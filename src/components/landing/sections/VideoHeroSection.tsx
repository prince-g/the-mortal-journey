import { LogoMark } from "../LogoMark";
import heroVideo from "../../../assets/videos/bamboo-pavilion.mp4";

export function VideoHeroSection() {
  return (
    <section className="relative h-screen w-full flex-shrink-0 overflow-hidden">
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

      {/* 左上 logo 块 */}
      <div className="pointer-events-auto absolute top-[24px] left-[20px] flex max-w-[calc(100vw-140px)] items-center gap-[16px] md:top-[64px] md:left-[64px] md:max-w-none md:gap-[24px]">
        <LogoMark size={48} className="h-[48px] w-[48px] text-white md:h-[64px] md:w-[64px]" />
        <p className="hidden text-[16px] leading-[1.2] font-semibold tracking-[0.02em] text-white md:block">
          Effortless Growth / Operations.
          <br />
          We Handle All Tasks.
          <br />
          Stay Calm.
        </p>
        <p className="block w-[112px] text-[11px] leading-[1.2] font-semibold tracking-[0.02em] text-white md:hidden">
          Complete Business / Automation. We Handle All / Tasks. You Relax.
        </p>
      </div>

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

      {/* 右上 CTA 按钮 */}
      <button className="absolute top-[24px] right-[20px] cursor-pointer rounded-[100%] border border-white bg-black/10 px-5 py-3 text-[12px] font-italiana tracking-widest text-white uppercase backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-[48px] md:top-[64px] md:right-[64px] md:bg-transparent md:px-10 md:py-7 md:text-[18px] md:backdrop-blur-none">
        Get started
      </button>

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
