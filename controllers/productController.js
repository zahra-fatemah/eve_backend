const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

/**
 * Product Controller
 * Full CRUD with Cloudinary image upload/delete.
 */

// Helper removed: Images are now stored directly in MongoDB as Base64 strings.
const getBase64DataURI = (file) => {
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Protected (Admin)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, description, price, and category are required",
      });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({ success: false, message: "Price must be greater than 0" });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({ success: false, message: "Stock cannot be negative" });
    }

    let imageUrl = "";
    let cloudinaryId = "";

    // Convert image to Base64 Data URI if provided
    if (req.file) {
      imageUrl = getBase64DataURI(req.file);
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      category,
      image: imageUrl,
      // cloudinaryId is kept empty since we aren't using Cloudinary anymore
      cloudinaryId: "",
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Protected (Admin)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const { name, description, price, stock, category } = req.body;

    // Validate
    if (price !== undefined && Number(price) <= 0) {
      return res.status(400).json({ success: false, message: "Price must be greater than 0" });
    }
    if (stock !== undefined && Number(stock) < 0) {
      return res.status(400).json({ success: false, message: "Stock cannot be negative" });
    }

    // If a new image is uploaded, store it as Base64 in MongoDB
    if (req.file) {
      // (Optional cleanup of old cloudinary images could happen here if needed, 
      // but since we are moving away from Cloudinary, we just ignore it and overwrite)
      product.image = getBase64DataURI(req.file);
      product.cloudinaryId = "";
    }

    // Update fields
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (category !== undefined) product.category = category;

    const updated = await product.save();
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Protected (Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Cloudinary destroy logic removed since images are now stored in MongoDB
    // if (product.cloudinaryId) {
    //   await cloudinary.uploader.destroy(product.cloudinaryId);
    // }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
