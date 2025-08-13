import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-gray-100 font-sans">
      <Header />

      <div className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8 mt-16">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}
