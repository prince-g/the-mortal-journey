import footerArtwork from "../../../assets/images/footer-artwork.png";
import "./FooterSection.css";

// TODO: 把每个 href 的 "#" 替换成真实的社交主页 / 联系方式
const footerLinks = [
  { label: "GitHub", href: "#", icon: "/gallery/daoyou/assets/logo/github-icon.svg" },
  { label: "Gitee", href: "#", icon: "/gallery/daoyou/assets/logo/gitee-svgrepo-com.svg" },
  { label: "Gmail", href: "#", icon: "/gallery/daoyou/assets/logo/google-gmail.svg" },
  { label: "QQ", href: "#", icon: "/gallery/daoyou/assets/logo/qq-fill-svgrepo-com.svg" },
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
            {footerLinks.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                title={label}
                target="_blank"
                rel="noreferrer"
              >
                <img src={icon} alt="" aria-hidden="true" />
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
