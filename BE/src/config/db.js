const { Sequelize } = require('sequelize');
require('dotenv').config();

//Khởi tạo kết nối Sequelize với cơ sở dữ liệu MySQL
const sequelize = new Sequelize(
    process.env.DB_NAME || 'pj26', // Tên cơ sở dữ liệu
    process.env.DB_USER || 'root', // Tên người dùng
    process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '', // Mật khẩu    
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: process.env.DB_DIALECT || 'mysql'
    }
);

const connectDB =  async () => {
    try{
        await sequelize.authenticate();
        console.log('Kết nối đến cơ sở dữ liệu thành công!');
        // sync() giúp tự động tạo bảng trong MySQL dựa trên các model đã định nghĩa
        await sequelize.sync({ alter: true }); // alter: true sẽ tự động cập nhật bảng nếu có sự thay đổi trong model
        console.log('Đồng bộ hóa cơ sở dữ liệu thành công!');
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
};
 module.exports = { sequelize, connectDB };