import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDM6O19qVNh5qJ3FKZqRdM9Gt4ciLNIsZQ",
  authDomain: "visually-impared-ecommerce.firebaseapp.com",
  projectId: "visually-impared-ecommerce",
  storageBucket: "visually-impared-ecommerce.firebasestorage.app",
  messagingSenderId: "318396076455",
  appId: "1:318396076455:web:42617a6586f895ac10a682"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

