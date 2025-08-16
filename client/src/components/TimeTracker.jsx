import { useState, useEffect } from "react";
import { Calendar, Clock, Copy } from "lucide-react";
import { getTimes, updateTime } from "../api/timeApi";

const TimeTracker = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeFromApi, setTimeFromApi] = useState(null); // Date (UTC instant)
  const [elapsed, setElapsed] = useState("");
  const [newTime, setNewTime] = useState(""); // value from <input type="datetime-local">
  const [timeId, setTimeId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // 1) Fetch time (assume API returns ISO UTC like "2025-08-15T21:13:00.000Z")
  useEffect(() => {
    const fetchTime = async () => {
      setIsLoading(true);
      try {
        const res = await getTimes();
        if (res.data?.length > 0) {
          const first = res.data[0];
          setTimeFromApi(new Date(first.dateTime)); // store as Date instant
          setTimeId(first._id);
        }
      } catch (err) {
        console.error("Error fetching time:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTime();
  }, []);

  // 2) Tick every second
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // 3) Recompute humanized elapsed
  useEffect(() => {
    if (timeFromApi) {
      setElapsed(humanizeElapsed(timeFromApi, currentTime));
    }
  }, [currentTime, timeFromApi]);

  // ---- Formatters ----

  // Local display for current time
  const formatLocal = (date) =>
    date?.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) ?? "";

  // UTC display for API time (show exactly what ISO Z represents)
  const formatUTC = (date) =>
    date
      ? `${date.toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
        })}`
      : "";

  // Humanize duration per spec:
  // - 1 ngày, 2 ngày
  // - 1 tuần, 2 tuần
  // - 1 ngày 3 giờ
  // - 1 tháng
  // - 2 năm 3 tháng, v.v.
  const humanizeElapsed = (start, end) => {
    let diffMs = end - start;
    if (diffMs <= 0) return "0 giây";

    const second = 1000;
    const minute = 60 * second;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day; // xấp xỉ để humanize
    const year = 365 * day; // xấp xỉ để humanize

    const years = Math.floor(diffMs / year);
    diffMs -= years * year;

    const months = Math.floor(diffMs / month);
    diffMs -= months * month;

    const weeks = Math.floor(diffMs / week);
    diffMs -= weeks * week;

    const days = Math.floor(diffMs / day);
    diffMs -= days * day;

    const hours = Math.floor(diffMs / hour);
    diffMs -= hours * hour;

    const minutes = Math.floor(diffMs / minute);
    diffMs -= minutes * minute;

    // Quy tắc hiển thị ưu tiên theo “đơn vị lớn nhất”, kèm phần dư hợp lý
    if (years > 0) {
      return months > 0 ? `${years} năm ${months} tháng` : `${years} năm`;
    }
    if (months > 0) {
      return weeks > 0 ? `${months} tháng ${weeks} tuần` : `${months} tháng`;
    }
    if (weeks > 0) {
      return days > 0 ? `${weeks} tuần ${days} ngày` : `${weeks} tuần`;
    }
    if (days > 0) {
      return hours > 0 ? `${days} ngày ${hours} giờ` : `${days} ngày`;
    }
    if (hours > 0) {
      return minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`;
    }
    if (minutes > 0) return `${minutes} phút`;
    const seconds = Math.floor(diffMs / second);
    return `${seconds} giây`;
  };

  // ---- Handlers ----

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTime || !timeId) return;

    // newTime từ <input type="datetime-local"> là local time (không timezone).
    // Chuyển sang ISO UTC để lưu nhất quán server.
    const isoUtc = new Date(newTime).toISOString();

    setIsLoading(true);
    try {
      await updateTime(timeId, { dateTime: isoUtc });
      setTimeFromApi(new Date(isoUtc)); // cập nhật state theo UTC vừa lưu
      setNewTime("");
    } catch (error) {
      console.error("Error updating time:", error);
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
            value={formatLocal(currentTime)}
          />

          {timeFromApi && (
            <Card
              icon={<Calendar className="w-5 h-5 text-green-400" />}
              chipClass="bg-green-500/20"
              title="Thời gian từ API (UTC)"
              value={formatUTC(timeFromApi)}
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
