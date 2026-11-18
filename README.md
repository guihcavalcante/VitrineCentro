# VitrineCentro — protótipo integrado

Vitrine web offline de pequenos negócios do Centro, com **condições de acesso campo a campo** e um **tema cultural que muda toda semana**.

| Origem | O que entra no projeto |
|---|---|
| **T3 · VitrineCentro** (base) | Negócios, itens, referência local, horário e contato autorizado, busca, filtros e favoritos |
| **A4 · AcessoLoja** | 7 atributos de acesso (observado / não observado / desconhecido), com fonte e data; tela de dúvidas |
| **T2 · PassaporteCentro** (inspiração) | Tema cultural da semana, com fonte visível e curiosidades que levam aos lugares |

> ⚠️ Todos os dados são **fictícios**. As condições de acesso **não são certificação** nem garantia.

---

## Como abrir

1. Descompacte a pasta.
2. Dê dois cliques em `index.html`. Funciona **sem internet e sem servidor**.
3. Opcional: no VS Code, use a extensão *Live Server*.

## Estrutura

```
VitrineCentro/
├── index.html          → estrutura da página
├── css/estilo.css      → visual, alto contraste e texto ampliado
├── js/app.js           → telas, busca, filtros, favoritos e anotações
├── dados/dados.js      → base de dados (JSON) — é aqui que a equipe edita
└── docs/
    ├── PROPOSTA_INTEGRADA.md  → problema, solução, MVP, modelo de dados e backlog
    ├── ROTEIRO_TESTE.md       → tarefas e ficha para os voluntários
    └── ROTEIRO_DEMO.md        → demonstração de 3 minutos e pitch
```

## Telas

| Tela | Endereço | O que faz |
|---|---|---|
| Início | `#inicio` | Tema da semana, busca, filtro por categoria e por necessidade de acesso |
| Ficha do negócio | `#negocio-n1` | Dados do negócio, itens, ilustração, curiosidade do tema e tabela de acesso |
| Item | `#item-i1` | Descrição do item e botão de favoritar |
| Favoritos | `#favoritos` | Até 5 itens e até 3 lojas, salvos só no aparelho |
| Anotações | `#anotacoes` | Dúvidas sugeridas (campos desconhecidos) e anotações pessoais |
| Sobre os dados | `#sobre` | Limites do protótipo e botão para apagar os dados locais |

## Como editar os dados (`dados/dados.js`)

O conteúdo é **JSON puro** dentro de `window.DADOS = { ... };`.

- **Novo negócio:** copie um bloco de `negocios` e troque o `id` (ex.: `n6`).
- **Novo item:** adicione em `itens` com `negocio_id` apontando para um negócio existente.
- **Acesso:** cada negócio tem 7 registros em `atributos_acesso`. O `estado` só aceita `observado`, `nao_observado` ou `desconhecido`.
- **Novo tema da semana:** adicione em `temas_culturais` com `semana_inicio` no formato `AAAA-MM-DD` (de preferência uma segunda-feira) e ligue os lugares em `tema_lugares`.

O site **escolhe o tema sozinho pela data**: vale o último tema cuja `semana_inicio` já chegou. Na demonstração, use o seletor "ver outra semana".

Se houver erro no arquivo (vírgula ou aspas faltando, `id` inexistente), o site mostra uma **mensagem de erro** em vez de exibir informação errada.

## Regras que não podem ser quebradas

1. Nunca escrever "acessível" ou "não acessível". Mostrar o atributo, o estado e a fonte.
2. O filtro de acesso **nunca esconde** os desconhecidos.
3. Dados reais só com **autorização** do responsável e **data de confirmação**.
4. Toda imagem tem legenda, texto alternativo e status de autorização.
5. Nada de login, GPS, rastreamento, avaliações públicas ou envio automático.
6. Textos culturais sempre com **fonte visível**, conferida antes de publicar.

## Ordem de construção sugerida

1. Fluxo do T3: lista, ficha, item e favoritos.
2. Seção de acesso do A4: tabela, filtro e dúvidas.
3. Tema da semana: banner, curiosidades e destaque.
4. Anotações e acabamento: teclado, estados vazios e contraste.
5. Teste com voluntários (prazo do A4: **25/11**) e correção dos 2 problemas mais frequentes.
