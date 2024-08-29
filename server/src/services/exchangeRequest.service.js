import Format from "../utils/Format.js";
import { ExchangeRequest } from "../models/exchangeRequest.model.js";
import { Book } from "../models/book.model.js";
import { User } from "../models/user.model.js";

export async function updateRequest(requestId, status, user) {
  if (!["pending", "accepted", "rejected"].includes(status)) {
    return Format.badRequest("Invalid status value");
  }

  const exchangeRequest = await ExchangeRequest.findById(requestId);

  if (!exchangeRequest) {
    return Format.notFound("Exchange request not found");
  }

  if (exchangeRequest.requestee.toString() !== user._id.toString()) {
    return Format.unAuthorized("You are not authorized to update this request");
  }

  exchangeRequest.status = status;
  await exchangeRequest.save();

  if (status === "accepted") return await fulfillRequest(requestId, user);

  return Format.success("Request status updated successfully", exchangeRequest);
}

export async function fulfillRequest(requestId) {
  const exchangeRequest = await ExchangeRequest.findById(requestId);

  const bookRequested = await Book.findById(exchangeRequest.bookRequested);
  const bookOffered = await Book.findById(exchangeRequest.bookOffered);

  if (!bookRequested || !bookOffered) {
    return Format.notFound("Books involved in the exchange not found");
  }

  const originalOwnerOfRequestedBook = bookRequested.ownedBy;
  bookRequested.ownedBy = exchangeRequest.requester;
  bookRequested.isOffered = false;
  bookOffered.ownedBy = originalOwnerOfRequestedBook;
  bookOffered.isOffered = false;

  await bookRequested.save();
  await bookOffered.save();

  await User.findByIdAndUpdate(exchangeRequest.requester, {
    $addToSet: { ownedBooks: bookRequested._id },
    $pull: { ownedBooks: bookOffered._id },
  });

  await User.findByIdAndUpdate(originalOwnerOfRequestedBook, {
    $addToSet: { ownedBooks: bookOffered._id },
    $pull: { ownedBooks: bookRequested._id },
  });

  return Format.success("Books exchanged successfully and ownership updated", {
    bookRequested,
    bookOffered,
  });
}

export async function addRequest(bookRequestedId, bookOfferedId, requesterId) {
  const bookRequested =
    await Book.findById(bookRequestedId).populate("ownedBy");
  if (!bookRequested) {
    return Format.notFound("Requested book not found");
  }

  const requesteeId = bookRequested.ownedBy._id;

  const bookOffered = await Book.findOne({
    _id: bookOfferedId,
    ownedBy: requesterId,
  });

  if (!bookOffered) {
    return Format.badRequest("You do not own the offered book");
  }
  const existingRequest = await ExchangeRequest.findOne({
    $or: [
      {
        requester: requesterId,
        requestee: requesteeId,
        bookOffered: bookOfferedId,
        bookRequested: bookRequestedId,
        status: "pending",
      },
      {
        requester: requesteeId,
        requestee: requesterId,
        bookOffered: bookRequestedId,
        bookRequested: bookOfferedId,
        status: "pending",
      },
    ],
  });

  if (existingRequest) {
    return Format.conflict("A similar pending request already exists");
  }

  const exchangeRequest = new ExchangeRequest({
    requester: requesterId,
    requestee: requesteeId,
    bookOffered: bookOfferedId,
    bookRequested: bookRequestedId,
  });

  await exchangeRequest.save();

  return Format.success(
    "Exchange request created successfully",
    exchangeRequest
  );
}
