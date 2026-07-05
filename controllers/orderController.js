const Order = require("../models/Order");

/**
 * Order Controller
 * Handles order creation (public), retrieval, status updates, and dashboard stats.
 */

// @desc    Place a new order (customer)
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const { customer, items, deliveryCharge } = req.body;

    // Validate customer info
    if (!customer || !customer.name) {
      return res.status(400).json({ success: false, message: "Customer name is required" });
    }
    if (!customer.phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }
    if (!customer.address) {
      return res.status(400).json({ success: false, message: "Address is required" });
    }
    if (!customer.city) {
      return res.status(400).json({ success: false, message: "City is required" });
    }
    if (!customer.state) {
      return res.status(400).json({ success: false, message: "State is required" });
    }
    if (!customer.pincode) {
      return res.status(400).json({ success: false, message: "Pincode is required" });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order must contain at least one item" });
    }

    // Calculate subtotals and grand total
    const processedItems = items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }));

    const itemsTotal = processedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const delivery = deliveryCharge !== undefined ? Number(deliveryCharge) : 99;
    const grandTotal = itemsTotal + delivery;

    const order = await Order.create({
      customer,
      items: processedItems,
      deliveryCharge: delivery,
      grandTotal,
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: order.orderId,
        grandTotal: order.grandTotal,
        _id: order._id,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (newest first)
// @route   GET /api/orders
// @access  Protected (Admin)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Protected (Admin)
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update payment status
// @route   PATCH /api/orders/:id/payment
// @access  Protected (Admin)
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (!paymentStatus || !["Paid", "Not Paid"].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'paymentStatus must be "Paid" or "Not Paid"',
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Protected (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = ["Pending", "Preparing", "Packed", "Delivered", "Cancelled"];

    if (!orderStatus || !validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `orderStatus must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Protected (Admin)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/orders/stats
// @access  Protected (Admin)
const getDashboardStats = async (req, res) => {
  try {
    // Get all orders
    const orders = await Order.find().sort({ createdAt: -1 });

    // Today's date range (start of day to end of day)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const totalOrders = orders.length;
    const todaysOrders = orders.filter(
      (o) => o.createdAt >= todayStart && o.createdAt <= todayEnd
    ).length;
    const paidOrders = orders.filter((o) => o.paymentStatus === "Paid").length;
    const notPaidOrders = totalOrders - paidOrders;
    const revenue = orders
      .filter((o) => o.paymentStatus === "Paid")
      .reduce((sum, o) => sum + o.grandTotal, 0);

    // Recent orders (latest 10)
    const recentOrders = orders.slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        todaysOrders,
        paidOrders,
        notPaidOrders,
        revenue,
        recentOrders,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updatePaymentStatus,
  updateOrderStatus,
  deleteOrder,
  getDashboardStats,
};
