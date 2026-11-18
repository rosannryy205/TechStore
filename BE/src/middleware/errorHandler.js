// Middleware error handler tập trung
// Chuẩn hoá format lỗi để FE xử lý đồng nhất.

const errorHandler = (err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode >= 500 ? "Hệ thống chưa xử lý được yêu cầu. Vui lòng thử lại." : err.message || "Yêu cầu không hợp lệ.";

  res.status(statusCode).json({
    success: false,
    message,
    ...(typeof err.code === "string" && (statusCode < 500 || err.code === "CANCELLATION_FAILED") ? { code: err.code } : {}),
  });
};

module.exports = errorHandler;

