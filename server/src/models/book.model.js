import mongoose, { Schema } from "mongoose";

const ownerSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isOffered: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

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
    owners: [ownerSchema],
  },
  {
    timestamps: true,
  }
);

export const Book = mongoose.model("Book", bookSchema);
