import { NotFound } from "@/components/not-found";
import type { AuthUser } from "@/lib/auth";
import type { TRPCRouter } from "@/trpc/router";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	HeadContent,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "../hooks/use-auth";
import appCss from "../styles.css?url";

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
					<ReactQueryDevtools buttonPosition="bottom-right" />
				</AuthProvider>
				<Scripts />
			</body>
		</html>
	);
}
