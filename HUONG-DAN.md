# Luyện ngữ pháp Hoa Dũng - tài khoản học sinh và giao bài theo khối

Dịch vụ gia sư và dạy kèm Hoa Dũng

## Gói này có gì
- index.html: app cho học sinh (có đăng nhập, chỉ thấy bài thầy giao cho khối của em).
- quan-ly.html: trang quản lý riêng của thầy (tạo tài khoản, giao bài theo khối).
- Code.gs: mã Google Apps Script (thay mã cũ).

Địa chỉ Google Sheet và link /exec cũ được giữ nguyên.

## Bước 1. Cập nhật Apps Script (làm một lần)
1. Mở Google Sheet của thầy, Tiện ích mở rộng, Apps Script.
2. Xoá toàn bộ mã cũ, dán toàn bộ nội dung Code.gs mới, bấm Lưu.
3. Chọn hàm caiDat, bấm Chạy (cho phép quyền nếu được hỏi). Hàm này tạo thêm các tab: Tài khoản, Giao bài, Quản trị.
4. Trong Sheet, mở tab Quản trị: ô B2 là mật khẩu quản lý của thầy (tự tạo, thầy đổi được).
5. Triển khai, Quản lý triển khai, bút chì, Phiên bản mới, Triển khai. Link /exec không đổi.

## Bước 2. Đưa app lên mạng
Tải index.html và quan-ly.html lên cùng repo GitHub/Vercel đang dùng (ghi đè index.html cũ).
- Học sinh vào: địa chỉ-của-thầy/
- Thầy vào: địa chỉ-của-thầy/quan-ly.html (cần mật khẩu ở ô B2).

## Bước 3. Tạo tài khoản
1. Vào quan-ly.html, nhập mật khẩu quản lý.
2. Dán danh sách, mỗi dòng một em: Họ và tên - Khối (ví dụ: Nguyễn Văn An - Khối 3).
3. Bấm Tạo tài khoản. App tự tạo tên đăng nhập và mật khẩu, hiện thành bảng. Bấm In phiếu hoặc Sao chép để phát cho học sinh.
4. Thầy chụp danh sách lớp gửi cho Claude: Claude đọc ra bảng Họ tên - Khối để thầy kiểm tra, rồi thầy dán vào ô này.
5. Mỗi lần tạo tối đa 60 em. Danh sách tài khoản, mật khẩu, nút đổi mật khẩu, khoá, xoá nằm ngay dưới.

## Bước 4. Giao bài
1. Tab Giao bài theo khối, chọn Khối 1 đến Khối 5.
2. Tìm và tích chọn các chủ đề, bấm Lưu giao bài. Mỗi lần lưu thay thế danh sách của khối đó.
3. Học sinh khối đó tải lại trang sẽ thấy đúng các bài đã giao. Bài chưa giao bị ẩn và không mở được.

## Điểm
- Điểm tự gửi về tab Dữ liệu nộp bài, Tổng hợp và tab từng khối như trước, kèm họ tên và khối lấy từ tài khoản.
- Điểm cũ vẫn nằm trong Sheet. Học sinh có tên và khối trùng với tài khoản mới sẽ gộp chung ở Tổng hợp và tab khối.

## Lưu ý
- Mật khẩu học sinh lưu dạng chữ thường trong tab Tài khoản để thầy tra cứu. Thầy không chia sẻ Sheet này cho học sinh.
- Học sinh đăng nhập một lần, lần sau máy tự vào. Đổi mật khẩu hoặc khoá tài khoản thì máy cũ bị yêu cầu đăng nhập lại.
- Điểm và giỏ chủ đề lưu theo từng tài khoản trên máy, nhiều em dùng chung một máy không bị lẫn.
- Em đã chạy thử toàn bộ luồng với máy chủ giả lập chạy đúng mã Code.gs. Chưa thử được trên Google thật (môi trường của em không truy cập được), nên thầy tạo thử một em "Thử nghiệm" ở Khối 1 để kiểm tra rồi xoá.

## Thử nhanh sau khi cài
1. Vào quan-ly.html, tạo "Thử nghiệm - Khối 1", giao một chủ đề cho Khối 1.
2. Mở trang học sinh trong cửa sổ ẩn danh, đăng nhập, làm một bài, bấm Kiểm tra.
3. Xem tab Dữ liệu nộp bài và tab Khối 1 có dòng mới. Xoá tài khoản thử trong trang quản lý.
