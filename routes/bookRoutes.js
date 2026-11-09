const express = require("express");
const router = express.Router();

const {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

// Create a book
router.post("/", createBook);

// Get all books
router.get("/", getAllBooks);

// Get one book by ID
router.get("/:id", getBookById);

// Update a book
router.put("/:id", updateBook);

// Delete a book
router.delete("/:id", deleteBook);

module.exports = router;