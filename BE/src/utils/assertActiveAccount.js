const assertActiveAccount = (user) => {
  if (!user) {
    throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
  }

  if (user.status !== 1) {
    throw Object.assign(new Error("Tài khoản của bạn đã bị khóa hoặc tạm ngưng."), {
      statusCode: 403,
      code: "ACCOUNT_LOCKED",
    });
  }
};

module.exports = assertActiveAccount;
