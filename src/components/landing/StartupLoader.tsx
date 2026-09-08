import { useCallback, useEffect, useRef, useState } from "react";
import bottleMark from "../../assets/marks/掌天瓶.svg";
import "./StartupLoader.css";

export const STARTUP_PROGRESS_DURATION_MS = 2300;
export const STARTUP_EXIT_DURATION_MS = 900;

const STARTUP_SESSION_KEY = "the-mortal-journey:startup-seen";

type SessionStorageLike = Pick<Storage, "getItem" | "setItem">;

type StartupLoaderProps = {
  onComplete: () => void;
};

let startupDecisionForDocument: boolean | undefined;

export function claimStartupForSession(storage: SessionStorageLike) {
  try {
    if (storage.getItem(STARTUP_SESSION_KEY)) return false;
    storage.setItem(STARTUP_SESSION_KEY, "1");
    return true;
  } catch {
    return true;
  }
}

export function shouldShowStartupForDocument() {
  if (startupDecisionForDocument !== undefined) {
    return startupDecisionForDocument;
  }

  if (typeof window === "undefined") {
    startupDecisionForDocument = true;
    return startupDecisionForDocument;
  }

  startupDecisionForDocument = claimStartupForSession(window.sessionStorage);
  return startupDecisionForDocument;
}

export function markStartupCompleteForDocument() {
  startupDecisionForDocument = false;
}

export function getStartupProgress(elapsedMs: number) {
  if (elapsedMs <= 0) return 0;
  if (elapsedMs >= STARTUP_PROGRESS_DURATION_MS) return 100;

  const time = elapsedMs / STARTUP_PROGRESS_DURATION_MS;
  const eased = 1 - Math.pow(1 - time, 2.15);
  return Math.min(99, Math.floor(eased * 100));
}

export function StartupLoader({ onComplete }: StartupLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "exiting">("loading");
  const completeCalledRef = useRef(false);

  const completeOnce = useCallback(() => {
    if (completeCalledRef.current) return;
    completeCalledRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (phase !== "loading") return;

    const startedAt = performance.now();
    let frameId = 0;
    let exitTimer = 0;

    const tick = (now: number) => {
      const nextProgress = getStartupProgress(now - startedAt);
      setProgress((current) =>
        current === nextProgress ? current : nextProgress,
      );

      if (nextProgress < 100) {
        frameId = requestAnimationFrame(tick);
        return;
      }

      exitTimer = window.setTimeout(() => setPhase("exiting"), 260);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(exitTimer);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "exiting") return;
    const fallbackTimer = window.setTimeout(
      completeOnce,
      STARTUP_EXIT_DURATION_MS + 120,
    );
    return () => window.clearTimeout(fallbackTimer);
  }, [completeOnce, phase]);

  return (
    <div
      className={`startup-loader startup-loader--${phase}`}
      role="status"
      aria-live="polite"
      aria-label="网站正在加载"
      onAnimationEnd={(event) => {
        if (phase === "exiting" && event.target === event.currentTarget) {
          completeOnce();
        }
      }}
    >
      <div className="startup-loader__content">
        <div className="startup-loader__mark-frame">
          <img
            className="startup-loader__mark"
            src={bottleMark}
            alt="掌天瓶"
          />
        </div>

        <div className="startup-loader__progress-block">
          <div
            className="startup-loader__track"
            role="progressbar"
            aria-label="网站加载进度"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span
              className="startup-loader__fill"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>

          <div className="startup-loader__meta">
            <p className="startup-loader__title">The Immortal Ascension</p>
            <span className="startup-loader__value" aria-hidden="true">
              {String(progress).padStart(2, "0")}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
