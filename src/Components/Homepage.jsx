import React from "react";
import Home from "../Pic/Gif.png"; // Assuming this path is correct

const Homepage = () => {
  const handleExploreClick = () => {
    // This function scrolls the user to the next section, identified by the ID in the Places component
    const section = document.getElementById("scroll-explore-helper");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    // Background gradient for soft look
    <div className="bg-gradient-to-br from-sky-200 via-sky-300 to-blue-400 min-h-screen flex flex-col md:flex-row items-center px-6 md:px-20 py-20">
      
      {/* LEFT SIDE TEXT CONTAINER */}
      <div className="w-full md:w-1/2 flex justify-center md:justify-start mb-12 md:mb-0">
          {/* IMPROVED: Glassmorphism effect: higher opacity white + increased blur + subtle border */}
          <div className="p-8 sm:p-10 bg-white/50 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-lg text-center md:text-left border border-white/70">
            
            {/* IMPROVED: Tighter leading, stronger primary color */}
            <h1 className="font-extrabold text-5xl sm:text-6xl md:text-7xl leading-tight md:leading-snug text-sky-900">
              The{" "}
              <span className="bg-gradient-to-r from-blue-600 to-sky-400 inline-block text-transparent bg-clip-text">
                World
              </span>{" "}
              is yours to Discover
            </h1>

            <h2 className="text-xl sm:text-2xl mt-4 text-gray-700 font-medium">
              Plan, track, and share every adventure with your personalized travel wishlist manager.
            </h2>

            {/* CTA Button (IMPROVED: Stronger hover/active effect) */}
            <button
              onClick={handleExploreClick}
              className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-full shadow-lg border-2 border-sky-100/50 hover:bg-blue-700 transition transform hover:scale-[1.03] active:scale-95 duration-300 font-bold text-lg inline-flex items-center justify-center gap-2"
            >
              Start Planning <span aria-hidden="true">→</span>
            </button>
          </div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div className="w-full md:w-1/2 flex justify-center mt-12 md:mt-0">
        <img
          src={Home}
          alt="Illustration of world exploration"
          className="w-full max-w-xs sm:max-w-md h-auto rounded-3xl shadow-2xl shadow-sky-900/40 border-4 border-white transition duration-500 hover:rotate-1 animate-pulse-slow"
        />
      </div>

      {/* Custom CSS for slow floating animation */}
      <style>{`
        @keyframes pulse-slow {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-8px); /* Slightly more pronounced float */
            }
        }
        .animate-pulse-slow {
            animation: pulse-slow 7s ease-in-out infinite; /* Slightly slower animation */
        }
      `}</style>
    </div>
  );
};

export default Homepage;