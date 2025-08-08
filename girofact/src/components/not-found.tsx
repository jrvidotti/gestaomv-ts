import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Home } from "lucide-react";

export function NotFound() {
	const router = useRouter();

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
			<Card className="w-full max-w-md text-center">
				<CardHeader>
					<CardTitle className="text-6xl font-bold text-primary mb-4">
						404
					</CardTitle>
					<p className="text-xl font-semibold text-gray-900 dark:text-white">
						Página não encontrada
					</p>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-gray-600 dark:text-gray-400">
						A página que você está procurando não existe ou foi movida.
					</p>
					<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
						<Button
							variant="outline"
							onClick={() => router.history.back()}
							className="flex items-center gap-2"
						>
							<ArrowLeft className="h-4 w-4" />
							Voltar
						</Button>
						<Button asChild className="flex items-center gap-2">
							<Link to="/">
								<Home className="h-4 w-4" />
								Página Inicial
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
