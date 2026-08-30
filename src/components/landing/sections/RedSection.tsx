import { LogoMark } from "../LogoMark";

export function RedSection() {
  return (
    <section
      id="mortal-way"
      className="relative z-10 flex min-h-screen w-full scroll-mt-20 flex-col bg-[#013440]"
    >
      {/* 内容区 */}
      <div className="flex w-full flex-1 flex-col items-center pt-[120px] md:pt-[240px]">
        <div className="relative z-20 mx-auto flex h-auto w-full max-w-[900px] flex-col items-center px-8 text-center md:h-[620px]">
          <LogoMark size={80} className="h-[80px] w-[80px] text-white" />
          <p className="mx-auto mb-[40px] h-[100px] max-w-[400px] text-[16px] leading-[1.6] tracking-wider text-white uppercase">
            We built this platform with a single purpose to eliminate operational
            chaos and restore balance to your daily business routine
          </p>
          <p className="mb-[32px] font-marck text-[120px] leading-none text-white">
            S.P.D
          </p>
          <div id="about" className="mb-[100px] scroll-mt-20 md:mb-24">
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
      <div id="effects" className="relative w-full shrink-0 scroll-mt-20">
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
