import { useState, useEffect } from "react";
import { ArrowLeft, Search, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { postsCollection, db } from "../config/firebase";
import { getDocs, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const ManagePage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    month: "all",
    weekday: "all",
  });

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const q = query(postsCollection, orderBy("dateTime", "desc"));
      const querySnapshot = await getDocs(q);

      let data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        data = data.filter((p) =>
          p.description?.toLowerCase().includes(searchLower)
        );
      }

      // Filter theo tháng
      if (filters.month !== "all") {
        data = data.filter((p) => {
          const d = new Date(p.dateTime);
          return d.getMonth() + 1 === Number(filters.month);
        });
      }

      // Filter theo thứ
      if (filters.weekday !== "all") {
        data = data.filter((p) => {
          const d = new Date(p.dateTime);
          let day = d.getDay(); // 0 = CN
          if (day === 0) day = 8; // Chủ Nhật = 8
          return day === Number(filters.weekday);
        });
      }

      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search/filter
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 400);
    return () => clearTimeout(timer);
  }, [filters]);

  // Format datetime
  const formatFullDateTime = (date) => {
    const d = new Date(date);
    return d.toLocaleString("vi-VN", {
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

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResetFilter = () => {
    setFilters((prev) => ({
      ...prev,
      search: "",
      month: "all",
      weekday: "all",
    }));
  };

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
          // Xóa document trong Firestore
          await deleteDoc(doc(db, "posts", postId));

          toast.success("Đã xóa bài viết thành công!", {
            style: {
              background: "#1e293b",
              color: "#f8fafc",
              border: "1px solid #334155",
            },
          });

          fetchPosts(); // Refresh lại danh sách
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
              Quay về
            </span>
          </span>
        </button>

        <button
          onClick={() => navigate("/create-post")}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-purple-500/20 transition-all font-bold"
        >
          Tạo bài viết
        </button>
      </div>

      <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-gray-700/50">
        <div className="bg-gradient-to-r from-purple-900/70 to-blue-900/70 p-6">
          <div className="flex items-center justify-between flex-wrap gap-5">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Quản lý bài viết
              </h1>
              <p className="text-sm text-purple-200 mt-1">
                Xem và quản lý tất cả bài đăng
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
              <span>Đặt lại</span>
            </button>
          </div>
        </div>

        {/* Filter + Search */}
        <div className="mb-6 bg-gray-800 rounded-xl p-4 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Tìm kiếm..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filter by Month */}
            <div>
              <select
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tất cả tháng</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Tháng {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Weekday */}
            <div>
              <select
                name="weekday"
                value={filters.weekday}
                onChange={handleFilterChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tất cả các ngày</option>
                <option value="1">Thứ 2</option>
                <option value="2">Thứ 3</option>
                <option value="3">Thứ 4</option>
                <option value="4">Thứ 5</option>
                <option value="5">Thứ 6</option>
                <option value="6">Thứ 7</option>
                <option value="8">Chủ Nhật</option>
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
                    className="px-6 py-3 text-left  font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                  >
                    Ngày/Giờ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left  font-medium text-gray-300 uppercase tracking-wider"
                  >
                    Mô tả
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left  font-medium text-gray-300 uppercase tracking-wider "
                  >
                    Thời lượng
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left  font-medium text-gray-300 uppercase tracking-wider"
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
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        <div className=" text-yellow-400 rounded font-semibold w-fit">
                          {formatFullDateTime(post.dateTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-300 min-w-xs max-w-xs">
                        {post.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap  text-gray-300">
                        <div className=" text-green-400 rounded font-semibold w-fit">
                          {post.duration}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap  text-gray-300">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/update-post/${post.id}`)}
                            className="p-4 bg-blue-600/50 hover:bg-blue-700/50 rounded-md transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
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
                      className="px-6 py-4 text-center  text-gray-400"
                    >
                      Không tìm thấy bài viết
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagePage;
