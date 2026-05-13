import time
from pathlib import Path

import cv2
from picamera2 import Picamera2

PROJECT_DIR = Path("/home/maram/attendance_project")
IMAGE_DIR = PROJECT_DIR / "student_images"
YUNET_MODEL = PROJECT_DIR / "models" / "face_detection_yunet_2023mar.onnx"

IMAGE_DIR.mkdir(exist_ok=True)

student_id = input("Enter student ID: ").strip()

detector = cv2.FaceDetectorYN_create(
    str(YUNET_MODEL),
    "",
    (640, 480),
    score_threshold=0.25,
    nms_threshold=0.3,
    top_k=5000
)

picam2 = Picamera2()
config = picam2.create_preview_configuration(
    main={"size": (640, 480), "format": "RGB888"}
)
picam2.configure(config)
picam2.start()
time.sleep(2)

print("Look at the camera. I will save ONLY photos where face is detected.")

saved = 0
attempts = 0

while saved < 10 and attempts < 80:
    attempts += 1

    frame = picam2.capture_array()
    frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

    h, w = frame_bgr.shape[:2]
    detector.setInputSize((w, h))
    _, faces = detector.detect(frame_bgr)

    count = 0 if faces is None else len(faces)
    print("Detected faces:", count)

    if faces is not None and len(faces) > 0:
        saved += 1
        path = IMAGE_DIR / f"{student_id}_{saved}.jpg"
        cv2.imwrite(str(path), frame_bgr)
        print("Saved:", path)
        time.sleep(0.5)
    else:
        time.sleep(0.2)

picam2.stop()

print("Done. Saved good photos:", saved)
