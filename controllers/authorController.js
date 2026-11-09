const Author = require("../models/Author");
const Book = require("../models/Book");

// Create a new author
const createAuthor = async (req, res) => {
  try {
    const author = await Author.create(req.body);

    res.status(201).json({
      message: "Author created successfully",
      author,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to create author",
      error: error.message,
    });
  }
};

// Get all authors
const getAllAuthors = async (req, res) => {
  try {
    const authors = await Author.find();

    res.status(200).json({
      count: authors.length,
      authors,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve authors",
      error: error.message,
    });
  }
};

// Get one author by ID
const getAuthorById = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({
        message: "Author not found",
      });
    }

    res.status(200).json({
      author,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid author ID",
      });
    }

    res.status(500).json({
      message: "Failed to retrieve author",
      error: error.message,
    });
  }
};

// Update an author by ID
const updateAuthor = async (req, res) => {
  try {
    const author = await Author.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!author) {
      return res.status(404).json({
        message: "Author not found",
      });
    }

    res.status(200).json({
      message: "Author updated successfully",
      author,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid author ID",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to update author",
      error: error.message,
    });
  }
};

// Get statistics for an author's books
const getAuthorStats = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({
        message: "Author not found",
      });
    }

    const books = await Book.find({ author: author._id }).sort({
      price: 1,
    });

    const bookCount = books.length;

    const averagePrice =
      bookCount === 0
        ? 0
        : books.reduce((total, book) => total + book.price, 0) / bookCount;

    res.status(200).json({
      author,
      bookCount,
      averagePrice: Number(averagePrice.toFixed(2)),
      cheapestBook: bookCount > 0 ? books[0] : null,
      mostExpensiveBook: bookCount > 0 ? books[bookCount - 1] : null,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid author ID",
      });
    }

    res.status(500).json({
      message: "Failed to retrieve author statistics",
      error: error.message,
    });
  }
};

// Delete an author by ID
const deleteAuthor = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);

    if (!author) {
      return res.status(404).json({
        message: "Author not found",
      });
    }

    // Check whether the author has any books
    const existingBook = await Book.findOne({
      author: author._id,
    });

    if (existingBook) {
      return res.status(409).json({
        message: "Cannot delete an author who has books. Delete or reassign their books first.",
      });
    }

    // Delete the author only if they have no books
    await Author.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Author deleted successfully",
      author,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid author ID",
      });
    }

    res.status(500).json({
      message: "Failed to delete author",
      error: error.message,
    });
  }
};

module.exports = {
  createAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
  getAuthorStats,
};