import { log } from "../log";

import { Response } from 'express';
import { RequestObject, ResponseDefinition } from "../types";

export const responseMethods = {
  default: "send",
  json: "json",
  send: "send",
  none: null,
};

const getResponseMethod = (method, body) => {
  if (!method || !responseMethods.hasOwnProperty(method)) {
    return responseMethods.default;
  }
  return responseMethods[method];
};

const sendResponse = (req: RequestObject, res: Response, result?: ResponseDefinition): void => {
  if (!result) {
    return;
  }

  if (res.headersSent) {
    return log("ERROR: Headers have already been sent");
  }

  const {
    body = null,
    status,
    method,
    redirect = false,
    headers = null,
    type = null,
  } = result;

  const responseMethod = getResponseMethod(method, body);
  if (responseMethod) {
    if (type) {
      res.type(type);
    }

    if (headers) {
      res.set(headers);
    }

    if (redirect) {
      if (status) {
        res.redirect(status, redirect);
      } else {
        res.redirect(redirect);
      }
      log.request(
        `Request ended with redirect after ${
          Date.now() - req.requestTiming
        }ms; ${req.protocol}, ${req.originalUrl}${
          status && `, status: ${status}`
        }`
      );
    } else {
      log.request(
        `Request ended with response after ${
          Date.now() - req.requestTiming
        }ms; ${req.protocol}, ${req.originalUrl}, status: ${status || 200}`
      );
      res.status(status || 200)[responseMethod](body);
    }
  }
};

export default sendResponse;
