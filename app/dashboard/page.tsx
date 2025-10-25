"use client";
import "../globals.css";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading...</p>;
  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
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
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Sidebar for larger screens */}
      <aside className="hidden md:flex w-60 bg-[#0062cc] text-white flex-col">
        <nav className="flex-1 mt-4 space-y-3">
          <Link href="/dashboard" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link href="/results" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <ClipboardList className="w-5 h-5 mr-3" /> Result
          </Link>
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0062cc]/95 backdrop-blur-sm text-white flex justify-around items-center py-2 shadow-lg z-50">
        <Link href="/dashboard" className="flex flex-col items-center text-xs">
          <LayoutDashboard className="w-5 h-5 mb-1" /> Dashboard
        </Link>
        <Link href="/results" className="flex flex-col items-center text-xs">
          <ClipboardList className="w-5 h-5 mb-1" /> Results
        </Link>
        <button onClick={handleSignOut} className="flex flex-col items-center text-xs">
          <LogOut className="w-5 h-5 mb-1" /> Logout
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center bg-white shadow px-4 md:px-6 py-3 sticky top-0 z-40">
          <Image src={logo} alt="Logo" className="h-[60px] w-[60px] md:h-[100px] md:w-[100px]" />
          <div className="flex items-center gap-3 md:gap-5">
            {/* ✅ Made visible on all screens */}
            <div className="flex items-center gap-2">
              <User2 className="w-5 h-5 text-gray-700" />
              <div className="text-sm text-gray-800 text-right">
                <div className="font-semibold truncate max-w-[100px] md:max-w-none">
                  {user?.email?.split("@")[0]}
                </div>
                <div className="text-xs text-gray-500 truncate max-w-[150px]">
                  {user?.email}
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Course Cards Section */}
       <main className="flex-1 p-4 sm:p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 lg:gap-3 xl:gap-2 overflow-y-auto mb-[80px] md:mb-0 bg-gray-100">
  {courses.map((course, index) => (
    <div
      key={index}
      className="bg-white shadow-md rounded-xl p-3 sm:p-4 lg:p-2 hover:shadow-lg transition cursor-pointer"
      onClick={() => router.push(`/courses/${course.route}`)}
    >
      <Image
        src={course.image}
        alt={course.title}
        className="w-full h-36 sm:h-40 object-cover rounded-md mb-3"
      />
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
        {course.title}
      </h3>
    </div>
  ))}
</main>
      </div>
    </div>
  );
}
