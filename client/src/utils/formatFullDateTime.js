// export const formatFullDateTime = (dateString) => {
//   if (!dateString) return "";

//   return new Date(dateString).toLocaleString("vi-VN", {
//     weekday: "long",
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: false, // dùng 24h format
//     timeZone: "Asia/Ho_Chi_Minh", // ép múi giờ VN
//   });
// };

export const formatFullDateTime = (isoUtcString) => {
  if (!isoUtcString) return "";

  const date = new Date(isoUtcString);

  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mi = String(date.getUTCMinutes()).padStart(2, "0");

  const weekdays = [
    "Chủ Nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];
  const weekday = weekdays[date.getUTCDay()];

  return `${hh}:${mi} ${weekday}, ${dd}/${mm}/${yyyy}`;
};
