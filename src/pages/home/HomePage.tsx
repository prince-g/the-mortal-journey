import { useRef } from "react";
import { VideoHeroSection } from "../../components/landing/sections/VideoHeroSection";
import { RedSection } from "../../components/landing/sections/RedSection";

export function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <main
      ref={containerRef}
      className="relative h-screen overflow-y-auto overflow-x-hidden bg-black font-manrope"
    >
      <VideoHeroSection />
      <RedSection containerRef={containerRef} />
    </main>
  );
}
