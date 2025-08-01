import { trpcRouter } from "@/integrations/trpc/router";
import { getUserFromToken } from "@/lib/auth.server";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

function handler({ request }: { request: Request }) {
	return fetchRequestHandler({
		req: request,
		router: trpcRouter,
		endpoint: "/api/trpc",
		createContext: ({ req }) => {
			const authHeader = req.headers.get("authorization");
			const [authType, token] = authHeader?.split(" ") || ["", ""];
			const hasToken = authType === "Bearer" && token;
			const user = hasToken ? getUserFromToken(token) : null;
			console.log(
				`[TRPC] Auth: has header: ${!!authHeader}, has token: ${hasToken}, user: ${user?.email}`,
			);

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
