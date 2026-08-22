import { useRef } from "react";
import { VideoHeroSection } from "../../components/landing/sections/VideoHeroSection";

export function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <main
      ref={containerRef}
      className="relative h-screen overflow-y-auto overflow-x-hidden bg-black font-manrope"
    >
      <VideoHeroSection />
      {/* RedSection 在 Task 5 加入 */}
    </main>
  );
}
