/* Nút chia sẻ. Listener gắn thẳng lên nút nằm trong container Swup, nên chúng
   biến mất cùng cây DOM cũ — không cần gỡ tay. Vẫn trả về hàm huỷ để mọi module
   trong registry có cùng một hình dạng API. */

export function init() {
  const buttons = [...document.querySelectorAll("[data-share]")];
  if (!buttons.length) return () => {};

  buttons.forEach((button) => button.addEventListener("click", async () => {
    const encodedUrl = encodeURIComponent(location.href);
    const encodedText = encodeURIComponent(document.title);
    if (button.dataset.share === "facebook") window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank", "noopener,noreferrer,width=720,height=600");
    if (button.dataset.share === "threads") window.open(`https://www.threads.net/intent/post?text=${encodedText}%20${encodedUrl}`, "_blank", "noopener,noreferrer,width=720,height=600");
    if (button.dataset.share === "copy") {
      await navigator.clipboard.writeText(location.href);
      button.textContent = "Đã sao chép";
    }
  }));

  return () => {};
}
