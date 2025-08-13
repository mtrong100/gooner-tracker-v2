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
import { getPost, updatePost } from "../api/postApi";

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

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await getPost(id);
        setFormData({
          dateTime: new Date(data.dateTime).toISOString().slice(0, 16),
          description: data.description,
          duration: data.duration,
        });
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("Failed to load post data", {
          style: {
            background: "#1e293b",
            color: "#f8fafc",
            border: "1px solid #334155",
          },
        });
        navigate("/posts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
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

    if (!formData.dateTime || !formData.description || !formData.duration) {
      toast.error("Please fill in all fields", {
        style: {
          background: "#1e293b",
          color: "#f8fafc",
          border: "1px solid #334155",
        },
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await updatePost(id, formData);
      toast.success("Post updated successfully!", {
        style: {
          background: "linear-gradient(to right, #4f46e5, #7c3aed)",
          color: "#f8fafc",
        },
        iconTheme: {
          primary: "#f8fafc",
          secondary: "#4f46e5",
        },
      });
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error(error.response?.data?.message || "Failed to update post", {
        style: {
          background: "#1e293b",
          color: "#f8fafc",
          border: "1px solid #334155",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
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
            Back
          </span>
        </span>
      </button>

      <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-gray-700/50">
        <div className="bg-gradient-to-r from-purple-900/70 to-blue-900/70 p-6">
          <h1 className="text-2xl font-bold text-white">Update Post</h1>
          <p className="text-sm text-purple-200 mt-1">
            Edit the post details below
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
              Date & Time
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                id="dateTime"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleChange}
                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-400 text-sm">⌚</span>
              </div>
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-3">
            <label
              htmlFor="description"
              className="flex items-center text-sm font-medium text-gray-300"
            >
              <TextCursorInput className="mr-2 h-4 w-4 text-purple-400" />
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Update your post content..."
              required
            />
          </div>

          {/* Duration Field */}
          <div className="space-y-3">
            <label
              htmlFor="duration"
              className="flex items-center text-sm font-medium text-gray-300"
            >
              <Clock className="mr-2 h-4 w-4 text-purple-400" />
              Duration
            </label>
            <div className="relative">
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g. 2 hours, 30 minutes"
                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-400 text-sm">⏱️</span>
              </div>
            </div>
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
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Update Post
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
