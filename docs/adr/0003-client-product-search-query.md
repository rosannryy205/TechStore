# Truy vấn tìm kiếm Product và phân trang tại Backend

API danh sách Client dùng SQL có tham số qua Sequelize để chọn Variant đại diện, lọc giá/khuyến mãi, đếm và phân trang Product trước khi hydrate quan hệ bằng ORM. Chọn cách này thay vì tải toàn bộ về FE/Node hoặc phân trang trực tiếp trên join nhiều Variant/ảnh, vì các phương án đó làm tăng dữ liệu truyền hoặc dễ sai tổng số và tập kết quả. SQL chỉ ghép cấu trúc cố định/allowlist, dữ liệu người dùng đi qua replacements; count, chọn trang và hydrate dùng cùng snapshot REPEATABLE READ để nhất quán khi dữ liệu thay đổi.
