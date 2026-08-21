export async function POST() {
  return Response.json(
    {
      error: {
        code: "payment_webhook_not_configured",
        message: "Webhook chưa được mở vì chưa có thuật toán chữ ký chính thức từ cổng đã phê duyệt.",
      },
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
