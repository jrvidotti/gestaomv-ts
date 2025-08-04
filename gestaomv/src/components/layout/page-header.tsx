import type { ReactNode } from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	children?: ReactNode;
	actions?: ReactNode[];
	icon?: ReactNode;
	onClickBack?: () => void;
	backButtonText?: string;
}

export function PageHeader({
	title,
	subtitle,
	children,
	actions,
	icon,
	onClickBack,
	backButtonText,
}: PageHeaderProps) {
	const {
		state,
		open,
		setOpen,
		openMobile,
		setOpenMobile,
		isMobile,
		toggleSidebar,
	} = useSidebar();

	return (
		<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background z-10">
			<SidebarTrigger
				className={cn(
					"bg-primary text-primary-foreground p-5 -ml-1 mr-2",
					state === "expanded" ? "lg:hidden" : "",
				)}
			/>
			{onClickBack && (
				<Button
					variant="ghost"
					size="sm"
					onClick={onClickBack}
					className="flex items-center space-x-2"
				>
					<ArrowLeft className="h-4 w-4" />
					{backButtonText}
				</Button>
			)}

			<div className="flex-1 flex items-center justify-between">
				<div className="flex flex-col">
					<h1 className="text-lg font-semibold flex items-center gap-2">
						{icon}
						{title}
					</h1>
					{subtitle && (
						<p className="text-sm text-muted-foreground hidden md:block">
							{subtitle}
						</p>
					)}
				</div>

				{actions && <div className="flex items-center gap-2">{...actions}</div>}
			</div>

			{children}
			{/* <ThemeToggle /> */}
		</header>
	);
}
