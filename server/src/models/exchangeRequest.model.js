import mongoose, { Schema } from "mongoose";

const exchangeRequestSchema = new Schema(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookOffered: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    bookRequested: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const ExchangeRequest = mongoose.model(
  "ExchangeRequest",
  exchangeRequestSchema
);
