import {
	HeadContent,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { NotFound } from "@/components/not-found";
import { AuthProvider } from "../hooks/use-auth";

import TanStackQueryLayout from "../integrations/tanstack-query/layout.tsx";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";

import type { TRPCRouter } from "@/integrations/trpc/router";
import type { AuthUser } from "@/lib/auth";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { Toaster } from "sonner";

interface MyRouterContext {
	queryClient: QueryClient;

	trpc: TRPCOptionsProxy<TRPCRouter>;

	user: AuthUser | null;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Gestão MV",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	notFoundComponent: NotFound,
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="pt-BR">
			<head>
				<HeadContent />
			</head>
			<body>
				<AuthProvider>
					{/* <Header /> */}
					{children}
					<Toaster
						position="top-right"
						expand={false}
						richColors
						closeButton
						duration={2000}
					/>
					<TanStackRouterDevtools />
					<TanStackQueryLayout />
				</AuthProvider>
				<Scripts />
			</body>
		</html>
	);
}
