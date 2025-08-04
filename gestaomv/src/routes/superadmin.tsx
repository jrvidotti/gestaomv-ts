import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/superadmin")({
	component: SuperadminPage,
});

function SuperadminPage() {
	const trpc = useTRPC();

	const {
		data: systemInfoData,
		isLoading: systemLoading,
		// refetch: refetchSystemInfo,
	} = useQuery(trpc.superadmin.getSystemInfo.queryOptions());

	// Queries
	const {
		data: statsData,
		isLoading: statsLoading,
		// error: statsError,
		// refetch: refetchStats,
	} = useQuery(trpc.superadmin.getStats.queryOptions());

	const {
		data: migrationInfoData,
		isLoading: migrationLoading,
		// refetch: refetchMigrationInfo,
	} = useQuery(trpc.superadmin.getMigrationInfo.queryOptions());

	console.log("stats", statsLoading, statsData);
	console.log("system", systemLoading, systemInfoData);
	console.log("migration", migrationLoading, migrationInfoData);

	return (
		<div>
			<h1>Superadmin</h1>
			<h2>Stats</h2>
			<pre>{JSON.stringify(statsData, null, 2)}</pre>
			<h2>System Info</h2>
			<pre>{JSON.stringify(systemInfoData, null, 2)}</pre>
			<h2>Migration Info</h2>
			<pre>{JSON.stringify(migrationInfoData, null, 2)}</pre>
		</div>
	);
}
