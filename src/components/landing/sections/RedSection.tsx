import type { RefObject } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { LogoMark } from "../LogoMark";

interface RedSectionProps {
  containerRef: RefObject<HTMLDivElement | null>;
}

export function RedSection({ containerRef }: RedSectionProps) {
  const { scrollY } = useScroll({ container: containerRef });
  const cloudYDesktop = useTransform(scrollY, [0, 300], [0, -100]);
  const cloudYMobile = useTransform(scrollY, [0, 300], [0, -24]);

  return (
    <section className="relative z-10 flex min-h-screen w-full flex-col bg-[#FF0000]">
      {/* 桌面云层 */}
      <motion.div
        style={{ y: cloudYDesktop }}
        className="pointer-events-none absolute top-0 left-0 z-[100] hidden w-full -translate-y-1/2 md:block"
      >
        <img
          src="https://res.cloudinary.com/dsdhxhhqh/image/upload/v1781500777/cloude_vj4pjv.png"
          className="block h-auto w-full"
          referrerPolicy="no-referrer"
          alt=""
        />
      </motion.div>

      {/* 移动云层 */}
      <motion.div
        style={{ y: cloudYMobile }}
        className="pointer-events-none absolute top-0 left-0 z-[100] w-full -translate-y-1/2 md:hidden"
      >
        <img
          src="https://res.cloudinary.com/dsdhxhhqh/image/upload/v1781500777/cloude_vj4pjv.png"
          className="block h-auto w-full"
          referrerPolicy="no-referrer"
          alt=""
        />
      </motion.div>

      {/* 内容区 */}
      <div className="flex w-full flex-1 flex-col items-center pt-[100px] md:pt-[400px]">
        <div className="relative z-20 mx-auto flex h-auto w-full max-w-[900px] flex-col items-center px-8 text-center md:h-[620px]">
          <LogoMark size={80} className="h-[80px] w-[80px] text-white" />
          <p className="mx-auto mb-[40px] h-[100px] max-w-[400px] text-[16px] leading-[1.6] tracking-wider text-white uppercase">
            We built this platform with a single purpose to eliminate operational
            chaos and restore balance to your daily business routine
          </p>
          <p className="mb-[32px] font-marck text-[120px] leading-none text-white">
            S.P.D
          </p>
          <div className="mb-[100px] md:mb-24">
            <p className="mb-[24px] w-[400px] max-w-full text-[16px] font-light text-white">
              Everything your business runs on — schedules, tasks, and follow-ups —
              comes together in one quiet, automatic flow.
            </p>
            <p className="w-[400px] max-w-full text-[16px] font-light text-white">
              No more chasing details by hand. Set it once, and let the routine
              carry itself while you stay calm.
            </p>
          </div>
        </div>
      </div>

      {/* 底部视频块 */}
      <div className="relative w-full shrink-0">
        <div className="pointer-events-none absolute top-0 left-0 z-10 h-[100px] w-full bg-gradient-to-b from-[#FF0000] to-transparent" />
        <video
          className="block h-auto w-full object-contain"
          src="https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/cloudinarry%20to%20cloudflare/track-video_2_haxdch.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
    </section>
  );
}
