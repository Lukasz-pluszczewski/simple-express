export default (error) => {
  console.error('Unknown error', error);
  return {
    status: 500,
    body: { message: 'Unknown error' },
  };
};
