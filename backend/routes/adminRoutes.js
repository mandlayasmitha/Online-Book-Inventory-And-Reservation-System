const express = require("express");

const {
  getDashboard,
  getBooks,
  addBook,
  updateBook,
  deleteBook,
  getInventory,
  getUsers,
  updateUserStatus,
  getReservations,
  updateReservationStatus
} = require("../controllers/adminController");

const router = express.Router();

router.get("/dashboard", getDashboard);

router.get("/books", getBooks);
router.post("/books", addBook);
router.put("/books/:id", updateBook);
router.delete("/books/:id", deleteBook);

router.get("/inventory", getInventory);

router.get("/users", getUsers);
router.put("/users/:id/status", updateUserStatus);

router.get("/reservations", getReservations);
router.put("/reservations/:id/status", updateReservationStatus);

module.exports = router;