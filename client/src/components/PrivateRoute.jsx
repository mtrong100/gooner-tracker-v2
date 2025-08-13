import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * PrivateRoute checks localStorage 'user' (JSON string).
 * If user exists -> render nested routes via <Outlet />
 * If not -> redirect to /login
 */
export default function PrivateRoute() {
  const raw = localStorage.getItem("user");
  let user = null;

  try {
    user = raw ? JSON.parse(raw) : null;
  } catch (e) {
    user = null;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
