import { trpcRouter } from "@/integrations/trpc/router";
import { authenticateRequest } from "@/lib/auth.server";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

function handler({ request }: { request: Request }) {
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
					console.log(
						`[TRPC] ${user?.email} ${endpoint} ${JSON.stringify(params.json ?? {})}`,
					);
				}
			} catch (error) {
				console.log(
					"erro ao fazer log de request em",
					url.pathname,
					url.searchParams,
					error,
				);
			}
			return {
				user: user || undefined,
			};
		},
	});
}

export const ServerRoute = createServerFileRoute("/api/trpc/$").methods({
	GET: handler,
	POST: handler,
});
