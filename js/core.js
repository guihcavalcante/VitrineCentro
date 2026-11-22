/* VitrineCentro — núcleo puro de acessibilidade, validação, filtros,
   índice cidadão (Civic Tech), roteiro offline e roteiro de narração por voz.
   Compatível com navegador (window.VC_CORE) e Node.js (module.exports). */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.VC_CORE = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const ESTADO_TXT = {
    observado: "Observado",
    nao_observado: "Não observado",
    desconhecido: "Desconhecido",
  };

  const ESTADO_ICONE = {
    observado: "✓",
    nao_observado: "⊘",
    desconhecido: "?",
  };

  const ATRIBUTOS_ATITUDINAIS = new Set(["atendimento", "cao_guia", "prioritario", "braille"]);

  const NECESSIDADES = [
    { tipo: "degrau", rot: "Entrada sem degrau", grupo: "fisico", ok: (a) => a.estado === "nao_observado" },
    { tipo: "banheiro", rot: "Banheiro adaptado", grupo: "fisico", ok: (a) => a.estado === "observado" },
    { tipo: "atendimento", rot: "Atendimento em Libras", grupo: "atitudinal", ok: (a) => a.estado === "observado" },
    { tipo: "cao_guia", rot: "Aceita cão-guia", grupo: "atitudinal", ok: (a) => a.estado === "observado" },
    { tipo: "prioritario", rot: "Atendimento prioritário", grupo: "atitudinal", ok: (a) => a.estado === "observado" },
    { tipo: "braille", rot: "Cardápio em Braille", grupo: "atitudinal", ok: (a) => a.estado === "observado" },
  ];

  const ESCALAS_FONTE = [100, 115, 130, 150];

  const A11Y_PADRAO = {
    tema: "claro",
    contraste: false,
    escalaFonte: 100,
    espacamento: false,
    sublinharLinks: false,
    reduzirAnimacao: false,
    vibracao: true,
  };

  // Ponto de referência central (Praça Fausto Cardoso, Centro de Aracaju) para modo demonstração offline
  const PONTO_CENTRO_ARACAJU = {
    lat: -10.9116,
    lng: -37.0501,
    rotulo: "Praça Fausto Cardoso — Centro de Aracaju (simulação)",
  };

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  function norm(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function fmtData(iso) {
    const [y, m, d] = String(iso || "").split("-");
    return d && m && y ? `${d}/${m}/${y}` : String(iso || "");
  }

  function normalizarA11y(raw, prefersReducedMotion, prefersDark) {
    const src = raw && typeof raw === "object" ? raw : {};
    let escala = Number(src.escalaFonte);
    if (!ESCALAS_FONTE.includes(escala)) {
      escala = src.ampliado ? 130 : A11Y_PADRAO.escalaFonte;
    }
    const reduzirAnimacao =
      typeof src.reduzirAnimacao === "boolean"
        ? src.reduzirAnimacao
        : Boolean(prefersReducedMotion);
    const vibracao = typeof src.vibracao === "boolean" ? src.vibracao : A11Y_PADRAO.vibracao;
    const tema =
      src.tema === "escuro" || src.tema === "claro"
        ? src.tema
        : prefersDark
          ? "escuro"
          : A11Y_PADRAO.tema;

    return {
      tema,
      contraste: Boolean(src.contraste),
      escalaFonte: escala,
      espacamento: Boolean(src.espacamento),
      sublinharLinks: Boolean(src.sublinharLinks),
      reduzirAnimacao,
      vibracao,
    };
  }

  function ajustarEscalaFonte(atual, direcao) {
    const idx = ESCALAS_FONTE.indexOf(atual);
    const baseIdx = idx === -1 ? 0 : idx;
    const proxIdx = Math.max(0, Math.min(ESCALAS_FONTE.length - 1, baseIdx + direcao));
    return ESCALAS_FONTE[proxIdx];
  }

  function validarDados(d) {
    const erros = [];
    if (!d || typeof d !== "object") {
      return ["O arquivo de dados não é um objeto JSON."];
    }
    ["negocios", "itens", "atributos_acesso", "temas_culturais", "tema_lugares"].forEach((k) => {
      if (!Array.isArray(d[k])) erros.push(`Lista "${k}" ausente.`);
    });
    if (erros.length) return erros;

    const ids = new Set(d.negocios.map((n) => n.id));
    d.negocios.forEach((n) => {
      if (n.lat !== undefined || n.lng !== undefined) {
        const latOk = typeof n.lat === "number" && Number.isFinite(n.lat) && n.lat >= -90 && n.lat <= 90;
        const lngOk = typeof n.lng === "number" && Number.isFinite(n.lng) && n.lng >= -180 && n.lng <= 180;
        if (!latOk || !lngOk) {
          erros.push(`Negócio ${n.id} possui coordenadas lat/lng inválidas.`);
        }
      }
    });
    d.itens.forEach((i) => {
      if (!ids.has(i.negocio_id)) {
        erros.push(`Item ${i.id} aponta para negócio inexistente (${i.negocio_id}).`);
      }
    });
    d.atributos_acesso.forEach((a) => {
      if (!ids.has(a.negocio_id)) {
        erros.push(`Atributo ${a.id} aponta para negócio inexistente.`);
      }
      if (!ESTADO_TXT[a.estado]) {
        erros.push(`Atributo ${a.id} com estado inválido.`);
      }
    });
    d.tema_lugares.forEach((t) => {
      if (!ids.has(t.negocio_id)) {
        erros.push(`Tema-lugar ${t.id} aponta para negócio inexistente.`);
      }
    });
    return erros;
  }

  const DIAS_SEMANA = {
    dom: 0,
    seg: 1,
    ter: 2,
    qua: 3,
    qui: 4,
    sex: 5,
    sab: 6,
  };

  function estaAbertoAgora(horarioInformado, dataRef) {
    const raw = String(horarioInformado || "").trim();
    if (!raw) return null;
    const agora = dataRef instanceof Date ? dataRef : new Date();
    const diaAtual = agora.getDay();
    const minAtual = agora.getHours() * 60 + agora.getMinutes();

    const segmentos = raw.split(/[·;]/).map((s) => s.trim()).filter(Boolean);
    let algumValido = false;

    for (const seg of segmentos) {
      const limpo = norm(seg);
      const mHora = limpo.match(/(\d{1,2})h(\d{2})?\s*(?:as|a|-)\s*(\d{1,2})h(\d{2})?/);
      if (!mHora) continue;

      const iniMin = Number(mHora[1]) * 60 + Number(mHora[2] || 0);
      const fimMin = Number(mHora[3]) * 60 + Number(mHora[4] || 0);
      const diasAtivos = new Set();

      const mRange = limpo.match(/\b(dom|seg|ter|qua|qui|sex|sab)\s+a\s+(dom|seg|ter|qua|qui|sex|sab)\b/);
      if (mRange) {
        const dIni = DIAS_SEMANA[mRange[1]];
        const dFim = DIAS_SEMANA[mRange[2]];
        let d = dIni;
        for (let step = 0; step < 7; step++) {
          diasAtivos.add(d);
          if (d === dFim) break;
          d = (d + 1) % 7;
        }
      } else {
        const matches = limpo.match(/\b(dom|seg|ter|qua|qui|sex|sab)\b/g);
        if (matches) {
          matches.forEach((tok) => diasAtivos.add(DIAS_SEMANA[tok]));
        }
      }

      if (!diasAtivos.size) continue;
      algumValido = true;

      if (diasAtivos.has(diaAtual)) {
        const aberto = fimMin >= iniMin
          ? minAtual >= iniMin && minAtual < fimMin
          : minAtual >= iniMin || minAtual < fimMin;
        if (aberto) {
          return { aberto: true, rotulo: "Aberto agora" };
        }
      }
    }

    if (!algumValido) return null;
    return { aberto: false, rotulo: "Fechado agora" };
  }

  function destaquesAcessoNegocio(dados, negocioId) {
    const attrs = (dados.atributos_acesso || []).filter((a) => a.negocio_id === negocioId);
    const porTipo = new Map(attrs.map((a) => [a.tipo, a]));
    const tags = [];

    const deg = porTipo.get("degrau");
    if (deg) {
      if (deg.estado === "nao_observado") {
        tags.push({ tipo: "degrau", rotulo: "Acesso em nível" });
      } else if (deg.estado === "observado" && norm(deg.descricao).includes("rampa")) {
        tags.push({ tipo: "degrau", rotulo: "Rampa na entrada" });
      }
    }

    const cao = porTipo.get("cao_guia");
    if (cao && cao.estado === "observado") {
      tags.push({ tipo: "cao_guia", rotulo: "Cão-guia bem-vindo" });
    }

    const prio = porTipo.get("prioritario");
    if (prio && prio.estado === "observado") {
      tags.push({ tipo: "prioritario", rotulo: "Atendimento prioritário" });
    }

    const banh = porTipo.get("banheiro");
    if (banh && banh.estado === "observado") {
      tags.push({ tipo: "banheiro", rotulo: "Banheiro adaptado" });
    }

    const braille = porTipo.get("braille");
    if (braille && braille.estado === "observado") {
      tags.push({ tipo: "braille", rotulo: "Cardápio em Braille" });
    }

    const libras = porTipo.get("atendimento");
    if (libras && libras.estado === "observado") {
      tags.push({ tipo: "atendimento", rotulo: "Atendimento em Libras" });
    }

    const rota = porTipo.get("rota");
    if (rota && rota.estado === "observado" && norm(rota.descricao).includes("piso tatil")) {
      tags.push({ tipo: "rota", rotulo: "Piso tátil" });
    }

    return tags;
  }

  function filtrarNegocios(dados, filtro, temaId, dataRef) {
    const termo = norm((filtro && filtro.q ? filtro.q : "").trim());
    const cat = filtro && filtro.cat ? filtro.cat : null;
    const necTipo = filtro && filtro.nec ? filtro.nec : null;
    const abertoAgora = Boolean(filtro && filtro.abertoAgora);
    const nec = NECESSIDADES.find((n) => n.tipo === necTipo) || null;

    const itensDe = (id) => dados.itens.filter((i) => i.negocio_id === id && i.ativo);
    const acessoDe = (id) => dados.atributos_acesso.filter((a) => a.negocio_id === id);
    const noTema = (nid) =>
      Boolean(temaId && dados.tema_lugares.some((x) => x.tema_id === temaId && x.negocio_id === nid));

    const res = dados.negocios.filter((n) => {
      if (cat && n.categoria !== cat) return false;
      if (abertoAgora) {
        const status = estaAbertoAgora(n.horario_informado, dataRef);
        if (!status || !status.aberto) return false;
      }
      if (termo) {
        const alvo = norm(
          [
            n.nome,
            n.categoria,
            n.referencia_local,
            ...itensDe(n.id).map((i) => i.titulo + " " + i.descricao_curta),
          ].join(" ")
        );
        if (!alvo.includes(termo)) return false;
      }
      if (nec) {
        const a = acessoDe(n.id).find((x) => x.tipo === nec.tipo);
        const temRampa = nec.tipo === "degrau" && a && a.estado === "observado" && norm(a.descricao).includes("rampa");
        // Regra do A4: nunca ocultar o estado "desconhecido"
        if (!a || !(nec.ok(a) || temRampa || a.estado === "desconhecido")) return false;
      }
      return true;
    });

    res.sort((a, b) => (noTema(b.id) ? 1 : 0) - (noTema(a.id) ? 1 : 0));
    return res;
  }

  // ---------- Índice de Acessibilidade Cidadã (Civic Tech — Fase 3) ----------
  function calcularIndiceCidadao(dados) {
    const totalNegocios = Array.isArray(dados.negocios) ? dados.negocios.length : 0;
    const atributos = Array.isArray(dados.atributos_acesso) ? dados.atributos_acesso : [];
    const totalAtributos = atributos.length;
    const desconhecidos = atributos.filter((a) => a.estado === "desconhecido").length;
    const verificados = totalAtributos - desconhecidos;
    const pctVerificados = totalAtributos ? Math.round((verificados / totalAtributos) * 100) : 0;
    const pctDesconhecidos = totalAtributos ? 100 - pctVerificados : 0;

    const indicadores = NECESSIDADES.map((nec) => {
      let atendidos = 0;
      let naoAtendidos = 0;
      let semVerificacao = 0;

      dados.negocios.forEach((n) => {
        const reg = atributos.find((a) => a.negocio_id === n.id && a.tipo === nec.tipo);
        if (!reg || reg.estado === "desconhecido") semVerificacao += 1;
        else if (nec.ok(reg)) atendidos += 1;
        else naoAtendidos += 1;
      });

      const pct = totalNegocios ? Math.round((atendidos / totalNegocios) * 100) : 0;
      return {
        tipo: nec.tipo,
        rotulo: nec.rot,
        grupo: nec.grupo,
        atendidos,
        naoAtendidos,
        semVerificacao,
        total: totalNegocios,
        pct,
      };
    });

    return {
      totalNegocios,
      totalAtributos,
      verificados,
      desconhecidos,
      pctVerificados,
      pctDesconhecidos,
      indicadores,
    };
  }

  // ---------- Exportação de Roteiro Offline (Impressão / PDF / WhatsApp — Fase 2) ----------
  function gerarTextoRoteiro(dados, opcoes) {
    const opts = opcoes || {};
    const lojaIds = Array.isArray(opts.lojaIds) ? opts.lojaIds : [];
    const itemIds = Array.isArray(opts.itemIds) ? opts.itemIds : [];
    const notas = Array.isArray(opts.notas) ? opts.notas : [];
    const negocioUnico = opts.negocioId
      ? dados.negocios.find((n) => n.id === opts.negocioId)
      : null;

    const negociosAlvo = negocioUnico
      ? [negocioUnico]
      : lojaIds.length
        ? lojaIds.map((id) => dados.negocios.find((n) => n.id === id)).filter(Boolean)
        : dados.negocios;

    const ordemTipos = Object.keys(dados.tipos_acesso || {});
    const linhas = [];

    linhas.push("VITRINECENTRO — ROTEIRO OFFLINE DE VISITA");
    linhas.push("========================================");
    linhas.push(
      "AVISO: Protótipo com dados fictícios. As condições de acesso são registros observados ou informados e não substituem confirmação antes da visita."
    );
    linhas.push("");

    if (negocioUnico) {
      linhas.push(`FICHA INDIVIDUAL: ${negocioUnico.nome}`);
    } else if (lojaIds.length) {
      linhas.push(`MINHAS LOJAS SALVAS (${negociosAlvo.length})`);
    } else {
      linhas.push(`GUIA COMPLETO DOS NEGÓCIOS (${negociosAlvo.length})`);
    }
    linhas.push("");

    negociosAlvo.forEach((n, idx) => {
      linhas.push(`${idx + 1}. ${n.nome} [${n.categoria}]`);
      linhas.push(`   Referência: ${n.referencia_local}`);
      linhas.push(`   Horário informado: ${n.horario_informado}`);
      linhas.push(`   Contato autorizado: ${n.contato_autorizado}`);
      linhas.push(`   Confirmado em: ${fmtData(n.data_confirmacao)}`);

      const ac = dados.atributos_acesso
        .filter((a) => a.negocio_id === n.id)
        .sort((a, b) => ordemTipos.indexOf(a.tipo) - ordemTipos.indexOf(b.tipo));

      linhas.push("   Condições de acesso (físicas e atitudinais):");
      ac.forEach((a) => {
        const nomeTipo = dados.tipos_acesso[a.tipo] || a.tipo;
        const ic = ESTADO_ICONE[a.estado] || "-";
        const est = ESTADO_TXT[a.estado] || a.estado;
        linhas.push(`     ${ic} ${nomeTipo}: ${est} — ${a.descricao}`);
      });

      const duvidas = ac.filter((a) => a.estado === "desconhecido");
      if (duvidas.length) {
        linhas.push(
          `   Dúvidas para confirmar antes de ir: ${duvidas
            .map((a) => dados.tipos_acesso[a.tipo] || a.tipo)
            .join("; ")}.`
        );
      }
      linhas.push("");
    });

    if (!negocioUnico && itemIds.length) {
      const itens = itemIds
        .map((id) => dados.itens.find((i) => i.id === id))
        .filter(Boolean);
      if (itens.length) {
        linhas.push(`ITENS FAVORITOS (${itens.length})`);
        itens.forEach((i) => {
          const n = dados.negocios.find((x) => x.id === i.negocio_id);
          linhas.push(`- ${i.titulo} (${n ? n.nome : ""}): ${i.descricao_curta}`);
        });
        linhas.push("");
      }
    }

    const notasFiltradas = negocioUnico
      ? notas.filter((x) => x.negocio_id === negocioUnico.id)
      : notas;
    if (notasFiltradas.length) {
      linhas.push(`MINHAS ANOTAÇÕES (${notasFiltradas.length})`);
      notasFiltradas.forEach((x) => {
        const n = dados.negocios.find((b) => b.id === x.negocio_id);
        linhas.push(`- [${n ? n.nome : "Geral"}] ${x.texto}`);
      });
      linhas.push("");
    }

    linhas.push("Gerado offline pela VitrineCentro — sem conta e sem rastreamento.");
    return linhas.join("\n");
  }

  // ---------- Roteiro de Narração por Voz (Web Speech API — Fase 1) ----------
  function montarTextoNarracaoNegocio(dados, negocioId, tema) {
    const n = dados.negocios.find((x) => x.id === negocioId);
    if (!n) return "";

    const ordemTipos = Object.keys(dados.tipos_acesso || {});
    const ac = dados.atributos_acesso
      .filter((a) => a.negocio_id === n.id)
      .sort((a, b) => ordemTipos.indexOf(a.tipo) - ordemTipos.indexOf(b.tipo));
    const itens = dados.itens.filter((i) => i.negocio_id === n.id && i.ativo);
    const curio =
      tema &&
      dados.tema_lugares.find((x) => x.tema_id === tema.id && x.negocio_id === n.id);

    const partes = [
      `Ficha de ${n.nome}, categoria ${n.categoria}.`,
      `Referência local: ${n.referencia_local}.`,
      `Horário informado: ${n.horario_informado}.`,
      `Contato autorizado: ${n.contato_autorizado}.`,
    ];

    if (curio && tema) {
      partes.push(`Curiosidade do tema da semana ${tema.titulo}: ${curio.curiosidade}.`);
    }

    if (itens.length) {
      partes.push(
        `Itens oferecidos: ${itens.map((i) => `${i.titulo}, ${i.descricao_curta}`).join(" ")}`
      );
    }

    const desc = ac.filter((a) => a.estado === "desconhecido").length;
    partes.push(
      `Condições de acesso físicas e atitudinais. Atenção: estas informações não são certificação. ${
        desc ? `Há ${desc} condições desconhecidas para confirmar antes da visita.` : ""
      }`
    );

    ac.forEach((a) => {
      const nomeTipo = dados.tipos_acesso[a.tipo] || a.tipo;
      const est = ESTADO_TXT[a.estado] || a.estado;
      partes.push(`${nomeTipo}: ${est}. ${a.descricao}`);
    });

    return partes.join(" ");
  }

  // ---------- Radar de Distância Offline (Fórmula de Haversine) ----------
  function calcularDistanciaHaversine(lat1, lng1, lat2, lng2) {
    if (
      ![lat1, lng1, lat2, lng2].every((v) => typeof v === "number" && Number.isFinite(v))
    ) {
      return null;
    }
    const R = 6371000; // Raio médio da Terra em metros
    const toRad = (g) => (g * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function formatarDistancia(metros) {
    if (typeof metros !== "number" || !Number.isFinite(metros) || metros < 0) return "";
    if (metros < 1000) {
      return `${Math.round(metros)} m`;
    }
    return `${(metros / 1000).toFixed(1).replace(".", ",")} km`;
  }

  function estimarCaminhada(metros) {
    if (typeof metros !== "number" || !Number.isFinite(metros) || metros < 0) return "";
    // Ritmo confortável acessível (~3,6 km/h = 60 m/min)
    const min = Math.max(1, Math.round(metros / 60));
    if (min < 60) return `~${min} min a pé`;
    const h = Math.floor(min / 60);
    const resto = min % 60;
    return resto ? `~${h}h ${resto}min a pé` : `~${h}h a pé`;
  }

  function ordenarPorDistancia(lista, origem) {
    if (!origem || typeof origem.lat !== "number" || typeof origem.lng !== "number") {
      return [...lista];
    }
    return [...lista].sort((a, b) => {
      const da = calcularDistanciaHaversine(origem.lat, origem.lng, a.lat, a.lng);
      const db = calcularDistanciaHaversine(origem.lat, origem.lng, b.lat, b.lng);
      const va = da === null ? Number.POSITIVE_INFINITY : da;
      const vb = db === null ? Number.POSITIVE_INFINITY : db;
      return va - vb;
    });
  }

  // ---------- Compartilhamento Elegante (Web Share API + Fallback) ----------
  function montarDadosCompartilhamento(dados, negocioId, urlBase) {
    const n = dados.negocios.find((x) => x.id === negocioId);
    if (!n) return null;
    const base = String(urlBase || "").split("#")[0];
    const url = `${base}#negocio-${n.id}`;
    const ac = dados.atributos_acesso.filter((a) => a.negocio_id === n.id);
    const observados = ac.filter((a) => a.estado === "observado").length;
    const desconhecidos = ac.filter((a) => a.estado === "desconhecido").length;

    const text =
      `${n.nome} (${n.categoria}) na VitrineCentro.\n` +
      `Referência: ${n.referencia_local}.\n` +
      `Horário informado: ${n.horario_informado}.\n` +
      `Condições registradas: ${observados} observada(s) e ${desconhecidos} desconhecida(s) — confirme antes da visita.`;

    return {
      title: `${n.nome} — VitrineCentro`,
      text,
      url,
    };
  }

  function montarDadosCompartilhamentoItem(dados, itemId, urlBase) {
    const i = dados.itens.find((x) => x.id === itemId);
    if (!i) return null;
    const n = dados.negocios.find((x) => x.id === i.negocio_id);
    const base = String(urlBase || "").split("#")[0];
    const url = `${base}#item-${i.id}`;
    return {
      title: `${i.titulo} — VitrineCentro`,
      text: `${i.titulo} em ${n ? n.nome : "VitrineCentro"}: ${i.descricao_curta}`,
      url,
    };
  }

  // ---------- Cálculo de contraste WCAG 2.x (luminância relativa sRGB) ----------
  function hexParaRgb(hex) {
    const limpo = String(hex).replace("#", "").trim();
    const full = limpo.length === 3 ? limpo.split("").map((c) => c + c).join("") : limpo;
    if (!/^[0-9a-fA-F]{6}$/.test(full)) {
      throw new Error(`Cor hexadecimal inválida: ${hex}`);
    }
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  }

  function luminanciaRelativa(hex) {
    const [r, g, b] = hexParaRgb(hex).map((v) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function razaoContraste(cor1, cor2) {
    const l1 = luminanciaRelativa(cor1);
    const l2 = luminanciaRelativa(cor2);
    const maisClara = Math.max(l1, l2);
    const maisEscura = Math.min(l1, l2);
    return (maisClara + 0.05) / (maisEscura + 0.05);
  }

  // ---------- Curadoria Colaborativa (Lojistas e Cidadãos) ----------
  const PERFIS_CURADORIA = [
    "Sou Lojista — Cadastrar comércio",
    "Sou Lojista — Atualizar meu comércio",
    "Sou Cidadão — Sugerir atualização",
  ];

  function contatoObrigatorioParaPerfil(perfil) {
    return perfil !== PERFIS_CURADORIA[2];
  }

  function criarRegistroCuradoria(entrada, enviadoEmail) {
    const src = entrada || {};
    const perfil = PERFIS_CURADORIA.includes(src.perfil) ? src.perfil : PERFIS_CURADORIA[2];
    const estabelecimento = String(src.estabelecimento || "").trim();
    const informacao = String(src.informacao || "").trim();
    const contato = String(src.contato || "").trim();
    const erros = {};

    if (!estabelecimento) {
      erros.estabelecimento = "Informe o nome do estabelecimento e o endereço ou rua.";
    }
    if (!informacao) {
      erros.informacao = "Descreva o que deseja cadastrar ou atualizar.";
    }
    if (contatoObrigatorioParaPerfil(perfil) && !contato) {
      erros.contato = "Informe o CNPJ ou WhatsApp oficial da loja para verificação pela curadoria.";
    }

    if (Object.keys(erros).length) {
      return { ok: false, erros, registro: null };
    }

    return {
      ok: true,
      erros: {},
      registro: {
        id: "cur" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
        perfil,
        estabelecimento,
        informacao,
        contato,
        loja_id: src.loja_id || null,
        data: src.data || new Date().toISOString(),
        enviadoEmail: Boolean(enviadoEmail),
        status: "pendente",
      },
    };
  }

  function aprovarRegistroCuradoria(lista, id) {
    if (!Array.isArray(lista)) return [];
    return lista.map((item) => (item && item.id === id ? { ...item, status: "aprovado" } : item));
  }

  return {
    ESTADO_TXT,
    ESTADO_ICONE,
    ATRIBUTOS_ATITUDINAIS,
    NECESSIDADES,
    ESCALAS_FONTE,
    A11Y_PADRAO,
    PONTO_CENTRO_ARACAJU,
    PERFIS_CURADORIA,
    esc,
    norm,
    fmtData,
    normalizarA11y,
    ajustarEscalaFonte,
    validarDados,
    estaAbertoAgora,
    destaquesAcessoNegocio,
    filtrarNegocios,
    calcularIndiceCidadao,
    gerarTextoRoteiro,
    montarTextoNarracaoNegocio,
    calcularDistanciaHaversine,
    formatarDistancia,
    estimarCaminhada,
    ordenarPorDistancia,
    montarDadosCompartilhamento,
    montarDadosCompartilhamentoItem,
    criarRegistroCuradoria,
    aprovarRegistroCuradoria,
    luminanciaRelativa,
    razaoContraste,
  };
});
