import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import { addDoc, collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function Attendance() {

    const { course, section } = useLocalSearchParams();
    const router = useRouter();

    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // ✅ FETCH FROM FIREBASE
    useEffect(() => {
    const fetchStudents = async () => {
        try {
            // 🔹 1. Always get students FIRST
            const querySnapshot = await getDocs(collection(db, "attendance"));

            let list: any[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();

                list.push({
                    id: doc.id,
                    name: data.name,
                    present: true, // default present
                });
            });

            // 🔹 2. TRY to get last attendance (safe)
            try {
                const q = query(
                    collection(db, "final_attendance"),
                    where("course", "==",course),
                    where("section", "==",section),
                    orderBy("date", "desc")
                );

                const resultSnap = await getDocs(q);

                if (!resultSnap.empty) {
                    const lastDoc = resultSnap.docs[0];
                    const data = lastDoc.data();

                    const presentList = data.present || [];

                    list = list.map(student => ({
                        ...student,
                        present: presentList.length>0 ?presentList.some((p: any) => p.name === student.name):true
                    }));
                }

            } catch (err) {
                console.log("Attendance fetch failed:", err);
                // 🔥 DON'T break the app
            }

            // ✅ ALWAYS set students
            setStudents(list);
            setLoading(false);

        } catch (error) {
            console.log("Students fetch failed:", error);
            setLoading(false);
        }
    };

    fetchStudents();
}, []);

    // ✅ TOGGLE
    const toggleAttendance = (index: number) => {
        const updated = [...students];
        updated[index].present = !updated[index].present;
        setStudents(updated);
    };
    const confirmAttendance = async () => {
        try {
            const presentStudents = students
                .filter(s => s.present)
                .map(s => ({ id: s.id, name: s.name, }));
            await addDoc(collection(db, "final_attendance"), {
                course: course,
                section: section,
                date: new Date().toLocaleDateString(),
                present: presentStudents,
            });
            alert("Attendance saved successfully✅");
            router.back();
        } catch (error) {
            console.log(error);
            alert("Error saving attendance❌");
        }
    };

    if (loading) {
        return (
            <LinearGradient
                colors={['#FFD27A', '#FFE7A8', '#FFD27A']}
                style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator
                    size="large" color="#F97316" />
                <Text style={{ marginTop: 10 }}>Loading Attendance...</Text>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={['#FFD27A', '#FFE7A8', '#FFD27A']}
            style={styles.container}
        >

            <Text style={styles.title}>Attendance List</Text>

            <Text style={styles.subtitle}>
                {course} - {section}
            </Text>

            <Text style={styles.counter}>
                Present: {students.filter(s => s.present).length} / {students.length}
            </Text>

            {/* ✅ LIST OF NAMES */}
            {students.map((student, index) => (
                <View key={student.id} style={styles.card}>
                    <Text style={styles.name}>{student.name}</Text>

                    <TouchableOpacity onPress={() => toggleAttendance(index)}>
                        <Ionicons
                            name={student.present ? "checkmark-circle" : "close-circle"}
                            size={24}
                            color={student.present ? "#22C55E" : "#EF4444"}
                        />
                    </TouchableOpacity>
                </View>
            ))}

            {/* Confirm */}
            <TouchableOpacity style={styles.button}
                onPress={confirmAttendance}>
                <Text style={styles.buttonText}>Confirm Attendance</Text>

            </TouchableOpacity>

        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 25 },

    title: {
        fontSize: 26,
        fontWeight: "600",
        color: "#122b53",
        marginBottom: 10,
        marginTop:30,
    },

    subtitle: {
        fontSize: 16,
        color: "#F97316",
        marginBottom: 20,
    },

    counter: {
        fontSize: 14,
        marginBottom: 10,
    },

    card: {
        backgroundColor: "#F3F4F6",
        padding: 16,
        borderRadius: 15,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    name: {
        fontSize: 16,
        color: "#335c9e",
    },

    button: {
        marginTop: 20,
        backgroundColor: "#335c9e",
        padding: 15,
        borderRadius: 15,
        alignItems: "center",
    },

    buttonText: {
        color: "#fff",
        fontWeight: "600",
    },

});