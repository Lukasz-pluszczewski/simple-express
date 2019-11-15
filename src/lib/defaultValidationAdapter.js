import checkPropTypes from './checkPropTypes';

const defaultValidationAdapter = (rules, method, path, req, res) => {
  checkPropTypes(
    rules,
    { body: req.body, query: req.query, params: req.params },
    'value',
    `${method.toUpperCase()} ${path}`
  );
};

export default defaultValidationAdapter;
