import { BookOpenText, House, Images, Sparkles } from "lucide-react";
import footerArtwork from "../../../assets/images/footer-artwork.png";
import "./FooterSection.css";

const footerLinks = [
  { label: "返回首页", href: "#home", Icon: House },
  { label: "阅读凡人之道", href: "#mortal-way", Icon: BookOpenText },
  { label: "浏览壁纸合集", href: "#wallpapers", Icon: Images },
  { label: "观看特效动图", href: "#effects", Icon: Sparkles },
];

export function FooterSection() {
  return (
    <footer
      id="about"
      className="footer-about scroll-mt-20"
      aria-label="网站页脚"
    >
      <div className="footer-about__layout">
        <div className="footer-about__content">
          <div>
            <h2 className="footer-about__title">
              <span>他日仙界若相逢</span>
              <span>一声道友尽沧桑</span>
            </h2>
            <p className="footer-about__description">
              2026 观仙途・个人粉丝收藏馆・非正式官方站点，哈哈哈。
            </p>
          </div>

          <nav className="footer-about__nav" aria-label="页脚导航">
            {footerLinks.map(({ label, href, Icon }) => (
              <a key={href} href={href} aria-label={label} title={label}>
                <Icon aria-hidden="true" size={21} strokeWidth={1.6} />
              </a>
            ))}
          </nav>

          <div className="footer-about__meta">
            <p className="footer-about__monogram" aria-hidden="true">
              凡人
            </p>
            <div>
              <p>关于我</p>
              <p>关注我</p>
            </div>
          </div>
        </div>

        <figure className="footer-about__media">
          <img
            src={footerArtwork}
            alt="呐喊风格人物油画"
            loading="lazy"
            decoding="async"
          />
        </figure>
      </div>
    </footer>
  );
}
