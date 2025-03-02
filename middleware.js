import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const user = auth.currentUser;

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));
  const role = userDoc.exists() ? userDoc.data().role : "user";

  if (url.pathname.startsWith("/dashboard") && role !== "admin") {
    return NextResponse.redirect(new URL("/user-dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/user-dashboard/:path*"],
};
