import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAeerrdV9EkWcpcYhV6Ov0NwqTkPtKKAvk",
  authDomain: "siraque.firebaseapp.com",
  projectId: "siraque",
  storageBucket: "siraque.firebasestorage.app",
  messagingSenderId: "195203227658",
  appId: "1:195203227658:web:f067dab001fea0e6e57ff3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);