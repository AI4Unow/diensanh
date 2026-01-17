# Hướng dẫn Kiểm thử Người dùng

Tài liệu này hướng dẫn quy trình kiểm thử thực tế cho ứng dụng Diên Sanh. Mục đích là đảm bảo các tính năng hoạt động đúng như mong đợi trên môi trường thực tế.

## 1. Chuẩn bị & Cài đặt

Trước khi bắt đầu, vui lòng đảm bảo bạn có:
-   **Thiết bị**: Máy tính hoặc điện thoại có trình duyệt web hiện đại (Chrome, Safari, Edge).
-   **Liên kết**: Truy cập vào địa chỉ ứng dụng (môi trường thử nghiệm hoặc chính thức).

### Tài khoản Thử nghiệm

Dưới đây là danh sách tài khoản để kiểm tra các vai trò khác nhau.

| Vai trò | Số điện thoại | Mật khẩu | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Quản trị viên xã** | `0900000000` | `quantri123` | *Cần bộ phận kỹ thuật cấp quyền quản trị nếu chưa có.* |
| **Trưởng thôn** | `0900000001` | `truongthon123` | *Cần bộ phận kỹ thuật cấp quyền trưởng thôn và gán thôn.* |
| **Người dân** | `0900000002` | `nguoidan123` | *Tài khoản dành cho người dân thông thường.* |

---

## 2. Kịch bản Kiểm thử

### A. Cổng thông tin (Dành cho mọi người dân)

**Mục tiêu**: Đảm bảo người dân có thể tiếp cận thông tin và dịch vụ công mà không cần (hoặc trước khi) đăng nhập.

1.  **Trang chủ & Điều hướng**
    -   Truy cập `/portal`.
    -   Kiểm tra giao diện tải nhanh, hiển thị rõ ràng, không bị lỗi phông chữ.
2.  **Tra cứu thông tin**
    -   Nhấn vào biểu tượng **"Tìm kiếm"**.
    -   Nhập từ khóa (ví dụ: "hộ nghèo", "thủ tục").
    -   Kiểm tra kết quả trả về có liên quan không.
3.  **Xem Thông báo**
    -   Vào mục **"Thông báo"**.
    -   Đọc chi tiết một thông báo bất kỳ.
4.  **Trợ lý ảo (Chatbot)**
    -   Mở cửa sổ Trợ lý ảo.
    -   Hỏi các câu đơn giản: *"Làm sao để đăng ký khai sinh?", "Giờ làm việc UBND xã?"*.
    -   Kiểm tra phản hồi của trợ lý ảo có hợp lý không.
5.  **Gửi phản ánh/kiến nghị**
    -   Tìm mục **"Gửi phản ánh"**.
    -   Điền thông tin và thử gửi (hoặc kiểm tra các trường bắt buộc).

### B. Dành cho Quản trị viên xã

**Mục tiêu**: Kiểm tra quyền quản lý toàn bộ dữ liệu dân cư và công việc.

1.  **Đăng nhập**
    -   Truy cập `/login`.
    -   Nhập tài khoản **Quản trị viên xã** (Số điện thoại/Mật khẩu ở trên).
    -   **Thành công**: Chuyển hướng vào Trang quản trị (`/admin`).
2.  **Trang tổng quan**
    -   Kiểm tra các con số thống kê (Tổng số hộ, nhân khẩu) có hiển thị không.
3.  **Quản lý Thôn/Xóm**
    -   Vào danh mục **"Thôn/Xóm"**.
    -   Xem danh sách các thôn. Nhấn vào một thôn để xem chi tiết.
4.  **Quản lý Hộ dân**
    -   Vào danh mục **"Hộ dân"**.
    -   **Thêm hộ**: Tạo thử một hộ mới (Chủ hộ: "Nguyễn Văn A", Địa chỉ: "Thôn An Lợi").
    -   **Thêm thành viên**: Vào chi tiết hộ vừa tạo, thêm một thành viên mới.
    -   **Chỉnh sửa**: Sửa số điện thoại hoặc thông tin của hộ dân.
5.  **Quản lý Công việc (Giao việc)**
    -   Vào danh mục **"Công việc"**.
    -   Chọn **"Giao việc"** (Tạo mới).
    -   Nhập tiêu đề: *"Kiểm tra vệ sinh môi trường"*.
    -   Giao cho: Chọn một thôn cụ thể.
    -   Hạn chót: Chọn ngày mai.
    -   Lưu và kiểm tra công việc xuất hiện ở trạng thái "Chờ xử lý".
6.  **Gửi tin nhắn**
    -   Vào danh mục **"Tin nhắn"** (SMS).
    -   Soạn tin nhắn thử nghiệm và gửi cho nhóm Trưởng thôn.

### C. Dành cho Trưởng thôn

**Mục tiêu**: Đảm bảo trưởng thôn nhận được việc và chỉ thấy dữ liệu thôn mình.

1.  **Đăng nhập**
    -   (Đăng xuất Quản trị viên trước). Đăng nhập bằng tài khoản **Trưởng thôn**.
    -   **Thành công**: Chuyển hướng vào trang Trưởng thôn (`/village`).
2.  **Nhận việc & Cập nhật tiến độ**
    -   Vào danh mục **"Công việc"**.
    -   Tìm công việc *"Kiểm tra vệ sinh môi trường"* mà Quản trị viên vừa giao.
    -   Bấm vào xem chi tiết.
    -   Chuyển trạng thái sang **"Đang thực hiện"** hoặc **"Hoàn thành"**.
    -   Ghi chú: *"Đã tiếp nhận và triển khai"*.
3.  **Quản lý dân cư thôn**
    -   Vào danh mục **"Hộ dân"**.
    -   Kiểm tra: Bạn chỉ được thấy danh sách hộ dân thuộc thôn mình phụ trách.

### D. Dành cho Người dân (Đăng nhập)

**Mục tiêu**: Kiểm tra tính năng dành cho người dân đã có tài khoản.

1.  **Đăng nhập**
    -   Đăng nhập bằng tài khoản **Người dân**.
    -   **Thành công**: Chuyển hướng vào trang Cổng thông tin.
2.  **Kiểm tra thông tin cá nhân**
    -   Nhấn vào ảnh đại diện (hoặc tên) để xem thông tin cá nhân (nếu có).

---

## 3. Báo cáo Lỗi & Góp ý

Nếu gặp lỗi hoặc thấy điểm chưa hợp lý, vui lòng báo lại theo mẫu sau:

**Mẫu báo cáo:**
-   **Vai trò**: (Ví dụ: Quản trị viên, Trưởng thôn)
-   **Trang bị lỗi**: (Ví dụ: Trang danh sách hộ dân)
-   **Thao tác**: (Bạn đang làm gì thì bị lỗi? Ví dụ: Ấn nút Lưu)
-   **Kết quả mong đợi**: (Lẽ ra phải lưu thành công)
-   **Thực tế**: (Bị báo lỗi đỏ, hoặc không có gì xảy ra)
-   **Ảnh chụp màn hình**: (Nếu có)

---

> [!TIP]
> **Lưu ý quan trọng**: Hãy tập trung kỹ vào luồng **Phân quyền** (Quản trị viên thấy tất cả, Trưởng thôn chỉ thấy thôn mình) và luồng **Giao việc** (Quản trị viên giao -> Trưởng thôn nhận).
