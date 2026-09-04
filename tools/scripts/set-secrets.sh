#!/usr/bin/env bash
# Nạp secrets cho GitHub Actions của repo huong-dong-tarot-site.
#
#   bash tools/scripts/set-secrets.sh
#
# Đọc .env và tệp service account trên máy bạn rồi đẩy lên GitHub bằng gh.
# Script KHÔNG in ra giá trị nào — chỉ in tên biến và độ dài, đủ để biết đã nạp
# đúng chỗ mà không lộ nội dung ra màn hình hay lịch sử terminal.
#
# Chạy được nhiều lần: gh secret set ghi đè, không tạo bản trùng.

set -euo pipefail

REPO="hongkhang21998-creator/huong-dong-tarot-site"
ENV_FILE="${ENV_FILE:-/home/asus/Desktop/HuongDong project/Huong-Dong-Claude-Handover-2026-08-09-update-main./Huong-Dong-Claude-Handover-2026-08-09-update-main/source/firebase-handover/.env}"

command -v gh >/dev/null || { echo "Thiếu gh CLI." >&2; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "gh chưa đăng nhập. Chạy: gh auth login" >&2; exit 1; }
[ -f "$ENV_FILE" ] || { echo "Không thấy .env ở: $ENV_FILE" >&2; exit 1; }

# shellcheck disable=SC1090
set -a; . "$ENV_FILE"; set +a

echo "Repo : $REPO"
echo

# Năm biến chuỗi thường.
for k in SITE_BASE_URL FIREBASE_PROJECT_ID FIREBASE_API_KEY FIREBASE_AUTH_DOMAIN FIREBASE_STORAGE_BUCKET; do
  v="${!k-}"
  if [ -z "${v}" ]; then
    printf '  bỏ qua  %-26s (không có trong .env)\n' "$k"
    continue
  fi
  printf '%s' "$v" | gh secret set "$k" --repo "$REPO"
  printf '  đã nạp  %-26s (%s ký tự)\n' "$k" "${#v}"
done

# Khoá dịch vụ: nạp nguyên tệp JSON.
SA="${GOOGLE_APPLICATION_CREDENTIALS-}"
if [ -n "$SA" ] && [ -f "$SA" ]; then
  gh secret set FIREBASE_SERVICE_ACCOUNT --repo "$REPO" < "$SA"
  printf '  đã nạp  %-26s (%s byte, từ tệp)\n' "FIREBASE_SERVICE_ACCOUNT" "$(stat -c%s "$SA")"
else
  echo "  BỎ QUA  FIREBASE_SERVICE_ACCOUNT — không thấy tệp ở \$GOOGLE_APPLICATION_CREDENTIALS" >&2
fi

echo
echo "── Secrets hiện có trên repo (GitHub không cho đọc lại giá trị):"
gh secret list --repo "$REPO"

echo
echo "── Hai secret App Check là tuỳ chọn, thiếu vẫn build được:"
echo "     FIREBASE_APP_ID · RECAPTCHA_SITE_KEY"
