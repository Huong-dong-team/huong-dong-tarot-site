"use client";

export function ReceiptActions() {
  return (
    <button className="button button-primary receipt-print-button" type="button" onClick={() => window.print()}>
      In hoặc lưu thành PDF
    </button>
  );
}
