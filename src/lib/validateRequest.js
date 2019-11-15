const createValidateRequest = validationAdapter => (rules, method, path) => async (req, res, next) => {
  try {
    await validationAdapter(rules, method, path, req, res);
  } catch (error) {
    console.log('thrown validation error', error);
    return next(error);
  }

  next();
};

export default createValidateRequest;
