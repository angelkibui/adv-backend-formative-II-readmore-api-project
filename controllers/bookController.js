const Book = require("../models/Book");
const Author = require("../models/Author");

// Create a new book
const createBook = async (req, res) => {
  try {
    const { author } = req.body;

    // Check that an author ID was provided
    if (!author) {
      return res.status(400).json({
        message: "Author ID is required",
      });
    }

    // Check that the author exists
    const existingAuthor = await Author.findById(author);

    if (!existingAuthor) {
      return res.status(400).json({
        message: "The specified author does not exist",
      });
    }

    // Check for duplicate titles by the same author
    const duplicateBook = await Book.findOne({
      author,
      title: { $regex: `^${req.body.title}$`, $options: "i" },
    });

    if (duplicateBook) {
      return res.status(409).json({
        message: "This author already has a book with that title",
      });
    }

    // Validate book price
    if (req.body.price <= 0) {
      return res.status(422).json({
        message: "Book price must be greater than zero",
      });
    }

    // Validate publication year
    const currentYear = new Date().getFullYear();

    if (
      req.body.publishedYear < 1450 ||
      req.body.publishedYear > currentYear
    ) {
      return res.status(422).json({
        message: `Published year must be between 1450 and ${currentYear}`,
      });
    }

    const book = await Book.create(req.body);

    res.status(201).json({
      message: "Book created successfully",
      book,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid author ID",
      });
    }

    res.status(500).json({
      message: "Failed to create book",
      error: error.message,
    });
  }
};

// Get all books with filtering, sorting and pagination
const getAllBooks = async (req, res) => {
  try {
    const filter = {};

    // Filter by genre
    if (req.query.genre) {
      filter.genre = {
        $regex: `^${req.query.genre}$`,
        $options: "i",
      };
    }

    // Filter by minimum price
    if (req.query.minPrice !== undefined) {
      const minPrice = Number(req.query.minPrice);

      if (!Number.isFinite(minPrice)) {
        return res.status(400).json({
          message: "minPrice must be a valid number",
        });
      }

      filter.price = { ...filter.price, $gte: minPrice };
    }

    // Filter by maximum price
    if (req.query.maxPrice !== undefined) {
      const maxPrice = Number(req.query.maxPrice);

      if (!Number.isFinite(maxPrice)) {
        return res.status(400).json({
          message: "maxPrice must be a valid number",
        });
      }

      filter.price = { ...filter.price, $lte: maxPrice };
    }

    // Filter by author
    if (req.query.author) {
      filter.author = req.query.author;
    }

    // Search titles (case-insensitive)
    if (req.query.search) {
      const escapedSearch = req.query.search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.title = {
        $regex: escapedSearch,
        $options: "i",
      };
    }

    // Sorting
    const sortOptions = {};
    if (req.query.sort) {
      const [field, order] = req.query.sort.split("_");
      const allowedFields = ["price", "title", "publishedYear"];

      if (!allowedFields.includes(field) || !["asc", "desc"].includes(order)) {
        return res.status(400).json({
          message: "Invalid sort. Use price_asc, title_desc, or publishedYear_asc, etc.",
        });
      }

      sortOptions[field] = order === "asc" ? 1 : -1;
    }

    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        message: "Page must be positive and limit must be between 1 and 100",
      });
    }

    const skip = (page - 1) * limit;

    const total = await Book.countDocuments(filter);

    const results = await Book.find(filter)
      .populate("author")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      page,
      limit,
      total,
      count: results.length,
      results,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid author ID",
      });
    }

    res.status(500).json({
      message: "Failed to retrieve books",
      error: error.message,
    });
  }
};

// Get one book by ID
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("author");

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json({
      book,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid book ID",
      });
    }

    res.status(500).json({
      message: "Failed to retrieve book",
      error: error.message,
    });
  }
};

// Update a book by ID
const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    // Determine the values after the update
    const updatedAuthor = req.body.author || book.author;
    const updatedTitle = req.body.title || book.title;
    const updatedPrice =
      req.body.price !== undefined ? req.body.price : book.price;
    const updatedYear =
      req.body.publishedYear !== undefined
        ? req.body.publishedYear
        : book.publishedYear;

    // Check that the new author exists
    const existingAuthor = await Author.findById(updatedAuthor);

    if (!existingAuthor) {
      return res.status(400).json({
        message: "The specified author does not exist",
      });
    }

    // Check for a duplicate title by the same author
    const duplicateBook = await Book.findOne({
      _id: { $ne: book._id },
      author: updatedAuthor,
      title: { $regex: `^${updatedTitle}$`, $options: "i" },
    });

    if (duplicateBook) {
      return res.status(409).json({
        message: "This author already has a book with that title",
      });
    }

    // Validate book price
    if (updatedPrice <= 0) {
      return res.status(422).json({
        message: "Book price must be greater than zero",
      });
    }

    // Validate publication year
    const currentYear = new Date().getFullYear();

    if (updatedYear < 1450 || updatedYear > currentYear) {
      return res.status(422).json({
        message: `Published year must be between 1450 and ${currentYear}`,
      });
    }

    // Save the updated book
    Object.assign(book, req.body);
    await book.save();
    await book.populate("author");

    res.status(200).json({
      message: "Book updated successfully",
      author: book.author,
      book,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid book or author ID",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to update book",
      error: error.message,
    });
  }
};

// Delete a book by ID
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json({
      message: "Book deleted successfully",
      book,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid book ID",
      });
    }

    res.status(500).json({
      message: "Failed to delete book",
      error: error.message,
    });
  }
};

// Get all books belonging to an author
const getBooksByAuthor = async (req, res) => {
  try {
    const books = await Book.find({
      author: req.params.id,
    }).populate("author");

    res.status(200).json({
      count: books.length,
      books,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid author ID",
      });
    }

    res.status(500).json({
      message: "Failed to retrieve author's books",
      error: error.message,
    });
  }
};

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getBooksByAuthor,
};