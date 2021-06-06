const ReactPropTypesSecret = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
const has = Function.call.bind(Object.prototype.hasOwnProperty);

const getWarning = (text) => {
  return text;
  // var message = 'Warning: ' + text;
  // if (typeof console !== 'undefined') {
  //   console.error(message);
  // }
  // try {
  //   // --- Welcome to debugging React ---
  //   // This error was thrown as a convenience so that you can use this stack
  //   // to find the callsite that caused this warning to fire.
  //   throw new Error(message);
  // } catch (x) { /**/ }
};

function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
  const errorMessages = [];

  if (process.env.NODE_ENV !== "production") {
    for (var typeSpecName in typeSpecs) {
      if (has(typeSpecs, typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          if (typeof typeSpecs[typeSpecName] !== "function") {
            var err = Error(
              (componentName || "React class") +
                ": " +
                location +
                " type `" +
                typeSpecName +
                "` is invalid; " +
                "it must be a function, usually from the `prop-types` package, but received `" +
                typeof typeSpecs[typeSpecName] +
                "`." +
                "This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
            );
            err.name = "Invariant Violation";
            throw err;
          }
          error = typeSpecs[typeSpecName](
            values,
            typeSpecName,
            componentName,
            location,
            null,
            ReactPropTypesSecret
          );
        } catch (ex) {
          error = ex;
        }
        if (error && !(error instanceof Error)) {
          errorMessages.push(
            getWarning(
              (componentName || "React class") +
                ": type specification of " +
                location +
                " `" +
                typeSpecName +
                "` is invalid; the type checker " +
                "function must return `null` or an `Error` but returned a " +
                typeof error +
                ". " +
                "You may have forgotten to pass an argument to the type checker " +
                "creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and " +
                "shape all require an argument)."
            )
          );
        }
        if (error instanceof Error) {
          var stack = getStack ? getStack() : "";

          errorMessages.push(
            getWarning(
              "Failed " +
                location +
                " type: " +
                error.message +
                (stack != null ? stack : "")
            )
          );
        }
      }
    }
  }

  return errorMessages;
}

export default checkPropTypes;
