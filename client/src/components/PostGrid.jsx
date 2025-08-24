import { useState, useEffect } from "react";
import { Search, Calendar } from "lucide-react";
import { postsCollection } from "../config/firebase";
import { getDocs, query, orderBy } from "firebase/firestore";

const PostGrid = () => {
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

  return (
    <div className="mb-5 mt-5">
      <h1 className="text-3xl font-bold text-white mb-6">Danh sách bài viết</h1>

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

      {/* Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 28 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg p-4"
            >
              <div className="h-5 bg-gray-700 rounded mb-3 w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col gap-5"
            >
              {/* DateTime + Duration */}
              <div className=" text-yellow-400 rounded font-semibold w-fit">
                🕒 {formatFullDateTime(post.dateTime)}
              </div>

              {/* Description */}
              <p className="text-gray-300 mb-2 flex-1 font-medium">
                {post.description}
              </p>

              <div className=" text-green-400 rounded font-semibold w-fit">
                ⏳ {post.duration}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-400 text-lg">
            Không tìm thấy bài viết nào phù hợp
          </p>
        </div>
      )}
    </div>
  );
};

export default PostGrid;
