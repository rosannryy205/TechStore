/**
 * Order Controller
 * - Nhận request từ client, gọi Order Service
 * - Format response chuẩn { success, data/message }
 */
const orderService = require("../../services/client/orderService");

/**
 * POST /api/orders
 * - Tạo đơn hàng từ giỏ hàng của user hiện tại
 * Body: { receiver_name, receiver_phone, receiver_email, address, payment_method, note }
 */
const createOrderController = async (req, res, next) => {
  try {
    const {
      receiver_name,
      receiver_phone,
      receiver_email,
      address,
      payment_method,
      note,
    } = req.body || {};

    const result = await orderService.createOrder({
      userId: req.user.id,
      shippingInfo: {
        receiver_name,
        receiver_phone,
        receiver_email,
        address,
      },
      paymentMethod: payment_method || "cod",
      note: note || "",
    });

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/orders/my-orders
 * - Lấy danh sách đơn hàng của user hiện tại
 */
const getMyOrdersController = async (req, res, next) => {
  try {
    const orders = await orderService.getOrdersByUser(req.user.id);
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    return next(err);
  }
};

/**
 * PUT /api/orders/:id/cancel
 * - Hủy đơn hàng (chỉ khi đang ở trạng thái "pending")
 */
const cancelOrderController = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const result = await orderService.cancelOrder({
      orderId,
      userId: req.user.id,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createOrderController,
  getMyOrdersController,
  cancelOrderController,
};
