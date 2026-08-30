import heroVideo from "../../../assets/videos/凡人.mp4";

export function VideoHeroSection() {
  return (
    <section
      id="home"
      className="relative h-screen w-full flex-shrink-0 scroll-mt-20 overflow-hidden"
    >
      {/* 背景视频 */}
      <video
        className="absolute inset-0 z-10 h-full w-full object-cover"
        src={heroVideo}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* 遮罩 */}
      <div className="pointer-events-none absolute inset-0 z-30" />

      {/* 左上描述（仅桌面） */}
      <div className="mt-[400px] hidden w-full max-w-[320px] flex-col gap-[24px] text-[14px] leading-relaxed font-normal text-white md:flex">
        <p>
          Our automation platform handles your recurring operational tasks —
          scheduling, reporting, and follow-ups — so your team can focus on
          growth instead of busywork.
        </p>
        <p>
          Built for small teams and growing businesses, it runs quietly in the
          background and gives back the hours you used to lose to manual
          processes.
        </p>
      </div>

      {/* 底部标题容器 */}
      <div className="absolute bottom-[32px] left-[20px] right-[20px] text-left md:right-[64px] md:bottom-[64px] md:left-auto md:max-w-[1200px] md:text-right">
        <div className="mb-[32px] flex max-w-[280px] flex-col gap-[16px] text-[12px] font-normal text-white md:hidden">
          <p>Complete business automation. We handle all tasks. You relax.</p>
        </div>
        <h1 className="text-[36px] leading-[1.1] font-italiana text-white md:text-[96px] md:leading-[88px]">
          <span className="hidden md:block">
            Intelligent Daily / Routine Automation / For Your Business. / You Relax
          </span>
          <span className="block text-[32px] md:hidden">
            Intelligent Daily Routine / Automation For Your / Business. You Relax
          </span>
        </h1>
      </div>
    </section>
  );
}
