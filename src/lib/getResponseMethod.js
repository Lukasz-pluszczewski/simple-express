export const responseMethods = {
  default: 'send',
  json: 'json',
  send: 'send',
  none: null,
};

const getResponseMethod = (method, body) => {
  if (!method || !responseMethods.hasOwnProperty(method)) {
    return responseMethods.default;
  }
  return responseMethods[method];
};

export default getResponseMethod;
