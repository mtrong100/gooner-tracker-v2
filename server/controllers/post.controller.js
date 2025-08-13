import Post from "../models/post.model.js";

export const getPosts = async (req, res) => {
  try {
    let {
      description,
      sortBy = "dateTime", // dateTime | timeOfDay
      sortOrder = "desc", // asc | desc
      page = 1,
      limit = 10,
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const filter = {};

    // 📌 Filter theo description (chứa từ khóa)
    if (description) {
      filter.description = { $regex: description, $options: "i" };
    }

    let sort = {};

    // 📌 Sort bình thường (chỉ dateTime)
    if (sortBy === "dateTime") {
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    }

    // 📌 Sort theo time of day (sáng, trưa, chiều, tối)
    if (sortBy === "timeOfDay") {
      // Sáng: 5-11, Trưa: 11-13, Chiều: 13-17, Tối: còn lại
      const orderMap = {
        morning: 1,
        noon: 2,
        afternoon: 3,
        evening: 4,
      };

      const posts = await Post.find(filter)
        .lean()
        .then((docs) => {
          return docs.sort((a, b) => {
            const getTimeOfDay = (date) => {
              const hourVN = new Date(date).getUTCHours() + 7; // giờ VN
              const hour = hourVN >= 24 ? hourVN - 24 : hourVN;
              if (hour >= 5 && hour < 11) return "morning";
              if (hour >= 11 && hour < 13) return "noon";
              if (hour >= 13 && hour < 17) return "afternoon";
              return "evening";
            };

            const aOrder = orderMap[getTimeOfDay(a.dateTime)];
            const bOrder = orderMap[getTimeOfDay(b.dateTime)];

            return sortOrder === "asc" ? aOrder - bOrder : bOrder - aOrder;
          });
        });

      // 📌 Pagination thủ công khi sort theo timeOfDay
      const total = posts.length;
      const paginatedPosts = posts.slice((page - 1) * limit, page * limit);

      return res.status(200).json({
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: paginatedPosts,
      });
    }

    // 📌 Sort & phân trang khi không phải timeOfDay
    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: posts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { dateTime, description, duration } = req.body;
    const newPost = new Post({ dateTime, description, duration });
    await newPost.save();
    res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateTime, description, duration } = req.body;
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { dateTime, description, duration },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
