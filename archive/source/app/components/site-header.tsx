import Link from "next/link";
import { navigation } from "@/content/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <div className="brand-cluster">
          <Link className="home-button" href="/" prefetch={false} aria-label="Về trang chủ" title="Trang chủ">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3.5 10.8 12 3.7l8.5 7.1" />
              <path d="M5.8 9.4v10.1h12.4V9.4M9.6 19.5v-6.2h4.8v6.2" />
            </svg>
          </Link>
          <Link className="wordmark" href="/" prefetch={false} aria-label="Hường Đông - trang chủ">
            Hường Đông
          </Link>
        </div>
        <nav className="main-nav" aria-label="Điều hướng chính">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a className="header-cta" href="/dat-coc">
          Đặt cọc
        </a>
      </div>
    </header>
  );
}
