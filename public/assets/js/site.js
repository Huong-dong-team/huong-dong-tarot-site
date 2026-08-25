/* Điểm vào duy nhất của front-end, được _layout.html nạp trên mọi trang.

   File này từng chứa toàn bộ mã tương tác của website. Nó đã được tách thành các
   module có vòng đời rõ ràng dưới ui/, page/ và page-transition/, vì chuyển cảnh
   bằng Swup thay DOM mà không tải lại trang: mã chạy bằng side-effect lúc import
   sẽ chồng listener lên nhau sau mỗi lần điều hướng và không có đường nào gỡ ra.

   Bản đồ nhanh:
     page-transition/bootstrap.js  dựng menu, dựng module của trang, rồi bật Swup
     page/registry.js              trang nào cần module nào, init/destroy ở đâu
     ui/*.js                       từng mảnh tương tác, mỗi mảnh một trách nhiệm
     landing-drag/*.js             dải kéo ngang của trang chủ */
import "./page-transition/bootstrap.js";
