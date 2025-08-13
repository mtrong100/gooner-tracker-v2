import React from "react";
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({
  size = 40,
  text = "Đang tải...",
  fullScreen = false,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${
        fullScreen
          ? "fixed inset-0 z-50 bg-gradient-to-br from-gray-900 to-gray-950"
          : ""
      }`}
    >
      <Loader2
        className="animate-spin text-blue-500"
        style={{ width: size, height: size }}
      />
      {text && <span className="text-sm text-gray-300">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
