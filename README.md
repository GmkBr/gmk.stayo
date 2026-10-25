# STAYO

Protótipo frontend da comunicação entre totens de autoatendimento e reservas. Não é um sistema de gestão de hotel.

A documentação navegável está em `/docs`. O texto em markdown está em [docs/DOCUMENTACAO.md](docs/DOCUMENTACAO.md).

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. A primeira tela é o login. Requer Node.js 24.

Em desenvolvimento, o modo demonstração fica ativo quando `VITE_DEMO_MODE` não foi configurado. Para API real, use `VITE_DEMO_MODE=false` e configure `VITE_API_BASE_URL`.

Preparação de produção: [guia de ambiente e critérios de piloto](docs/PRODUCAO.md). Próximas entregas e diferenciais: [plano de produto](docs/PLANO_PRODUTO.md).

Organização do código e regras de dependência: [módulos do frontend](docs/MODULOS.md).

```bash
npm run check       # tipos, limites dos módulos, lint e testes
npm run build       # API real; exige configuração de produção
npm run build:demo  # demonstração explícita, com dados no navegador
```
