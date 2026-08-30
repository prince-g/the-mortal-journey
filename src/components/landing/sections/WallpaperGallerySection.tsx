import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "./WallpaperGallerySection.css";

gsap.registerPlugin(useGSAP);

const cardLabels = ["GSAP", "GSAP", "GSAP"];

export function WallpaperGallerySection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const cleanups = gsap.utils
            .toArray<HTMLElement>(".wallpaper-card")
            .map((card) => {
              const logo = card.querySelector<HTMLElement>(
                ".wallpaper-card__logo",
              );
              if (!logo) return () => undefined;

              const rotateX = gsap.quickTo(card, "rotationX", {
                duration: 0.45,
                ease: "power3.out",
              });
              const rotateY = gsap.quickTo(card, "rotationY", {
                duration: 0.45,
                ease: "power3.out",
              });
              const moveX = gsap.quickTo(logo, "x", {
                duration: 0.45,
                ease: "power3.out",
              });
              const moveY = gsap.quickTo(logo, "y", {
                duration: 0.45,
                ease: "power3.out",
              });

              const reset = () => {
                rotateX(0);
                rotateY(0);
                moveX(0);
                moveY(0);
              };

              const handlePointerMove = (event: PointerEvent) => {
                const bounds = card.getBoundingClientRect();
                const horizontal =
                  (event.clientX - bounds.left) / bounds.width - 0.5;
                const vertical =
                  (event.clientY - bounds.top) / bounds.height - 0.5;

                rotateX(vertical * -10);
                rotateY(horizontal * 12);
                moveX(horizontal * -12);
                moveY(vertical * -12);
              };

              card.addEventListener("pointermove", handlePointerMove);
              card.addEventListener("pointerleave", reset);

              return () => {
                card.removeEventListener("pointermove", handlePointerMove);
                card.removeEventListener("pointerleave", reset);
              };
            });

          return () => cleanups.forEach((cleanup) => cleanup());
        },
        sectionRef,
      );

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="wallpapers"
      className="wallpaper-gallery scroll-mt-20"
      aria-label="壁纸合集"
    >
      <div
        className="wallpaper-gallery__track"
        role="region"
        aria-label="三张 GSAP 动效卡片，可横向滚动"
        tabIndex={0}
      >
        {cardLabels.map((label, index) => (
          <figure className="wallpaper-card" key={index}>
            <div className="wallpaper-card__logo" role="img" aria-label={label}>
              <span className="wallpaper-card__wordmark">{label}</span>
              <sup className="wallpaper-card__registered" aria-hidden="true">
                ®
              </sup>
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}
