// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm py-4 mt-auto">
      <div className="max-w-6xl mx-auto px-6 text-center">
        © {new Date().getFullYear()} Goon Tracker V2. All rights reserved.
      </div>
    </footer>
  );
}
