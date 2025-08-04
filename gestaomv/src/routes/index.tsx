import { useAuth } from "@/hooks/use-auth";
import { Navigate, createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (isAuthenticated) {
		return <Navigate to="/admin" />;
	}

	return <Navigate to="/login" />;
}
