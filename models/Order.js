const mongoose = require("mongoose");

/**
 * Order Schema
 * Stores customer details, ordered items, totals, and status.
 * Auto-generates a custom orderId in format: EVE-YYYYMMDD-NNNN
 */
const orderSchema = new mongoose.Schema(
  {
    // Custom order ID: EVE-20260704-0001
    orderId: {
      type: String,
      unique: true,
    },

    // Customer information
    customer: {
      name: {
        type: String,
        required: [true, "Customer name is required"],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        default: "",
      },
      address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      pincode: {
        type: String,
        required: [true, "Pincode is required"],
        trim: true,
      },
      landmark: {
        type: String,
        trim: true,
        default: "",
      },
      notes: {
        type: String,
        trim: true,
        default: "",
      },
    },

    // Ordered items
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        subtotal: { type: Number, required: true },
      },
    ],

    deliveryCharge: {
      type: Number,
      default: 99,
    },

    grandTotal: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["Paid", "Not Paid"],
      default: "Not Paid",
    },

    orderStatus: {
      type: String,
      enum: ["Pending", "Preparing", "Packed", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook to auto-generate custom orderId.
 * Format: EVE-YYYYMMDD-NNNN (sequential per day)
 */
orderSchema.pre("save", async function (next) {
  if (this.orderId) return next();

  const now = new Date();
  const dateStr =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");

  const prefix = `EVE-${dateStr}-`;

  // Find the last order created today to determine the next sequence number
  const lastOrder = await this.constructor
    .findOne({ orderId: { $regex: `^${prefix}` } })
    .sort({ orderId: -1 })
    .lean();

  let seq = 1;
  if (lastOrder && lastOrder.orderId) {
    const lastSeq = parseInt(lastOrder.orderId.split("-").pop(), 10);
    seq = lastSeq + 1;
  }

  this.orderId = `${prefix}${String(seq).padStart(4, "0")}`;
  next();
});

module.exports = mongoose.model("Order", orderSchema);
