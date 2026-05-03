"use client";

import { useEffect, useState } from "react";

// CSS-only star data — generated once, never re-rendered
interface Star {
  top: string;
  left: string;
  size: string;
  duration: string;
  delay: string;
  opacity: string;
}

let _stars: Star[] | null = null;
function getStars(): Star[] {
  if (_stars) return _stars;
  _stars = Array.from({ length: 18 }, () => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 6 + 4}px`,
    duration: `${Math.random() * 4 + 3}s`,
    delay: `${Math.random() * 5}s`,
    opacity: `${Math.random() * 0.25 + 0.1}`,
  }));
  return _stars;
}

export function BackgroundEffects() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const stars = getStars();

  return (
    <>
      {/* Injected CSS keyframes — zero JS runtime cost */}
      <style>{`
        @keyframes bg-float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(40px, 80px) scale(1.18); }
          66%       { transform: translate(20px, 40px) scale(1.05); }
        }
        @keyframes bg-float-rev {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(-35px, -70px) scale(1.12); }
          66%       { transform: translate(-15px, -30px) scale(1.04); }
        }
        @keyframes star-pulse {
          0%, 100% { opacity: var(--star-opacity-min); transform: translateY(0); }
          50%       { opacity: var(--star-opacity-max); transform: translateY(-18px); }
        }
      `}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Glow blobs — CSS animated, GPU-composited via transform only */}
        <div
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px]"
          style={{
            animation: "bg-float-slow 16s ease-in-out infinite",
            willChange: "transform",
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]"
          style={{
            animation: "bg-float-rev 13s ease-in-out infinite",
            willChange: "transform",
          }}
        />

        {/* Floating stars — pure CSS, no JS animation loop */}
        {stars.map((star, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              borderRadius: "50%",
              backgroundColor: "rgba(6, 182, 212, 0.55)", // cyan-500
              animation: `star-pulse ${star.duration} ease-in-out infinite`,
              animationDelay: star.delay,
              willChange: "transform, opacity",
              // CSS custom properties for per-star opacity range
              ["--star-opacity-min" as string]: star.opacity,
              ["--star-opacity-max" as string]: `${Math.min(parseFloat(star.opacity) * 2.2, 0.55)}`,
            }}
          />
        ))}
      </div>
    </>
  );
}
