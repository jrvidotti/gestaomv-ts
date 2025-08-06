import { Badge } from "@/components/ui/badge";
import { USER_ROLES_DATA } from "@/constants";
import { USER_ROLES } from "@/constants";
import type { UserRoleType } from "@/constants";

interface RoleBadgeProps {
	role: UserRoleType;
	className?: string;
}

interface MultipleRoleBadgeProps {
	roles: UserRoleType[];
	maxDisplay?: number;
	className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
	const roleData = USER_ROLES_DATA[role];

	if (!roleData) {
		return (
			<Badge variant="secondary" className={className}>
				{role}
			</Badge>
		);
	}

	const getVariant = (role: UserRoleType) => {
		if (role === USER_ROLES.ADMIN) return "destructive";

		if (role.startsWith("gerencia_")) return "default";

		return "secondary";
	};

	return (
		<Badge
			variant={getVariant(role)}
			className={className}
			title={roleData.description}
		>
			{roleData.label}
		</Badge>
	);
}

export function MultipleRoleBadges({
	roles,
	maxDisplay = 2,
	className,
}: MultipleRoleBadgeProps) {
	if (!roles || roles.length === 0) {
		return null;
	}

	const displayRoles = roles.slice(0, maxDisplay);
	const remainingCount = roles.length - maxDisplay;

	return (
		<div className={`flex flex-wrap gap-1 ${className}`}>
			{displayRoles.map((role, index) => (
				<RoleBadge
					key={`${role}-${
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						index
					}`}
					role={role}
				/>
			))}
			{remainingCount > 0 && (
				<Badge variant="outline" className="text-xs">
					+{remainingCount}
				</Badge>
			)}
		</div>
	);
}
