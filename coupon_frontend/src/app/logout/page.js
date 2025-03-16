"use client";
import { useRouter } from "next/navigation"; 
import { useEffect } from "react";

const Logout = () => {
  const router = useRouter();

  useEffect(() => {
    const logoutAdmin = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/logout`, {
          method: "POST",
          credentials: "include", 
        });

        localStorage.removeItem("authToken");
      } catch (error) {
        console.error("Admin logout failed", error);
      }
      router.push("/login");
    };

    logoutAdmin();
  }, [router]);

  return(
    <div className="bg-black min-h-screen flex items-center justify-center">
        <div>
            <p className="text-3xl text-white">Logging Out...</p>
        </div>
    </div>
  );
};

export default Logout;
