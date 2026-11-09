const Author = require("../models/Author");

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

// Delete an author by ID
const deleteAuthor = async (req, res) => {
  try {
    const author = await Author.findByIdAndDelete(req.params.id);

    if (!author) {
      return res.status(404).json({
        message: "Author not found",
      });
    }

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
};