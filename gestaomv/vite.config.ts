import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
	plugins: [
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		tanstackStart({
			customViteReactPlugin: true,
		}),
		viteReact(),
	],
	css: {
		devSourcemap: true,
	},
	build: {
		rollupOptions: {
			onwarn(warning, warn) {
				// Suprimir warnings sobre imports não utilizados de dependências externas
				if (
					warning.code === 'UNUSED_EXTERNAL_IMPORT' &&
					(warning.exporter?.includes('@tanstack/start-server-core') ||
					 warning.exporter?.includes('@tanstack/router-core') ||
					 warning.exporter?.includes('h3'))
				) {
					return;
				}
				
				// Manter outros warnings
				warn(warning);
			},
		},
	},
});

export default config;
