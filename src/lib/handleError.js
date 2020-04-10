export default (errorClass, handler) => (error, handlerParams) => {
  if (error instanceof errorClass) {
    return handler(error, handlerParams);
  }
  return error;
};
