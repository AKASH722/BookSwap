import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";

const bookSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: String,
      required: true,
      trim: true,
    },
    isbn: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    ownedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isOffered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Post-save middleware to sync ownedBooks array in the User model
bookSchema.post("save", async function (doc, next) {
  try {
    await User.findByIdAndUpdate(doc.ownedBy, {
      $addToSet: { ownedBooks: doc._id },
    });
    next();
  } catch (err) {
    next(err);
  }
});

// Pre-update middleware to sync ownedBooks array when ownedBy is updated
bookSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.ownedBy) {
    try {
      // Remove the book from the previous owner's ownedBooks array
      const book = await this.model.findOne(this.getQuery());
      if (book && book.ownedBy) {
        await User.findByIdAndUpdate(book.ownedBy, {
          $pull: { ownedBooks: book._id },
        });
      }

      // Add the book to the new owner's ownedBooks array
      await User.findByIdAndUpdate(update.ownedBy, {
        $addToSet: { ownedBooks: book._id },
      });
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

// Pre-remove middleware to remove the book from the ownedBooks array in User model
bookSchema.pre("remove", async function (next) {
  try {
    await User.findByIdAndUpdate(this.ownedBy, {
      $pull: { ownedBooks: this._id },
    });
    next();
  } catch (err) {
    next(err);
  }
});

export const Book = mongoose.model("Book", bookSchema);
