import axiosClient from "./axiosClient";

export const getAllPosts = (params = {}) => {
  return axiosClient.get("/posts", {
    params: {
      description: params.description || "",
      timeOfDay: params.timeOfDay || "", // 👈 thêm filter buổi
      sortBy: params.sortBy || "dateTime", // dateTime | timeOfDay
      sortOrder: params.sortOrder || "desc", // asc | desc
      page: params.page || 1,
      limit: params.limit || 10,
    },
  });
};

export const createPost = (data) => axiosClient.post("/posts", data);

export const deletePost = (id) => axiosClient.delete(`/posts/${id}`);

export const updatePost = (id, data) => axiosClient.put(`/posts/${id}`, data);

export const getPost = (id) => axiosClient.get(`/posts/${id}`);
