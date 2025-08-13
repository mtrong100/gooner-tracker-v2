import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllPosts } from "../api/postApi";
import {
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Loader,
  RefreshCw,
} from "lucide-react";
import { formatFullDateTime } from "../utils/formatFullDateTime";

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

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

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search, filters.sortBy]);

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await getAllPosts({
        description: filters.search,
        sortBy: "dateTime",
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
  }, [filters.page, filters.limit]);

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

  // Generate pagination buttons with ellipsis
  const renderPaginationButtons = () => {
    const buttons = [];
    const { page } = filters;
    const { totalPages } = pagination;

    // Always show first page
    buttons.push(
      <PaginationButton
        key={1}
        page={1}
        currentPage={page}
        onClick={handlePageChange}
      />
    );

    // Show ellipsis if current page is far from start
    if (page > 3) {
      buttons.push(
        <span key="start-ellipsis" className="px-2 text-gray-400">
          ...
        </span>
      );
    }

    // Show pages around current page
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      buttons.push(
        <PaginationButton
          key={i}
          page={i}
          currentPage={page}
          onClick={handlePageChange}
        />
      );
    }

    // Show ellipsis if current page is far from end
    if (page < totalPages - 2) {
      buttons.push(
        <span key="end-ellipsis" className="px-2 text-gray-400">
          ...
        </span>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      buttons.push(
        <PaginationButton
          key={totalPages}
          page={totalPages}
          currentPage={page}
          onClick={handlePageChange}
        />
      );
    }

    return buttons;
  };

  return (
    <div className="mb-5 mt-5 px-4 sm:px-6 lg:px-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-3xl font-bold text-white mb-6"
      >
        Post List
      </motion.h1>

      {/* Filter and Sort Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 bg-gray-800 rounded-xl p-4 shadow-lg"
      >
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
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
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
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none transition-all duration-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              setFilters({
                search: "",
                sortBy: "newest",
                page: 1,
                limit: 12,
              })
            }
            className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Filters
          </motion.button>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex justify-center items-center py-12"
        >
          <Loader className="animate-spin h-8 w-8 text-purple-500" />
        </motion.div>
      )}

      {/* Posts Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          // Loading skeleton cards
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {Array.from({ length: filters.limit }).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                variants={cardVariants}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
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
              </motion.div>
            ))}
          </motion.div>
        ) : (
          // Actual content
          <motion.div
            key={`posts-${filters.page}-${filters.search}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {posts.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {posts.map((post) => (
                  <motion.div
                    key={post._id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-200 hover:z-10"
                  >
                    <div className="p-5">
                      <p className="text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                        {post.description}
                      </p>

                      <div className="flex items-center text-gray-400 text-sm mb-2">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {formatFullDateTime(post.dateTime)}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-400 text-sm">
                        <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{post.duration}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-12"
              >
                <p className="text-gray-400 text-lg">
                  No posts found matching your criteria
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination - Only show when not loading and there are pages */}
      {!loading && pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mt-8"
        >
          <nav className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page === 1}
              className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>

            {renderPaginationButtons()}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page === pagination.totalPages}
              className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </nav>
        </motion.div>
      )}
    </div>
  );
};

// Reusable pagination button component
const PaginationButton = ({ page, currentPage, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(page)}
      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        currentPage === page
          ? "bg-purple-600 text-white"
          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
      } transition-all duration-200`}
    >
      {page}
    </motion.button>
  );
};

export default PostGrid;
