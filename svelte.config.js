import adapter from '@sveltejs/adapter-static';

const repoName = process.env.GITHUB_REPOSITORY?.split('/').pop() ?? '';
const basePath = process.env.BASE_PATH ?? (repoName ? `/${repoName}` : '');

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html'
    }),
    paths: {
      base: basePath
    },
    prerender: {
      entries: ['*']
    }
  }
};
