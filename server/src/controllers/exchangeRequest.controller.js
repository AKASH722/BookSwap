import * as exchangeRequestService from "../services/exchangeRequest.service.js";
import Format from "../utils/Format.js";
import { ExchangeRequest } from "../models/exchangeRequest.model.js";

export const getHistory = async (req, res, next) => {
  try {
    const exchanges = await ExchangeRequest.find({
      $or: [
        { requester: req.user._id, status: { $in: ["accepted", "rejected"] } },
        { requestee: req.user._id, status: { $in: ["accepted", "rejected"] } },
      ],
    })
      .populate("requester")
      .populate("requestee")
      .populate("bookOffered")
      .populate("bookRequested");

    return res
      .status(200)
      .json(Format.success("Exchange history fetched successfully", exchanges));
  } catch (error) {
    next(error);
  }
};
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { requestId, status } = req.body;
    const result = await exchangeRequestService.updateRequest(
      requestId,
      status,
      req.user
    );
    return res.status(result.code).json(result);
  } catch (error) {
    next(error);
  }
};

export const getReceivedRequests = async (req, res, next) => {
  try {
    const receivedRequests = await ExchangeRequest.find({
      requestee: req.user._id,
      status: "pending",
    })
      .populate("bookRequested")
      .populate("bookOffered")
      .populate("requester");

    return res
      .status(200)
      .json(
        Format.success(
          "Received requests fetched successfully",
          receivedRequests
        )
      );
  } catch (error) {
    next(error);
  }
};
export const getSentRequests = async (req, res, next) => {
  try {
    const sentRequests = await ExchangeRequest.find({
      requester: req.user._id,
      status: "pending",
    })
      .populate("bookRequested")
      .populate("bookOffered")
      .populate("requestee");
    return res
      .status(200)
      .json(Format.success("Sent requests fetched successfully", sentRequests));
  } catch (error) {
    next(error);
  }
};

export const fulfillRequest = async (req, res, next) => {
  try {
    const { requestId } = req.body;

    const result = await exchangeRequestService.fulfillRequest(
      requestId,
      req.user
    );
    return res.status(result.code).json(result);
  } catch (error) {
    next(error);
  }
};

export const createRequest = async (req, res, next) => {
  try {
    const { bookRequestedId, bookOfferedId } = req.body;
    const requesterId = req.user._id;
    const result = await exchangeRequestService.addRequest(
      bookRequestedId,
      bookOfferedId,
      requesterId
    );
    return res.status(result.code).json(result);
  } catch (error) {
    next(error);
  }
};
