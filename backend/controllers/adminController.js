const Book = require("../models/Book");
const User = require("../models/User");
const Reservation = require("../models/Reservation");

const getDashboard = async (req, res) => {
  try {
    const books = await Book.find();

    const totalBooks = books.length;
    const totalQuantity = books.reduce((sum, book) => sum + book.quantity, 0);
    const availableQuantity = books.reduce(
      (sum, book) => sum + book.availableQuantity,
      0
    );
    const reservedQuantity = totalQuantity - availableQuantity;
    const totalUsers = await User.countDocuments();
    const totalReservations = await Reservation.countDocuments();
    const pendingReservations = await Reservation.countDocuments({
      status: "Pending"
    });

    res.json({
      totalBooks,
      totalQuantity,
      availableQuantity,
      reservedQuantity,
      totalUsers,
      totalReservations,
      pendingReservations
    });
  } catch (error) {
    res.status(500).json({ message: "Error loading dashboard" });
  }
};

const getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books" });
  }
};

const addBook = async (req, res) => {
  try {
    const { title, author, category, quantity } = req.body;
    const parsedQuantity = Number(quantity);

    if (!title || !author || !category || !Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({ message: "Enter valid book details" });
    }

    const book = await Book.create({
      title,
      author,
      category,
      quantity: parsedQuantity,
      availableQuantity: parsedQuantity
    });

    res.status(201).json({ message: "Book added successfully", book });
  } catch (error) {
    res.status(500).json({ message: "Error adding book" });
  }
};

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, category, quantity } = req.body;
    const newQuantity = Number(quantity);

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!Number.isInteger(newQuantity) || newQuantity < 0) {
      return res.status(400).json({ message: "Quantity must be a non-negative integer" });
    }

    const reservedQuantity = book.quantity - book.availableQuantity;

    if (newQuantity < reservedQuantity) {
      return res.status(400).json({
        message: `Quantity cannot be less than reserved quantity (${reservedQuantity})`
      });
    }

    book.title = title;
    book.author = author;
    book.category = category;
    book.quantity = newQuantity;
    book.availableQuantity = newQuantity - reservedQuantity;

    await book.save();

    res.json({ message: "Book updated successfully", book });
  } catch (error) {
    res.status(500).json({ message: "Error updating book" });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.quantity !== book.availableQuantity) {
      return res.status(400).json({
        message: "Cannot delete a book with active reservations"
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting book" });
  }
};

const getInventory = async (req, res) => {
  try {
    const books = await Book.find().sort({ title: 1 });

    const inventory = books.map((book) => ({
      id: book._id,
      title: book.title,
      total: book.quantity,
      available: book.availableQuantity,
      reserved: book.quantity - book.availableQuantity
    }));

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: "Error loading inventory" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-__v").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error loading users" });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User status updated", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user status" });
  }
};

const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({
      reservationDate: -1
    });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: "Error loading reservations" });
  }
};

const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "Approved", "Cancelled", "Completed"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid reservation status" });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    res.json({
      message: "Reservation status updated",
      reservation
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating reservation status" });
  }
};

module.exports = {
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
};