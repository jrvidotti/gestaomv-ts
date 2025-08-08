import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { IMaskInput } from "react-imask";

interface MaskedInputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
	mask: string;
	unmask?: boolean;
	onAccept?: (value: string) => void;
	onChange?: (value: string) => void;
}

const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
	({ className, mask, unmask = false, onAccept, onChange, ...props }, ref) => {
		return (
			<IMaskInput
				{...props}
				mask={mask}
				unmask={unmask}
				ref={ref}
				onAccept={(value: string) => {
					if (onAccept) onAccept(value);
					if (onChange) onChange(value);
				}}
				className={cn(
					"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
					className,
				)}
			/>
		);
	},
);

MaskedInput.displayName = "MaskedInput";

export { MaskedInput };
