import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyApAGS6u9zRJvqQxsW11mZp1IYZjkn9GR0",
  authDomain: "universityattendencesystem.firebaseapp.com",
  projectId: "universityattendencesystem",
  storageBucket: "universityattendencesystem.firebasestorage.app",
  messagingSenderId: "775819664519",
  appId: "1:775819664519:web:16779621de1c846b8fec22",
  measurementId: "G-TYCHPVE4GL"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);