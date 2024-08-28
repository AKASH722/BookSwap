import Format from "../utils/Format.js";
import { Book } from "../models/book.model.js";

export async function getAllOfferedBooks(user) {
  const offeredBooks = await Book.find({
    ownedBy: { $ne: user._id },
    isOffered: true,
  }).populate({
    path: "ownedBy",
    populate: [{ path: "desiredBooks" }],
  });

  if (!offeredBooks) return Format.notFound("No Book are currently offered");

  return Format.success("Offered Books fetched", offeredBooks);
}

export async function deleteBook(id, user) {
  const deletedBook = await Book.findOneAndDelete({
    _id: id,
    ownedBy: user._id,
  });

  if (!deletedBook)
    return Format.notFound("Book not found or not owned by user");

  return Format.success("Book deleted successfully", deletedBook);
}

export async function updateBook(
  title,
  author,
  genre,
  isbn,
  description,
  imageUrl,
  isOffered,
  id,
  user
) {
  if (!title || !author || !genre || !isbn)
    return Format.badRequest("Title, author, genre, and ISBN are required.");

  const updatedBook = await Book.findOneAndUpdate(
    { _id: id, ownedBy: user._id },
    {
      title,
      author,
      genre,
      isbn,
      description,
      imageUrl,
      isOffered,
    },
    { new: true, runValidators: true }
  );

  if (!updatedBook)
    return Format.notFound("Book not found or not owned by user");

  return Format.success("Book updated successfully", updatedBook);
}

export async function getBookByOwner(user) {
  const books = await Book.find({
    ownedBy: user._id,
  });

  if (!books || books.length === 0) return Format.notFound("Books not found");

  return Format.success("Book retrieved successfully", books);
}

export async function addBook(
  title,
  author,
  genre,
  isbn,
  description,
  imageUrl,
  user
) {
  if (!title || !author || !genre || !isbn)
    return Format.badRequest("Title, author, genre, and ISBN are required.");

  const newBook = new Book({
    title,
    author,
    genre,
    isbn,
    description,
    imageUrl,
    ownedBy: user._id, // Assuming req.user contains the logged-in user's data
  });

  const savedBook = await newBook.save();

  return Format.success("Book created successfully", savedBook);
}
