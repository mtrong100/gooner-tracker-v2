import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpDown,
  Calendar,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  TextCursorInput,
  Edit,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { deletePost, getAllPosts } from "../api/postApi";
import Swal from "sweetalert2";
import { formatFullDateTime } from "../utils/formatFullDateTime";

const ManagePage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    description: "",
    sortBy: "newest",
    timeOfDay: "",
    page: 1,
    limit: 30,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await getAllPosts({
        ...filters,
        sortBy: "dateTime",
        sortOrder: filters.sortBy === "oldest" ? "asc" : "desc",
      });
      setPosts(data.data);
      setPagination({
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts", {
        style: {
          background: "#1e293b",
          color: "#f8fafc",
          border: "1px solid #334155",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filters]);

  const handleDeletePost = async (postId) => {
    Swal.fire({
      title: "Bạn chắc chắn muốn xóa?",
      text: "Bạn sẽ không thể hoàn tác lại hành động này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      background: "#1e293b",
      color: "#f8fafc",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deletePost(postId);
          toast.success("Xóa bài viết thành công!", {
            style: {
              background: "#1e293b",
              color: "#f8fafc",
              border: "1px solid #334155",
            },
          });
          fetchPosts(); // Refresh the list
        } catch (error) {
          console.error("Error deleting post:", error);
          toast.error("Xóa bài viết thất bại!", {
            style: {
              background: "#1e293b",
              color: "#f8fafc",
              border: "1px solid #334155",
            },
          });
        }
      }
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handleResetFilter = () => {
    setFilters({
      description: "",
      sortBy: "newest",
      timeOfDay: "",
      page: 1,
      limit: 30,
    });
  };

  const getTimeOfDay = (date) => {
    const hourVN = new Date(date).getUTCHours() + 7;
    const hour = hourVN >= 24 ? hourVN - 24 : hourVN;
    if (hour >= 5 && hour < 11) return "Sáng";
    if (hour >= 11 && hour < 13) return "Trưa";
    if (hour >= 13 && hour < 17) return "Chiều";
    return "Tối";
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center group text-sm font-medium transition-all duration-200"
        >
          <span className="flex items-center bg-gray-800/60 hover:bg-gray-700/80 backdrop-blur-sm rounded-lg px-6 py-3 border border-gray-700/50 group-hover:border-purple-400/30 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
            <span className="text-gray-300 group-hover:text-white bg-gradient-to-r from-purple-400/80 to-blue-400/80 bg-clip-text text-transparent">
              Back
            </span>
          </span>
        </button>

        <button
          onClick={() => navigate("/create-post")}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-purple-500/20 transition-all"
        >
          Create Post
        </button>
      </div>

      <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-gray-700/50">
        <div className="bg-gradient-to-r from-purple-900/70 to-blue-900/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Manage Posts</h1>
              <p className="text-sm text-purple-200 mt-1">
                View and manage all posts
              </p>
            </div>

            <button
              onClick={handleResetFilter}
              className="flex items-center justify-center px-5 py-3 space-x-2 text-sm font-medium text-white bg-gray-800 hover:to-gray-800 border border-gray-700/50 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-red-500/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M7 12h10" />
                <path d="M10 18h4" />
              </svg>
              <span>Reset filter</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="description"
                value={filters.description}
                onChange={handleFilterChange}
                placeholder="Search descriptions..."
                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="w-full bg-gray-700/80 border border-gray-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>

            <div className="relative">
              <select
                name="timeOfDay"
                value={filters.timeOfDay}
                onChange={handleFilterChange}
                className="w-full bg-gray-700/80 border border-gray-600/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="">Tất cả thời gian</option>
                <option value="morning">Sáng</option>
                <option value="noon">Trưa</option>
                <option value="afternoon">Chiều</option>
                <option value="evening">Tối</option>
              </select>
            </div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead className="bg-gray-800/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  >
                    Ngày/Giờ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Mô tả
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Buổi
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider "
                  >
                    Thời lượng
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800/30 divide-y divide-gray-700/50">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <tr
                      key={post._id}
                      className="hover:bg-gray-700/20 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatFullDateTime(post.dateTime)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 min-w-xs max-w-xs">
                        {post.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {getTimeOfDay(post.dateTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {post.duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/update-post/${post._id}`)}
                            className="p-4 bg-blue-600/50 hover:bg-blue-700/50 rounded-md transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="p-4 bg-red-600/50 hover:bg-red-700/50 rounded-md transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-4 text-center text-sm text-gray-400"
                    >
                      Không tìm thấy bài viết
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination at bottom */}
        {!loading && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-700/50 flex items-center justify-center space-x-4">
            <button
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={filters.page === 1}
              className="flex items-center px-4 py-2 rounded-lg border border-gray-700/50 bg-gray-800/50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/50 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-300 mr-2" />
              Previous
            </button>
            <div className="text-sm text-gray-300">
              Trang {filters.page} / {pagination.totalPages}
            </div>
            <button
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={filters.page === pagination.totalPages}
              className="flex items-center px-4 py-2 rounded-lg border border-gray-700/50 bg-gray-800/50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/50 transition-colors"
            >
              Next
              <ChevronRight className="h-5 w-5 text-gray-300 ml-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePage;
