import { SiteHeader } from "../../components/landing/SiteHeader";
import { VideoHeroSection } from "../../components/landing/sections/VideoHeroSection";
import { WallpaperGallerySection } from "../../components/landing/sections/WallpaperGallerySection";
import { RedSection } from "../../components/landing/sections/RedSection";

export function HomePage() {
  return (
    <main
      className="home-scroll relative h-screen overflow-y-auto overflow-x-hidden bg-black font-manrope"
    >
      <SiteHeader />
      <VideoHeroSection />
      <WallpaperGallerySection />
      <RedSection />
    </main>
  );
}
