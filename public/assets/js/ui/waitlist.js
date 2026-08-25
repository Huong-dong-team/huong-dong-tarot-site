/* Form danh sách chờ. Ghi thẳng vào Firestore REST bằng khoá web công khai;
   id document là SHA-256 của email nên gửi lại cùng email trả về 409 thay vì
   tạo bản ghi trùng. */

export function init() {
  const forms = [...document.querySelectorAll("[data-waitlist]")];
  if (!forms.length) return () => {};

  forms.forEach((form) => form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = form.querySelector(".form-status");
    const email = form.elements.email.value.trim().toLowerCase();
    const source = form.elements.source?.value || "website";
    const projectId = document.body.dataset.firebaseProject;
    const apiKey = document.body.dataset.firebaseKey;
    if (!apiKey || !projectId || projectId.includes("HUONG-DONG")) {
      status.textContent = "Bản xem thử đã nhận email trên thiết bị; hãy kết nối Firebase trước khi phát hành.";
      localStorage.setItem("huong-dong-waitlist-demo", JSON.stringify({ email, source, at: new Date().toISOString() }));
      form.reset();
      return;
    }
    const id = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email)).then((bytes) => [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, "0")).join(""));
    status.textContent = "Đang ghi nhận…";
    try {
      const response = await fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/subscribers?documentId=${id}&key=${encodeURIComponent(apiKey)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fields: { email: { stringValue: email }, source: { stringValue: source }, note: { stringValue: "" }, createdAt: { timestampValue: new Date().toISOString() } } }) });
      if (!response.ok && response.status !== 409) throw new Error("request-failed");
      status.textContent = response.status === 409 ? "Email này đã có trong danh sách." : "Đã ghi nhận. Hẹn gặp bạn trong lá thư đầu tiên.";
      form.reset();
    } catch {
      status.textContent = "Chưa ghi nhận được. Vui lòng thử lại sau.";
    }
  }));

  return () => {};
}
