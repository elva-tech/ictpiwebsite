"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Download, X } from "lucide-react";
import Image from "next/image";
import appliedfinance from "../../../assets/fourthimage.webp";
import "../../globals.css";

interface AuthContextType {
  user: { uid: string; email: string } | null;
  loading: boolean;
}

export default function AppliedFinancePage() {
  const auth = useAuth() as AuthContextType | null;
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

const handleCloseModal = useCallback(() => {
  router.push("/dashboard");
}, [router]);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleCloseModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCloseModal]);

  useEffect(() => {
    if (!auth) return;
    if (!auth.loading && !auth.user) router.push("/");
    if (!auth.loading && auth.user) setShowModal(true);
  }, [auth, router]);

  if (!auth || auth.loading)
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;

  if (!auth.user) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg text-center">
        <div className="relative w-full h-56">
          <Image
            src={appliedfinance}
            alt="Applied Financial Accounting & EL"
            fill
            className="object-cover rounded-xl"
            priority
          />
        </div>
        <h1 className="text-2xl font-bold text-[#0062cc] mt-6 mb-4">
          Applied Financial Accounting & EL
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-[#0062cc] text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
          <div className="flex justify-end p-4">
            <button
              onClick={handleCloseModal}
              className="text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 w-full h-full relative">
            <iframe
              src="/pdf/Applied_Finance.pdf"
              className="w-full h-full"
              title="Applied Finance PDF"
            />
          </div>

          <div className="flex justify-center p-4 bg-black bg-opacity-80">
            <a
              href="/pdf/Applied_Finance.pdf"
              download="Applied_Finance.pdf"
              className="inline-flex items-center gap-2 bg-[#0062cc] text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Download className="w-4 h-4" /> Download PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
