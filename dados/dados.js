/* BASE DE DADOS DO PROTÓTIPO — tudo aqui é FICTÍCIO.
   O conteúdo entre as chaves é JSON puro. Ele fica dentro de "window.DADOS = ...;"
   só para o site abrir offline com dois cliques (sem servidor).
   Ao editar: mantenha aspas duplas, vírgulas entre registros e os ids coerentes
   (negocio_id precisa existir em "negocios"). */
window.DADOS = {
  "meta": {
    "projeto": "VitrineCentro + AcessoLoja (protótipo integrado T3 + A4, tema inspirado no T2)",
    "versao": "0.1-prototipo",
    "aviso": "TODOS os negócios, itens, horários, contatos e atributos de acesso são EXEMPLOS FICTÍCIOS para teste. Não representam lojas reais nem garantem acessibilidade.",
    "data_geracao": "2026-11-13"
  },
  "categorias": [
    "Alimentação",
    "Arte e Cultura",
    "Serviços"
  ],
  "tipos_acesso": {
    "degrau": "Degrau na entrada",
    "largura": "Largura da porta informada",
    "circulacao": "Circulação interna",
    "balcao": "Balcão rebaixado",
    "banheiro": "Banheiro adaptado",
    "atendimento": "Atendimento em Libras",
    "rota": "Rota da calçada até a entrada",
    "cao_guia": "Aceita cão-guia (Lei nº 11.126/2005)",
    "prioritario": "Atendimento prioritário no caixa (Lei nº 10.048/2000)",
    "braille": "Cardápio ou material em Braille"
  },
  "negocios": [
    {
      "id": "n1",
      "nome": "Café da Praça (exemplo)",
      "categoria": "Alimentação",
      "icone": "☕",
      "referencia_local": "Em frente à praça principal, ao lado da banca de revistas",
      "horario_informado": "Seg a Sáb, 7h às 18h",
      "contato_autorizado": "(00) 0000-0001 — exemplo fictício",
      "data_confirmacao": "2026-11-10",
      "lat": -10.9111,
      "lng": -37.0493,
      "exemplo_ficticio": true
    },
    {
      "id": "n2",
      "nome": "Ateliê Cordel & Arte (exemplo)",
      "categoria": "Arte e Cultura",
      "icone": "📜",
      "referencia_local": "Rua do comércio, próximo à igreja matriz",
      "horario_informado": "Ter a Sáb, 9h às 17h",
      "contato_autorizado": "@atelie.exemplo — perfil fictício",
      "data_confirmacao": "2026-11-08",
      "lat": -10.9136,
      "lng": -37.0522,
      "exemplo_ficticio": true
    },
    {
      "id": "n3",
      "nome": "Tabuleiro da Dona Rosa (exemplo)",
      "categoria": "Alimentação",
      "icone": "🍲",
      "referencia_local": "Esquina do mercado municipal, entrada lateral",
      "horario_informado": "Seg a Sex, 15h às 20h",
      "contato_autorizado": "(00) 0000-0003 — exemplo fictício",
      "data_confirmacao": "2026-11-11",
      "lat": -10.9082,
      "lng": -37.0472,
      "exemplo_ficticio": true
    },
    {
      "id": "n4",
      "nome": "Casa do Sanfoneiro (exemplo)",
      "categoria": "Arte e Cultura",
      "icone": "🪗",
      "referencia_local": "Atrás do coreto, portão azul",
      "horario_informado": "Qua a Dom, 14h às 21h",
      "contato_autorizado": "contato@exemplo.invalid — e-mail fictício",
      "data_confirmacao": "2026-11-05",
      "lat": -10.9125,
      "lng": -37.0477,
      "exemplo_ficticio": true
    },
    {
      "id": "n5",
      "nome": "Conserta Tudo Centro (exemplo)",
      "categoria": "Serviços",
      "icone": "🛠️",
      "referencia_local": "Galeria comercial, térreo, loja 4",
      "horario_informado": "Seg a Sex, 8h às 17h",
      "contato_autorizado": "(00) 0000-0005 — exemplo fictício",
      "data_confirmacao": "2026-11-12",
      "lat": -10.9154,
      "lng": -37.0504,
      "exemplo_ficticio": true
    }
  ],
  "itens": [
    {
      "id": "i1",
      "negocio_id": "n1",
      "titulo": "Café coado na hora",
      "descricao_curta": "Café passado no coador de pano, servido em xícara.",
      "icone": "☕",
      "ativo": true
    },
    {
      "id": "i2",
      "negocio_id": "n1",
      "titulo": "Bolo de macaxeira",
      "descricao_curta": "Fatia de bolo caseiro, receita da casa.",
      "icone": "🍰",
      "ativo": true
    },
    {
      "id": "i3",
      "negocio_id": "n2",
      "titulo": "Folhetos de cordel",
      "descricao_curta": "Folhetos com histórias em versos, capas em xilogravura.",
      "icone": "📜",
      "ativo": true
    },
    {
      "id": "i4",
      "negocio_id": "n2",
      "titulo": "Oficina de xilogravura",
      "descricao_curta": "Demonstração aberta de entalhe em madeira (exemplo).",
      "icone": "🖼️",
      "ativo": true
    },
    {
      "id": "i5",
      "negocio_id": "n2",
      "titulo": "Marcadores de página",
      "descricao_curta": "Marcadores impressos com gravuras do ateliê.",
      "icone": "🔖",
      "ativo": true
    },
    {
      "id": "i6",
      "negocio_id": "n3",
      "titulo": "Acarajé",
      "descricao_curta": "Bolinho de feijão-fradinho frito no dendê, com recheios.",
      "icone": "🧆",
      "ativo": true
    },
    {
      "id": "i7",
      "negocio_id": "n3",
      "titulo": "Cocada de forno",
      "descricao_curta": "Doce de coco assado, vendido em porções.",
      "icone": "🥥",
      "ativo": true
    },
    {
      "id": "i8",
      "negocio_id": "n4",
      "titulo": "Roda de forró pé de serra",
      "descricao_curta": "Apresentação com sanfona, zabumba e triângulo (exemplo).",
      "icone": "🪗",
      "ativo": true
    },
    {
      "id": "i9",
      "negocio_id": "n4",
      "titulo": "Aula aberta de zabumba",
      "descricao_curta": "Iniciação ao ritmo, sem necessidade de instrumento próprio.",
      "icone": "🥁",
      "ativo": true
    },
    {
      "id": "i10",
      "negocio_id": "n5",
      "titulo": "Conserto de celular",
      "descricao_curta": "Troca de tela e bateria com orçamento no balcão.",
      "icone": "📱",
      "ativo": true
    },
    {
      "id": "i11",
      "negocio_id": "n5",
      "titulo": "Cópia de chaves",
      "descricao_curta": "Cópia simples feita na hora.",
      "icone": "🔑",
      "ativo": true
    },
    {
      "id": "i12",
      "negocio_id": "n3",
      "titulo": "Abará",
      "descricao_curta": "Massa de feijão cozida na folha de bananeira.",
      "icone": "🍃",
      "ativo": true
    }
  ],
  "atributos_acesso": [
    {
      "id": "a1",
      "negocio_id": "n1",
      "tipo": "degrau",
      "estado": "nao_observado",
      "descricao": "Entrada no nível da calçada.",
      "fonte_observacao": "Observação da equipe (simulada) em 10/11"
    },
    {
      "id": "a2",
      "negocio_id": "n1",
      "tipo": "largura",
      "estado": "observado",
      "descricao": "Porta informada com cerca de 90 cm.",
      "fonte_observacao": "Informado pelo estabelecimento (simulado)"
    },
    {
      "id": "a3",
      "negocio_id": "n1",
      "tipo": "circulacao",
      "estado": "observado",
      "descricao": "Mesas espaçadas no salão.",
      "fonte_observacao": "Observação da equipe (simulada)"
    },
    {
      "id": "a4",
      "negocio_id": "n1",
      "tipo": "balcao",
      "estado": "desconhecido",
      "descricao": "Não foi verificado.",
      "fonte_observacao": "—"
    },
    {
      "id": "a5",
      "negocio_id": "n1",
      "tipo": "banheiro",
      "estado": "observado",
      "descricao": "Banheiro com barras de apoio.",
      "fonte_observacao": "Observação da equipe (simulada)"
    },
    {
      "id": "a6",
      "negocio_id": "n1",
      "tipo": "atendimento",
      "estado": "desconhecido",
      "descricao": "Não foi verificado.",
      "fonte_observacao": "—"
    },
    {
      "id": "a7",
      "negocio_id": "n1",
      "tipo": "rota",
      "estado": "observado",
      "descricao": "Calçada contínua desde a praça.",
      "fonte_observacao": "Observação da equipe (simulada)"
    },
    {
      "id": "a8",
      "negocio_id": "n2",
      "tipo": "degrau",
      "estado": "observado",
      "descricao": "Um degrau de cerca de 15 cm na entrada.",
      "fonte_observacao": "Observação da equipe (simulada) em 08/11"
    },
    {
      "id": "a9",
      "negocio_id": "n2",
      "tipo": "largura",
      "estado": "desconhecido",
      "descricao": "Não foi medida.",
      "fonte_observacao": "—"
    },
    {
      "id": "a10",
      "negocio_id": "n2",
      "tipo": "circulacao",
      "estado": "observado",
      "descricao": "Corredor estreito entre expositores.",
      "fonte_observacao": "Observação da equipe (simulada)"
    },
    {
      "id": "a11",
      "negocio_id": "n2",
      "tipo": "balcao",
      "estado": "nao_observado",
      "descricao": "Balcão alto, sem parte rebaixada.",
      "fonte_observacao": "Observação da equipe (simulada)"
    },
    {
      "id": "a12",
      "negocio_id": "n2",
      "tipo": "banheiro",
      "estado": "desconhecido",
      "descricao": "Não foi verificado.",
      "fonte_observacao": "—"
    },
    {
      "id": "a13",
      "negocio_id": "n2",
      "tipo": "atendimento",
      "estado": "observado",
      "descricao": "Responsável informou saber Libras básica.",
      "fonte_observacao": "Informado pelo estabelecimento (simulado)"
    },
    {
      "id": "a14",
      "negocio_id": "n2",
      "tipo": "rota",
      "estado": "desconhecido",
      "descricao": "Não foi verificada.",
      "fonte_observacao": "—"
    },
    {
      "id": "a15",
      "negocio_id": "n3",
      "tipo": "degrau",
      "estado": "nao_observado",
      "descricao": "Atendimento na calçada, sem degrau.",
      "fonte_observacao": "Observação da equipe (simulada) em 11/11"
    },
    {
      "id": "a16",
      "negocio_id": "n3",
      "tipo": "largura",
      "estado": "desconhecido",
      "descricao": "Não se aplica / não verificado.",
      "fonte_observacao": "—"
    },
    {
      "id": "a17",
      "negocio_id": "n3",
      "tipo": "circulacao",
      "estado": "desconhecido",
      "descricao": "Não foi verificada.",
      "fonte_observacao": "—"
    },
    {
      "id": "a18",
      "negocio_id": "n3",
      "tipo": "balcao",
      "estado": "observado",
      "descricao": "Tabuleiro em altura média.",
      "fonte_observacao": "Observação da equipe (simulada)"
    },
    {
      "id": "a19",
      "negocio_id": "n3",
      "tipo": "banheiro",
      "estado": "nao_observado",
      "descricao": "Não há banheiro no ponto.",
      "fonte_observacao": "Informado pelo estabelecimento (simulado)"
    },
    {
      "id": "a20",
      "negocio_id": "n3",
      "tipo": "atendimento",
      "estado": "desconhecido",
      "descricao": "Não foi verificado.",
      "fonte_observacao": "—"
    },
    {
      "id": "a21",
      "negocio_id": "n3",
      "tipo": "rota",
      "estado": "observado",
      "descricao": "Calçada com piso irregular em um trecho.",
      "fonte_observacao": "Observação da equipe (simulada)"
    },
    {
      "id": "a22",
      "negocio_id": "n4",
      "tipo": "degrau",
      "estado": "observado",
      "descricao": "Rampa curta no portão.",
      "fonte_observacao": "Observação da equipe (simulada) em 05/11"
    },
    {
      "id": "a23",
      "negocio_id": "n4",
      "tipo": "largura",
      "estado": "observado",
      "descricao": "Portão largo, informado pelo responsável.",
      "fonte_observacao": "Informado pelo estabelecimento (simulado)"
    },
    {
      "id": "a24",
      "negocio_id": "n4",
      "tipo": "circulacao",
      "estado": "observado",
      "descricao": "Salão amplo, cadeiras móveis.",
      "fonte_observacao": "Observação da equipe (simulada)"
    },
    {
      "id": "a25",
      "negocio_id": "n4",
      "tipo": "balcao",
      "estado": "desconhecido",
      "descricao": "Não foi verificado.",
      "fonte_observacao": "—"
    },
    {
      "id": "a26",
      "negocio_id": "n4",
      "tipo": "banheiro",
      "estado": "desconhecido",
      "descricao": "Não foi verificado.",
      "fonte_observacao": "—"
    },
    {
      "id": "a27",
      "negocio_id": "n4",
      "tipo": "atendimento",
      "estado": "nao_observado",
      "descricao": "Sem atendimento em Libras informado.",
      "fonte_observacao": "Informado pelo estabelecimento (simulado)"
    },
    {
      "id": "a28",
      "negocio_id": "n4",
      "tipo": "rota",
      "estado": "desconhecido",
      "descricao": "Não foi verificada.",
      "fonte_observacao": "—"
    },
    {
      "id": "a29",
      "negocio_id": "n5",
      "tipo": "degrau",
      "estado": "nao_observado",
      "descricao": "Galeria no nível da rua.",
      "fonte_observacao": "Observação da equipe (simulada) em 12/11"
    },
    {
      "id": "a30",
      "negocio_id": "n5",
      "tipo": "largura",
      "estado": "desconhecido",
      "descricao": "Não foi medida.",
      "fonte_observacao": "—"
    },
    {
      "id": "a31",
      "negocio_id": "n5",
      "tipo": "circulacao",
      "estado": "desconhecido",
      "descricao": "Não foi verificada.",
      "fonte_observacao": "—"
    },
    {
      "id": "a32",
      "negocio_id": "n5",
      "tipo": "balcao",
      "estado": "observado",
      "descricao": "Parte do balcão rebaixada.",
      "fonte_observacao": "Observação da equipe (simulada)"
    },
    {
      "id": "a33",
      "negocio_id": "n5",
      "tipo": "banheiro",
      "estado": "observado",
      "descricao": "Banheiro adaptado da galeria (uso compartilhado).",
      "fonte_observacao": "Informado pela galeria (simulado)"
    },
    {
      "id": "a34",
      "negocio_id": "n5",
      "tipo": "atendimento",
      "estado": "desconhecido",
      "descricao": "Não foi verificado.",
      "fonte_observacao": "—"
    },
    {
      "id": "a35",
      "negocio_id": "n5",
      "tipo": "rota",
      "estado": "observado",
      "descricao": "Piso tátil na entrada da galeria.",
      "fonte_observacao": "Observação da equipe (simulada)"
    },
    {
      "id": "a36",
      "negocio_id": "n1",
      "tipo": "cao_guia",
      "estado": "observado",
      "descricao": "Sinalização na entrada informando entrada livre para cão-guia.",
      "fonte_observacao": "Observação da equipe (simulada) em 10/11"
    },
    {
      "id": "a37",
      "negocio_id": "n1",
      "tipo": "prioritario",
      "estado": "observado",
      "descricao": "Placa de atendimento prioritário visível no caixa.",
      "fonte_observacao": "Observação da equipe (simulada) em 10/11"
    },
    {
      "id": "a38",
      "negocio_id": "n1",
      "tipo": "braille",
      "estado": "observado",
      "descricao": "Cardápio resumido em Braille disponível no balcão.",
      "fonte_observacao": "Informado pelo estabelecimento (simulado)"
    },
    {
      "id": "a39",
      "negocio_id": "n2",
      "tipo": "cao_guia",
      "estado": "observado",
      "descricao": "Responsável confirmou acolhimento a visitantes com cão-guia.",
      "fonte_observacao": "Informado pelo estabelecimento (simulado)"
    },
    {
      "id": "a40",
      "negocio_id": "n2",
      "tipo": "prioritario",
      "estado": "desconhecido",
      "descricao": "Não foi verificado se há sinalização de atendimento prioritário.",
      "fonte_observacao": "—"
    },
    {
      "id": "a41",
      "negocio_id": "n2",
      "tipo": "braille",
      "estado": "nao_observado",
      "descricao": "Catálogo apenas impresso em tinta; sem versão em Braille.",
      "fonte_observacao": "Observação da equipe (simulada) em 08/11"
    },
    {
      "id": "a42",
      "negocio_id": "n3",
      "tipo": "cao_guia",
      "estado": "observado",
      "descricao": "Atendimento em área aberta na calçada, livre para cão-guia.",
      "fonte_observacao": "Observação da equipe (simulada) em 11/11"
    },
    {
      "id": "a43",
      "negocio_id": "n3",
      "tipo": "prioritario",
      "estado": "observado",
      "descricao": "Atendimento prioritário organizado verbalmente na fila.",
      "fonte_observacao": "Informado pelo estabelecimento (simulado)"
    },
    {
      "id": "a44",
      "negocio_id": "n3",
      "tipo": "braille",
      "estado": "nao_observado",
      "descricao": "Preços apenas em placa escrita à mão.",
      "fonte_observacao": "Observação da equipe (simulada) em 11/11"
    },
    {
      "id": "a45",
      "negocio_id": "n4",
      "tipo": "cao_guia",
      "estado": "desconhecido",
      "descricao": "Não foi confirmado com a equipe do espaço.",
      "fonte_observacao": "—"
    },
    {
      "id": "a46",
      "negocio_id": "n4",
      "tipo": "prioritario",
      "estado": "observado",
      "descricao": "Entrada e assentos reservados para atendimento prioritário.",
      "fonte_observacao": "Informado pelo estabelecimento (simulado)"
    },
    {
      "id": "a47",
      "negocio_id": "n4",
      "tipo": "braille",
      "estado": "desconhecido",
      "descricao": "Não foi verificado se a programação possui versão em Braille.",
      "fonte_observacao": "—"
    },
    {
      "id": "a48",
      "negocio_id": "n5",
      "tipo": "cao_guia",
      "estado": "observado",
      "descricao": "Galeria sinaliza permissão permanente para cão-guia.",
      "fonte_observacao": "Observação da equipe (simulada) em 12/11"
    },
    {
      "id": "a49",
      "negocio_id": "n5",
      "tipo": "prioritario",
      "estado": "observado",
      "descricao": "Senha preferencial no balcão de orçamento.",
      "fonte_observacao": "Observação da equipe (simulada) em 12/11"
    },
    {
      "id": "a50",
      "negocio_id": "n5",
      "tipo": "braille",
      "estado": "nao_observado",
      "descricao": "Tabela de serviços sem versão em Braille no momento.",
      "fonte_observacao": "Informado pelo estabelecimento (simulado)"
    }
  ],
  "fotos_autorizadas": [
    {
      "id": "f1",
      "negocio_id": "n1",
      "arquivo": "placeholder",
      "legenda": "Fachada (ilustração)",
      "texto_alternativo": "Ilustração de fachada com porta larga no nível da calçada.",
      "autorizacao_status": "exemplo_ficticio"
    },
    {
      "id": "f2",
      "negocio_id": "n2",
      "arquivo": "placeholder",
      "legenda": "Entrada com degrau (ilustração)",
      "texto_alternativo": "Ilustração de entrada com um degrau baixo.",
      "autorizacao_status": "exemplo_ficticio"
    },
    {
      "id": "f3",
      "negocio_id": "n3",
      "arquivo": "placeholder",
      "legenda": "Tabuleiro na calçada (ilustração)",
      "texto_alternativo": "Ilustração de tabuleiro de comida na calçada.",
      "autorizacao_status": "exemplo_ficticio"
    },
    {
      "id": "f4",
      "negocio_id": "n4",
      "arquivo": "placeholder",
      "legenda": "Portão com rampa (ilustração)",
      "texto_alternativo": "Ilustração de portão azul com rampa curta.",
      "autorizacao_status": "exemplo_ficticio"
    },
    {
      "id": "f5",
      "negocio_id": "n5",
      "arquivo": "placeholder",
      "legenda": "Galeria com piso tátil (ilustração)",
      "texto_alternativo": "Ilustração de entrada de galeria com piso tátil.",
      "autorizacao_status": "exemplo_ficticio"
    }
  ],
  "temas_culturais": [
    {
      "id": "t1",
      "semana_inicio": "2026-11-09",
      "titulo": "Literatura de Cordel",
      "icone": "📜",
      "texto": "Histórias em versos, vendidas em folhetos e ilustradas com xilogravura. Uma tradição viva do Nordeste.",
      "fonte": "IPHAN — Literatura de Cordel, registrada como Patrimônio Cultural do Brasil (2018). Conferir antes de publicar.",
      "aviso_ficticio": "Lugares indicados são exemplos fictícios."
    },
    {
      "id": "t2",
      "semana_inicio": "2026-11-16",
      "titulo": "Sabores afro-brasileiros",
      "icone": "🧆",
      "texto": "Comidas de tabuleiro que carregam história, fé e trabalho de mulheres negras.",
      "fonte": "IPHAN — Ofício das Baianas de Acarajé, registrado como Patrimônio Cultural do Brasil (2004). Conferir antes de publicar.",
      "aviso_ficticio": "Lugares indicados são exemplos fictícios."
    },
    {
      "id": "t3",
      "semana_inicio": "2026-11-23",
      "titulo": "Forró pé de serra",
      "icone": "🪗",
      "texto": "Sanfona, zabumba e triângulo: o trio que embala festas e encontros em todo o Nordeste.",
      "fonte": "IPHAN — Matrizes Tradicionais do Forró, registradas como Patrimônio Cultural do Brasil (2021). Conferir antes de publicar.",
      "aviso_ficticio": "Lugares indicados são exemplos fictícios."
    }
  ],
  "tema_lugares": [
    {
      "id": "tl1",
      "tema_id": "t1",
      "negocio_id": "n2",
      "ordem": 1,
      "curiosidade": "Você sabia que as capas de cordel costumam ser impressas a partir de matrizes entalhadas em madeira?",
      "fonte_curiosidade": "Fonte-modelo: conferir em material do IPHAN"
    },
    {
      "id": "tl2",
      "tema_id": "t1",
      "negocio_id": "n1",
      "ordem": 2,
      "curiosidade": "Neste exemplo, o café expõe folhetos de cordel para leitura enquanto você espera.",
      "fonte_curiosidade": "Exemplo fictício"
    },
    {
      "id": "tl3",
      "tema_id": "t2",
      "negocio_id": "n3",
      "ordem": 1,
      "curiosidade": "Você sabia que o acarajé é feito de feijão-fradinho e frito no azeite de dendê?",
      "fonte_curiosidade": "Fonte-modelo: conferir em material do IPHAN"
    },
    {
      "id": "tl4",
      "tema_id": "t2",
      "negocio_id": "n1",
      "ordem": 2,
      "curiosidade": "Neste exemplo, o café serve bolo de macaxeira, ingrediente presente em muitas cozinhas tradicionais.",
      "fonte_curiosidade": "Exemplo fictício"
    },
    {
      "id": "tl5",
      "tema_id": "t3",
      "negocio_id": "n4",
      "ordem": 1,
      "curiosidade": "Você sabia que o trio sanfona, zabumba e triângulo é a base do forró pé de serra?",
      "fonte_curiosidade": "Fonte-modelo: conferir em material do IPHAN"
    },
    {
      "id": "tl6",
      "tema_id": "t3",
      "negocio_id": "n2",
      "ordem": 2,
      "curiosidade": "Neste exemplo, o ateliê vende cordéis que contam histórias de sanfoneiros.",
      "fonte_curiosidade": "Exemplo fictício"
    }
  ]
};
