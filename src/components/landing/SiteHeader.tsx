import { Menu, UserRound } from "lucide-react";
import wordmark from "../../assets/marks/fanren-wordmark.svg";

const navigationItems = [
  { label: "首页", href: "#home" },
  { label: "凡人之道", href: "#mortal-way" },
  { label: "壁纸合集", href: "#wallpapers" },
  { label: "特效动图", href: "#effects" },
  { label: "关于我", href: "#about" },
];

const linkClassName =
  "group relative flex min-h-11 items-center whitespace-nowrap px-2 text-[14px] tracking-[0.08em] text-[#E6ECE8]/78 transition-colors duration-300 hover:text-[#E6ECE8] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C49A62]";

export function SiteHeader() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[200] border-b border-[#E6ECE8]/10 bg-[#061012]/72 font-navigation backdrop-blur-md">
      <div className="pointer-events-auto mx-auto grid h-16 w-full max-w-[1600px] grid-cols-[1fr_auto] items-center gap-4 px-5 md:h-20 md:px-10 lg:grid-cols-[1fr_auto_1fr] lg:px-16">
        <a
          href="#home"
          className="w-fit rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C49A62]"
          aria-label="返回首页"
        >
          <img
            src={wordmark}
            alt="凡人修仙传"
            className="h-auto w-[132px] select-none md:w-[176px]"
          />
        </a>

        <nav className="hidden items-stretch gap-5 lg:flex" aria-label="主导航">
          {navigationItems.map((item) => (
            <a key={item.href} href={item.href} className={linkClassName}>
              {item.label}
              <span className="absolute inset-x-2 bottom-0 h-px origin-left scale-x-0 bg-[#C49A62] transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-self-end gap-2 md:gap-3">
          <a
            href="#about"
            aria-label="用户中心"
            className="grid size-11 place-items-center rounded-full text-[#E6ECE8]/84 transition-colors hover:bg-[#E6ECE8]/8 hover:text-[#E6ECE8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C49A62]"
          >
            <UserRound aria-hidden="true" size={20} strokeWidth={1.6} />
          </a>

          <a
            href="#mortal-way"
            className="hidden min-h-11 items-center rounded-full border border-[#C49A62]/55 px-5 text-[13px] tracking-[0.12em] text-[#F1E5D2] transition-colors hover:border-[#C49A62] hover:bg-[#C49A62]/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C49A62] md:flex"
          >
            进入仙途
          </a>

          <details className="group/menu relative lg:hidden">
            <summary className="grid size-11 list-none cursor-pointer place-items-center rounded-full text-[#E6ECE8] transition-colors hover:bg-[#E6ECE8]/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C49A62] [&::-webkit-details-marker]:hidden" aria-label="打开导航菜单">
              <Menu aria-hidden="true" size={21} strokeWidth={1.6} />
            </summary>
            <nav
              aria-label="移动端主导航"
              className="absolute top-[calc(100%+12px)] right-0 flex min-w-[180px] flex-col border border-[#E6ECE8]/12 bg-[#061012]/96 p-3 shadow-[0_18px_48px_rgba(0,0,0,0.36)] backdrop-blur-xl"
            >
              {navigationItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={linkClassName}
                  onClick={(event) =>
                    event.currentTarget.closest("details")?.removeAttribute("open")
                  }
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
