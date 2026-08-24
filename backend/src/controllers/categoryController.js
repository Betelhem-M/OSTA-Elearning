const Category = require("../models/Category");

const categoryController = {
  async getAll(req, res) {
    try {
      const categories = await Category.findAll();

      return res.status(200).json(categories);
    } catch (error) {
      console.error("Get categories error:", error);

      return res.status(500).json({
        message: "Failed to fetch categories",
      });
    }
  },

  async create(req, res) {
    try {
      const { name, description } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          message: "Category name is required",
        });
      }

      if (
        req.user.role !== "admin" &&
        req.user.role !== "instructor"
      ) {
        return res.status(403).json({
          message: "Only instructors and admins can create categories",
        });
      }

      const existingCategories = await Category.findAll();

      const alreadyExists = existingCategories.some(
        (category) =>
          category.name.toLowerCase() === name.trim().toLowerCase()
      );

      if (alreadyExists) {
        return res.status(409).json({
          message: "A category with this name already exists",
        });
      }

      const categoryId = await Category.create({
        name: name.trim(),
        description: description?.trim() || "",
      });

      const category = await Category.findById(categoryId);

      return res.status(201).json({
        message: "Category created successfully",
        category,
      });
    } catch (error) {
      console.error("Create category error:", error);

      return res.status(500).json({
        message: "Failed to create category",
      });
    }
  },
};

module.exports = categoryController;