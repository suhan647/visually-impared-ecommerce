import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";

// Signup Function
export const signUp = async (email, password, role = "user") => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user role in Firestore
    await setDoc(doc(db, "users", user.uid), { email, role });

    return user;
  } catch (error) {
    console.error("Signup Error:", error.message);
    return null;
  }
};

// Login Function (fetches user role)
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user role from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userRole = userDoc.exists() ? userDoc.data().role : "user";

    return { user, role: userRole };
  } catch (error) {
    console.error("Login Error:", error.message);
    return null;
  }
};
