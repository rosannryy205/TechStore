require("dotenv").config({ quiet: true });
const { sequelize } = require("../models");
const { processNextEmail } = require("../services/orderEmailService");

let stopping = false;
process.on("SIGINT", () => { stopping = true; });
process.on("SIGTERM", () => { stopping = true; });

async function run() {
  // Worker chỉ kiểm tra kết nối, tuyệt đối không alter schema khi khởi động.
  await sequelize.authenticate();
  while (!stopping) {
    try {
      if (await processNextEmail()) continue;
    } catch {
      console.error("Không xử lý được hàng đợi email; sẽ thử lại.");
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  await sequelize.close();
}
if (require.main === module) run().catch(() => { console.error("Không thể khởi động worker email."); process.exitCode = 1; });
module.exports = { run };
