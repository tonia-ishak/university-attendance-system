import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import {
    collection,
    getDocs,
    query,
    where
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRouter } from "expo-router";
import { TextInput } from "react-native";
import { db } from "../firebaseConfig";

export default function History() {
    const router = useRouter();
    const { course, section } = useLocalSearchParams();

    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchDate, setSearchDate]=useState("");

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const q = query(
                    collection(db, "final_attendance"),
                    where("course", "==", String(course)),
                    where("section", "==", String(section))
                );

                const snapshot = await getDocs(q);

                const list: any[] = [];

                snapshot.forEach(doc => {
                    const data = doc.data();

                    list.push({
                        id: doc.id,
                        date: data.date,
                        present: data.present || []
                    });
                });

                list.sort(
                    (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                );

                setHistory(list);
                setLoading(false);

            } catch (error) {
                console.log("Error loading history:", error);
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    // ✅ LOADING SCREEN
    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <LinearGradient
                    colors={['#FFD27A', '#FFE7A8', '#FFD27A']}
                    style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                >
                    <ActivityIndicator size="large" color="#F97316" />
                    <Text style={{ marginTop: 10 }}>Loading history...</Text>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
    <LinearGradient
        colors={['#FFD27A', '#FFE7A8', '#FFD27A']}
        style={{ flex: 1, padding: 20 }}
    >

        {/* HEADER */}
        <Text style={{
            fontSize: 26,
            fontWeight: "600",
            color: "#122b53",
            marginBottom: 15
        }}>
            Attendance History
        </Text>

        <Text style={{
            fontSize: 14,
            color: "#F97316",
            marginBottom: 20
        }}>
            {course} - {section}
        </Text>
        <View style={{
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eee"
}}>
    <Ionicons name="search-outline" size={20} color="#999" />

    <TextInput
        placeholder="Search date (e.g. MM/DD/YY)"
        value={searchDate}
        onChangeText={setSearchDate}
        style={{
            flex: 1,
            paddingVertical: 10,
            marginLeft: 8
        }}
    />
</View>

        {/* CONTENT */}
        {history.length === 0 ? (
            <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
            }}>
                <Ionicons name="calendar-outline" size={70} color="#ccc" />

                <Text style={{
                    fontSize: 18,
                    marginTop: 15,
                    color: "#555"
                }}>
                    No Attendance Yet
                </Text>

                <Text style={{
                    fontSize: 14,
                    marginTop: 5,
                    color: "#888"
                }}>
                    Start taking attendance to see history
                </Text>
            </View>
        ) : (
            <FlatList
                data={history.filter(item =>
    String(item.date).toLowerCase().includes(searchDate.toLowerCase())
)}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }} // 👈 important
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={{
                            backgroundColor: "#fff",
                            padding: 16,
                            borderRadius: 16,
                            marginBottom: 12,
                            elevation: 3
                        }}
                    >
                        <Text style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: "#122b53"
                        }}>
                            {item.date}
                        </Text>

                        <Text style={{
                            marginTop: 5,
                            color: "#F97316",
                            fontWeight: "500"
                        }}>
                            {item.present.length} student(s) present
                        </Text>

                        <View style={{ marginTop: 8 }}>
                            {item.present.map((student: any, index: number) => (
                                <Text
                                    key={index}
                                    style={{
                                        color: "#555",
                                        fontSize: 13
                                    }}
                                >
                                    • {student.name} ({student.id})
                                </Text>
                            ))}
                        </View>
                    </TouchableOpacity>
                )}
            />
        )}

        {/* ✅ BACK BUTTON (ALWAYS VISIBLE) */}
        <View style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20
        }}>
            <TouchableOpacity
                onPress={() => router.back()}
                style={{
                    backgroundColor: "#122b53",
                    paddingVertical: 14,
                    borderRadius: 15,
                    alignItems: "center"
                }}
            >
                <Text style={{
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: "600"
                }}>
                    ← Back
                </Text>
            </TouchableOpacity>
        </View>

    </LinearGradient>
</SafeAreaView>
    );
}