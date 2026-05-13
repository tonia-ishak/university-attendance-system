import os
import time
from pathlib import Path

import cv2
import numpy as np
from gpiozero import DigitalInputDevice
from picamera2 import Picamera2
import firebase_admin
from firebase_admin import credentials, firestore

# =========================================================
# PATHS
# =========================================================
PROJECT_DIR = Path("/home/maram/attendance_project")
IMAGE_DIR = PROJECT_DIR / "student_images"
SERVICE_ACCOUNT_PATH = PROJECT_DIR / "universityattendencesystem-firebase-adminsdk-fbsvc-ebbdc1edbb.json"
YUNET_MODEL = PROJECT_DIR / "models" / "face_detection_yunet_2023mar.onnx"
SFACE_MODEL = PROJECT_DIR / "models" / "face_recognition_sface_2021dec.onnx"

# =========================================================
# FIREBASE SETUP
# =========================================================
if not firebase_admin._apps:
    cred = credentials.Certificate(str(SERVICE_ACCOUNT_PATH))
    firebase_admin.initialize_app(cred)

db = firestore.client()


# =========================================================
# IR SENSOR TRIGGER
# physical pin 13 = GPIO27
# physical pin 14/6 = GND
# physical pin 1 = 3.3V
# active_state=False means LOW = triggered
# =========================================================
ir_sensor = DigitalInputDevice(27, pull_up=None, active_state=False)


# =========================================================
# GLOBAL ARRAYS
# =========================================================
array1 = []
array2 = []


# =========================================================
# HAAR CASCADE
# =========================================================
face_detector = cv2.CascadeClassifier(
    "/usr/share/opencv4/haarcascades/haarcascade_frontalface_default.xml"
)

if face_detector.empty():
    raise Exception("Could not load Haar cascade for face detection.")


# =========================================================
# FIREBASE HELPERS
# =========================================================
def get_system_state():
    doc_ref = db.collection("system_control").document("app_state")
    doc = doc_ref.get()

    if not doc.exists:
        return False, "one"

    data = doc.to_dict()
    attendance_enabled = data.get("attendance_enabled", False)
    current_session = data.get("current_session", "one")

    if current_session not in ["one", "two"]:
        current_session = "one"

    return attendance_enabled, current_session


def clear_attendance_collection():
    docs = db.collection("attendance").stream()
    for doc in docs:
        doc.reference.delete()
    print("attendance collection cleared.")


def upload_final_attendance(common_students):
    clear_attendance_collection()

    for student_id in common_students:
        student_name = ""

        docs = db.collection("students").where("student_id", "==", int(student_id)).stream()

        for doc in docs:
            student_data = doc.to_dict()
            student_name = student_data.get("name", "")
            break

        db.collection("attendance").document(str(student_id)).set({
            "student_id": str(student_id),
            "name": student_name,
            "present": True
        })

        print(f"Uploaded: {student_id} | name: {student_name}")

    print("Final attendance uploaded to Firebase.")


# =========================================================
# LOAD STUDENT IMAGES
# =========================================================
def load_student_images():
    image_paths = []
    student_ids = []

    if not IMAGE_DIR.exists():
        raise Exception(f"Student images folder not found: {IMAGE_DIR}")

    for file_name in os.listdir(IMAGE_DIR):
        if file_name.lower().endswith((".jpg", ".jpeg", ".png")):
            image_paths.append(str(IMAGE_DIR / file_name))
            student_id = os.path.splitext(file_name)[0].split("_")[0]
            student_ids.append(student_id)

    if len(image_paths) == 0:
        raise Exception("No student images found in student_images folder.")

    return image_paths, student_ids

def create_sface_models(frame_width=640, frame_height=480):
    detector = cv2.FaceDetectorYN_create(
        str(YUNET_MODEL),
        "",
        (frame_width, frame_height),
        score_threshold=0.25,
        nms_threshold=0.3,
        top_k=5000
    )

    recognizer = cv2.FaceRecognizerSF_create(
        str(SFACE_MODEL),
        ""
    )

    return detector, recognizer
def build_face_database(detector, recognizer, image_paths, student_ids):
    database = []

    for image_path, student_id in zip(image_paths, student_ids):
        image = cv2.imread(str(image_path))
        if image is None:
            print(f"Could not read image: {image_path}")
            continue

        h, w = image.shape[:2]
        detector.setInputSize((w, h))
        _, faces = detector.detect(image)

        if faces is None or len(faces) == 0:
            print(f"No face found in image: {image_path}")
            continue

        face = max(faces, key=lambda f: f[2] * f[3])
        aligned_face = recognizer.alignCrop(image, face)
        feature = recognizer.feature(aligned_face)

        norm = np.linalg.norm(feature)
        if norm > 0:
            feature = feature / norm

        database.append({
            "student_id": student_id,
            "feature": feature.astype(np.float32),
            "image_path": str(image_path),
        })

    return database
def recognize_face_sface(frame, face, recognizer, database, threshold=0.32, min_margin=0.10):
    aligned_face = recognizer.alignCrop(frame, face)
    feature = recognizer.feature(aligned_face)

    norm = np.linalg.norm(feature)
    if norm > 0:
        feature = feature / norm

    feature = feature.astype(np.float32)

    student_best_scores = {}

    for item in database:
        score = recognizer.match(feature, item["feature"], cv2.FaceRecognizerSF_FR_COSINE)
        student_id = item["student_id"]

        if student_id not in student_best_scores or score > student_best_scores[student_id]:
            student_best_scores[student_id] = score

    scores = sorted(student_best_scores.items(), key=lambda x: x[1], reverse=True)
    print("All scores:", scores)

    if not scores:
        return None, -1, -1, -1

    best_id, best_score = scores[0]
    second_score = scores[1][1] if len(scores) > 1 else -1
    margin = best_score - second_score if second_score >= 0 else best_score

    if best_score >= threshold and margin >= min_margin:
        return best_id, best_score, second_score, margin

    return None, best_score, second_score, margin

# =========================================================
# TRAIN RECOGNIZER
# =========================================================
def train_recognizer(image_paths, student_ids):
    faces = []
    labels = []
    label_map = {}
    reverse_label_map = {}

    current_label = 0

    for student_id, image_path in zip(student_ids, image_paths):
        if student_id not in label_map:
            label_map[student_id] = current_label
            reverse_label_map[current_label] = student_id
            current_label += 1

        img = cv2.imread(image_path)
        if img is None:
            print(f"Could not read training image: {image_path}")
            continue

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        detected_faces = face_detector.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(60, 60)
        )

        if len(detected_faces) == 0:
            print(f"No face found in training image: {image_path}")
            continue

        x, y, w, h = max(detected_faces, key=lambda f: f[2] * f[3])
        face_roi = gray[y:y + h, x:x + w]
        face_roi = cv2.resize(face_roi, (200, 200))

        faces.append(face_roi)
        labels.append(label_map[student_id])

    if len(faces) == 0:
        raise Exception("No valid training faces found.")

    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.train(faces, np.array(labels))

    return recognizer, reverse_label_map


# =========================================================
# PICAMERA2 SETUP
# =========================================================
def create_camera():
    picam2 = Picamera2()
    config = picam2.create_preview_configuration(
        main={"size": (640, 480), "format": "RGB888"}
    )
    picam2.configure(config)
    picam2.start()
    time.sleep(2)
    return picam2


# =========================================================
# CAPTURE + RECOGNIZE
# =========================================================
def capture_and_recognize(picam2, detector, recognizer, face_database, timeout_seconds=10):
    start_time = time.time()
    last_student_id = None
    consecutive_matches = 0

    while time.time() - start_time < timeout_seconds:
        frame = picam2.capture_array()
        frame = picam2.capture_array()
        h, w = frame.shape[:2]
        detector.setInputSize((w, h))
        _, detected_faces = detector.detect(frame)
        print("Detected faces:", 0 if detected_faces is None else len(detected_faces))
        if detected_faces is not None and len(detected_faces) > 0:
            face = max(detected_faces, key=lambda f: f[2] * f[3])

            student_id, best_score,second_score, margin = recognize_face_sface(
                frame,
                face,
                recognizer,
                face_database,
                threshold=0.24,
                min_margin=0.02
            )

            if student_id is not None:
                print(f"Recognized candidate: {student_id} | best: {best_score:.4f} | second: {second_score:.4f} | margin: {margin:.4f}")

                if student_id == last_student_id:
                    consecutive_matches += 1
                else:
                    last_student_id = student_id
                    consecutive_matches = 2

                print(f"Consecutive matches for {student_id}: {consecutive_matches}")

                if consecutive_matches >= 4:
                    print(f"Final recognized: {student_id} | best: {best_score:.4f} | second: {second_score:.4f} | margin: {margin:.4f}")
                    return student_id

            else:
                print(f"Face detected but not recognized well. best: {best_score:.4f} | second: {second_score:.4f} | margin: {margin:.4f}")
                last_student_id = None
                consecutive_matches = 0

        time.sleep(0.1)

    print("Camera timeout without valid recognition.")
    return None

# =========================================================
# SAVE TO SESSION ARRAY
# =========================================================
def save_to_session(student_id, current_session):
    global array1, array2

    if student_id is None:
        print("No recognized student to save.")
        return

    if current_session == "one":
        if student_id not in array1:
            array1.append(student_id)
            print("Added to array1:", student_id)
        else:
            print(f"{student_id} already exists in array1.")

    elif current_session == "two":
        if student_id not in array2:
            array2.append(student_id)
            print("Added to array2:", student_id)
        else:
            print(f"{student_id} already exists in array2.")


# =========================================================
# MAIN
# =========================================================
def main():
    global array1, array2

    print("Loading student images...")
    image_paths, student_ids = load_student_images()
    detector, recognizer = create_sface_models()
    face_database = build_face_database(detector, recognizer, image_paths, student_ids)
    print("Number of faces in database:", len(face_database))
    print("SFace database ready.")
    print("Student IDs found:", student_ids)

    print("Starting camera...")
    picam2 = create_camera()
    print("Camera ready.")

    previous_attendance_enabled = None
    previous_session = None
    final_uploaded = False

    print("System started.")

    try:
        while True:
            attendance_enabled, current_session = get_system_state()

            print("\nCurrent state:")
            print("attendance_enabled =", attendance_enabled)
            print("current_session =", current_session)
            print("array1 =", array1)
            print("array2 =", array2)

            if (
                attendance_enabled is True
                and current_session == "one"
                and (
                    previous_attendance_enabled is None
                    or previous_attendance_enabled is False
                    or previous_session == "two"
                )
            ):
                print("New attendance cycle started.")
                array1.clear()
                array2.clear()
                final_uploaded = False
                clear_attendance_collection()

            if attendance_enabled:
                print("Waiting for IR sensor trigger on GPIO27...")
                triggered = ir_sensor.wait_for_active(timeout=1)

                if triggered:
                    print("IR sensor triggered.")
                    student_id = capture_and_recognize(
                        picam2,
                        detector,
                        recognizer,
                        face_database
                    )
                    save_to_session(student_id, current_session)

                    ir_sensor.wait_for_inactive()
                    time.sleep(1)

            if (
                previous_attendance_enabled is True
                and previous_session == "two"
                and attendance_enabled is False
                and current_session == "two"
                and not final_uploaded
            ):
                print("Session two finished.")
                common_students = list(set(array1) & set(array2))
                print("Common students:", common_students)
                upload_final_attendance(common_students)
                final_uploaded = True

            previous_attendance_enabled = attendance_enabled
            previous_session = current_session

            time.sleep(0.5)

    except KeyboardInterrupt:
        print("\nProgram stopped manually.")

    finally:
        try:
            picam2.stop()
        except Exception:
            pass


if __name__ == "__main__":
    main()
