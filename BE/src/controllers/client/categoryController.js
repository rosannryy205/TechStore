const {getAllCategories} = require("../../services/client/categoryService");

const getAllCategoriesController = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        res.status(200).json({ success: true, data: categories });
    } catch(error) {
        next(error);
    }
}

module.exports = {
    getAllCategories: getAllCategoriesController,
}
