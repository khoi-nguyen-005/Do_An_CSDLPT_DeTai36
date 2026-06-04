# Đồ Án Cơ Sở Dữ Liệu Phân Tán - Đề Tài 36

## Hệ Thống Đặt Vé Máy Bay Phân Tán (Mô phỏng Giao thức 2PC và CTP)

**Sinh viên thực hiện:** Nguyễn Văn Khởi  
**Mã số sinh viên:** N23DCCN032

---

## 1. Giới thiệu Đề tài

Hệ thống mô phỏng quy trình đặt vé phân tán sử dụng **Giao thức cam kết hai pha (2-Phase Commit - 2PC)** kết hợp với **Giao thức kết thúc hợp tác (Cooperative Termination Protocol - CTP)** nhằm đảm bảo tính nguyên tố toàn cục (Global Atomicity) và khả năng chịu lỗi khi nút điều phối gặp sự cố sập nguồn đột ngột.

### Kiến trúc mạng lưới:

- **Coordinator (Bộ điều phối):** Chạy tại cổng `8000`
- **Participant 1 (Trạm nhánh 1):** Chạy tại cổng `8001`
- **Participant 2 (Trạm nhánh 2):** Chạy tại cổng `8002`
- **Participant 3 (Trạm nhánh 3):** Chạy tại cổng `8003`

---

## 2. Cấu trúc thư mục dự án

```text
Do_An_Phan_Tan_De_Tai_36/
├── coordinator.py       # Mã nguồn nút điều phối (Port 8000)
├── participant.py       # Mã nguồn chung cho các nút thành phần (Port 8001, 8002, 8003)
├── README.md            # File hướng dẫn chạy dự án
└── frontend/            # Thư mục mã nguồn giao diện Monitor (ReactJS)
    ├── src/
    │   └── App.jsx      # Giao diện điều khiển và Nhật ký hệ thống
    └── package.json
```
