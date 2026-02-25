"use client";

import { useEffect, useState } from "react";

export default function AnimatedHero() {
  const [showSecondText, setShowSecondText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSecondText(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-40 flex items-center justify-center">
      {/* First text - Track your wealth */}
      <div
        className={`absolute transition-all duration-1000 ${
          showSecondText
            ? "opacity-0 scale-95"
            : "opacity-100 scale-100"
        }`}
      >
        <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
          track your wealth
        </h1>
      </div>

      {/* Second text - Easy, free, swiss */}
      <div
        className={`absolute transition-all duration-1000 ${
          showSecondText
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95"
        }`}
      >
        <h1 className="text-6xl md:text-7xl font-light tracking-wider text-blue-300">
          easy. free. swiss.
        </h1>
      </div>
    </div>
  );
}
