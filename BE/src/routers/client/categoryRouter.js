const express = require("express");
const router = express.Router();
const { getAllCategories } = require("../../controllers/client/categoryController");


router.get("/", getAllCategories);

module.exports = router;