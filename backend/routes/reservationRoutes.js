
const express = require("express");
const Reservation = require("../models/Reservation");

const router = express.Router();

// Create a reservation
router.post("/", async (req, res) => {
  try {
    const {
      userName,
      bookTitle,
      reservationDate,
      returnDate,
    } = req.body;

    if (!userName || !bookTitle) {
      return res.status(400).json({
        message: "User name and book title are required",
      });
    }

    const reservation = await Reservation.create({
      userName,
      bookTitle,
      reservationDate: reservationDate || new Date(),
      returnDate: returnDate || null,
      status: "Pending",
    });

    return res.status(201).json({
      message: "Reservation created successfully",
      reservation,
    });
  } catch (error) {
    console.error("Create reservation error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

// Get all reservations
router.get("/", async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({
      createdAt: -1,
    });

    return res.status(200).json(reservations);
  } catch (error) {
    console.error("Get reservations error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
