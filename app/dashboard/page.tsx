"use client";
import "../globals.css";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, ClipboardList, User2, LogOut } from "lucide-react";
import Image from "next/image";
import accountancy from "../../assets/Accountancy.webp";
import complaince from "../../assets/complaiance.webp";
import directax from "../../assets/directtax.webp";
import appliedfinance from "../../assets/fourthimage.webp";
import logo from "../../assets/ICTPL_image.png";

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading...</p>;
  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut(); // Call the signOut function from AuthContext
      router.push("/"); // Redirect to the root page
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const courses = [
    { title: "Indirect Tax Laws Compliance (ITXL)", route: "indirecttax", image: accountancy },
    { title: "Business Regulatory Laws Compliance", route: "business", image: complaince },
    { title: "Direct Tax Laws Compliance (DTLC)", route: "directtax", image: directax },
    { title: "Applied Financial Accounting & EL", route: "appliedfinance", image: appliedfinance },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-60 bg-[#0062cc] text-white flex flex-col">
        <nav className="flex-1 mt-4 space-y-3">
          <Link href="/dashboard" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link href="/results" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <ClipboardList className="w-5 h-5 mr-3" /> Result
          </Link>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center bg-white shadow px-6 py-3">
          <Image src={logo} alt="Logo" className="h-[100px] w-[100px]" />
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <User2 className="w-5 h-5 text-gray-700" />
              <div className="text-sm text-gray-800">
                <div className="font-semibold">{user?.email?.split("@")[0]}</div>
                <div className="text-xs text-gray-500">Logged in as: {user?.email}</div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </header>

        <main className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto">
          {courses.map((course, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition cursor-pointer"
              onClick={() => router.push(`/courses/${course.route}`)}
            >
              <Image src={course.image} alt={course.title} className="w-full h-32 object-cover rounded-md mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{course.title}</h3>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}