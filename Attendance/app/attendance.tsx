import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import {
    addDoc,
    collection,
    onSnapshot
} from "firebase/firestore";

import { db } from "../firebaseConfig";

export default function Attendance() {

    const { course, section } =
        useLocalSearchParams();

    const router = useRouter();

    const [students, setStudents] =
        useState<any[]>([]);


    // 🔥 REALTIME LISTENER
    useEffect(() => {

        const unsubscribe =
            onSnapshot(

                collection(db, "attendance"),

                (snapshot) => {

                    const list =
                        snapshot.docs.map((doc) => {

                            const data =
                                doc.data();

                            return {

                                id:
                                    data.id ||
                                    doc.id,

                                name:
                                    data.name,

                                present:
                                    true,

                            };

                        });

                    setStudents(list);

                },

                (error) => {

                    console.log(
                        "Realtime error:",
                        error
                    );

                }

            );

        return () =>
            unsubscribe();

    }, []);


    // ✅ TOGGLE PRESENT
    const toggleAttendance =
        (index: number) => {

            const updated =
                [...students];

            updated[index]
                .present =
                !updated[index]
                    .present;

            setStudents(
                updated
            );

        };


    // ✅ CONFIRM ATTENDANCE
    const confirmAttendance =
        async () => {

            try {

                const presentStudents =
                    students

                        .filter(
                            s =>
                                s.present
                        )

                        .map(
                            s => ({

                                id:
                                    s.id,

                                name:
                                    s.name,

                            })
                        );


                await addDoc(

                    collection(
                        db,
                        "final_attendance"
                    ),

                    {

                        course:
                            course,

                        section:
                            section,

                        date:
                            new Date()
                                .toLocaleDateString(),

                        present:
                            presentStudents,

                    }

                );


                alert(
                    "Attendance saved ✅"
                );


                router.back();


            } catch (error) {

                console.log(
                    error
                );

                alert(
                    "Error ❌"
                );

            }

        };


    return (

        <LinearGradient

            colors={[
                '#FFD27A',
                '#FFE7A8',
                '#FFD27A'
            ]}

            style={
                styles.container
            }

        >


            <Text
                style={
                    styles.title
                }
            >

                Attendance List

            </Text>



            <Text
                style={
                    styles.subtitle
                }
            >

                {course}
                {" - "}
                {section}

            </Text>



            <Text
                style={
                    styles.counter
                }
            >

                Present:

                {" "}

                {
                    students.filter(
                        s =>
                            s.present
                    ).length
                }

                /

                {
                    students.length
                }

            </Text>



            <ScrollView>

                {

                    students.map(

                        (
                            student,
                            index
                        ) => (

                            <View

                                key={
                                    index
                                }

                                style={
                                    styles.card
                                }

                            >

                                <View>

                                    <Text
                                        style={
                                            styles.name
                                        }
                                    >

                                        {
                                            student.name
                                        }

                                    </Text>


                                    <Text
                                        style={
                                            styles.id
                                        }
                                    >

                                        {
                                            student.id
                                        }

                                    </Text>


                                </View>



                                <TouchableOpacity

                                    onPress={
                                        () =>
                                            toggleAttendance(
                                                index
                                            )
                                    }

                                >

                                    <Ionicons

                                        name={

                                            student.present

                                                ?

                                                "checkmark-circle"

                                                :

                                                "close-circle"

                                        }

                                        size={
                                            28
                                        }

                                        color={

                                            student.present

                                                ?

                                                "#22C55E"

                                                :

                                                "#EF4444"

                                        }

                                    />

                                </TouchableOpacity>

                            </View>

                        )

                    )

                }



                <TouchableOpacity

                    style={
                        styles.button
                    }

                    onPress={
                        confirmAttendance
                    }

                >

                    <Text

                        style={
                            styles.buttonText
                        }

                    >

                        Confirm Attendance

                    </Text>

                </TouchableOpacity>


            </ScrollView>

        </LinearGradient>

    );

}



const styles =
    StyleSheet.create({

        container: {

            flex: 1,

            padding: 25,

        },

        title: {

            fontSize: 28,

            fontWeight:
                "700",

            color:
                "#122b53",

            marginTop:
                30,

        },

        subtitle: {

            fontSize:
                16,

            color:
                "#F97316",

            marginBottom:
                20,

        },

        counter: {

            marginBottom:
                10,

        },

        card: {

            backgroundColor:
                "#F3F4F6",

            padding:
                16,

            borderRadius:
                15,

            marginBottom:
                10,

            flexDirection:
                "row",

            justifyContent:
                "space-between",

            alignItems:
                "center",

        },

        name: {

            fontSize:
                16,

            color:
                "#335c9e",

        },

        id: {

            color:
                "#777",

            marginTop:
                4,

        },

        button: {

            marginTop:
                20,

            backgroundColor:
                "#335c9e",

            padding:
                15,

            borderRadius:
                15,

            alignItems:
                "center",

            marginBottom:
                40,

        },

        buttonText: {

            color:
                "#fff",

            fontWeight:
                "700",

        },

    });
});
