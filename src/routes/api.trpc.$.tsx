import { createServerFileRoute } from "@tanstack/react-start/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { trpcRouter } from "@/integrations/trpc/router";
import { getUserFromToken } from "@/lib/auth";

function handler({ request }: { request: Request }) {
	return fetchRequestHandler({
		req: request,
		router: trpcRouter,
		endpoint: "/api/trpc",
		createContext: ({ req }) => {
			const authHeader = req.headers.get("authorization");
			const token = authHeader?.replace("Bearer ", "");
			const user = token ? getUserFromToken(token) : null;
			
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
