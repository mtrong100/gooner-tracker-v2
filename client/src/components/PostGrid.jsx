import { useState, useEffect } from "react";
import { getAllPosts } from "../api/postApi";
import {
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Loader,
} from "lucide-react";
import { formatFullDateTime } from "../utils/formatFullDateTime";

const PostGrid = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    sortBy: "newest",
    page: 1,
    limit: 12,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await getAllPosts({
        description: filters.search,
        sortBy: filters.sortBy === "newest" ? "dateTime" : "dateTime",
        sortOrder: filters.sortBy === "newest" ? "desc" : "asc",
        page: filters.page,
        limit: filters.limit,
      });

      setPosts(data.data);
      setPagination({
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mb-5 mt-5">
      <h1 className="text-3xl font-bold text-white mb-4">Post List</h1>

      {/* Filter and Sort Controls */}
      <div className="mb-5 bg-gray-800 rounded-lg p-4 shadow-md">
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
              placeholder="Search posts..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ArrowUpDown className="h-5 w-5 text-gray-400" />
            </div>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          <button
            onClick={() =>
              setFilters({
                search: "",
                sortBy: "newest",
                page: 1,
                limit: 12,
              })
            }
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader className="animate-spin h-8 w-8 text-purple-500" />
        </div>
      )}

      {/* Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          // Loading skeleton cards
          Array.from({ length: filters.limit }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-pulse"
            >
              <div className="p-4">
                <div className="h-5 bg-gray-700 rounded mb-3 w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                </div>

                <div className="flex items-center mt-4">
                  <div className="h-4 w-4 bg-gray-700 rounded-full mr-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-24"></div>
                </div>

                <div className="flex items-center mt-2">
                  <div className="h-4 w-4 bg-gray-700 rounded-full mr-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))
        ) : // Actual post cards
        posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post._id}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-4">
                <p className="text-gray-300 mb-4 line-clamp-3">
                  {post.description}
                </p>

                <div className="flex items-center text-gray-400 text-sm mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatFullDateTime(post.dateTime)}</span>
                </div>

                <div className="flex items-center text-gray-400 text-sm">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{post.duration}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 text-lg">
              No posts found matching your criteria
            </p>
          </div>
        )}
      </div>

      {/* Pagination - Only show when not loading and there are pages */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page === 1}
              className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (filters.page <= 3) {
                  pageNum = i + 1;
                } else if (filters.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = filters.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      filters.page === pageNum
                        ? "bg-purple-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    } transition-colors`}
                  >
                    {pageNum}
                  </button>
                );
              }
            )}

            <button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page === pagination.totalPages}
              className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default PostGrid;
