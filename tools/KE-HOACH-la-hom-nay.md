# Kế hoạch · Thuật toán "Lá hôm nay" — bản 2

Ghép **thời điểm bốc bài** với **ý nghĩa lá Tarot**. Giọng văn Tây phương.
Lớp Kinh Dịch giữ lại nhưng **ẩn hoàn toàn**, chỉ để chỉnh nhịp.

Bản 2 đổi trục chính từ Can Chi sang **chiêm tinh Tây phương** — quyết định này
làm bài toán sạch hơn hẳn, xem §2.

Đây là kế hoạch. Chưa viết code.

---

## 1 · Bài toán thật

Không phải ở phép nhân — nhân thì dễ. Khó ở chỗ **nhân mà không nhạt**.

Một hệ ghép ngây thơ cho ra: *"Lá Công Lý · hôm nay Mặt Trời ở Bọ Cạp · giờ Sao Kim
· trăng khuyết — bạn nên cân nhắc"*. Bốn mẩu dán cạnh nhau, đọc phát biết là máy sinh.

Bản 2 giải bằng hai cơ chế, §6 và §7: **chọn lọc** thay vì ghép hết, và **va chạm**
thay vì cộng dồn.

---

## 2 · Vì sao đổi sang chiêm tinh Tây phương lại sạch hơn

Bản 1 dùng Can Chi, vướng chỗ **tứ đại không chia hết cho ngũ hành**: bốn nhà là
Lửa · Nước · Khí · Đất, còn Can Chi là Kim · Mộc · Thủy · Hỏa · Thổ. Mộc thành hành
trống, phải chế ra quy tắc riêng để lấp.

Chiêm tinh Tây phương dùng **đúng bốn nguyên tố ấy**. Ánh xạ 1:1, không mất mát:

| Nhà | Nguyên tố | Cung |
|---|---|---|
| Cây Tre | Lửa | Bạch Dương · Sư Tử · Nhân Mã |
| Bông Lúa | Đất | Kim Ngưu · Xử Nữ · Ma Kết |
| Dâu Tằm | Khí | Song Tử · Thiên Bình · Bảo Bình |
| Hoa Sen | Nước | Cự Giải · Bọ Cạp · Song Ngư |

Và có sẵn một hệ tương ứng đã được ghi chép — **Golden Dawn**:

- 12 Ẩn Chính ↔ 12 cung hoàng đạo
- 7 Ẩn Chính ↔ 7 hành tinh cổ điển
- 3 Ẩn Chính ↔ 3 nguyên tố
- **36 lá số 2–10 ↔ đúng 36 decan** — đã kiểm: bộ bài có chính xác 36 lá loại này
- 16 lá hoàng gia ↔ tổ hợp nguyên tố

Nghĩa là **không phải bịa ánh xạ**. Tên RWS của 78 lá còn nguyên trong dữ liệu nên
tra bảng được thẳng.

> Đây là một truyền thống trong nhiều truyền thống — Marseille không dùng hệ này.
> Chọn Golden Dawn là quyết định biên tập, cần ghi rõ trong tài liệu nội bộ.

---

## 3 · Đầu vào: rút được gì từ một thời điểm

Chỉ cần **thời điểm bốc bài**. Không hỏi ngày sinh, không cần lá số cá nhân —
tránh luôn chuyện dữ liệu nhạy cảm.

| Đại lượng | Cách tính | Số trạng thái |
|---|---|---|
| Cung Mặt Trời | từ ngày tháng | 12 |
| Decan Mặt Trời | cung chia ba | 36 |
| Cung Mặt Trăng | cần ephemeris; Trăng đổi cung ~2,5 ngày | 12 |
| Pha Mặt Trăng | góc Mặt Trời–Trăng | 8 |
| Hành tinh chủ ngày | thứ trong tuần | 7 |
| **Giờ hành tinh** | thứ tự Chaldean, chia từ lúc mặt trời mọc | 7 |
| Tính chất cung | khởi · vững · biến | 3 |

**Giờ hành tinh** là mảnh hợp bài toán nhất: nó thuần Tây phương, đổi theo từng giờ
trong ngày, và cho 7 trạng thái — đúng thứ cần cho "bốc lúc mấy giờ thì khác nhau".

---

## 4 · Lớp Kinh Dịch ẩn — giữ lại, không lộ

Vẫn dùng Mai Hoa Dịch Số sinh từ chính con số thời gian, nhưng **không lấy tên quẻ**.
Chỉ rút một đại lượng: **vị trí hào động** → việc đang ở đoạn nào.

| Hào động | Thời | Ảnh hưởng |
|---|---|---|
| 1–2 | mới chớm | câu khung nghiêng về "còn sớm" |
| 3–4 | giữa chừng | "đang giữa dòng" |
| 5–6 | gần dứt | "đã gần chỗ kết" |

**Cấm tuyệt đối trong đầu ra:** "quẻ", "hào", "Dịch", "âm dương", "ngũ hành",
"can chi", tên 64 quẻ, tên 8 quái. Có test chặn ở §9.

Lớp này ẩn vì đó là lựa chọn thẩm mỹ — giọng văn phải thuần Tây phương, không lẫn
Hán–Việt. Nhưng nội bộ tra ngược được qua `traceId`.

---

## 5 · Tám trục và không gian tổ hợp

| Trục | Nguồn | Trạng thái |
|---|---|---|
| A · Lá | 78 × 2 chiều | 156 |
| B · Quan hệ nguyên tố | lá vs cung Mặt Trời | 4 |
| C · Tính chất cung | khởi / vững / biến | 3 |
| D · Giờ hành tinh | Chaldean | 7 |
| E · Pha Mặt Trăng | sóc → vọng → hạ huyền | 8 |
| F · Nguyên tố cung Mặt Trăng | Lửa/Đất/Khí/Nước | 4 |
| G · Cộng hưởng decan | trùng lá / cùng cung / không liên quan | 3 |
| H · Thời ẩn | Kinh Dịch | 3 |

```
Không gian đầu ra : 156 × 4 × 3 × 7 × 8 × 4 × 3 × 3 = 3.773.952 tổ hợp
Mẩu phải viết tay : 156 (đã có) + 4+3+7+8+4+3+3 = 188
```

**188 mẩu → gần 3,8 triệu tổ hợp.** Mẩu tăng tuyến tính, đầu ra tăng cấp số nhân.

Trục G đáng chú ý: khi lá bốc được **đúng bằng** lá ứng với decan Mặt Trời hôm đó,
đó là trạng thái hiếm (~1/36) và xứng đáng có câu riêng — một khoảnh khắc "trùng khớp"
mà người đọc cảm nhận được mà không cần giải thích.

---

## 6 · Chọn lọc, không ghép hết — cơ chế chống nhạt số một

Tám trục mà trục nào cũng nói thì thành danh sách, không thành lời đọc.

**Mỗi trục sinh ra một giá trị kèm một điểm nổi bật (salience 0–1).** Chỉ **ba trục
điểm cao nhất** được lên tiếng. Trăng tròn thì trục E nói; trăng lưng chừng thì nó im.
Lá trùng decan thì trục G chiếm ngay một chỗ.

Kết quả: lời đọc luôn 4–5 câu, nhưng **câu nào xuất hiện thì đổi theo thời điểm**.
Chọn 3 trong 8 trục có 56 cách — bản thân cấu trúc câu đã biến thiên, chưa tính nội dung.

Đây là điểm khác biệt lớn nhất so với bản 1.

---

## 7 · Va chạm — cơ chế chống nhạt số hai

Mỗi trục cho một **vector**: *hướng* (tiến / giữ / lùi) và *nhịp* (nhanh / chậm).

- Lá xuôi → tiến · lá ngược → lùi
- Nguyên tố đồng hành → tiến · nghịch → lùi
- Cung khởi → nhanh · cung vững → chậm
- Trăng lên → tiến · trăng xuống → lùi

Khi hướng của lá và hướng của trời **khớp** → khung *cộng hưởng*.
Khi **ngược** → khung *căng*, và chính sự ngược đó là nội dung:

> Lá nói kết thúc, trăng đang lên →
> *"Thứ bạn muốn khép lại hôm nay lại được tiếp thêm sức. Đừng nhầm sức ấy với dấu hiệu nên tiếp tục."*

Ba khung × 4 quan hệ nguyên tố = 12 câu khung, viết một lần, dùng cho cả 3,8 triệu tổ hợp.

---

## 8 · Giọng văn Tây phương — định nghĩa cụ thể

Không phải "tránh chữ Hán–Việt" một cách chung chung. Ba quy tắc kiểm được:

**Từ vựng.** Dùng tên hành tinh và cung theo lối phổ thông: *Sao Kim, Sao Hỏa, Bọ Cạp,
Song Ngư, trăng non, trăng khuyết*. Không dùng: *Kim tinh, Hỏa tinh, Thiên Yết,
sóc, vọng, thượng huyền*.

**Nhịp câu.** Câu ngắn, hình ảnh trước, kết luận sau — đúng lối đọc Rider–Waite.
Không dùng cấu trúc đối xứng bốn chữ kiểu Hán văn.

| Không | Có |
|---|---|
| "Âm dương giao hòa, vạn sự hanh thông." | "Hai phía cuối cùng cũng chịu ngồi xuống cùng một bàn." |
| "Thủy khắc Hỏa, chủ sự trì trệ." | "Nước và lửa hôm nay không đứng cùng phía. Việc gì cần nhiệt thì phải đợi." |
| "Quý nhân phù trợ." | "Có người sẽ mở lời trước. Nhận đi." |

**Ngôi và thì.** Ngôi hai, hiện tại. Không "vận số", không "mệnh", không "tiền định".

---

## 9 · Kiểm thử — phần tôi coi trọng hơn thuật toán

| Kiểm | Ngưỡng |
|---|---|
| Lớp Dịch không rò rỉ | 0 lần xuất hiện từ cấm trong 10.000 mẫu |
| Giọng Tây phương | 0 lần xuất hiện danh sách từ Hán–Việt cấm |
| Không trùng lặp | 10.000 mẫu → ≥ 9.700 chuỗi khác nhau |
| Không mâu thuẫn | Không mẫu nào vừa khuyên "dứt khoát" vừa khuyên "hãy chờ" |
| Xác định tính | Cùng seed × 100 lần → 100 kết quả y hệt |
| Độ dài | 45–95 từ |
| Phủ đều | Mỗi trong 156 trạng thái lá xuất hiện ≥ 1 lần trong 10.000 mẫu |
| Cân bằng trục | Không trục nào lên tiếng > 60% số mẫu |

Kiểm "hay hay nhạt" thì máy không làm được. Thay bằng: **lấy 50 mẫu ngẫu nhiên cho
người chấm**, mỗi đợt sinh nội dung mới lại chấm lại.

---

## 10 · Xác định tính

```
seed = hash(userId ?? deviceId, ngày-theo-múi-giờ-đã-chốt)
```

Không `Math.random()`. Cùng người cùng ngày → cùng lá, cùng lời đọc. Lý do: bốc lại
ra kết quả khác thì mất tin cậy; test không chạy được; ảnh chia sẻ phải khớp cái đã đọc.

---

## 11 · Ranh giới

**Không nói tương lai xác quyết.** "Hôm nay nghiêng về…", không phải "bạn sẽ…".

**Không đụng bốn lĩnh vực nhạy cảm.** Bốn trường `love/career/finance/health` trong
dữ liệu dùng làm *chủ đề*, không làm *lời khuyên hành động*. Không sinh câu mang tính
chẩn đoán y tế, khuyến nghị đầu tư, hay tư vấn pháp lý.

**Không thu thập ngày sinh.** Toàn bộ hệ chạy trên thời điểm bốc bài. Đây vừa là lựa
chọn thiết kế vừa là lựa chọn quyền riêng tư.

---

## 12 · Lộ trình và phân công

| Bước | Việc | Ai | Nghiệm thu |
|---|---|---|---|
| **A1** | Vị trí Mặt Trời + decan + tính chất cung, offline | Claude | 365 ngày đối chiếu lịch chuẩn, sai 0 |
| **A2** | Ephemeris Mặt Trăng: cung + pha | Claude | Sai ≤ 1° so với bảng thiên văn; ghi rõ ca sát ranh cung |
| **A3** | Giờ hành tinh theo Chaldean | Claude | Cần chốt §13.2 trước |
| **A4** | Bảng Golden Dawn cho 78 lá | Claude dựng, **Người** duyệt | 22 + 36 + 16 + 4 đủ, không lá nào trống |
| **A5** | Lớp Dịch ẩn (Mai Hoa) | Claude | Cùng thời điểm → cùng kết quả |
| **B1** | 12 câu khung va chạm | **ChatGPT** viết, **Người** duyệt giọng | Qua kiểm từ cấm ở §9 |
| **B2** | 29 mẩu trục (4+3+7+8+4+3) | **ChatGPT** | Ghép được với mọi lá, không sượng |
| **B3** | Bộ chấm salience + chọn 3 trục | Claude | Kiểm "cân bằng trục" đạt |
| **B4** | Bộ ghép + xác định tính + `traceId` | Claude | 8 kiểm ở §9 đều đạt |
| **C1** | Trang "Lá hôm nay" | **ChatGPT** | a11y ≥ 97 · CLS 0 |
| **C2** | Chia sẻ thành ảnh | **ChatGPT** | Ảnh khớp lời đọc đã hiện |
| **D1** | Chấm 50 mẫu, chỉnh giọng | **Người** | Đạt thì mở cho người dùng |

A1, A4, A5 làm được ngay. A3 chờ §13.2.

**Ước lượng:** A 4–6 ngày · B 1–1,5 tuần · C 3–5 ngày · D tùy lịch duyệt.

---

## 13 · Cần chốt trước khi viết dòng code đầu tiên

**13.1 · Múi giờ tính "ngày"** — giờ Việt Nam cố định, hay giờ máy người dùng?
Ảnh hưởng: người ở nước ngoài bốc lúc 23h là hôm nay hay hôm qua.

**13.2 · Giờ hành tinh cần vĩ độ để biết lúc mặt trời mọc.** Ba lựa chọn:
lấy toạ độ Hà Nội làm chuẩn cho mọi người · hỏi vị trí (thêm ma sát, thêm quyền riêng tư) ·
hoặc dùng 24 giờ đều từ nửa đêm (đơn giản nhưng mất chất chiêm tinh). **Tôi nghiêng
về lấy Hà Nội làm chuẩn** — không hỏi gì thêm, sai số chấp nhận được với mục đích này.

**13.3 · Bốc lại trong ngày** — chặn hẳn, hay cho xem lại đúng kết quả cũ?

**13.4 · Có dùng lá ngược không?** Có → trục A là 156, không → 78. Ảnh hưởng trực tiếp
tới con số 3,8 triệu.
