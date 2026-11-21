# VitrineCentro — PWA Offline-First de Comércio Local e Acessibilidade Cidadã

> **Vitrine web offline-first** de pequenos negócios do Centro Histórico, com **condições de acesso físicas e atitudinais campo a campo**, **tema cultural semanal**, **Radar de Distância Offline (Haversine)**, **leitura por voz**, **exportação de roteiro para impressão/WhatsApp** e **Índice de Acessibilidade Cidadã (Civic Tech)**.

| Pilar | Origem | O que integra no projeto |
|---|---|---|
| **T3 · VitrineCentro** | Base do produto | Catálogo de negócios, itens, referência local, horário, contato autorizado, busca, filtros, favoritos e compartilhamento |
| **A4 · AcessoLoja** | Transparência de acesso | 10 atributos por loja (6 físicos + 4 atitudinais/comunicacionais previstos em lei) com estado (`observado`, `nao_observado`, `desconhecido`), fonte, data e tela de dúvidas |
| **T2 · PassaporteCentro** | Cultura e território | Tema cultural da semana com fonte verificável e curiosidades conectadas aos estabelecimentos |
| **Civic Tech & Inclusão** | Evolução PWA | Índice de Acessibilidade Cidadã, Radar Offline (Haversine), Leitura por Voz (Web Speech API), Feedback Háptico e Exportação Offline (PDF/WhatsApp) |

> ⚠️ **Aviso importante:** Todos os dados presentes neste protótipo são **fictícios** (para demonstração e testes). As informações de acesso **não são certificação nem garantia** — servem como transparência de campo para orientar a visita e devem ser confirmadas no local.

---

## Sumário

1. [Funcionalidades Principais](#funcionalidades-principais)
2. [Acessibilidade e Conformidade Legal (Aba `#acessibilidade`)](#acessibilidade-e-conformidade-legal-aba-acessibilidade)
3. [Telas da Aplicação](#telas-da-aplicação)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Como Rodar e Testar](#como-rodar-e-testar)
6. [Como Editar os Dados (`dados/dados.js`)](#como-editar-os-dados-dadosdadosjs)
7. [Princípios e Regras Inegociáveis](#princípios-e-regras-inegociáveis)

---

## Funcionalidades Principais

### 1. Catálogo, Busca e Filtros Inclusivos
- Busca instantânea por nome do negócio, categoria, produtos, serviços ou referência local (insensível a acentos e maiúsculas).
- Filtros separados por **Categoria**, **Acessibilidade Física** e **Acessibilidade Atitudinal / Leis Vigentes**.
- **Regra de ouro A4:** ao filtrar por uma necessidade de acesso, locais com o atributo marcado como **`desconhecido` nunca são escondidos** — aparecem identificados com selo próprio para que a pessoa saiba exatamente o que confirmar.

### 2. Radar de Distância Offline (Fórmula de Haversine)
- Calcula a distância em linha reta entre o usuário e cada estabelecimento **100% no aparelho**, sem mapas pagos e sem chamadas a APIs externas.
- **Privacidade e opt-in:** o aplicativo **nunca** dispara pedido de GPS ao abrir. O usuário decide quando clicar em **Ativar Radar (GPS)** ou testar instantaneamente em **Simular no Centro (Aracaju)** (referência na Praça Fausto Cardoso).
- Exibe a distância formatada em metros (`104 m`) ou quilômetros (`1,2 km`) nos cards da tela inicial e na ficha de cada loja, acompanhada da **estimativa de caminhada acessível** (`~2 min a pé`) e ordenação opcional do mais próximo ao mais distante.
- Ao clicar em **Desativar**, as coordenadas são descartadas imediatamente da memória.

### 3. Compartilhamento Elegante (`Web Share API` + Fallback Inteligente)
- Disponível nas fichas de negócios (`#negocio-*`) e nas páginas de itens (`#item-*`).
- **Celular / navegadores compatíveis:** aciona a folha nativa de compartilhamento (`navigator.share`) com título, resumo de acesso e link direto.
- **Computador / fallback:** copia o link direto para a área de transferência (`navigator.clipboard.writeText` com fallback seguro via `execCommand("copy")`), exibindo transição animada de confirmação (`✓ Link copiado!`), feedback háptico e anúncio em leitor de tela.

### 4. Leitura por Voz Integrada (`Web Speech API`)
- Presente em toda ficha de negócio, narra em português (`pt-BR`) os dados principais, curiosidades culturais, itens oferecidos e todas as condições de acesso físicas e atitudinais.
- Controles completos de **Ouvir / Parar**, **Pausar / Retomar** e **Velocidade** (`0,85×`, `1×` e `1,25×`).

### 5. Exportação de Roteiro Offline (PDF / Impressão / WhatsApp / `.TXT`)
- Pensada para **pessoas idosas** ou em situação de exclusão digital que preferem levar o guia impresso ou receber por mensagem.
- Gera um resumo limpo e legível (de uma loja específica ou de todas as lojas salvas + favoritos + dúvidas + anotações) pronto para:
  - **Imprimir / Salvar em PDF** (com folha de estilo `@media print` dedicada em alto contraste preto no branco);
  - **Copiar para WhatsApp** com um clique;
  - **Baixar arquivo `.txt`** para leitura offline em qualquer dispositivo.

### 6. Índice de Acessibilidade Cidadã (Civic Tech)
- Painel público no fim da página inicial que consolida, em tempo real a partir dos dados locais:
  - Total de negócios mapeados;
  - Percentual de condições verificadas vs. lacunas desconhecidas;
  - Barras de progresso individuais para cada um dos **10 atributos físicos e atitudinais**, com botão de atalho para filtrar a vitrine por aquele indicador.
- Transforma o catálogo local em evidência aberta para diálogo comunitário e políticas públicas.

### 7. PWA Offline-First e Privacidade Local
- Instalável via `manifest.json` com identidade visual oficial e cache offline via Service Worker (`sw.js`).
- Favoritos (até 5 itens e 3 lojas), anotações e preferências de acessibilidade ficam exclusivamente no `localStorage` do dispositivo — sem conta, sem login e sem rastreamento.

---

## Acessibilidade e Conformidade Legal (Aba `#acessibilidade`)

A acessibilidade não é um extra na **VitrineCentro** — é o eixo estrutural do projeto. O aplicativo possui uma **barra superior de acessibilidade permanente** e uma **aba dedicada (`#acessibilidade` — Declaração de Conformidade e Painel de Preferências)** onde qualquer pessoa pode ajustar a interface às suas necessidades.

### Painel de Preferências Disponível ao Usuário

| Controle | Onde encontrar | O que faz |
|---|---|---|
| **Alto contraste (WCAG AAA)** | Barra superior e `#acessibilidade` | Ativa paleta preto absoluto (`#000000`), texto branco (`#ffffff`) e destaques amarelo ouro (`#ffd400`) com contraste máximo |
| **Tamanho do texto (`A−` / `A+`)** | Barra superior e `#acessibilidade` | Escala progressiva de **100% até 150%** (compatível também com zoom nativo do navegador até **400%**) |
| **Espaçamento de leitura** | Barra superior e `#acessibilidade` | Amplia altura de linha, espaçamento entre letras, palavras e parágrafos conforme **WCAG 1.4.12** (ideal para dislexia e baixa visão) |
| **Reduzir animações** | Barra superior e `#acessibilidade` | Desativa transições e ondas visuais (respeita automaticamente `prefers-reduced-motion: reduce` do sistema) |
| **Feedback háptico (Vibração)** | `#acessibilidade` | Resposta tátil discreta (`navigator.vibrate`) ao tocar em botões, salvar ações ou receber alertas em celulares compatíveis |
| **Sublinhar todos os links** | `#acessibilidade` | Garante sublinhado permanente em todos os links para identificação sem depender de cor (**WCAG 1.4.1**) |
| **Restaurar padrão** | `#acessibilidade` | Reverte todas as preferências visuais e táteis com um clique |

### Atalhos de Teclado (Padrão eMAG 3.1)

Combine as teclas abaixo com o modificador do seu navegador (`Alt` + tecla no Windows/Linux ou `Control` + `Option` + tecla no macOS):

| Tecla | Destino / Ação |
|---|---|
| `1` | Ir diretamente para o **conteúdo principal** (`#conteudo`) |
| `2` | Ir para o **menu principal** (`#menu-principal`) |
| `3` | Ir para o **campo de busca** de negócios |
| `4` | Ir para o **rodapé** (`#rodape`) |
| `5` | Abrir a aba **Acessibilidade** (`#acessibilidade`) |
| `C` | Alternar **Alto Contraste** |
| `Tab` / `Shift + Tab` | Navegar entre todos os elementos interativos com anel de foco visível de alto contraste |
| `Esc` | Fechar diálogos modais de confirmação ou exportação de roteiro |

### Atributos de Acesso Monitorados por Loja (10 Dimensões)

| Dimensão | Atributos monitorados (`dados/dados.js`) |
|---|---|
| **Física (6)** | `degrau` (Degrau na entrada), `largura` (Largura da porta informada), `circulacao` (Circulação interna), `balcao` (Balcão rebaixado), `banheiro` (Banheiro adaptado) e `rota` (Rota da calçada até a entrada) |
| **Atitudinal & Comunicacional — Leis Vigentes (4)** | `atendimento` (Atendimento em Libras), `cao_guia` (Aceita cão-guia — Lei nº 11.126/2005), `prioritario` (Atendimento prioritário no caixa — Lei nº 10.048/2000) e `braille` (Cardápio ou material em Braille) |

> Cada estado (`observado`, `nao_observado`, `desconhecido`) combina **ícone + rótulo textual + padrão de borda distinto** (sólida, tracejada e pontilhada), nunca dependendo apenas de cor.

### Normas, Diretrizes e Legislação Observadas

- **WCAG 2.2 (Níveis A, AA e critérios AAA):**
  - Contraste elevado **≥ 7:1** em textos e **≥ 3:1 / 4,5:1** em bordas e componentes interativos (validado por testes automatizados em `a11y.test.js`);
  - Alvos de toque com mínimo de **44×44 px** (WCAG 2.5.5 / 2.5.8);
  - **Reflow sem rolagem horizontal até 320 px** (WCAG 1.4.10), incluindo tabelas responsivas com `data-label`;
  - Foco visível não obstruído (`:focus-visible`) e **preservação de foco** após re-renderizações e fechamento de modais;
  - Regiões vivas ARIA (`role="status"` / `role="alert"`), títulos de página dinâmicos (`document.title`) e `<dialog>` nativo para prevenção de ações destrutivas (WCAG 3.3.4);
  - Suporte a **Windows High Contrast / `forced-colors: active`**.
- **eMAG 3.1 (Modelo de Acessibilidade em Governo Eletrônico):** barra de acessibilidade e links de salto padronizados no topo, landmarks semânticos (`header`, `nav`, `main`, `footer`), hierarquia rigorosa de cabeçalhos e atalhos `1` a `5`.
- **Legislação Brasileira:** **LBI — Lei nº 13.146/2015** (Art. 63), **Decreto nº 5.296/2004**, **Lei nº 11.126/2005** (direito de acesso com cão-guia) e **Lei nº 10.048/2000** (atendimento prioritário).
- **ABNT NBR 17060:2022:** ergonomia de toque em dispositivos móveis, compatibilidade com leitores de tela e navegação consistente.

---

## Telas da Aplicação

| Tela | Rota (Hash) | O que oferece |
|---|---|---|
| **Início** | `#inicio` | Tema da semana, Radar de Distância Offline, busca, filtros físicos/atitudinais, lista de negócios e Índice de Acessibilidade Cidadã |
| **Ficha do negócio** | `#negocio-n1` | Dados verificados, faixa de distância offline, Leitura por Voz, botão de Compartilhar, Exportação PDF/WhatsApp, itens, curiosidade cultural e tabela completa de acesso |
| **Item** | `#item-i1` | Descrição detalhada, vínculo com o negócio, favoritar, compartilhar e atalho direto para as condições de acesso da loja |
| **Favoritos** | `#favoritos` | Até 5 itens e 3 lojas salvos localmente + exportação consolidada de roteiro offline |
| **Anotações** | `#anotacoes` | Dúvidas sugeridas automaticamente a partir dos atributos `desconhecido` das lojas salvas + bloco de anotações pessoais (validação acessível) |
| **Sobre os dados** | `#sobre` | Origem das propostas integradas, limites de transparência/privacidade e botão com confirmação modal para apagar dados locais |
| **Acessibilidade** | `#acessibilidade` | Painel completo de preferências visuais/táteis, lista de recursos inclusivos, atalhos eMAG 3.1 e declaração de conformidade legal |

---

## Estrutura do Projeto

```text
VitrineCentro/
├── index.html          → Estrutura semântica, barra eMAG, landmarks, modais nativos e registro do PWA
├── manifest.json       → Manifesto PWA (nome, ícones e tema)
├── sw.js               → Service Worker para cache offline-first
├── server.js           → Servidor Express leve para desenvolvimento local (porta 3000)
├── package.json        → Scripts de execução, lint e testes automatizados
├── a11y.test.js        → Testes unitários de contraste WCAG AAA, Haversine, Web Share, roteiro e dados
├── server.test.js      → Testes de integração do servidor estático e segurança de rotas
├── css/
│   └── estilo.css      → Tokens AAA, alto contraste, reflow 320px, animações sutis, radar, share e @media print
├── js/
│   ├── core.js         → Lógica pura testável (validação, filtros, Haversine, Índice Cidadão, roteiro, narração, contraste)
│   └── app.js          → Controlador de telas, roteamento hash, voz, vibração, radar offline e compartilhamento
├── dados/
│   └── dados.js        → Base de dados JSON pura (negócios com lat/lng de Aracaju, itens, acesso físico/atitudinal e temas)
└── docs/
    ├── PROPOSTA_INTEGRADA.md  → Problema, solução, MVP, modelo de dados e backlog
    ├── ROTEIRO_TESTE.md       → Tarefas e ficha de validação com voluntários
    └── ROTEIRO_DEMO.md        → Roteiro de demonstração e pitch
```

---

## Como Rodar e Testar

### Opção 1 — 100% offline (sem servidor)
1. Baixe ou clone este repositório.
2. Abra `index.html` diretamente no navegador (Chrome, Edge, Firefox ou Safari).
   - *Observação:* recursos de PWA (`Service Worker`) e `Geolocation` funcionam de forma completa quando servidos em `http://localhost` ou `HTTPS` (use a Opção 2 para testar tudo).

### Opção 2 — Servidor local com Node.js (recomendado para PWA, Radar GPS e testes)

```bash
# 1. Instalar dependências
npm install

# 2. Subir o servidor local em http://localhost:3000
npm run dev
```

### Validação e Testes Automatizados

```bash
# Verificar sintaxe de todos os arquivos JS (build / lint)
npm run lint

# Rodar a suíte completa de testes (contraste WCAG AAA, Haversine, Web Share, dados e servidor)
npm test
```

---

## Como Editar os Dados (`dados/dados.js`)

Toda a base fica em **JSON puro** dentro de `window.DADOS = { ... };`.

- **Novo negócio:** copie um objeto em `negocios`, altere o `id` (ex.: `n6`) e informe `lat` e `lng` numéricos para ativar automaticamente o cálculo de distância no Radar Offline.
- **Novo item:** adicione em `itens` com `negocio_id` apontando para um negócio existente.
- **Condições de acesso:** cada negócio possui registros em `atributos_acesso` cobrindo atributos físicos e atitudinais. O campo `estado` aceita estritamente:
  - `"observado"`
  - `"nao_observado"`
  - `"desconhecido"`
- **Novo tema da semana:** adicione em `temas_culturais` com `semana_inicio` em `AAAA-MM-DD` e relacione os locais em `tema_lugares`. O app seleciona o tema automaticamente pela data atual (ou pelo seletor de demonstração na tela inicial).

> **Proteção contra dados quebrados:** ao carregar, `core.js` executa `validarDados(D)`. Se houver erro de sintaxe, chave ausente, coordenada inválida ou `id` quebrado, o aplicativo exibe um alerta acessível em vez de mostrar informação incorreta.

---

## Princípios e Regras Inegociáveis

1. **Zero rótulo binário:** nunca classificar um local como "acessível" ou "não acessível". Exibir sempre o atributo específico, o estado, a descrição e a fonte.
2. **Transparência radical nos filtros:** o filtro de acesso **nunca esconde** registros com estado `desconhecido`.
3. **Consentimento de dados reais:** estabelecimentos reais só podem entrar com autorização expressa do responsável e data de confirmação.
4. **Mídia acessível:** toda ilustração ou imagem possui legenda, texto alternativo descritivo e status de autorização.
5. **Privacidade em primeiro lugar:** sem conta, sem login, sem rastreamento e sem coleta automática de GPS (o Radar Offline é estritamente opt-in e efêmero em memória).
6. **Rigor cultural:** todo texto do Tema da Semana traz fonte visível e verificável antes de qualquer publicação.
