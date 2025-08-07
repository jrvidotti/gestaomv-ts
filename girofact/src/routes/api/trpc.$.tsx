import { authenticateRequest } from "@/lib/auth";
import { trpcRouter } from "@/trpc/router";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

function handler({ request }: { request: Request }) {
	try {
		return fetchRequestHandler({
			req: request,
			router: trpcRouter,
			endpoint: "/api/trpc",
			createContext: ({ req }) => {
				const user = authenticateRequest(req);
				const url = new URL(req.url);
				try {
					const endpoints =
						url.pathname.split("api/trpc/").pop()?.split(",") || [];
					const inputs = JSON.parse(url.searchParams.get("input") ?? "{}");
					for (const [index, endpoint] of endpoints.entries()) {
						const params = inputs[index];
						try {
							console.log(
								`[TRPC] [REQUEST] ${user?.email || "anonymous"} ${endpoint} ${JSON.stringify(params.json ?? {})}`,
							);
						} catch (error) {
							console.log(
								`[TRPC] [REQUEST] ${user?.email || "anonymous"} ${endpoint} ${params}`,
							);
						}
					}
				} catch (error) {
					console.error(
						"[TRPC] [ERROR] erro ao fazer log de request em",
						url.pathname,
						url.searchParams,
						error,
					);
				}
				return {
					user: user || undefined,
				};
			},
			onError: ({ error, path, type, ctx }) => {
				const timestamp = new Date().toISOString();
				const userInfo = ctx?.user ? `${ctx.user.email}` : "anonymous";

				console.error(
					`[TRPC] [HANDLER_ERROR] ${timestamp} user=${userInfo} type=${type} path=${path} error=${error.message} (${error.code}) ${error.cause ? ` cause: ${error.cause}` : ""}`,
				);
			},
		});
	} catch (error) {
		const timestamp = new Date().toISOString();
		console.error(
			`[TRPC] [FATAL_ERROR] ${timestamp} Erro não capturado no handler:`,
			error,
		);
		throw error;
	}
}

export const ServerRoute = createServerFileRoute("/api/trpc/$").methods({
	GET: handler,
	POST: handler,
});
