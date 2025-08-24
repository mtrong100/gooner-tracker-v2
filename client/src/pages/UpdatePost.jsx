import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Calendar,
  Clock,
  TextCursorInput,
  ArrowLeft,
  Save,
} from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const UpdatePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dateTime: "",
    description: "",
    duration: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const formatDateTimeLocalForInput = (value) => {
    let d;
    if (!value) return ""; // guard
    if (typeof value === "string") d = new Date(value); // ISO string
    else if (value?.toDate) d = value.toDate(); // Firestore Timestamp
    else d = new Date(value); // fallback

    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const HH = pad(d.getHours()); // <-- local hours
    const mm = pad(d.getMinutes()); // <-- local minutes
    return `${yyyy}-${MM}-${dd}T${HH}:${mm}`;
  };

  useEffect(() => {
    const fetchPostById = async () => {
      try {
        const docRef = doc(db, "posts", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          setFormData({
            dateTime: formatDateTimeLocalForInput(data.dateTime),
            description: data.description || "",
            duration: data.duration || "",
          });
        } else {
          toast.error("Không tìm thấy bài viết!");
          navigate("/manage");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("Có lỗi khi tải dữ liệu!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostById();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const docRef = doc(db, "posts", id);
      await updateDoc(docRef, {
        dateTime: new Date(formData.dateTime).toISOString(),
        description: formData.description,
        duration: formData.duration,
      });

      toast.success("Cập nhật thành công!");
      navigate("/manage");
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Cập nhật thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center text-white mt-10">Đang tải dữ liệu...</div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center group text-sm font-medium mb-6 transition-all duration-200"
      >
        <span className="flex items-center bg-gray-800/60 hover:bg-gray-700/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700/50 group-hover:border-purple-400/30 transition-all">
          <ArrowLeft className="mr-2 h-4 w-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
          <span className="text-gray-300 group-hover:text-white bg-gradient-to-r from-purple-400/80 to-blue-400/80 bg-clip-text text-transparent">
            Quay về
          </span>
        </span>
      </button>

      <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-gray-700/50">
        <div className="bg-gradient-to-r from-purple-900/70 to-blue-900/70 p-6">
          <h1 className="text-2xl font-bold text-white">Update Post</h1>
          <p className="text-sm text-purple-200 mt-1">
            Điền thông tin bên dưới
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* DateTime Field */}
          <div className="space-y-3">
            <label
              htmlFor="dateTime"
              className="flex items-center text-sm font-medium text-gray-300"
            >
              <Calendar className="mr-2 h-4 w-4 text-purple-400" />
              Ngày & Giờ
            </label>
            <input
              type="datetime-local"
              id="dateTime"
              name="dateTime"
              value={formData.dateTime}
              onChange={handleChange}
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label
              htmlFor="description"
              className="flex items-center text-sm font-medium text-gray-300"
            >
              <TextCursorInput className="mr-2 h-4 w-4 text-purple-400" />
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white"
              placeholder="Update your post content..."
              required
            />
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <label
              htmlFor="duration"
              className="flex items-center text-sm font-medium text-gray-300"
            >
              <Clock className="mr-2 h-4 w-4 text-purple-400" />
              Thời lượng
            </label>
            <input
              type="text"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g. 2 hours, 30 minutes"
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white"
              required
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-300 ${
                isSubmitting
                  ? "bg-purple-800/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-purple-500/20"
              } flex items-center justify-center`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Cập nhật
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePost;
