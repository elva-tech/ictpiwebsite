"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import accountancy from "../../../assets/Accountancy.webp";
import Image from "next/image";
import "../../globals.css";

export default function ITXLPage() {
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
        <Image src={accountancy} alt="Indirect Tax Laws Compliance (ITXL)" className="w-full h-56 object-cover rounded-xl mb-6"/>
        <h1 className="text-2xl font-bold text-[#0062cc] mb-4">Indirect Tax Laws Compliance (ITXL)</h1>
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
            src="/pdf/ITXL.pdf" 
            className="flex-1 w-full"
            title="ITXL PDF"
          ></iframe>
          <div className="flex justify-center p-4 bg-black bg-opacity-80">
            <a href="/pdf/ITXL.pdf" download className="inline-flex items-center gap-2 bg-[#0062cc] text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
              <Download className="w-4 h-4"/> Download PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
