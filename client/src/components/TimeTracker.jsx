import { useState, useEffect } from "react";
import { Calendar, Clock, Copy } from "lucide-react";
import {
  doc,
  getDocs,
  updateDoc,
  collection,
  query,
  limit,
} from "firebase/firestore";
import { db, timeCollection } from "../config/firebase";

const TimeTracker = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeFromApi, setTimeFromApi] = useState(null);
  const [elapsed, setElapsed] = useState("");
  const [newTime, setNewTime] = useState("");
  const [timeId, setTimeId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // format datetime -> Chủ Nhật, 24/08/2025 15:23
  const formatDateTime = (date) => {
    return date.toLocaleString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // format thời gian trôi qua (ví dụ: 1 ngày 3 giờ, 2 tuần, v.v.)
  const formatElapsed = (start, now) => {
    const diff = Math.floor((now - start) / 1000); // giây
    const days = Math.floor(diff / (60 * 60 * 24));
    const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((diff % (60 * 60)) / 60);

    if (days > 0)
      return `${days} ngày ${hours > 0 ? hours + " giờ" : ""}`.trim();
    if (hours > 0)
      return `${hours} giờ ${minutes > 0 ? minutes + " phút" : ""}`.trim();
    return `${minutes} phút`;
  };

  // lấy doc đầu tiên từ Firestore
  useEffect(() => {
    const fetchTime = async () => {
      const q = query(timeCollection, limit(1));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const docSnap = snap.docs[0];
        setTimeId(docSnap.id);
        const dateTime = new Date(docSnap.data().dateTime);
        setTimeFromApi(dateTime);
      }
    };

    fetchTime();
  }, []);

  // setInterval cập nhật currentTime + elapsed
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      if (timeFromApi) {
        setElapsed(formatElapsed(new Date(timeFromApi), new Date()));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeFromApi]);

  // cập nhật time khi user submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTime || !timeId) return;

    setIsLoading(true);
    try {
      const docRef = doc(db, "times", timeId);
      // convert local datetime -> ISO UTC
      const utcTime = new Date(newTime).toISOString();
      await updateDoc(docRef, { dateTime: utcTime });

      setTimeFromApi(new Date(utcTime));
      setNewTime("");
    } catch (err) {
      console.error("Error updating time:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(elapsed || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
      <div className="p-6">
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card
            icon={<Clock className="w-5 h-5 text-blue-400" />}
            chipClass="bg-blue-500/20"
            title="Thời gian hiện tại"
            value={formatDateTime(currentTime)}
          />

          {timeFromApi && (
            <Card
              icon={<Calendar className="w-5 h-5 text-green-400" />}
              chipClass="bg-green-500/20"
              title="Thời gian từ API (UTC)"
              value={formatDateTime(new Date(timeFromApi))}
            />
          )}

          {elapsed && (
            <div className="bg-gray-700 rounded-lg p-5 shadow relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-yellow-500/20">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-gray-200">
                  Thời gian trôi qua
                </h3>
              </div>
              <p className="text-2xl text-white mb-4 font-bold">{elapsed}</p>
              <button
                onClick={handleCopy}
                className="absolute bottom-4 right-4 py-2 px-3 font-bold flex items-center gap-2 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors group"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4 text-gray-300 group-hover:text-white" />
                Copy
              </button>
              {copied && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                  Copied!
                </span>
              )}
            </div>
          )}
        </div>

        {/* Update Form */}
        <div className="bg-gray-700 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Cập nhật thời gian
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Chọn thời gian (Local)
              </label>
              <input
                type="datetime-local"
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Sẽ được lưu lên server dưới dạng UTC (ISO).
              </p>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
                isLoading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              }`}
            >
              {isLoading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Card = ({ icon, title, value, chipClass = "bg-gray-500/20" }) => (
  <div className="bg-gray-700 rounded-lg p-5 shadow">
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2 rounded-full ${chipClass}`}>{icon}</div>
      <h3 className="font-semibold text-gray-200">{title}</h3>
    </div>
    <p className="text-2xl text-white font-bold">{value}</p>
  </div>
);

export default TimeTracker;
