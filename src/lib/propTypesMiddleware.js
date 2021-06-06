import { ValidationError } from "./index";
import checkPropTypes from "./checkPropTypes";

const propTypesMiddleware =
  (rules) =>
  ({ req, res, next }) => {
    const method = req.method;
    const path = req.originalUrl;
    let errors = [];

    if (rules.body) {
      errors = [
        ...errors,
        ...checkPropTypes(
          { body: rules.body },
          { body: req.body },
          "value",
          `${method.toUpperCase()} ${path}`
        ),
      ];
    }

    if (rules.query) {
      errors = [
        ...errors,
        ...checkPropTypes(
          rules.query,
          req.query,
          "query value",
          `${method.toUpperCase()} ${path}`
        ),
      ];
    }

    if (rules.params) {
      errors = [
        ...errors,
        ...checkPropTypes(
          rules.params,
          req.params,
          "param",
          `${method.toUpperCase()} ${path}`
        ),
      ];
    }

    if (rules.cookies) {
      errors = [
        ...errors,
        ...checkPropTypes(
          rules.cookies,
          req.cookies,
          "cookie",
          `${method.toUpperCase()} ${path}`
        ),
      ];
    }

    if (rules.headers) {
      errors = [
        ...errors,
        ...checkPropTypes(
          rules.headers,
          req.headers,
          "header",
          `${method.toUpperCase()} ${path}`
        ),
      ];
    }

    if (errors.length) {
      next(new ValidationError(errors));
    }

    next();
  };

export default propTypesMiddleware;
