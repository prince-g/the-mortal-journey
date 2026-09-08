import { useState } from "react";
import {
  markStartupCompleteForDocument,
  shouldShowStartupForDocument,
  StartupLoader,
} from "../../components/landing/StartupLoader";
import { SiteHeader } from "../../components/landing/SiteHeader";
import { VideoHeroSection } from "../../components/landing/sections/VideoHeroSection";
import { WallpaperGallerySection } from "../../components/landing/sections/WallpaperGallerySection";
import { RedSection } from "../../components/landing/sections/RedSection";
import { ImageStreamSection } from "../../components/landing/sections/ImageStreamSection";

export function HomePage() {
  const [showStartup, setShowStartup] = useState(
    shouldShowStartupForDocument,
  );

  const finishStartup = () => {
    markStartupCompleteForDocument();
    setShowStartup(false);
  };

  return (
    <main
      className="home-scroll relative h-[100dvh] overflow-y-auto overflow-x-hidden bg-black font-manrope"
      data-startup-active={showStartup ? "" : undefined}
    >
      {showStartup && <StartupLoader onComplete={finishStartup} />}
      <div
        className={`startup-home-content ${
          showStartup ? "startup-home-content--veiled" : ""
        }`}
        inert={showStartup ? true : undefined}
        aria-hidden={showStartup ? true : undefined}
      >
        <SiteHeader />
        <VideoHeroSection />
        <WallpaperGallerySection />
        <RedSection />
        <ImageStreamSection />
      </div>
    </main>
  );
}
