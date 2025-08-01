import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		SERVER_URL: z.string().url().optional().default("http://localhost:3000"),
		DATABASE_PATH: z.string().optional().default("./data/database.sqlite"),
		NODE_ENV: z.string().optional().default("production"),
		DATAFILES_PATH: z.string().optional().default("./data"),
		JWT_SECRET: z.string(),
		TAGONE_BASE_URL: z.string(),
		SUPERADMIN_PASSWORD: z.string(),
		RESEND_API_KEY: z.string().optional(),
		RESEND_EMAIL_FROM: z.string().optional(),
		AWS_ACCESS_KEY_ID: z.string().optional(),
		AWS_SECRET_ACCESS_KEY: z.string().optional(),
		AWS_ENDPOINT_URL_S3: z.string().optional(),
		AWS_REGION: z.string().optional(),
		BUCKET_NAME: z.string().optional(),
		PONTOWEB_USER: z.string().optional(),
		PONTOWEB_PASS: z.string().optional(),
		DIRECTDATA_TOKEN: z.string().optional(),
		DIRECTDATA_URL: z.string().optional(),
	},

	/**
	 * The prefix that client-side variables must have. This is enforced both at
	 * a type-level and at runtime.
	 */
	clientPrefix: "VITE_",

	client: {
		VITE_APP_TITLE: z.string().min(1).optional(),
	},

	/**
	 * What object holds the environment variables at runtime. This is usually
	 * `process.env` or `import.meta.env`.
	 */
	runtimeEnv: typeof window === 'undefined' ? process.env : import.meta.env,

	/**
	 * By default, this library will feed the environment variables directly to
	 * the Zod validator.
	 *
	 * This means that if you have an empty string for a value that is supposed
	 * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
	 * it as a type mismatch violation. Additionally, if you have an empty string
	 * for a value that is supposed to be a string with a default value (e.g.
	 * `DOMAIN=` in an ".env" file), the default value will never be applied.
	 *
	 * In order to solve these issues, we recommend that all new projects
	 * explicitly specify this option as true.
	 */
	emptyStringAsUndefined: true,
});
