export default [
  ['/', {
    get: async ({ query: { published }, postsRepository }) => {
      const allPosts = await postsRepository.getAll(published === 'true' ? true : false);

      return {
        body: allPosts,
      };
    },
    post: async ({ body, postsRepository }) => {
      const results = await postsRepository.create(body);

      return {
        status: 201,
        body: results,
      };
    },
  }],
  ['/:id', {
    get: async ({ params: { id }, postsRepository }) => {
      const post = await postsRepository.getById(id);

      if (post) {
        return {
          body: post,
        };
      }

      return {
        status: 404,
        body: 'post not found',
      };
    },
    put: async ({ params: { id }, body, postsRepository }) => {
      const result = await postsRepository.updateById(id, body);

      if (result) {
        return {
          status: 204,
        };
      }

      return {
        status: 404,
        body: 'post not found',
      };
    },
  }],
];
