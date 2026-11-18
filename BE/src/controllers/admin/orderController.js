const orderService = require("../../services/admin/orderService");
const orderStatusService = require("../../services/orderStatusService");

const getOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getOrders(req.query);

    return res.status(200).json({
      success: true,
      ...orders,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrder(id);

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const advanceOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { expected_status, target_status } = req.body;
    const order = await orderStatusService.advanceOrder({
      orderId: id,
      actorId: req.user.id,
      expectedStatus: expected_status,
      targetStatus: target_status,
    });

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const bulkAdvanceOrders = async (req, res, next) => {
  try {
    const { orders, target_status } = req.body;
    const result = await orderService.bulkAdvance({
      orders,
      targetStatus: target_status,
      actorId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { expected_status, request_id, reason } = req.body;
    const order = await orderStatusService.cancelOrder({
      orderId: id,
      actorId: req.user.id,
      operator: true,
      expectedStatus: expected_status,
      requestId: request_id,
      reason,
    });

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrderDetail,
  advanceOrder,
  bulkAdvanceOrders,
  cancelOrder,
};
