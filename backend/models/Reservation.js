const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true
    },
    bookTitle: {
      type: String,
      required: true
    },
    reservationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Cancelled", "Completed"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "AdminInventoryReservation",
  reservationSchema
);