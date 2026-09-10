import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import immortalTitle from "../../../assets/marks/叩问仙门.svg";
import image412a from "../../../assets/images/412a1593-1ae5-434c-90d3-da49b26ff721.png";
import image46ef from "../../../assets/images/46efbad1-63cc-40dd-89e1-fe5525738cc1.png";
import image4c2b from "../../../assets/images/4c2b81a9-4d73-4fe0-a271-30f28ff46465.png";
import image5178 from "../../../assets/images/51787b10-8a18-4e40-89b8-802dab9938b0.jpg";
import image76e6 from "../../../assets/images/76e62d16-2318-49e5-84b0-f41a028c9074.png";
import imageB6cc from "../../../assets/images/b6cca74f-0987-435c-aa78-f540168320b9.png";
import imageBf51 from "../../../assets/images/bf512603-c014-408b-b774-84e541654193.jpg";
import imageC1e3 from "../../../assets/images/c1e3141b-7506-4157-b8c4-b00af33e21a8.png";
import imageCe8b from "../../../assets/images/ce8bc8c4-90e8-45fd-b75a-c4c2a93d50da.png";
import profileShijie from "../../../assets/videos/师姐.mp4";
import profileZhenggong from "../../../assets/videos/正宫.mp4";
import { VideoProfileCard } from "../VideoProfileCard";
import "./WallpaperGallerySection.css";

gsap.registerPlugin(useGSAP);

export type GalleryEntry = {
  id: "xiantu" | "jinghong" | "daoyou";
  label: string;
  href?: string;
};

export const galleryEntries = [
  { id: "xiantu", label: "仙途" },
  { id: "jinghong", label: "惊鸿" },
  { id: "daoyou", label: "道友", href: "/gallery/daoyou/index.html" },
] as const satisfies readonly GalleryEntry[];
const profileVideos = [
  { label: "正宫人物视频", src: profileZhenggong },
  { label: "师姐人物视频", src: profileShijie },
];

// 以后只需修改这里的 label，就能更换左侧滚轮显示的文字。
const immortalGalleryItems = [
  { label: "仙影画壁", src: image412a },
  { label: "刹那仙踪", src: image46ef },
  { label: "惊鸿名场面", src: image4c2b },
  { label: "光影忆仙途", src: image5178 },
  { label: "术法流光", src: image76e6 },
  { label: "剑阵光影", src: imageB6cc },
  { label: "众生群像", src: imageBf51 },
  { label: "仙门人物志", src: imageC1e3 },
  { label: "山海仙途", src: imageCe8b },
];

export function clampGalleryIndex(index: number, count: number) {
  return Math.min(Math.max(index, 0), Math.max(count - 1, 0));
}

function getWheelItemStyle(index: number, selectedIndex: number) {
  const distance = index - selectedIndex;
  const angle = Math.max(-58, Math.min(58, distance * 11));
  const radians = (angle * Math.PI) / 180;
  const radius = 340;
  const x = -radius * (1 - Math.cos(radians));
  const y = radius * Math.sin(radians);
  const visibleDistance = Math.abs(distance);

  return {
    opacity: Math.max(0, 1 - visibleDistance * 0.2),
    filter: `blur(${Math.max(0, visibleDistance - 1) * 0.7}px)`,
    pointerEvents: visibleDistance > 4 ? "none" : "auto",
    transform: `translate3d(${x.toFixed(2)}px, calc(-50% + ${y.toFixed(2)}px), 0)`,
  } satisfies CSSProperties;
}

function ImmortalImageGallery() {
  const wheelRef = useRef<HTMLDivElement>(null);
  const selectedIndexRef = useRef(0);
  const wheelDeltaRef = useRef(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectImage = useCallback((index: number) => {
    const nextIndex = clampGalleryIndex(index, immortalGalleryItems.length);
    selectedIndexRef.current = nextIndex;
    setSelectedIndex(nextIndex);
  }, []);

  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

      const direction = Math.sign(event.deltaY);
      const currentIndex = selectedIndexRef.current;
      const isBoundary =
        (direction < 0 && currentIndex === 0) ||
        (direction > 0 && currentIndex === immortalGalleryItems.length - 1);

      if (isBoundary) {
        wheelDeltaRef.current = 0;
        return;
      }

      event.preventDefault();
      const delta = event.deltaMode === 1 ? event.deltaY * 24 : event.deltaY;
      wheelDeltaRef.current += delta;
      if (Math.abs(wheelDeltaRef.current) < 52) return;

      selectImage(currentIndex + Math.sign(wheelDeltaRef.current));
      wheelDeltaRef.current = 0;
    };

    wheel.addEventListener("wheel", handleWheel, { passive: false });
    return () => wheel.removeEventListener("wheel", handleWheel);
  }, [selectImage]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const keyTargets: Record<string, number> = {
      ArrowDown: selectedIndex + 1,
      ArrowRight: selectedIndex + 1,
      ArrowUp: selectedIndex - 1,
      ArrowLeft: selectedIndex - 1,
      Home: 0,
      End: immortalGalleryItems.length - 1,
    };
    const nextIndex = keyTargets[event.key];
    if (nextIndex === undefined) return;
    event.preventDefault();
    selectImage(nextIndex);
  };

  const selectedItem = immortalGalleryItems[selectedIndex];

  return (
    <div className="immortal-gallery">
      <img
        className="immortal-gallery__title"
        src={immortalTitle}
        alt="凡人修仙"
      />

      <div className="immortal-gallery__stage">
        <div
          ref={wheelRef}
          className="immortal-gallery__wheel"
          role="listbox"
          tabIndex={0}
          aria-label="壁纸选择"
          aria-activedescendant={`immortal-gallery-option-${selectedIndex}`}
          onKeyDown={handleKeyDown}
        >
          {immortalGalleryItems.map((item, index) => (
            <button
              id={`immortal-gallery-option-${index}`}
              key={item.src}
              type="button"
              role="option"
              tabIndex={-1}
              aria-selected={selectedIndex === index}
              className={`immortal-gallery__option${
                selectedIndex === index
                  ? " immortal-gallery__option--selected"
                  : ""
              }`}
              style={getWheelItemStyle(index, selectedIndex)}
              onClick={() => selectImage(index)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <figure className="immortal-gallery__figure">
          <img
            key={selectedItem.src}
            className="immortal-gallery__image"
            src={selectedItem.src}
            alt={`${selectedItem.label} 壁纸`}
            loading="lazy"
            decoding="async"
          />
        </figure>
      </div>
    </div>
  );
}

function GalleryEntryWordmark({ label }: Pick<GalleryEntry, "label">) {
  return (
    <div className="wallpaper-card__logo" role="img" aria-label={label}>
      <span className="wallpaper-card__wordmark">{label}</span>
      <sup className="wallpaper-card__registered" aria-hidden="true">
        ®
      </sup>
    </div>
  );
}

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
        {galleryEntries.map((entry) => (
          <figure className="wallpaper-card" key={entry.id}>
            {"href" in entry ? (
              <a
                className="wallpaper-card__link"
                href={entry.href}
                aria-label={`打开${entry.label}闪卡画廊`}
              >
                <GalleryEntryWordmark label={entry.label} />
              </a>
            ) : (
              <GalleryEntryWordmark label={entry.label} />
            )}
          </figure>
        ))}
      </div>

      <div
        className="video-profile-gallery"
        role="region"
        aria-label="人物视频卡片"
      >
        {profileVideos.map((video) => (
          <VideoProfileCard
            key={video.src}
            label={video.label}
            src={video.src}
          />
        ))}
      </div>

      <ImmortalImageGallery />
    </section>
  );
}
