const express = require("express");
const router = express.Router();

const {
  createAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
} = require("../controllers/authorController");

// Create an author
router.post("/", createAuthor);

// Get all authors
router.get("/", getAllAuthors);

// Get one author by ID
router.get("/:id", getAuthorById);

// Update an author
router.put("/:id", updateAuthor);

// Delete an author
router.delete("/:id", deleteAuthor);

module.exports = router;