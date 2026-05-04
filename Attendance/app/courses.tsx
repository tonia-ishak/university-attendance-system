import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function Courses() {
    const { name } = useLocalSearchParams();
    const router = useRouter();

    // 🔥 FIREBASE REF
    const appStateRef = doc(db, "system_control", "app_state");

    // 🔥 FIREBASE FUNCTIONS
    const startFirstAttendance = async () => {
        try {
            await updateDoc(appStateRef, {
                attendance_enabled: true,
                current_session: "one"
            });
        } catch (error) {
            console.log(error);
        }
    };

    const startLastAttendance = async () => {
        try {
            await updateDoc(appStateRef, {
                attendance_enabled: true,
                current_session: "two"
            });
        } catch (error) {
            console.log(error);
        }
    };

    const stopAttendance = async () => {
        try {
            await updateDoc(appStateRef, {
                attendance_enabled: false
            });
        } catch (error) {
            console.log(error);
        }
    };

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            { text: "Yes", onPress: () => router.replace("./welcome") }
        ]);
    };

    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);

    const [isScanning, setIsScanning] = useState(false);
    const [currentSession, setCurrentSession] = useState<"first" | "last" | null>(null);

    const courses = [
        { code: "CENG495", name: "Senior Project" },
        { code: "CENG460", name: "Operating System" },
        { code: "CENG375", name: "Data Structures" },
    ];

    const sectionsByCourse: any = {
        CENG495: ["Section A", "Section B", "Section C"],
        CENG460: ["Section A", "Section B", "Section C"],
        CENG375: ["Section A", "Section B", "Section C"],
    };

    return (
        <LinearGradient
            colors={['#FFD27A', '#FFE7A8', '#FFD27A']}
            style={styles.container}
        >
            <View style={styles.circleTop} />
            <View style={styles.circleRight} />
            <View style={styles.circleBottom} />

            {!selectedCourse ? (
                <>
                    <View style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                        marginBottom: 15
                    }}>
                        <Text style={styles.welcome}>
                            Welcome, Dr. {String(name || "Instructor")}
                        </Text>
                    </View>

                    <Text style={styles.subtitle}>Select Course</Text>

                    {courses.map((course, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.card}
                            onPress={() => {
                                if (isScanning) return;
                                setSelectedCourse(course.code);
                                setSelectedSection(null);
                            }}
                        >
                            <View>
                                <Text style={styles.course}>{course.code}</Text>
                                <Text style={styles.courseName}>{course.name}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={22} color="#F97316" />
                        </TouchableOpacity>
                    ))}
                </>
            ) : (
                <>
                    <Text style={styles.welcome}>{selectedCourse}</Text>
                    <Text style={styles.subtitle}>Select Section</Text>

                    {sectionsByCourse[selectedCourse].map(
                        (section: string, index: number) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.card,
                                    selectedSection === section && styles.selectedCard
                                ]}
                                onPress={() => {
                                    if (isScanning) return;
                                    setSelectedSection(section);
                                }}
                            >
                                <Text style={styles.course}>{section}</Text>
                                <Ionicons name="chevron-forward" size={22} color="#F97316" />
                            </TouchableOpacity>
                        )
                    )}

                    {/* ACTION BUTTONS */}
                    {selectedSection && !isScanning && (
                        <View style={{ gap: 12 }}>

                            {/* FIRST */}
                            <TouchableOpacity
                                style={styles.scanButton}
                                onPress={async () => {
                                    setIsScanning(true);
                                    setCurrentSession("first");
                                    await startFirstAttendance();
                                }}
                            >
                                <Ionicons name="camera-outline" size={18} color="#fff" />
                                <Text style={styles.scanText}>Start First Attendance</Text>
                            </TouchableOpacity>

                            {/* LAST */}
                            <TouchableOpacity
                                style={styles.scanButton}
                                onPress={async () => {
                                    setIsScanning(true);
                                    setCurrentSession("last");
                                    await startLastAttendance();
                                }}
                            >
                                <Ionicons name="camera-outline" size={18} color="#fff" />
                                <Text style={styles.scanText}>Start Last Attendance</Text>
                            </TouchableOpacity>

                            {/* HISTORY */}
                            <TouchableOpacity
                                style={[styles.scanButton, { backgroundColor: "#6B7280" }]}
                                onPress={() => {
                                    router.push({
                                        pathname: "./history",
                                        params: {
                                            course: selectedCourse,
                                            section: selectedSection
                                        }
                                    });
                                }}
                            >
                                <Ionicons name="time-outline" size={18} color="#fff" />
                                <Text style={styles.scanText}>View Attendance History</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* STOP */}
                    {isScanning && (
                        <TouchableOpacity
                            style={[styles.scanButton, { backgroundColor: "#DC2626" }]}
                            onPress={async () => {
                                setIsScanning(false);
                                await stopAttendance();

                                if (currentSession === "last") {
                                    router.push({
                                        pathname: "/attendance",
                                        params: {
                                            course: selectedCourse,
                                            section: selectedSection,
                                        },
                                    });
                                }
                            }}
                        >
                            <Ionicons name="stop-circle" size={20} color="#fff" />
                            <Text style={styles.scanText}>Stop Scan</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        disabled={isScanning}
                        onPress={() => setSelectedCourse(null)}
                    >
                        <Text style={styles.back}>← Back</Text>
                    </TouchableOpacity>
                </>
            )}

            {/* LOGOUT BUTTON */}
            <View style={{
                position: "absolute",
                bottom: 30,
                right: 20
            }}>
                <TouchableOpacity
                    onPress={handleLogout}
                    style={{
                        backgroundColor: "#F97316",
                        padding: 14,
                        borderRadius: 50,
                        elevation: 5
                    }}
                >
                    <Ionicons name="log-out-outline" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 25,
        justifyContent: "center",
    },
    welcome: {
        fontSize: 30,
        fontWeight: "600",
        color: "#122b53",
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 18,
        color: "#F97316",
        marginBottom: 20,
    },
    card: {
        backgroundColor: "#F3F4F6",
        padding: 20,
        borderRadius: 20,
        marginBottom: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        elevation: 3,
    },
    selectedCard: {
        borderWidth: 2,
        borderColor: "#F97316",
    },
    course: {
        fontSize: 18,
        fontWeight: "600",
        color: "#335c9e",
    },
    courseName: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 4,
    },
    scanButton: {
        marginTop: 10,
        backgroundColor: "#122b53",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    scanText: {
        color: "#fff",
        marginLeft: 8,
        fontSize: 14,
        fontWeight: "600",
    },
    back: {
        fontSize: 16,
        color: "#F97316",
        marginTop: 15,
        alignSelf: "flex-end",
    },
    circleTop: {
        position: "absolute",
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: "#F97316",
        top: -80,
        right: -60,
        opacity: 0.5,
    },
    circleRight: {
        position: "absolute",
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: "#F97316",
        right: -50,
        top: 200,
        opacity: 0.3,
    },
    circleBottom: {
        position: "absolute",
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: "#F97316",
        bottom: -120,
        left: -100,
        opacity: 0.35,
    },
});