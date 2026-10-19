// Static build for GitHub Pages.
// BASE_PATH is set by the GitHub Actions workflow to "/1975_roadstory";
// locally it is empty, so `npm run dev` still serves at http://localhost:5173/.
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Write plain HTML/JS/CSS into build/ (no server needed)
			adapter: adapter({ fallback: '404.html' }),
			paths: { base: process.env.BASE_PATH ?? '' }
		})
	]
});
