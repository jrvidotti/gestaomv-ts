import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { addDays, addMonths, lastDayOfMonth } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Calendar } from "lucide-react";
import { useState } from "react";

interface DateRangeFilterProps {
	value?: { dataInicial?: string; dataFinal?: string };
	onValueChange: (dates: { dataInicial?: string; dataFinal?: string }) => void;
	placeholder?: string;
	className?: string;
}

const DATE_RANGE_OPTIONS = [
	{ value: "all", label: "Todas as datas" },
	{ value: "today", label: "Hoje" },
	{ value: "yesterday", label: "Ontem" },
	{ value: "last7days", label: "Últimos 7 dias" },
	{ value: "last30days", label: "Últimos 30 dias" },
	{ value: "thisMonth", label: "Este mês" },
	{ value: "lastMonth", label: "Mês passado" },
	{ value: "custom", label: "Intervalo personalizado" },
];

export function DateRangeFilter({
	value,
	onValueChange,
	placeholder = "Filtrar por data",
	className,
}: DateRangeFilterProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [tempDataInicial, setTempDataInicial] = useState<string>("");
	const [tempDataFinal, setTempDataFinal] = useState<string>("");

	const today = formatInTimeZone(new Date(), "UTC", "yyyy-MM-dd");
	const yesterday = formatInTimeZone(addDays(today, -1), "UTC", "yyyy-MM-dd");
	const last7Days = formatInTimeZone(addDays(today, -7), "UTC", "yyyy-MM-dd");
	const last30Days = formatInTimeZone(addDays(today, -30), "UTC", "yyyy-MM-dd");
	const thisMonthStart = formatInTimeZone(today, "UTC", "yyyy-MM-01");
	const lastMonthStart = formatInTimeZone(
		addMonths(thisMonthStart, -1),
		"UTC",
		"yyyy-MM-01",
	);
	const lastMonthEnd = formatInTimeZone(
		lastDayOfMonth(lastMonthStart),
		"UTC",
		"yyyy-MM-dd",
	);

	const getCurrentSelectedValue = () => {
		if (!value?.dataInicial && !value?.dataFinal) return "all";

		const valueInicial = value.dataInicial
			? formatInTimeZone(value.dataInicial, "UTC", "yyyy-MM-dd")
			: null;
		const valueFinal = value.dataFinal
			? formatInTimeZone(value.dataFinal, "UTC", "yyyy-MM-dd")
			: null;

		// Hoje
		if (
			valueInicial &&
			valueFinal &&
			valueInicial === today &&
			valueFinal === today
		) {
			return "today";
		}

		// Ontem
		if (
			valueInicial &&
			valueFinal &&
			valueInicial === yesterday &&
			valueFinal === yesterday
		) {
			return "yesterday";
		}

		// Últimos 7 dias
		if (
			valueInicial &&
			valueFinal &&
			valueInicial === last7Days &&
			valueFinal === today
		) {
			return "last7days";
		}

		// Últimos 30 dias
		if (
			valueInicial &&
			valueFinal &&
			valueInicial === last30Days &&
			valueFinal === today
		) {
			return "last30days";
		}

		// Este mês
		if (
			valueInicial &&
			valueFinal &&
			valueInicial === thisMonthStart &&
			valueFinal === today
		) {
			return "thisMonth";
		}

		// Mês passado
		if (
			valueInicial &&
			valueFinal &&
			valueInicial === lastMonthStart &&
			valueFinal === lastMonthEnd
		) {
			return "lastMonth";
		}

		// Se tem datas mas não corresponde a nenhum preset, é custom
		if (valueInicial || valueFinal) {
			return "custom";
		}

		return "all";
	};

	const handleSelectChange = (newValue: string) => {
		switch (newValue) {
			case "all":
				onValueChange({ dataInicial: undefined, dataFinal: undefined });
				break;

			case "today": {
				onValueChange({ dataInicial: today, dataFinal: today });
				break;
			}

			case "yesterday": {
				onValueChange({ dataInicial: yesterday, dataFinal: yesterday });
				break;
			}

			case "last7days": {
				onValueChange({ dataInicial: last7Days, dataFinal: today });
				break;
			}

			case "last30days": {
				onValueChange({ dataInicial: last30Days, dataFinal: today });
				break;
			}

			case "thisMonth": {
				onValueChange({ dataInicial: thisMonthStart, dataFinal: today });
				break;
			}

			case "lastMonth": {
				onValueChange({ dataInicial: lastMonthStart, dataFinal: lastMonthEnd });
				break;
			}

			case "custom": {
				// Preencher valores temporários com os valores atuais
				setTempDataInicial(value?.dataInicial ? value.dataInicial : "");
				setTempDataFinal(value?.dataFinal ? value.dataFinal : "");
				setIsModalOpen(true);
				break;
			}
		}
	};

	const handleApplyCustomRange = () => {
		const dataInicial = tempDataInicial;
		const dataFinal = tempDataFinal;

		// Validação: data inicial deve ser menor ou igual à data final
		if (dataInicial && dataFinal && dataInicial > dataFinal) {
			alert("A data inicial deve ser anterior ou igual à data final.");
			return;
		}

		onValueChange({ dataInicial, dataFinal });
		setIsModalOpen(false);
	};

	const handleClearCustomRange = () => {
		setTempDataInicial("");
		setTempDataFinal("");
		onValueChange({ dataInicial: undefined, dataFinal: undefined });
		setIsModalOpen(false);
	};

	return (
		<>
			<Select
				value={getCurrentSelectedValue()}
				onValueChange={handleSelectChange}
			>
				<SelectTrigger className={cn("h-8 w-full", className)}>
					<div className="flex items-center gap-2">
						<Calendar className="h-4 w-4" />
						<SelectValue placeholder={placeholder} />
					</div>
				</SelectTrigger>
				<SelectContent>
					{DATE_RANGE_OPTIONS.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Intervalo Personalizado</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="dataInicial">Data Inicial</Label>
							<Input
								id="dataInicial"
								type="date"
								value={tempDataInicial}
								onChange={(e) => setTempDataInicial(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="dataFinal">Data Final</Label>
							<Input
								id="dataFinal"
								type="date"
								value={tempDataFinal}
								onChange={(e) => setTempDataFinal(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter className="flex gap-2">
						<Button variant="outline" onClick={handleClearCustomRange}>
							Limpar
						</Button>
						<Button variant="outline" onClick={() => setIsModalOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleApplyCustomRange}>Aplicar</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
