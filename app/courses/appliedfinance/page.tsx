"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import appliedfinance from "../../../assets/fourthimage.webp";
import Image from "next/image";
import "../../globals.css";

export default function AppliedFinancePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/");
    if (!loading && user) setShowModal(true);
  }, [user, loading, router]);

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading...</p>;
  if (!user) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg text-center">
        <Image src={appliedfinance} alt="Applied Financial Accounting & EL" className="w-full h-56 object-cover rounded-xl mb-6"/>
        <h1 className="text-2xl font-bold text-[#0062cc] mb-4">Applied Financial Accounting & EL</h1>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-[#0062cc] text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
          <Download className="w-4 h-4"/> Download PDF
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
          <div className="flex justify-end p-4">
            <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-300">
              <X className="w-6 h-6"/>
            </button>
          </div>
          <iframe 
            src="/pdf/Applied_Finance.pdf" 
            className="flex-1 w-full"
            title="Applied Finance PDF"
          ></iframe>
          <div className="flex justify-center p-4 bg-black bg-opacity-80">
            <a href="/pdf/Applied_Finance.pdf" download="Applied Finance" className="inline-flex items-center gap-2 bg-[#0062cc] text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
              <Download className="w-4 h-4"/> Download PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
