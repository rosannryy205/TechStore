const ATTRIBUTES = [
  {
    name: "color",
    display_name: "Màu sắc",
    type: "text",
    sort_order: 0,
    options: [
      "Titan Sa Mạc",
      "Titan Tự Nhiên",
      "Titan Đen",
      "Titan Trắng",
      "Xám Không Gian",
      "Bạc",
      "Xanh Dương",
      "Tím",
      "Đen Huyền Bí",
      "Xám Titan",
      "Xanh Navy",
      "Trắng",
      "Xám Eclipse",
      "Bạc Platinum",
      "Đen Da Sinh Học",
    ],
  },
  {
    name: "storage",
    display_name: "Dung lượng",
    type: "select",
    sort_order: 1,
    options: ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"],
  },
  {
    name: "ram",
    display_name: "RAM",
    type: "select",
    sort_order: 2,
    options: ["8GB", "12GB", "16GB", "18GB", "24GB", "32GB", "36GB", "64GB"],
  },
];

module.exports = {
  ATTRIBUTES,
};
