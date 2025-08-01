import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import * as TanstackQuery from "./integrations/tanstack-query/root-provider";
import { getUserFromStorage } from "./lib/auth";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const createRouter = () => {
	const rqContext = TanstackQuery.getContext();
	const user = getUserFromStorage();

	return routerWithQueryClient(
		createTanstackRouter({
			routeTree,
			context: {
				...rqContext,
				user,
			},
			defaultPreload: "intent",
			Wrap: (props: { children: React.ReactNode }) => {
				return (
					<TanstackQuery.Provider {...rqContext}>
						{props.children}
					</TanstackQuery.Provider>
				);
			},
		}),
		rqContext.queryClient,
	);
};

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof createRouter>;
	}
}
