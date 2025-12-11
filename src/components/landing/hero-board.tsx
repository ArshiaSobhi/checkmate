"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const Chessboard = dynamic(() => import("react-chessboard").then((m) => m.Chessboard), {
  ssr: false,
});

const demoPositions = ["rnbqkbnr/pppp1ppp/8/4p3/3P4/5N2/PPP1PPPP/RNBQKB1R b KQkq - 1 2", "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1"];

export function HeroBoard() {
  const [fen, setFen] = useState(demoPositions[0]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const id = setInterval(() => {
      setFen((prev) => (prev === demoPositions[0] ? demoPositions[1] : demoPositions[0]));
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const transform = useMemo(() => `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`, [tilt]);

  return (
    <div
      className="relative h-80 w-full max-w-xl rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4 shadow-[0_40px_120px_rgba(0,0,0,0.35)]"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
        setTilt({ x, y });
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div
        className={cn(
          "absolute inset-4 rounded-3xl bg-gradient-to-br from-emerald-500/40 via-transparent to-sky-500/30 blur-3xl",
        )}
      />
      <div className="relative h-full w-full perspective-1000">
        <div
          className="relative h-full w-full overflow-hidden rounded-2xl border border-white/5 bg-slate-900/70 backdrop-blur-lg"
          style={{ transform, transformStyle: "preserve-3d", transition: "transform 200ms ease" }}
        >
          <Chessboard
            position={fen}
            arePiecesDraggable={false}
            boardOrientation="white"
            customBoardStyle={{
              borderRadius: "16px",
              boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
            }}
            customLightSquareStyle={{ backgroundColor: "#f1f5f9" }}
            customDarkSquareStyle={{ backgroundColor: "#0f172a" }}
          />
        </div>
      </div>
    </div>
  );
}
