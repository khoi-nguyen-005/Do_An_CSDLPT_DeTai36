import json
import random

# Tạo 10.000 cái ghế ngẫu nhiên
dataset = {}
for i in range(1, 10001):
    dataset[f"seat_{i}"] = {
        "status": random.choice(["free", "booked"]), # Random trạng thái
        "locked_by": None
    }

# Ghi thẳng ra file JSON
with open("seats_10000.json", "w") as file:
    json.dump(dataset, file, indent=4)

print("Đã tạo xong 10.000 ghế!")