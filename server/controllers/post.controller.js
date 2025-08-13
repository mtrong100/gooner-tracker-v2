import Post from "../models/post.model.js";

export const getPosts = async (req, res) => {
  try {
    let {
      description,
      timeOfDay, // morning | noon | afternoon | evening
      sortBy = "dateTime", // dateTime | timeOfDay
      sortOrder = "desc", // asc | desc
      page = 1,
      limit = 10,
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    let filter = {};

    // 📌 Filter theo description
    if (description) {
      filter.description = { $regex: description, $options: "i" };
    }

    // 📌 Lấy toàn bộ để filter timeOfDay (vì MongoDB khó filter theo buổi trực tiếp)
    let allPosts = await Post.find(filter).lean();

    // 📌 Nếu filter theo buổi
    if (timeOfDay) {
      const timeMap = {
        morning: { start: 5, end: 11 },
        noon: { start: 11, end: 13 },
        afternoon: { start: 13, end: 17 },
        evening: { start: 17, end: 24, wrap: true }, // wrap = qua ngày hôm sau
      };

      const range = timeMap[timeOfDay];
      if (range) {
        allPosts = allPosts.filter((post) => {
          const hourVN = new Date(post.dateTime).getUTCHours() + 7;
          const hour = hourVN >= 24 ? hourVN - 24 : hourVN;
          if (range.wrap) {
            return hour >= range.start || hour < 5; // evening + khuya
          }
          return hour >= range.start && hour < range.end;
        });
      }
    }

    // 📌 Sort
    if (sortBy === "dateTime") {
      allPosts.sort((a, b) => {
        const diff = new Date(a.dateTime) - new Date(b.dateTime);
        return sortOrder === "asc" ? diff : -diff;
      });
    }

    if (sortBy === "timeOfDay") {
      const orderMap = {
        morning: 1,
        noon: 2,
        afternoon: 3,
        evening: 4,
      };

      const getBuoi = (date) => {
        const hourVN = new Date(date).getUTCHours() + 7;
        const hour = hourVN >= 24 ? hourVN - 24 : hourVN;
        if (hour >= 5 && hour < 11) return "morning";
        if (hour >= 11 && hour < 13) return "noon";
        if (hour >= 13 && hour < 17) return "afternoon";
        return "evening";
      };

      allPosts.sort((a, b) => {
        const aOrder = orderMap[getBuoi(a.dateTime)];
        const bOrder = orderMap[getBuoi(b.dateTime)];
        return sortOrder === "asc" ? aOrder - bOrder : bOrder - aOrder;
      });
    }

    // 📌 Pagination
    const total = allPosts.length;
    const paginatedPosts = allPosts.slice((page - 1) * limit, page * limit);

    res.status(200).json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: paginatedPosts,
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
