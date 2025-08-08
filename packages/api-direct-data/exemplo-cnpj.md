# Exemplo de requisição para consulta de cadastro de pessoa jurídica

```
curl -X 'GET' \
  'https://apiv3.directd.com.br/api/CadastroPessoaJuridica?CNPJ=01901270000136&TOKEN=<TOKEN>' \
  -H 'accept: application/json'
```

Resultado:
```
{
  "metaDados": {
    "consultaNome": "Cadastro - Pessoa Jurídica - Básica",
    "consultaUid": "direct-fe1734b8-4f3b-4788-a816-661c7cffc830",
    "chave": "CNPJ=01901270000136;",
    "usuario": "Junior Vidotti",
    "mensagem": "Sucesso",
    "ip": "189.115.252.114",
    "resultadoId": 1,
    "resultado": "Sucesso",
    "apiVersao": "v3",
    "gerarComprovante": false,
    "urlComprovante": null,
    "assincrono": false,
    "data": "08/08/2025 16:24:17",
    "tempoExecucaoMs": 1095
  },
  "retorno": {
    "cnpj": "01.901.270/0001-36",
    "razaoSocial": "A V PINHEIRO LTDA",
    "nomeFantasia": null,
    "dataFundacao": "10/06/1997 00:00:00",
    "cnaeCodigo": 4782201,
    "cnaeDescricao": "Comércio varejista de calçados",
    "cnaEsSecundarios": [],
    "quantidadeFuncionarios": 68,
    "situacaoCadastral": "ATIVA",
    "naturezaJuridicaCodigo": 2062,
    "naturezaJuridicaDescricao": "Sociedade Empresária Limitada",
    "naturezaJuridicaTipo": null,
    "porte": null,
    "faixaFuncionarios": "De 5 A 100 Funcionários",
    "faixaFaturamento": "De R$ 10,1 MM A R$ 30,0 MM",
    "matriz": true,
    "orgaoPublico": null,
    "ramo": null,
    "tipoEmpresa": "LTDA",
    "telefones": [
      {
        "telefoneComDDD": "(65) 981350313",
        "telemarketingBloqueado": null,
        "operadora": null,
        "tipoTelefone": null,
        "whatsApp": null
      },
      {
        "telefoneComDDD": "(65) 992859585",
        "telemarketingBloqueado": null,
        "operadora": null,
        "tipoTelefone": null,
        "whatsApp": null
      },
      {
        "telefoneComDDD": "(65) 992331099",
        "telemarketingBloqueado": null,
        "operadora": null,
        "tipoTelefone": null,
        "whatsApp": null
      },
      {
        "telefoneComDDD": "(65) 992329288",
        "telemarketingBloqueado": null,
        "operadora": null,
        "tipoTelefone": null,
        "whatsApp": null
      },
      {
        "telefoneComDDD": "(65) 996015439",
        "telemarketingBloqueado": null,
        "operadora": null,
        "tipoTelefone": null,
        "whatsApp": null
      }
    ],
    "enderecos": [
      {
        "logradouro": "SOROCABA",
        "numero": "06",
        "complemento": null,
        "bairro": "MORADA DA SERRA",
        "cidade": "CUIABA",
        "uf": "MT",
        "cep": "78055-210"
      }
    ],
    "emails": [
      {
        "enderecoEmail": "junior@modaverao.com.br"
      },
      {
        "enderecoEmail": "luis@modaverao.com.br"
      },
      {
        "enderecoEmail": "jrvidotti@gmail.com"
      }
    ],
    "ultimaAtualizacaoPJ": null,
    "socios": [
      {
        "documento": "692.428.521-04",
        "nome": "ADRIELE VIDOTTI PINHEIRO",
        "percentualParticipacao": null,
        "dataEntrada": "10/06/1997 00:00:00",
        "cargo": "Sócio Administrador"
      }
    ]
  }
}
```