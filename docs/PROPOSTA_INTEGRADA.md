# VitrineCentro — Proposta integrada (T3 + A4, tema inspirado no T2)

**Eixo:** Falta de atrativos · Calçadas e acessibilidade
**Nível:** Iniciante (base T3), com camadas da A4 e da T2

---

## 1. Problema a validar

Visitantes, moradores e estudantes podem **não conhecer os pequenos negócios do Centro** nem encontrar informações básicas para decidir uma visita. Pessoas com deficiência ou mobilidade reduzida podem **não saber, antes de sair de casa, quais condições de entrada e atendimento foram observadas**. E falta um **motivo curioso** para circular.

> São hipóteses. Precisam ser validadas localmente; não é estudo científico.

**Público:** visitantes, moradores e estudantes; pessoas com deficiência ou mobilidade reduzida e acompanhantes; comerciantes que autorizem suas informações.

## 2. Solução

Uma **vitrine web offline** que reúne:

- **o que existe** (negócio, itens, referência local, horário e contato autorizado), vindo do T3;
- **como é o acesso** (7 atributos com estado, fonte e data, sem selo), vindo da A4;
- **por que visitar agora** (tema cultural semanal com curiosidades e fonte), inspirado no T2.

**Diferencial:** não é só um catálogo. O tema da semana cria motivo de visita, e a camada de acesso troca o rótulo "acessível / não acessível" por evidências e lacunas, campo a campo.

## 3. MVP — funcionalidades mínimas

| # | Funcionalidade | Origem |
|---|---|---|
| 1 | Listar 5 negócios fictícios com categoria, referência e horário informado | T3 + A4 |
| 2 | Exibir até 12 itens ligados aos negócios, com descrição e contato autorizado | T3 |
| 3 | Buscar por texto e filtrar 3 categorias | T3 |
| 4 | Ficha com 7 atributos de acesso (observado / não observado / desconhecido) e fonte | A4 |
| 5 | Filtrar 3 necessidades de acesso **sem ocultar desconhecidos** | A4 |
| 6 | Salvar até 5 itens e até 3 lojas no localStorage, sem conta | T3 + A4 |
| 7 | Banner do tema da semana, com fonte e de 2 a 4 lugares com curiosidade | T2 (inspiração) |
| 8 | Anotações e dúvidas locais (substituem os "comentários" públicos) | A4 |

**Fora do escopo:** pagamentos, reservas, descontos, avaliações públicas, login, GPS ou mapa real, certificação de acessibilidade, carimbos e prêmios, envio automático de mensagens.

## 4. Jornada do usuário

A pessoa abre a vitrine e vê o **tema da semana**. Toca numa curiosidade **ou** busca e filtra pela sua necessidade. Abre a ficha, consulta horário, contato e **condições de acesso**, salva a loja ou o item e **anota o que vai confirmar** na visita.

## 5. Telas

1. **Início:** tema da semana, busca, categorias, filtro de acesso e cartões.
2. **Ficha do negócio:** dados, itens, ilustração autorizada, curiosidade do tema e tabela de acesso.
3. **Item:** descrição, negócio e botão de favoritar.
4. **Favoritos:** itens e lojas salvos, com remoção.
5. **Anotações:** dúvidas geradas pelos campos desconhecidos e anotações livres.
6. **Sobre os dados:** autorização, limites, atualização e botão para apagar os dados locais.

## 6. Modelo de dados

```
Negocio:        id, nome, categoria, referencia_local, horario_informado,
                contato_autorizado, data_confirmacao, exemplo_ficticio
ItemVitrine:    id, negocio_id, titulo, descricao_curta, icone, ativo
AtributoAcesso: id, negocio_id, tipo, estado, descricao, fonte_observacao
                tipo   ∈ degrau | largura | circulacao | balcao | banheiro | atendimento | rota
                estado ∈ observado | nao_observado | desconhecido
FotoAutorizada: id, negocio_id, arquivo, legenda, texto_alternativo, autorizacao_status
TemaCultural:   id, semana_inicio, titulo, icone, texto, fonte, aviso_ficticio
TemaLugar:      id, tema_id, negocio_id, ordem, curiosidade, fonte_curiosidade

localStorage (somente no aparelho):
  vc_fav_itens  → [{ id, item_id, salvo_em, dispositivo_local, origem_dado }]  (máx. 5)
  vc_fav_lojas  → [negocio_id]                                                  (máx. 3)
  vc_anotacoes  → [{ id, negocio_id, texto, data }]
```

## 7. Tecnologias

HTML, CSS e JavaScript puros, dados locais em JSON e localStorage. Funciona offline e não exige serviço pago. Evolução opcional: SQLite ou API própria.

## 8. Backlog — sequência de construção

1. Definir 5 negócios, 12 itens e 3 temas fictícios, marcando os exemplos.
2. Mapear os 7 atributos de acesso de cada negócio nos três estados.
3. Construir lista, ficha, item, busca e filtros por categoria.
4. Adicionar tabela de acesso e filtro de necessidade (sem ocultar desconhecidos).
5. Implementar favoritos (5 itens e 3 lojas) com mensagem de limite.
6. Adicionar banner do tema semanal com curiosidades e fonte.
7. Tela de anotações e dúvidas; tela "Sobre os dados".
8. Acessibilidade: teclado, foco visível, alto contraste, texto ampliado e textos alternativos.
9. Testar com 3 a 5 voluntários e corrigir os 2 problemas mais frequentes.

## 9. Critérios de aceite

1. Carregar os 5 negócios e abrir cada ficha sem erro.
2. Filtrar por categoria ou termo mostra **só** as correspondências, mantendo horário e contato ligados ao negócio certo.
3. O filtro de acesso retorna os negócios com o atributo e **mantém visíveis os desconhecidos**, sinalizados.
4. A ficha exibe legenda, texto alternativo, autorização e data; tudo navegável por teclado.
5. Salvar 3 lojas persiste após recarregar; tentar a quarta mostra o limite **sem apagar** as anteriores (o mesmo vale para o 6º item).
6. Com dados inválidos ou busca sem resultado, o site mostra erro claro ou estado vazio **sem travar**; os favoritos continuam removíveis.
7. O tema exibido corresponde à semana atual, e o seletor de demonstração troca o tema.

## 10. Riscos e prevenção

| Risco | Prevenção |
|---|---|
| Horário, contato ou acesso desatualizado | Exibir "informado", data de confirmação e fonte |
| Informação de acesso vista como garantia | Aviso fixo, sem selo; "desconhecido" sempre visível |
| Foto, telefone ou texto sem autorização | Usar dados fictícios ou autorizados; sem dados pessoais |
| Conteúdo cultural incorreto ou estereotipado | Fonte visível, revisão antes de publicar, tom respeitoso |
| Imagem com licença incerta | Usar arquivos próprios ou com licença compatível, guardando a fonte |
| Escopo grande demais (3 projetos) | Seguir a ordem do backlog; cada camada só depois da anterior funcionar |

## 11. Custo e continuidade

**Estimativa didática:** R$ 0 a R$ 40 (impressão opcional de roteiros e etiquetas), com computadores e internet já disponíveis. Não é cotação.

**Quem poderia manter:** uma turma, laboratório ou núcleo escolar, revisando autorizações, atributos de acesso e temas em ciclos definidos. É uma proposta, não parceria confirmada.

**Depois do evento:** painel de atualização com revisão humana, histórico de confirmações, pedido local de correção e calendário de temas construído com grupos culturais do município.
