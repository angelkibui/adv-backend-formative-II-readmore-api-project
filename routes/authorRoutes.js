const express = require("express");
const router = express.Router();

const {
  createAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
  getAuthorStats,
} = require("../controllers/authorController");

const {
  getBooksByAuthor,
} = require("../controllers/bookController");

// Create an author
router.post("/", createAuthor);

// Get all authors
router.get("/", getAllAuthors);

// Get statistics for an author's books (must be above /:id)
router.get("/:id/stats", getAuthorStats);

// Get all books belonging to an author
router.get("/:id/books", getBooksByAuthor);

// Get one author by ID
router.get("/:id", getAuthorById);

// Update an author
router.put("/:id", updateAuthor);

// Delete an author
router.delete("/:id", deleteAuthor);

module.exports = router;