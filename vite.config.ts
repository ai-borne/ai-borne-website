import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        payslipmax: resolve(__dirname, 'apps/payslipmax.html'),
        blog: resolve(__dirname, 'blog/index.html'),
        blogpost: resolve(__dirname, 'blog/post.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        support: resolve(__dirname, 'support.html'),
        privacy: resolve(__dirname, 'privacy-policy.html'),
        terms: resolve(__dirname, 'terms.html'),
        datadeletion: resolve(__dirname, 'data-deletion.html'),
      },
    },
  },
});
