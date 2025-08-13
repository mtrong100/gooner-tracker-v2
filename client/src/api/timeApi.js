import axiosClient from "./axiosClient";

export const getTimes = () => axiosClient.get("/times");

export const updateTime = (id, data) => axiosClient.put(`/times/${id}`, data);
