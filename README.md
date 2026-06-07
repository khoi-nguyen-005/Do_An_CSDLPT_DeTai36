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
## 3. Hướng dẫn cài đặt và khởi chạy
Yêu cầu tiên quyết
- Đã cài đặt Python 3.x
- Đã cài đặt Node.js (để chạy Frontend React)

 
  *Bước 1: Cài đặt thư viện cho Backend (Python)
  Mở Terminal tại thư mục gốc và chạy lệnh:
  pip install fastapi uvicorn requests python-multipart

  
  *Bước 2: Khởi chạy các nút mạng Backend
  Mở 4 cửa sổ Terminal độc lập và chạy các lệnh sau:
  - Chạy Coordinator:
    uvicorn coordinator:app --host 127.0.0.1 --port 8000 --reload
  - Chạy Participant 1:
    uvicorn participant:app --host 127.0.0.1 --port 8001 --reload
  - Chạy Participant 2:
    uvicorn participant:app --host 127.0.0.1 --port 8002 --reload
  - Chạy Participant 3:
    uvicorn participant:app --host 127.0.0.1 --port 8003 --reload

    
  *Bước 3: Cài đặt và khởi chạy Giao diện Frontend (ReactJS)
    Mở một Terminal mới, di chuyển vào thư mục frontend:
    cd frontend
    npm install
    npm run dev
    Sau đó truy cập đường dẫn hiển thị trên terminal (thường là http://localhost:5173) để mở giao diện Monitor điều khiển.
## 4. Các kịch bản thử nghiệm hệ thống (Demo Scenarios)
  Hệ thống hỗ trợ thực hiện trực quan 3 kịch bản cốt lõi ngay trên giao diện Web Monitor:
  - Kịch bản 1 (Lý tưởng): Tiến hành đặt vé bình thường, các nút phản hồi đồng thuận, Coordinator phát lệnh COMMIT thành công
  - Kịch bản 2 (Giả lập lỗi sập điều phối - CTP): Bấm nút giả lập sập mạng, Coordinator crash đột ngột sau giai đoạn 1. Các trạm nhánh tự động kích hoạt giao thức CTP thông qua cổng ngang hàng /termination-query, nhận biết hệ thống bị nghẽn và đồng loạt chuyển sang trạng thái đóng băng BLOCKED để bảo vệ dữ liệu.
  - Kịch bản 3 (Khôi phục hệ thống): Bật lại Coordinator, nhấn nút Reset Hệ Thống để giải phóng bộ nhớ và đưa 4 nút mạng về trạng thái hoạt động ACTIVE mặc định.
