# Kế hoạch · Thuật toán "Lá hôm nay"

Ghép **thời điểm bốc bài** (chiêm tinh) với **ý nghĩa lá bài**, có một lớp
**Kinh Dịch ẩn** không lộ ra cho người xem. Mục tiêu: sinh được rất nhiều diễn
giải khác nhau mà không cần viết tay từng cái.

Đây là bản kế hoạch. Chưa viết code.

---

## 1 · Bài toán thật nằm ở đâu

Không phải ở chỗ ghép chuỗi — ghép thì dễ. Khó ở chỗ **ghép mà không nhạt**.

Một hệ tổ hợp ngây thơ sẽ cho ra: *"Lá Công Lý · hôm nay là ngày Canh Tý · bạn nên
cân nhắc"* — ba mẩu dán cạnh nhau, đọc phát biết là máy sinh. Cái làm nó có hồn là
**quy tắc va chạm**: khi lá bài và thời điểm nói ngược nhau thì chính mâu thuẫn đó
là nội dung, chứ không phải chọn một bên rồi bỏ bên kia.

Toàn bộ thiết kế dưới đây xoay quanh điểm này.

---

## 2 · Ba lớp đầu vào

| Lớp | Nguồn | Lộ ra cho người xem? |
|---|---|---|
| **Lá bài** | 78 lá × 2 chiều = 156 trạng thái, dữ liệu đã có | Có — tên lá, nghĩa, chủ thể |
| **Thời điểm** | Can Chi ngày + giờ, tuần trăng, tiết khí | Một phần — nói kiểu "sáng nay", "cuối tháng" |
| **Quẻ Dịch** | Sinh từ chính thời điểm đó | **Không bao giờ** |

Lớp thứ ba là lớp ẩn. Nó chỉ đổi **nhịp và hướng** của lời đọc, không bao giờ
xuất hiện dưới dạng tên quẻ, tên hào, hay chữ "quẻ".

---

## 3 · Sinh quẻ ẩn từ thời điểm — Mai Hoa Dịch Số

Phép này vốn dùng chính con số thời gian, nên khớp bài toán một cách tự nhiên.

```
Thượng quái = (năm chi + tháng âm + ngày âm)          mod 8   (0 → 8)
Hạ quái     = (năm chi + tháng âm + ngày âm + giờ chi) mod 8   (0 → 8)
Hào động    = (năm chi + tháng âm + ngày âm + giờ chi) mod 6   (0 → 6)
```

Ra một quẻ trong 64, kèm một hào động trong 6. Nhưng ta **không dùng tên quẻ**.
Ta chỉ rút ra hai đại lượng:

- **Vị trí hào động (1–6)** → *thời*: việc đang ở đoạn nào
- **Quẻ biến so với quẻ gốc** → *hướng*: đang mở ra hay đang khép lại

Quy về ba trạng thái thời, mỗi trạng thái một câu khung:

| Hào động | Thời | Câu khung mẫu |
|---|---|---|
| 1–2 | Mới chớm | "Việc còn ở đoạn chưa thành hình…" |
| 3–4 | Giữa chừng | "Việc đã đi được nửa đường…" |
| 5–6 | Gần dứt | "Việc đã gần chỗ kết…" |

**Không được xuất hiện trong đầu ra:** tên 64 quẻ, tên 8 quái, chữ "hào", "quẻ",
"Dịch", "Càn/Khôn/Chấn/Tốn/Khảm/Ly/Cấn/Đoài". Sẽ có test chặn (§8).

---

## 4 · Cầu nối tứ đại ↔ ngũ hành

Bốn nhà Ẩn Phụ dùng **tứ đại**: Lửa · Nước · Khí · Đất.
Can Chi dùng **ngũ hành**: Kim · Mộc · Thủy · Hỏa · Thổ.

Bốn không chia hết cho năm. Đây là chỗ dễ ép bừa, nên phải khai báo tường minh:

| Nhà | Tứ đại | Ngũ hành gán |
|---|---|---|
| Cây Tre | Lửa | Hỏa |
| Hoa Sen | Nước | Thủy |
| Dâu Tằm | Khí | Kim |
| Bông Lúa | Đất | Thổ |

**Mộc không có nhà tương ứng.** Đó không phải lỗi — Mộc trở thành "hành trống":
ngày mang hành Mộc thì không có nhà nào đồng khí, và quy tắc va chạm dùng đúng
khoảng trống đó làm chất liệu ("hôm nay không có gì cùng nhịp với bạn").

22 lá Ẩn Chính chưa có trường `element`. Cần bổ sung một bảng gán 22 dòng, viết
tay theo quy ước Tarot cổ điển, **không suy ra bằng công thức**.

---

## 5 · Năm trục tổ hợp

| Trục | Nguồn | Số trạng thái | Ảnh hưởng câu nào |
|---|---|---|---|
| A · Lá | 78 × 2 chiều | 156 | Câu lõi — nghĩa của ngày |
| B · Quan hệ ngũ hành | hành lá vs hành ngày | 5 | Mức thuận/nghịch |
| C · Thời (hào động) | Kinh Dịch ẩn | 3 | Việc đang ở đoạn nào |
| D · Khung giờ | 12 chi gom thành 4 buổi | 4 | Lĩnh vực nổi lên |
| E · Tuần trăng | 4 pha | 4 | Giọng: khởi / tăng / mãn / lắng |

Quan hệ ngũ hành ở trục B, năm trạng thái: **sinh nhập** (ngày nuôi lá),
**sinh xuất** (lá cho đi), **khắc nhập** (ngày ép lá), **khắc xuất** (lá vượt ngày),
**tỵ hòa** (cùng hành).

### Con số quan trọng nhất của cả kế hoạch

```
Không gian đầu ra : 156 × 5 × 3 × 4 × 4 = 37.440 tổ hợp
Mẩu phải viết tay : 156 (đã có sẵn) + 5 + 3 + 4 + 4 = 172
```

**Mẩu viết tay tăng tuyến tính, đầu ra tăng theo cấp số nhân.** Thêm một trục 4
trạng thái nữa là gấp bốn đầu ra mà chỉ tốn 4 mẩu.

---

## 6 · Quy tắc va chạm — phần làm nó không nhạt

Mỗi trục cho ra một **vector hai chiều**: *hướng* (tiến / giữ / thoái) và
*nhịp* (nhanh / chậm).

- Lá xuôi → tiến · lá ngược → thoái
- Sinh nhập → tiến · khắc nhập → thoái · tỵ hòa → giữ
- Hào 1–2 → nhịp chậm · hào 5–6 → nhịp nhanh

Khi **hướng của lá** và **hướng của ngày** khớp nhau → dùng khung *cộng hưởng*.
Khi **ngược nhau** → dùng khung *căng*, và chính sự ngược đó là nội dung:

> Lá nói kết thúc, ngày nói khởi đầu →
> *"Điều bạn đang muốn khép lại hôm nay lại có dấu hiệu mở ra thêm một lần nữa."*

Ba khung: **cộng hưởng · căng · trung tính**. Nhân với 5 quan hệ ngũ hành cho
15 câu khung, viết tay một lần, dùng cho cả 37.440 tổ hợp.

Đây là chỗ phân biệt hệ này với một bộ sinh chuỗi tầm thường.

---

## 7 · Xác định tính

Cùng một người, cùng một ngày → **cùng một lá và cùng một lời đọc**.

```
seed = hash(userId ?? deviceId, ngày-dương-lịch)
```

Không dùng `Math.random()`. Lý do:
- Người bốc lại nhiều lần trong ngày mà ra kết quả khác nhau thì mất tin cậy
- Test không chạy được nếu đầu ra ngẫu nhiên
- Chia sẻ ảnh lên mạng phải khớp với cái họ đọc

Người chưa đăng nhập thì seed theo `deviceId` lưu ở `localStorage`.

---

## 8 · Kiểm thử — làm sao biết đầu ra không nhạt

Đây là phần tôi coi trọng hơn cả thuật toán.

| Kiểm | Ngưỡng |
|---|---|
| Lớp Dịch không rò rỉ | 0 lần xuất hiện từ cấm trong 10.000 mẫu sinh ngẫu nhiên |
| Không trùng lặp | 10.000 mẫu → ≥ 9.500 chuỗi khác nhau |
| Không mâu thuẫn nội tại | Không mẫu nào vừa khuyên "hãy dứt khoát" vừa khuyên "hãy chờ" |
| Xác định tính | Cùng seed chạy 100 lần → 100 kết quả y hệt |
| Độ dài | 40–90 từ; dài hơn là dấu hiệu đang lấp chỗ trống |
| Phủ đều | Mỗi trong 156 lá xuất hiện ít nhất một lần trong 10.000 mẫu |

Kiểm "không nhạt" thì máy không làm được. Cách thay thế: **lấy mẫu 50 kết quả
ngẫu nhiên cho người đọc chấm**, mỗi đợt sinh nội dung mới lại chấm lại.

---

## 9 · Ranh giới cần giữ

**Không nói tương lai xác quyết.** Câu chữ ở mức "hôm nay nghiêng về…",
không phải "hôm nay bạn sẽ…".

**Không đụng bốn lĩnh vực nhạy cảm.** Không sinh câu về sức khỏe theo nghĩa y tế,
tài chính theo nghĩa khuyến nghị đầu tư, pháp lý, hay quan hệ theo nghĩa chẩn đoán.
Bốn trường `love/career/finance/health` đã có trong dữ liệu được dùng làm *chủ đề*,
không dùng làm *lời khuyên hành động*.

**Lớp Dịch ẩn không phải để giấu chất lượng.** Nó ẩn vì đó là lựa chọn thẩm mỹ —
người đọc không cần biết bộ máy. Nhưng nội bộ phải tra ngược được: mỗi kết quả
kèm một `traceId` cho phép dựng lại chính xác đầu vào nào sinh ra nó.

---

## 10 · Lộ trình và phân công

| Bước | Việc | Ai | Nghiệm thu |
|---|---|---|---|
| **A1** | Lịch Can Chi + âm lịch + tuần trăng, offline, không gọi API | Claude | Đối chiếu 100 ngày mẫu với lịch chuẩn, sai 0 |
| **A2** | Bảng gán ngũ hành cho 22 Ẩn Chính | **Người** duyệt, Claude dựng | 22/22 có hành, không suy ra bằng công thức |
| **A3** | Bộ sinh quẻ ẩn theo Mai Hoa | Claude | Cùng thời điểm → cùng quẻ; test 1.000 mốc |
| **B1** | 15 câu khung va chạm (5 quan hệ × 3 trạng thái) | **ChatGPT** viết, **Người** duyệt giọng | Không câu nào lộ từ cấm |
| **B2** | 3 câu thời + 4 câu buổi + 4 câu tuần trăng | **ChatGPT** | Ghép được với mọi lá, không sượng |
| **B3** | Bộ ghép + xác định tính + `traceId` | Claude | 6 kiểm ở §8 đều đạt |
| **C1** | Giao diện trang "Lá hôm nay" | **ChatGPT** | a11y ≥ 97 · CLS 0 |
| **C2** | Chia sẻ kết quả thành ảnh | **ChatGPT** | Ảnh khớp lời đọc đã hiện |
| **D1** | Chấm 50 mẫu, chỉnh giọng | **Người** | Đạt thì mở cho người dùng |

Bước A phải xong trước B; B trước C. A1 và A3 làm được ngay, không chờ ai.

**Ước lượng:** A 3–4 ngày · B 1 tuần (phần lớn là viết và duyệt giọng) ·
C 3–5 ngày · D tùy lịch duyệt.

---

## 11 · Việc cần chốt trước khi viết dòng code đầu tiên

1. **Múi giờ nào tính "ngày"?** Giờ Việt Nam, hay giờ máy người dùng? Người ở nước
   ngoài bốc lúc 23h giờ họ là "hôm nay" hay "hôm qua"?
2. **Đổi ngày lúc mấy giờ?** Nửa đêm dương lịch, hay giờ Tý (23h) theo lối cổ?
3. **Bốc lại trong ngày** — chặn hẳn, hay cho xem lại đúng kết quả cũ?
4. **Lá ngược có dùng không?** Hiện dữ liệu có `reversedMeaning` cho cả 78 lá, nhưng
   trang lá đang hiện cả hai nghĩa. Nếu "lá hôm nay" cũng rút ngược thì không gian
   gấp đôi; nếu không thì chỉ còn 78 trạng thái ở trục A.
