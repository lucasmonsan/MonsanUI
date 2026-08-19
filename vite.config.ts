import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		target: 'chrome109'
	},
	server: {
		port: 5171,
		strictPort: true
	}
});
