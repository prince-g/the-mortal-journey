import type { PointerEvent } from "react";
import "./VideoProfileCard.css";

interface VideoProfileCardProps {
  label: string;
  src: string;
}

export function VideoProfileCard({ label, src }: VideoProfileCardProps) {
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;

    const card = event.currentTarget;
    const bounds = card.getBoundingClientRect();
    const pointerX = ((event.clientX - bounds.left) / bounds.width) * 100;
    const pointerY = ((event.clientY - bounds.top) / bounds.height) * 100;

    card.style.setProperty("--pointer-x", `${pointerX}%`);
    card.style.setProperty("--pointer-y", `${pointerY}%`);
    card.style.setProperty("--rotate-x", `${(pointerY - 50) / -7}deg`);
    card.style.setProperty("--rotate-y", `${(pointerX - 50) / 8}deg`);
  };

  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    const card = event.currentTarget;
    card.style.setProperty("--pointer-x", "50%");
    card.style.setProperty("--pointer-y", "50%");
    card.style.setProperty("--rotate-x", "0deg");
    card.style.setProperty("--rotate-y", "0deg");
  };

  return (
    <figure className="video-profile-card" aria-label={label}>
      <div
        className="video-profile-card__shell"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div className="video-profile-card__surface">
          <video
            className="video-profile-card__video"
            src={src}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
          <div className="video-profile-card__shine" aria-hidden="true">
            {Array.from({ length: 7 }, (_, index) => (
              <span
                className="video-profile-card__code-mark"
                key={index}
              />
            ))}
          </div>
          <div className="video-profile-card__glare" aria-hidden="true" />
        </div>
      </div>
    </figure>
  );
}
