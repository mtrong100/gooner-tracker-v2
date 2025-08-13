import { useState, useEffect } from "react";
import { Calendar, Clock, Copy } from "lucide-react";
import { getTimes, updateTime } from "../api/timeApi";

const TimeTracker = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeFromApi, setTimeFromApi] = useState(null);
  const [elapsed, setElapsed] = useState("");
  const [newTime, setNewTime] = useState("");
  const [timeId, setTimeId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch time data from API
  useEffect(() => {
    const fetchTime = async () => {
      setIsLoading(true);
      try {
        const res = await getTimes();
        if (res.data?.length > 0) {
          const firstTime = res.data[0];
          setTimeFromApi(new Date(firstTime.dateTime));
          setTimeId(firstTime._id);
        }
      } catch (error) {
        console.error("Error fetching time:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTime();
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate elapsed time
  useEffect(() => {
    if (timeFromApi) {
      setElapsed(formatElapsed(timeFromApi, currentTime));
    }
  }, [currentTime, timeFromApi]);

  const formatDateTime = (date) => {
    if (!date) return "";
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
  };

  const formatElapsed = (start, end) => {
    const diffMs = end - start;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays < 1) {
      return `${String(diffHours).padStart(2, "0")}:${String(
        diffMin % 60
      ).padStart(2, "0")}:${String(diffSec % 60).padStart(2, "0")}`;
    } else if (diffDays < 7) {
      return `${diffDays} ngày ${diffHours % 24} giờ`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} tuần ${diffDays % 7} ngày`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)} tháng ${Math.floor(
        (diffDays % 30) / 7
      )} tuần`;
    } else {
      return `${Math.floor(diffDays / 365)} năm ${Math.floor(
        (diffDays % 365) / 30
      )} tháng`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTime || !timeId) return;

    setIsLoading(true);
    try {
      await updateTime(timeId, { dateTime: newTime });
      setTimeFromApi(new Date(newTime));
      setNewTime("");
    } catch (error) {
      console.error("Error updating time:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Đã trôi qua: ${elapsed}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className=" bg-gray-800 rounded-xl shadow-2xl overflow-hidden ">
      {/* Main Content */}
      <div className="p-6">
        {/* Time Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Time Card */}
          <div className="bg-gray-700 rounded-lg p-5 shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-blue-500/20">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-200">
                Thời gian hiện tại
              </h3>
            </div>
            <p className="text-2xl  text-white font-bold">
              {formatDateTime(currentTime)}
            </p>
          </div>

          {/* API Time Card */}
          {timeFromApi && (
            <div className="bg-gray-700 rounded-lg p-5 shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-green-500/20">
                  <Calendar className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-200">
                  Thời gian từ API
                </h3>
              </div>
              <p className="text-2xl  text-white font-bold">
                {formatDateTime(timeFromApi)}
              </p>
            </div>
          )}

          {/* Elapsed Time Card */}
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
              <p className="text-2xl  text-white mb-4 font-bold">{elapsed}</p>
              <button
                onClick={handleCopy}
                className="absolute bottom-4 right-4 py-3 px-4 font-bold flex items-center gap-2 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors group"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4 text-gray-300 group-hover:text-white" />
                Copy
              </button>
              {copied && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                  Copied!
                </div>
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
                Chọn thời gian
              </label>
              <input
                type="datetime-local"
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
              />
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

export default TimeTracker;
