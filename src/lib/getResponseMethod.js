export const responseMethods = {
  default: 'send',
  json: 'json',
  send: 'send',
  none: null,
};


const getResponseMethod = (format, body) => {
  if (!format) {
    const typeofBody = typeof body;
    if (typeofBody === 'string' || typeofBody === 'number' || typeofBody === 'boolean') {
      return 'send';
    }
    return 'json';
  }

  if (!responseMethods.hasOwnProperty(format)) {
    return responseMethods.default;
  }
  return responseMethods[format];
};

export default getResponseMethod;
