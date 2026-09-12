import { useEffect, useRef } from "react";
import wordmark from "../../../assets/marks/凡人修仙.svg";
import image412a from "../../../assets/images/xuanzimages/1f54a096-7cbd-4767-8631-9f0aed86fe50.jpg";
import image46ef from "../../../assets/images/xuanzimages/2afaa8a5-9b2c-43fe-8cd5-3fa90d45957d.jpg";
import image4c2b from "../../../assets/images/xuanzimages/3b194c18-7304-4a52-9ab4-f03453cbf67f.jpg";
import image5178 from "../../../assets/images/xuanzimages/4b7be0de-fbea-4382-9c8c-3ab9ce705787.jpg";
import image76e6 from "../../../assets/images/xuanzimages/7de0a4d4-8946-4515-8027-fe71960863dc.jpg";
import imageB6cc from "../../../assets/images/xuanzimages/46efbad1-63cc-40dd-89e1-fe5525738cc1.png";
import imageBf51 from "../../../assets/images/xuanzimages/55abe41f-d451-4bb2-9dd9-97cf13a0e87b.jpg";
import imageC1e3 from "../../../assets/images/xuanzimages/e091a92f-4be7-4e07-af10-9f80573e2aca.png";
import imageCe8b from "../../../assets/images/xuanzimages/e3283bce-7311-4aae-9bff-07dcf003b690.png";
import "./ImageStreamSection.css";

const streamImages = [
  image412a,
  image46ef,
  image4c2b,
  image5178,
  image76e6,
  imageB6cc,
  imageBf51,
  imageC1e3,
  imageCe8b,
];

const path = {
  perspective: 30,
  cardWidth: 18,
  cardHeight: 25,
  birthHeight: 2.6,
  exitHeight: 46,
  railBirth: -11,
  railExit: 44,
  fan: 3.3,
  turnBirth: 6,
  turnExit: 28,
  stops: 24,
};

function createKeyframes(direction: 1 | -1, name: string) {
  const steps: string[] = [];

  for (let step = 0; step <= path.stops; step += 1) {
    const progress = step / path.stops;
    const scale =
      (path.birthHeight / path.cardHeight) *
      Math.pow(path.exitHeight / path.birthHeight, progress);
    const depth = path.perspective * (1 - 1 / scale);
    const rail =
      path.railExit -
      (path.railExit - path.railBirth) * Math.pow(1 - progress, path.fan);
    const turn =
      path.turnBirth + (path.turnExit - path.turnBirth) * progress;

    steps.push(
      `${(progress * 100).toFixed(2)}%{transform:translate3d(${(
        direction * rail
      ).toFixed(2)}cqw,0,${depth.toFixed(2)}cqw) rotateY(${(
        -direction * turn
      ).toFixed(2)}deg)}`,
    );
  }

  return `@keyframes ${name}{${steps.join("")}}`;
}

const streamKeyframes = [
  createKeyframes(1, "image-stream-right"),
  createKeyframes(-1, "image-stream-left"),
].join("");

export function ImageStreamSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let isVisible = true;
    const syncPlayback = () => {
      section.toggleAttribute(
        "data-stream-active",
        isVisible && document.visibilityState !== "hidden",
      );
    };

    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            ([entry]) => {
              isVisible = entry.isIntersecting;
              syncPlayback();
            },
            { rootMargin: "12% 0px" },
          )
        : null;

    observer?.observe(section);
    syncPlayback();
    document.addEventListener("visibilitychange", syncPlayback);

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="effects"
      className="image-stream-section scroll-mt-20"
      aria-label="仙途影像流"
    >
      <style>{streamKeyframes}</style>

      <div
        className="image-stream-section__scene"
        style={{
          perspective: `${path.perspective}cqw`,
          perspectiveOrigin: "50% 55%",
        }}
        aria-hidden="true"
      >
        {(["right", "left"] as const).map((rail) => (
          <div
            key={rail}
            className="image-stream-section__rail"
            data-stream-rail={rail}
          >
            {streamImages.map((src, index) => (
              <div
                key={`${rail}-${src}`}
                className={`image-stream-section__card image-stream-section__card--${rail}`}
                data-stream-card=""
                style={{ animationDelay: `${-(index * 18) / 9}s` }}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="image-stream-section__brand">
        <img src={wordmark} alt="凡人修仙传" />
      </div>
    </section>
  );
}
