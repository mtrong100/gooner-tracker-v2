// src/api/userApi.js

import axiosClient from "./axiosClient";

export const userSignin = (data) => axiosClient.post("/users/signin", data);
