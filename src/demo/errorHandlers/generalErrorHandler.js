export default (error) => {
  return {
    status: 500,
    body: { message: 'Unknown error' },
  };
};
