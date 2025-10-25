"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, ClipboardList, User2, LogOut } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/Supabase";
import logo from "../../assets/ICTPL_image.png";
import Confetti from "react-confetti";

const ResultPage = () => {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showGlitter, setShowGlitter] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  // Update window size
  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSignOut = async () => {
    try {
      if (typeof signOut === "function") {
        await signOut();
        router.push("/");
      } else {
        console.error("signOut is not a function");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const fetchResult = async () => {
    if (!user?.email) {
      setError("User email not found");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("results")
        .select("status")
        .eq("email", user.email)
        .single();

      if (error) throw error;

      if (data) {
        setResult(data.status);
        if (data.status === "passed") {
          setShowGlitter(true);
          setTimeout(() => setShowGlitter(false), 10000);
        }
      } else {
        setError("No result found for this user");
      }
    } catch (error) {
      console.error("Error fetching result:", error);
      setError("Failed to fetch result. Please try again.");
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading...</p>;
  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-100 relative overflow-hidden">
      <aside className="w-60 bg-[#0062cc] text-white flex flex-col">
        <nav className="flex-1 mt-4 space-y-3">
          <Link href="/dashboard" className="flex items-center px-5 py-2 hover:bg-blue-500 transition">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link href="/results" className="flex items-center px-5 py-2 bg-blue-500">
            <ClipboardList className="w-5 h-5 mr-3" /> Result
          </Link>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col relative">
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

        <main className="p-8 flex flex-col items-center relative flex-1">
          <button
            onClick={fetchResult}
            className="mb-6 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Show Results
          </button>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {result && (
            <div className="relative w-full flex justify-center items-center flex-1">
              {result === "passed" ? (
                <>
                  <p className="text-2xl font-bold text-green-500 mb-4 z-10 relative">Passed</p>
                  {showGlitter && (
                    <Confetti
                      width={windowSize.width}
                      height={windowSize.height}
                      recycle={false}
                      numberOfPieces={800}
                      gravity={0.15}
                      initialVelocityX={20} // move right
                      initialVelocityY={0}  // minimal vertical movement
                      colors={["#FFD700", "#FF4500", "#00FF00", "#1E90FF", "#FF69B4"]}
                      run={showGlitter}
                    />
                  )}
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-red-500">Failed</p>
                  <p className="text-gray-600 mt-2">Try next time</p>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ResultPage;
