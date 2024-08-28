import * as bookService from "../services/book.service.js";

export let getAllDesiredBooks = async (req, res, next) => {
  try {
    const user = req.user;
    const result = await bookService.getAllDesiredBooks(user);
    return res.status(result.code).json(result);
  } catch (err) {
    next(err);
  }
};

export const getAllOfferedBooks = async (req, res, next) => {
  try {
    const user = req.user;
    const result = await bookService.getAllOfferedBooks(user);
    return res.status(result.code).json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const result = await bookService.deleteBook(id, user);
    return res.status(result.code).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateBook = async (req, res, next) => {
  try {
    const { title, author, genre, isbn, description, imageUrl, isOffered } =
      req.body;
    const { id } = req.params;
    const user = req.user;
    const result = await bookService.updateBook(
      title,
      author,
      genre,
      isbn,
      description,
      imageUrl,
      isOffered,
      id,
      user
    );
    return res.status(result.code).json(result);
  } catch (err) {
    next(err);
  }
};

export const getBooks = async (req, res, next) => {
  try {
    const user = req.user;
    const result = await bookService.getBookByOwner(user);
    return res.status(result.code).json(result);
  } catch (err) {
    next(err);
  }
};

export const addBook = async (req, res, next) => {
  try {
    const { title, author, genre, isbn, description, imageUrl } = req.body;
    const user = req.user;
    const result = await bookService.addBook(
      title,
      author,
      genre,
      isbn,
      description,
      imageUrl,
      user
    );
    return res.status(result.code).json(result);
  } catch (err) {
    next(err);
  }
};
