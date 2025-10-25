"use client";
import { useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import logo from "../assets/ICTPL_image.png";
import Image from "next/image";
import "../app/globals.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
      router.push("/dashboard");
    } catch (error) {
      setError("Please use ICTPI provided Credentials");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white"
      
    >
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 transform transition-all duration-300 hover:scale-105 max-w-md">
        {/* Logo Section */}
        <div className="flex justify-center mb-6">
          <Image
            src={logo} // Replace with your logo path
            alt="Logo"
            className="h-16 w-auto"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">
          Welcome
        </h1>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        {/* Form */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-blue-50 text-blue-900 placeholder-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-blue-50 text-blue-900 placeholder-blue-400"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold shadow-md hover:shadow-lg"
          >
            Sign In
          </button>
        </div>

        {/* Additional Links (Optional) */}
        
      </div>
    </div>
  );
}