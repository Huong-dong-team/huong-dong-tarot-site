import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <p className="wordmark footer-wordmark">Hường Đông</p>
          <p className="footer-copy">
            Học Tarot qua một hành trình huyền sử Việt - giữ logic RWS, mở rộng bằng liên tưởng văn hóa.
          </p>
        </div>
        <div>
          <p className="footer-heading">Khám phá</p>
          <Link href="/bo-bai">Thư viện lá bài</Link>
          <Link href="/tarot-rws">Tra cứu Tarot RWS</Link>
          <Link href="/chiem-tinh">Chiêm tinh nhập môn</Link>
          <Link href="/hon-cot-nuoc-nam">Hồn cốt nước Nam</Link>
          <Link href="/cua-hang">Phiên bản sản phẩm</Link>
        </div>
        <div>
          <p className="footer-heading">Mua hàng an toàn</p>
          <span>Chính sách đặt cọc</span>
          <span>Đổi trả & hoàn tiền</span>
          <span>Bảo mật dữ liệu</span>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 NguyenHongKhang. All rights reserved.</span>
        <span>Sản phẩm văn hóa và học tập - không thay thế tư vấn chuyên môn.</span>
      </div>
    </footer>
  );
}
