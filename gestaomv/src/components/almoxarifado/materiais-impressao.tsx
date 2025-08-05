import type { MaterialVisualizacao } from "./materiais-visualizacao";

interface MateriaisImpressaoProps {
	materiais: MaterialVisualizacao[];
	titulo?: string;
	mostrarValorTotal?: boolean;
	styles?: Record<string, string>;
}

export function MateriaisImpressao({
	materiais,
	titulo = "Materiais da Solicitação",
	mostrarValorTotal = true,
	styles: classNames = {},
}: MateriaisImpressaoProps) {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	const calcularValorTotal = () => {
		return materiais.reduce((total, material) => {
			const qtd = material.qtdAtendida ?? material.qtdSolicitada;
			return total + material.valorUnitario * qtd;
		}, 0);
	};

	const calcularQuantidadeTotal = () => {
		return materiais.reduce((total, material) => {
			const qtd = material.qtdAtendida ?? material.qtdSolicitada;
			return total + qtd;
		}, 0);
	};

	if (materiais.length === 0) {
		return (
			<div className={classNames.printSection || "print-section"}>
				<h3 className={classNames.sectionTitle || "section-title"}>{titulo}</h3>
				<p className={classNames.noItems || "no-items"}>
					Nenhum material encontrado
				</p>
			</div>
		);
	}

	return (
		<div className={classNames.printSection || "print-section"}>
			<div className={classNames.sectionHeader || "section-header"}>
				<h3 className={classNames.sectionTitle || "section-title"}>
					{titulo} ({materiais.length}{" "}
					{materiais.length === 1 ? "item" : "itens"})
				</h3>
				{mostrarValorTotal && (
					<div className={classNames.totals || "totals"}>
						<div className={classNames.totalInfo || "total-info"}>
							<span className={classNames.totalLabel || "total-label"}>
								Qtd. Total:
							</span>
							<span className={classNames.totalValue || "total-value"}>
								{calcularQuantidadeTotal()}
							</span>
						</div>
						<div className={classNames.totalInfo || "total-info"}>
							<span className={classNames.totalLabel || "total-label"}>
								Valor Total:
							</span>
							<span
								className={`${classNames.totalValue || "total-value"} font-bold`}
							>
								{formatCurrency(calcularValorTotal())}
							</span>
						</div>
					</div>
				)}
			</div>

			<div className={classNames.materialsList || "materials-list"}>
				{materiais.map((material, index) => {
					const qtdAtual = material.qtdAtendida ?? material.qtdSolicitada;

					return (
						<div
							key={material.materialId}
							className={classNames.materialItem || "material-item"}
						>
							<div className={classNames.itemNumber || "item-number"}>
								{index + 1}
							</div>
							<div className={classNames.itemDetails || "item-details"}>
								<div className={classNames.itemName || "item-name"}>
									{material.nome}
								</div>
								<div className={classNames.itemMeta || "item-meta"}>
									<span className={classNames.itemType || "item-type"}>
										{material.tipoMaterial?.nome || "Sem tipo"}
									</span>
									<span className="item-unit-price">
										{formatCurrency(material.valorUnitario)}/
										{material.unidadeMedida?.nome || "unid"}
									</span>
								</div>
							</div>
							<div className={classNames.itemQuantity || "item-quantity"}>
								<div className={classNames.quantityInfo || "quantity-info"}>
									<span className={classNames.quantity || "quantity"}>
										{qtdAtual}
									</span>
									<span className={classNames.unit || "unit"}>
										{material.unidadeMedida?.nome || "unid"}
									</span>
								</div>
								{material.qtdAtendida !== undefined &&
									material.qtdAtendida !== material.qtdSolicitada && (
										<div className={classNames.requestedQty || "requested-qty"}>
											(Solicitado: {material.qtdSolicitada})
										</div>
									)}
							</div>
							<div className={classNames.itemTotal || "item-total"}>
								{formatCurrency(material.valorUnitario * qtdAtual)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
