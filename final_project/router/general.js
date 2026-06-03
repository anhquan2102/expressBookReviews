const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const BASE_URL = "http://localhost:5000";


public_users.post("/register", (req,res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (!isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Internal endpoint for async Axios calls
public_users.get('/books', function (req, res) {
  return res.status(200).json(books);
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/books`);
    const allBooks = response.data;
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch books" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const { isbn } = req.params;
    const response = await axios.get(`${BASE_URL}/books`);
    const allBooks = response.data;
    const book = allBooks[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch book" });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const { author } = req.params;
    const authorQuery = author.toLowerCase();
    const response = await axios.get(`${BASE_URL}/books`);
    const allBooks = response.data;
    const matches = Object.keys(allBooks)
      .filter((isbn) => allBooks[isbn].author.toLowerCase() === authorQuery)
      .map((isbn) => ({ isbn, ...allBooks[isbn] }));

    if (matches.length === 0) {
      return res.status(404).json({ message: "No books found for author" });
    }

    return res.status(200).json(matches);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch books" });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const { title } = req.params;
    const titleQuery = title.toLowerCase();
    const response = await axios.get(`${BASE_URL}/books`);
    const allBooks = response.data;
    const matches = Object.keys(allBooks)
      .filter((isbn) => allBooks[isbn].title.toLowerCase() === titleQuery)
      .map((isbn) => ({ isbn, ...allBooks[isbn] }));

    if (matches.length === 0) {
      return res.status(404).json({ message: "No books found for title" });
    }

    return res.status(200).json(matches);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch books" });
  }
});

//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
  try {
    const { isbn } = req.params;
    const response = await axios.get(`${BASE_URL}/books`);
    const allBooks = response.data;
    const book = allBooks[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(book.reviews);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

module.exports.general = public_users;
