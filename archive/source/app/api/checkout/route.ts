export async function POST() {
  return Response.json(
    {
      error: {
        code: "payment_provider_not_configured",
        message: "Cổng thanh toán thật đang khóa cho đến khi ADR và hợp đồng merchant được phê duyệt.",
      },
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
