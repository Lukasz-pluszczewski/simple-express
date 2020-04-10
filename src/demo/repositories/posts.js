export default (fixtures = []) => {
  const postsFakeDatabase = fixtures;
  return {
    getAll: published => postsFakeDatabase.filter(post => (published ? post.published : !post.published)),
    create: newPost => postsFakeDatabase.push(newPost) && newPost,
    getById: id => postsFakeDatabase.find(post => post.id === id),
    updateById: (id, post) => {
      const postIndex = postsFakeDatabase.findIndex(post => post.id === id);
      return ~postIndex ? (postsFakeDatabase[postIndex] = { ...postsFakeDatabase[postIndex], ...post }) : false;
    },
  };
};
