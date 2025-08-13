import axiosClient from "./axiosClient";

export const getAllPosts = () => axiosClient.get("/posts");

export const createPost = (data) => axiosClient.post("/posts", data);

export const deletePost = (id) => axiosClient.delete(`/posts/${id}`);

export const updatePost = (id, data) => axiosClient.put(`/posts/${id}`, data);

export const getPost = (id) => axiosClient.get(`/posts/${id}`);
