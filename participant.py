from fastapi import FastAPI, Request
import requests
import threading
import time
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Mở cửa cho ReactJS kết nối vào
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
transaction_state = "INIT"
ALL_PORTS = [8001, 8002, 8003]

def cooperative_termination():
    global transaction_state
    time.sleep(5) # Chờ 5 giây xem Nút điều phối có gửi COMMIT/ABORT không
    
    if transaction_state == "READY":
        print("\n!!! TIMEOUT: Nút điều phối mất tích! Bắt đầu tự liên lạc (P2P)...")
        
        peer_states = []
        for port in ALL_PORTS:
            try:
                # Hỏi thăm các trạm khác
                res = requests.get(f"http://127.0.0.1:{port}/termination-query", timeout=2)
                peer_states.append(res.json().get("state"))
            except:
                pass
        
        # Quyết định dựa trên tập thể
        if "COMMIT" in peer_states:
            transaction_state = "COMMIT"
            print(">>> Phát hiện có trạm đã COMMIT. Quyết định: CÙNG COMMIT (Bảo vệ tính đồng nhất)!")
        elif "ABORT" in peer_states:
            transaction_state = "ABORT"
            print(">>> Phát hiện có trạm đã ABORT. Quyết định: CÙNG ABORT!")
        else:
            print(">>> Tất cả đều chỉ mới READY. Hệ thống tạm thời bị chặn (BLOCKED) chờ phục hồi.")

@app.post("/prepare")
def prepare_phase():
    global transaction_state
    transaction_state = "READY"
    print(">>> Đã nhận lệnh PREPARE. Chuyển trạng thái: SẴN SÀNG (READY)")
    
    # Kích hoạt đồng hồ đếm ngược chờ lệnh tiếp theo
    threading.Thread(target=cooperative_termination).start()
    return {"status": "VOTE_COMMIT", "message": "Nút trạm đã sẵn sàng"}

@app.post("/commit")
def commit_phase():
    global transaction_state
    transaction_state = "COMMIT"
    print(">>> Đã nhận lệnh COMMIT. Giao dịch chốt thành công!")
    return {"status": "SUCCESS"}

@app.post("/abort")
def abort_phase():
    global transaction_state
    transaction_state = "ABORT"
    print(">>> Đã nhận lệnh ABORT. Hủy bỏ giao dịch!")
    return {"status": "SUCCESS"}

@app.get("/termination-query")
def termination_query():
    # Trả lời khi có trạm khác gọi điện hỏi thăm
    return {"state": transaction_state}

@app.post("/reset")
def reset_participant(request: Request):
    
    global transaction_state 
    transaction_state = "INIT" # Đưa trạng thái transaction về mặc định ban đầu
    my_port = request.url.port
    print(f"--- Trạm nhánh tại port {my_port} nhận lệnh RESET ---")
    # Ghi đè file JSON cục bộ của trạm đó về trạng thái trống (available)
    import json
    default_seats = {
        "A1": {"status": "available", "locked_by": None},
        "A2": {"status": "available", "locked_by": None},
        "A3": {"status": "available", "locked_by": None},
        "A4": {"status": "available", "locked_by": None}
    }
    
    # MY_PORT là cổng của trạm đó (8001, 8002 hoặc 8003)
    with open(f"seats_{MY_PORT}.json", "w") as f:
        json.dump(default_seats, f, indent=4)
        
    return {"status": "PARTICIPANT_RESET_SUCCESS"}