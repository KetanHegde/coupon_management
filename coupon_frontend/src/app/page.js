"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ClaimCoupon = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();
  const [coupon, setCoupon] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(coupon);
    setCopied(true);
    setShowConfetti(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);

    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  // Confetti particles
  const confettiColors = [
    "#FF6B6B",
    "#4ECDC4",
    "#FFD166",
    "#118AB2",
    "#073B4C",
  ];
  const confettiParticles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    color: confettiColors[i % confettiColors.length],
    x: Math.random() * 100,
    y: -10 - Math.random() * 40,
    size: 5 + Math.random() * 7,
  }));

  useEffect(() => {
    const storedBrowserId = localStorage.getItem("browserId");
    if (!storedBrowserId) {
      const newBrowserId = generateBrowserId();
      localStorage.setItem("browserId", newBrowserId);
    }
  }, []);

  const generateBrowserId = () => {
    return "browser-" + Math.random().toString(36).substr(2, 9);
  };

  const claimCoupon = async () => {
    setLoading(true);
    setError("");
    setCoupon(null);

    const browserId = localStorage.getItem("browserId");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/claim-coupon`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ browserId }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to claim coupon.");
      } else {
        setCoupon(data.coupon);
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{backgroundColor:"#0B192C"}}>
      <div className="flex items-center justify-end">
        <button 
        onClick={() => router.push("/login")}
        style={{cursor:"pointer"}} className="border border-white px-5 py-2 my-5 mx-5 rounded-lg bg-transparent text-white hover:bg-white hover:text-black transition">
          Admin
        </button>
      </div>
      <div className="flex flex-col items-center justify-center min-h-[95vh]">
        {!error &&
        <h1 className="text-2xl font-bold mb-4">Claim Your Coupon</h1>
        }
        {coupon ? (
          <div className="p-8 flex items-center justify-center">
            <div className="w-full max-w-md relative overflow-hidden">
              {/* Background with gradient and pattern */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-800 opacity-90" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBoLTQweiIvPjxjaXJjbGUgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBjeD0iMjAiIGN5PSIyMCIgcj0iMSIvPjwvZz48L3N2Zz4=')] opacity-10" />

              <div className="relative p-6 rounded-xl shadow-2xl backdrop-blur-sm">
                {/* Shimmering border effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-pulse opacity-70" />
                <div className="absolute inset-px rounded-xl bg-gradient-to-br from-violet-600 to-indigo-800" />

                {/* Content */}
                <div className="relative px-5 py-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white tracking-wide">
                      Special Offer
                    </h3>
                    <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full transform rotate-12 shadow-lg">
                      LIMITED TIME
                    </div>
                  </div>

                  {/* Coupon details */}
                  <div className="text-center mb-4 mt-5">
                    <p className="text-white text-sm mb-1 opacity-90">
                      Use the below code to claim the offer
                    </p>
                  </div>

                  {/* Coupon code */}
                  <div
                    className="mt-4 relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 transform"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                  >
                    <div
                      className={`absolute inset-0 bg-white opacity-5 ${
                        isHovering ? "animate-pulse" : ""
                      }`}
                    />
                    <div className="flex items-center justify-between bg-white bg-opacity-95 backdrop-blur-sm p-3 rounded-lg">
                      <div className="relative overflow-hidden">
                        <span className="text-xl font-mono font-bold tracking-widest text-gray-800">
                          {coupon}
                        </span>
                        <div
                          className={`absolute bottom-0 left-0 h-0.5 bg-indigo-600 transition-all duration-700 ${
                            isHovering ? "w-full" : "w-0"
                          }`}
                        />
                      </div>
                      <button
                        style={{ cursor: "pointer" }}
                        onClick={copyToClipboard}
                        title={copied ? "" : "copy to clipboard"}
                        className={`ml-2 p-3 rounded-full transition-all duration-300 ${
                          copied
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600"
                        }`}
                      >
                        {copied ? (
                          <span className="text-green-600 font-bold text-lg">
                            ✓
                          </span>
                        ) : (
                          <span className="text-gray-600 text-lg">📋</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Scissor cut line */}
                  <div className="flex items-center my-4">
                    <div className="flex-1 border-t border-dashed border-white opacity-30" />
                    <div className="mx-4 text-white opacity-70">✂</div>
                    <div className="flex-1 border-t border-dashed border-white opacity-30" />
                  </div>

                  {/* Footer */}
                  <p className="text-center text-xs text-white text-opacity-70">
                    *Some restrictions may apply. Cannot be combined with other
                    offers.
                  </p>
                </div>
              </div>

              {/* Confetti animation */}
              {showConfetti && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {confettiParticles.map((particle) => (
                    <div
                      key={particle.id}
                      className="absolute animate-confetti"
                      style={{
                        backgroundColor: particle.color,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        borderRadius: "2px",
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        animationDelay: `${Math.random() * 0.5}s`,
                        animationDuration: `${1 + Math.random() * 2}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
             {error && <p className="text-red-500 text-2xl text-center">{error}</p>}
            <button
              onClick={claimCoupon}
              disabled={loading}
              style={{
                display: `${error ? "none" : "initial"}`,
                cursor: "pointer",
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Claiming..." : "Claim Coupon"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ClaimCoupon;
