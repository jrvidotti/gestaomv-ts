import { expect, test } from "vitest";
import "dotenv/config";
import { OdataQuery } from "../types";
import { mountOdataQuery } from "../helpers";

const nro_telefone = "65991234567";
const cpf = "11122233344";
const expectedResult = `?$expand=PessoaTelefones($select=CodigoPessoaTelefone,Telefone,Situacao;$filter=CodigoTipoContato eq 1 and Telefone eq '${nro_telefone}';$orderby=Situacao desc)&$select=DataNascimento,CpfCnpj,NomePessoa,CodigoPessoa&$filter=CpfCnpj eq '${cpf}'`;

test("mountOdataQuery ok 1", async () => {
	const query: OdataQuery = {
		$expand: {
			PessoaTelefones: {
				$select: ["CodigoPessoaTelefone", "Telefone", "Situacao"],
				$filter: `CodigoTipoContato eq 1 and Telefone eq '${nro_telefone}'`,
				$orderby: "Situacao desc",
			},
		},
		$select: ["DataNascimento", "CpfCnpj", "NomePessoa", "CodigoPessoa"],
		$filter: `CpfCnpj eq '${cpf}'`,
	};

	expect(mountOdataQuery(query)).toBe(expectedResult);
});

test("mountOdataQuery ok 2", async () => {
	const query: OdataQuery = {
		$expand: `PessoaTelefones($select=CodigoPessoaTelefone,Telefone,Situacao;$filter=CodigoTipoContato eq 1 and Telefone eq '${nro_telefone}';$orderby=Situacao desc)`,
		$select: "DataNascimento,CpfCnpj,NomePessoa,CodigoPessoa",
		$filter: `CpfCnpj eq '${cpf}'`,
	};

	expect(mountOdataQuery(query)).toBe(expectedResult);
});

test("mountOdataQuery complex", () => {
	const expectedResult = `?$expand=Pessoa($select=NomePessoa,CpfCnpj),Comprador($select=NomePessoa),PedidoProduto($orderby=Produto/Marca/NomeMarca,Produto/Classificacao/NomeClassificacao,Produto/Grupo/NomeGrupo,Produto/ReferenciaFabricante;$select=CodigoPedidoProduto,ValorProduto,ValorVenda;$expand=Produto($select=CodigoProduto,ReferenciaFabricante,Complemento,Anotacao;$expand=Departamento($select=CodigoDepartamento,NomeDepartamento),Classificacao($select=CodigoClassificacao,NomeClassificacao),Grupo($select=CodigoGrupo,NomeGrupo),Modelo($select=CodigoModelo,NomeModelo),Material($select=CodigoMaterial,NomeMaterial),Marca($select=CodigoMarca,NomeMarca),Referencias($select=ReferenciaProduto),ProdutoEstoque($select=CodigoProdutoEstoque,CodigoProdutoCor,CodigoProdutoTamanho,ProdutoTamanho,ProdutoCor;$filter=Situacao eq true;$expand=ProdutoTamanho($select=NomeProdutoTamanho,Ordem),ProdutoCor($select=NomeProdutoCor)),Anexo($filter=Padrao eq true)),PedidoProdutoEstoque($select=CodigoProdutoEstoque,PedidoProdutoEstoqueEmpresa;$expand=PedidoProdutoEstoqueEmpresa($select=CodigoEmpresa,Quantidade)))&$select=CodigoPedido,NumeroPedido,CodigoEmpresas,DataPedido,DataPrevisao,Observacao,ObservacaoFinanceira,DescontoProduto,DescontoFinanceiro,Parcelamento&$filter=(CodigoPedido eq 22037) and (Situacao eq true)`;

	const query: OdataQuery = {
		$expand: {
			Pessoa: {
				$select: ["NomePessoa", "CpfCnpj"],
			},
			Comprador: {
				$select: ["NomePessoa"],
			},
			PedidoProduto: {
				$orderby: [
					"Produto/Marca/NomeMarca",
					"Produto/Classificacao/NomeClassificacao",
					"Produto/Grupo/NomeGrupo",
					"Produto/ReferenciaFabricante",
				],
				$select: ["CodigoPedidoProduto", "ValorProduto", "ValorVenda"],
				$expand: {
					Produto: {
						$select: [
							"CodigoProduto",
							"ReferenciaFabricante",
							"Complemento",
							"Anotacao",
						],
						$expand: {
							Departamento: {
								$select: ["CodigoDepartamento", "NomeDepartamento"],
							},
							Classificacao: {
								$select: ["CodigoClassificacao", "NomeClassificacao"],
							},
							Grupo: {
								$select: ["CodigoGrupo", "NomeGrupo"],
							},
							Modelo: {
								$select: ["CodigoModelo", "NomeModelo"],
							},
							Material: {
								$select: ["CodigoMaterial", "NomeMaterial"],
							},
							Marca: {
								$select: ["CodigoMarca", "NomeMarca"],
							},
							Referencias: {
								$select: ["ReferenciaProduto"],
							},
							ProdutoEstoque: {
								$select: [
									"CodigoProdutoEstoque",
									"CodigoProdutoCor",
									"CodigoProdutoTamanho",
									"ProdutoTamanho",
									"ProdutoCor",
								],
								$filter: "Situacao eq true",
								$expand: {
									ProdutoTamanho: {
										$select: ["NomeProdutoTamanho", "Ordem"],
									},
									ProdutoCor: {
										$select: ["NomeProdutoCor"],
									},
								},
							},
							Anexo: {
								$filter: "Padrao eq true",
							},
						},
					},
					PedidoProdutoEstoque: {
						$select: ["CodigoProdutoEstoque", "PedidoProdutoEstoqueEmpresa"],
						$expand: {
							PedidoProdutoEstoqueEmpresa: {
								$select: ["CodigoEmpresa", "Quantidade"],
							},
						},
					},
				},
			},
		},
		$select: [
			"CodigoPedido",
			"NumeroPedido",
			"CodigoEmpresas",
			"DataPedido",
			"DataPrevisao",
			"Observacao",
			"ObservacaoFinanceira",
			"DescontoProduto",
			"DescontoFinanceiro",
			"Parcelamento",
		],
		$filter: ["CodigoPedido eq 22037", "Situacao eq true"],
	};

	const result = mountOdataQuery(query);
	expect(result).toBe(expectedResult);
});
