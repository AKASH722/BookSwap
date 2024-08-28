import { Book } from "../models/book.model.js";
import Format from "../utils/Format.js";
import { User } from "../models/user.model.js";

export async function toggleDesiredBook(user, id) {
  const book = await Book.findById(id).exec();

  if (!book) {
    return Format.notFound("Book not found");
  }

  const update = user.desiredBooks.includes(book._id)
    ? { $pull: { desiredBooks: book._id } }
    : { $push: { desiredBooks: book._id } };

  // Update the user document
  const updatedUser = await User.findByIdAndUpdate(user._id, update, {
    new: true,
  });

  // Check if update was successful
  if (!updatedUser) {
    return Format.error("Failed to update user's desired books");
  }

  // Return success response
  const action = update.$pull
    ? "Book removed from desired list"
    : "Book added to desired list";
  return Format.success(action, updatedUser.desiredBooks);
}
