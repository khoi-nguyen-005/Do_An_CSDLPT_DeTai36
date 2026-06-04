import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [coordStatus, setCoordStatus] = useState("ACTIVE");
  const [p1Status, setP1Status] = useState("ACTIVE");
  const [p2Status, setP2Status] = useState("ACTIVE");
  const [p3Status, setP3Status] = useState("ACTIVE");
  const [seats, setSeats] = useState([
    "Trống",
    "Trống",
    "Trống",
    "Trống",
    "Trống",
  ]);
  const [logs, setLogs] = useState([
    "[System] Đang kết nối mạng lưới phân tán...",
  ]);

  const addLog = (msg) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  // VÒNG LẶP QUÉT REAL-TIME
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await axios.get("http://127.0.0.1:8000/", { timeout: 800 });
        setCoordStatus("ACTIVE");
      } catch {
        setCoordStatus("CRASHED");
      }
      try {
        const res = await axios.get("http://127.0.0.1:8001/termination-query", {
          timeout: 800,
        });
        if (res.data.state === "READY") setP1Status("BLOCKED");
        else setP1Status(res.data.state === "INIT" ? "ACTIVE" : res.data.state);
      } catch {
        setP1Status("OFFLINE");
      }
      try {
        const res = await axios.get("http://127.0.0.1:8002/termination-query", {
          timeout: 800,
        });
        if (res.data.state === "READY") setP2Status("BLOCKED");
        else setP2Status(res.data.state === "INIT" ? "ACTIVE" : res.data.state);
      } catch {
        setP2Status("OFFLINE");
      }
      try {
        const res = await axios.get("http://127.0.0.1:8003/termination-query", {
          timeout: 800,
        });
        if (res.data.state === "READY") setP3Status("BLOCKED");
        else setP3Status(res.data.state === "INIT" ? "ACTIVE" : res.data.state);
      } catch {
        setP3Status("OFFLINE");
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);
  const handleBooking = async () => {
    addLog("Gửi yêu cầu đặt vé tới Coordinator...");
    try {
      const res = await axios.post("http://127.0.0.1:8000/booking");
      if (res.data.status === "SUCCESS") {
        addLog("Giao dịch THÀNH CÔNG! Đã COMMIT trên toàn hệ thống.");
        setSeats(["Đã đặt", "Đã đặt", "Đã đặt", "Đã đặt", "Đã đặt"]);
      } else {
        addLog("Giao dịch THẤT BẠI! Hệ thống đã ABORT.");
      }
    } catch {
      addLog("Lỗi kết nối tới Coordinator!");
    }
  };
  const handleBookingCrash = async () => {
    addLog("KÍCH HOẠT SỰ CỐ: Gửi lệnh sập mạng...");
    try {
      // Gọi sang endpoint giả lập sập của coordinator
      await axios.post("http://127.0.0.1:8000/booking-crash");
    } catch (error) {
      addLog("Coordinator đã ĐỘT NGỘT SẬP NGUỒN!");
      addLog("Chờ 5 giây xem thuật toán CTP của các trạm tự cứu nhau...");

      // Đợi 5 giây giả lập CTP chạy xong thì ép hàng ghế chuyển sang chữ "Bị khóa"
      setTimeout(() => {
        addLog(
          "Các trạm kích hoạt P2P thành công! Đã tự đóng băng ở trạng thái [BLOCKED].",
        );

        setSeats(["Bị khóa", "Bị khóa", "Bị khóa", "Bị khóa", "Bị khóa"]);
      }, 5000);
    }
  };
  const handleCrash = async () => {
    addLog("🔥 KÍCH HOẠT SỰ CỐ: Gửi lệnh sập mạng...");
    try {
      await axios.post(
        "http://127.0.0.1:8000/booking-crash",
        {},
        { timeout: 1000 },
      );
    } catch {
      addLog("❌ Coordinator đã ĐỘT NGỘT SẬP NGUỒN!");
      addLog("⏳ Chờ 5 giây xem thuật toán CTP của các trạm tự cứu nhau...");
      setTimeout(() => {
        addLog(
          "▶️ Các trạm kích hoạt P2P thành công! Đã tự đóng băng ở trạng thái [BLOCKED] để bảo vệ file dữ liệu.",
        );
      }, 5500);
    }
  };

  // HÀM RESET HỆ THỐNG THẬT
  const handleReset = async () => {
    addLog("🔄 Đang gửi lệnh khôi phục trạng thái hệ thống...");
    try {
      await axios.post("http://127.0.0.1:8000/reset");
      addLog("✨ Reset THÀNH CÔNG! Toàn bộ ghế đã trống, hệ thống sẵn sàng.");
      setSeats(["Trống", "Trống", "Trống", "Trống", "Trống"]);
      setCoordStatus("ACTIVE");
    } catch {
      addLog(
        "❌ Không thể reset (Hãy chắc chắn đã bật lại file coordinator.py trước)!",
      );
    }
  };

  const getStatusColor = (status) => {
    if (status === "ACTIVE")
      return "bg-green-600 border-green-700 text-white shadow-lg shadow-green-900/30";
    if (status === "CRASHED" || status === "OFFLINE" || status === "ABORT")
      return "bg-red-600 border-red-700 text-white animate-pulse shadow-lg shadow-red-900/30";
    if (status === "COMMIT")
      return "bg-indigo-600 border-indigo-700 text-white shadow-lg shadow-indigo-900/30";
    return "bg-yellow-500 border-yellow-600 text-black font-bold shadow-lg shadow-yellow-700/30";
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto mb-8 border-b border-gray-800 pb-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              HỆ THỐNG ĐẶT VÉ MÁY BAY PHÂN TÁN
            </h1>
            <p className="text-gray-400 mt-1 font-medium">
              Đồ án: Giao thức 2 Phase Commit (2PC) & Cooperative Termination
              Protocol (CTP)
            </p>
          </div>
          <div className="bg-gray-900 px-4 py-2 rounded-lg border border-gray-800 text-xs font-mono text-gray-400">
            MSSV: N23DCCN032
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 h-fit space-y-6">
          <div>
            <h2 className="text-lg font-bold mb-4 text-blue-400 flex items-center gap-2">
              🎮 Bảng Điều Khiển
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleBooking}
                disabled={coordStatus === "CRASHED"}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white py-3 px-4 rounded-xl font-semibold transition duration-200 shadow-md"
              >
                🎟️ Đặt Vé Bình Thường (2PC)
              </button>
              <button
                onClick={handleCrash}
                disabled={coordStatus === "CRASHED"}
                className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-600 text-white py-3 px-4 rounded-xl font-semibold transition duration-200 shadow-md"
              >
                💥 Giả Lập Sập Điều Phối (CTP)
              </button>
              {/* NÚT RESET HỆ THỐNG NẰM Ở ĐÂY */}
              <button
                onClick={handleReset}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-xl font-semibold transition duration-200 active:scale-[0.98]"
              >
                🔄 Reset Hệ Thống
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-400 mb-2">
              📜 Nhật ký Monitor:
            </h3>
            <div className="text-xs font-mono bg-black/50 p-4 rounded-xl border border-gray-800 space-y-2 h-44 overflow-y-auto flex flex-col-reverse">
              {logs.map((log, i) => (
                <p
                  key={i}
                  className={
                    log.includes("❌") || log.includes("🔥")
                      ? "text-red-400"
                      : log.includes("THÀNH CÔNG")
                        ? "text-green-400"
                        : "text-gray-300"
                  }
                >
                  {log}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h2 className="text-lg font-bold mb-5 text-blue-400">
              🌐 Trạng Thái Nút Hệ Thống (Real-time)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                className={`p-4 rounded-xl border text-center transition-all duration-300 ${getStatusColor(coordStatus)}`}
              >
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-75">
                  Coordinator
                </div>
                <div className="text-lg font-black my-1">Port 8000</div>
                <div className="text-xs font-medium uppercase">
                  {coordStatus}
                </div>
              </div>
              <div
                className={`p-4 rounded-xl border text-center transition-all duration-300 ${getStatusColor(p1Status)}`}
              >
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-75">
                  Trạm 1
                </div>
                <div className="text-lg font-black my-1">Port 8001</div>
                <div className="text-xs font-medium uppercase">{p1Status}</div>
              </div>
              <div
                className={`p-4 rounded-xl border text-center transition-all duration-300 ${getStatusColor(p2Status)}`}
              >
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-75">
                  Trạm 2
                </div>
                <div className="text-lg font-black my-1">Port 8002</div>
                <div className="text-xs font-medium uppercase">{p2Status}</div>
              </div>
              <div
                className={`p-4 rounded-xl border text-center transition-all duration-300 ${getStatusColor(p3Status)}`}
              >
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-75">
                  Trạm 3
                </div>
                <div className="text-lg font-black my-1">Port 8003</div>
                <div className="text-xs font-medium uppercase">{p3Status}</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h2 className="text-lg font-bold mb-4 text-blue-400">
              ✈️ Sơ Đồ Ghế Ngồi (Replicated Database)
            </h2>
            <div className="grid grid-cols-5 gap-4">
              {seats.map((status, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border text-center transition-all duration-500 ${status === "Trống" ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-indigo-600 border-indigo-500 text-white font-bold shadow-md"}`}
                >
                  <div className="text-xl mb-1">💺</div>
                  <div className="text-base font-black">A{index + 1}</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-70 mt-1">
                    {status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
