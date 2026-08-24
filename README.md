# Calculadora Nobre

Uma coleção de calculadoras financeiras para ajudar no planejamento e tomada de decisões financeiras.

**Recursos gerais:**
- **PWA instalável** — adicione à tela inicial e use offline
- **Layout responsivo** — otimizado para mobile e desktop
- **Versionado** — versão exibida na tela inicial, atualizada manualmente (major.minor.patch)

## Calculadoras Disponíveis

### 📈 Juros Compostos
Simule o crescimento do seu dinheiro com aportes mensais e ajuste por inflação.

**Funcionalidades:**
- Cálculo de juros compostos com aportes mensais
- Taxa de juros mensal ou anual
- Período em meses ou anos
- Ajuste opcional por inflação
- Gráfico de evolução patrimonial
- Tabela detalhada mês a mês

### 🏦 Rentabilidade e Aposentadoria
Simule estratégias de resgate para planejamento de aposentadoria.

**Funcionalidades:**
- 3 cenários: Preservar (perpétuo), Consumir Nominal, Consumir Real
- Modo "Quanto posso sacar?" - calcula saque máximo por cenário
- Modo "Quanto tempo dura?" - calcula duração com saque desejado
- Gráfico comparativo dos 3 cenários
- Tabela detalhada com saldo nominal e real
- Tratamento de taxa real negativa

### 🏠 Financiamento Imobiliário
Simule financiamento imobiliário com sistemas SAC e Price.

**Funcionalidades:**
- Sistemas SAC (parcelas decrescentes) e Price (parcelas fixas)
- Comparação lado a lado dos dois sistemas
- Amortizações extras com notação de parcelas (ex: `1-5`, `3,7,12-15,20`)
- Estratégias de amortização **por prazo** (reduz o prazo, amortização crescente) e **por parcela** (mantém o prazo, amortização decrescente), fiéis ao simulador de referência
- Botões "Adicionar" (soma valores) e "Substituir" (sobrescreve) por parcela
- Gerador de sequência de parcelas (começando em X, a cada Y, até Z)
- Taxas e seguros mensais
- Datas das parcelas (MM/AAAA) e data da última parcela
- Gráfico de evolução do saldo devedor e parcelas
- Tabela detalhada com todas as colunas

## Tecnologias

- **React 18** - Interface de usuário
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **Recharts** - Gráficos
- **React Router** - Navegação
- **vite-plugin-pwa** - PWA, service worker (Workbox) e manifest
- **Vitest** - Testes unitários

## Instalação

```bash
# Clone o repositório
git clone https://github.com/soulnanx/calculadora-nobre.git
cd calculadora-nobre

# Instale as dependências
npm install

# Execute em modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Execute os testes
npm test
```

## Deploy

O projeto está configurado para deploy automático via GitHub Pages. A cada push na branch `master`, o GitHub Actions executa o build e deploy.

**URL:** https://soulnanx.github.io/calculadora-nobre/

## Estrutura do Projeto

```
src/
├── calculators/          # Lógica de cálculo pura
│   ├── compound-interest.ts
│   ├── retirement.ts
│   └── amortization.ts
├── components/           # Componentes reutilizáveis
│   ├── CurrencyInput.tsx
│   ├── NumberInput.tsx
│   ├── RadioGroup.tsx
│   ├── ResultCard.tsx
│   └── ScenarioTabs.tsx
├── pages/                # Páginas da aplicação
│   ├── Home.tsx
│   ├── JurosCompostos.tsx
│   ├── Rentabilidade.tsx
│   └── Financiamento.tsx
├── types/                # Tipos TypeScript
│   └── index.ts
└── lib/                  # Utilitários
    └── utils.ts
```

## Documentação

- [Ideias de Calculadoras](docs/calculadoras-ideias.md) - Lista de calculadoras implementadas e futuras ideias
- [Specs](docs/specs/) - Especificações técnicas de cada calculadora
- [Plans](docs/plans/) - Planos de implementação

## Licença

ISC
