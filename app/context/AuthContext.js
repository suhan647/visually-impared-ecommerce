// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import { onAuthStateChanged, signOut } from "firebase/auth";
// import { auth } from "@/lib/firebase";

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setUser(user);
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, loading, logout: () => signOut(auth) }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }




"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { speak } from "@/lib/speech";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRoles = JSON.parse(localStorage.getItem("roles")) || {};
      const storedUser = auth.currentUser;
      if (storedUser) {
        setUser(storedUser);
        setRole(storedRoles[storedUser.email] || "user");
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        if (typeof window !== "undefined") {
          const storedRoles = JSON.parse(localStorage.getItem("roles")) || {};
          setRole(storedRoles[currentUser.email] || "user");
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;
      const userRole = email === "suhanahmed647@gmail.com" ? "admin" : "user";

      setUser(loggedInUser);
      setRole(userRole);

      if (typeof window !== "undefined") {
        const storedRoles = JSON.parse(localStorage.getItem("roles")) || {};
        storedRoles[email] = userRole;
        localStorage.setItem("roles", JSON.stringify(storedRoles));
      }

      speak("Login successful! Redirecting...");
      if (userRole === "admin") {
        router.push("/dashboard");
        speak("Welcome Admin! Redirecting to dashboard.");
      } else {
        router.push("/user");
        speak("Welcome User! Redirecting to user page.");
      }
    } catch (error) {
      speak("Invalid email or password. Please try again.");
      throw error;
    }
  };

  const logout = async () => {
    if (user && typeof window !== "undefined") {
      const storedRoles = JSON.parse(localStorage.getItem("roles")) || {};
      delete storedRoles[user.email];
      localStorage.setItem("roles", JSON.stringify(storedRoles));
    }

    await signOut(auth);
    setUser(null);
    setRole(null);
    router.push("/auth/login");
    speak("You have been logged out successfully. Redirecting to login page.");
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
