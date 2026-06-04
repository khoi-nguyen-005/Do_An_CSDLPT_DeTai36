from fastapi import FastAPI
import requests
import os
import time
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def read_root():
    return {"status": "ALIVE"}
PARTICIPANTS = [
    "http://127.0.0.1:8001",
    "http://127.0.0.1:8002",
    "http://127.0.0.1:8003"
]

@app.post("/booking")
def book_ticket():
    print("--- Bắt đầu giao dịch đặt vé Bình thường ---")
    print("Giai đoạn 1: Đang gửi lệnh PREPARE...")
    votes = []
    for p in PARTICIPANTS:
        try:
            response = requests.post(f"{p}/prepare", timeout=5)
            votes.append(response.json().get("status"))
        except Exception as e:
            votes.append("VOTE_ABORT")
            
    if all(v == "VOTE_COMMIT" for v in votes):
        print("Tất cả đều đồng ý. Gửi lệnh COMMIT...")
        for p in PARTICIPANTS:
            try:
                requests.post(f"{p}/commit", timeout=5)
            except: pass
        return {"status": "SUCCESS"}
    else:
        print("Có nút từ chối. Gửi lệnh ABORT...")
        for p in PARTICIPANTS:
            try:
                requests.post(f"{p}/abort", timeout=5)
            except: pass
        return {"status": "FAILED"}

@app.post("/booking-crash")
def book_ticket_crash():
    print("--- Bắt đầu giao dịch giả lập SỰ CỐ ---")
    print("Giai đoạn 1: Đang gửi lệnh PREPARE tới 3 trạm...")
    for p in PARTICIPANTS:
        try:
            requests.post(f"{p}/prepare", timeout=5)
        except: pass
    
    print(">>> TẤT CẢ ĐÃ SẴN SÀNG. NHƯNG NÚT ĐIỀU PHỐI ĐỘT NGỘT SẬP NGUỒN TRƯỚC KHI GỬI COMMIT!!!")
    # Đếm ngược 2 giây cho kịch tính rồi tự sát
    time.sleep(2)
    os._exit(1) # Lệnh này tắt ngay lập tức tiến trình của Nút điều phối
    
@app.post("/reset")
def reset_system():
    print("--- Bộ điều phối bắt đầu phát lệnh RESET hệ thống ---")
    
    # Duyệt qua các trạm nhánh để bắt tụi nó giải phóng trạng thái kẹt
    for port in [8001, 8002, 8003]:
        try:
            # BẮT BUỘC phải có timeout=2 để tránh treo luồng khi trạm đang bận xử lý CTP
            response = requests.post(f"http://127.0.0.1:{port}/reset", timeout=2)
            if response.status_code == 200:
                print(f"-> Trạm {port}: Đã giải phóng trạng thái thành công.")
            else:
                print(f"-> Trạm {port}: Trả về mã lỗi {response.status_code}")
        except Exception as e:
            print(f"-> Không thể kết nối để reset Trạm {port} (Có thể trạm đang offline): {e}")
            
    print("--- Reset toàn bộ hệ thống HOÀN TẤT ---")
    return {"status": "RESET_SUCCESS"}