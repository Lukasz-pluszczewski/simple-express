import log from './log';
import getResponseMethod from './getResponseMethod';

const sendResponse = (req, res, result) => {
  if (!result) {
    return;
  }

  if (res.headersSent) {
    return log('ERROR: Headers have already been sent');
  }

  const {
    body = null,
    status,
    format,
    redirect = false,
    headers = null,
  } = result;

  const responseMethod = getResponseMethod(format, body);
  if (responseMethod) {
    if (headers) {
      res.set(headers);
    }

    if (redirect) {
      if (status) {
        res.redirect(status, redirect);
      } else {
        res.redirect(redirect);
      }
      log.request(`Request ended with redirect after ${Date.now() - req.requestTiming}ms; ${req.protocol}, ${req.originalUrl}${status && `, status: ${status}`}`);
    } else {
      log.request(`Request ended with response after ${Date.now() - req.requestTiming}ms; ${req.protocol}, ${req.originalUrl}, status: ${status || 200}`);
      res.status(status || 200)[responseMethod](body);
    }
  }
};

export default sendResponse;
