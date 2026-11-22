/* VitrineCentro — protótipo integrado (T3 + A4 + tema inspirado no T2)
   Telas, busca, filtros físicos/atitudinais, favoritos, anotações,
   leitura por voz (Web Speech API), feedback háptico (navigator.vibrate),
   exportação de roteiro offline (PDF/impressão/WhatsApp), Índice Cidadão,
   Radar de Distância Offline (Haversine) e Compartilhamento Elegante (Web Share API). */
(function () {
  "use strict";

  const C = window.VC_CORE;
  const LIM_ITENS = 5;
  const LIM_LOJAS = 5;
  const KEY = {
    itens: "vc_fav_itens",
    lojas: "vc_fav_lojas",
    notas: "vc_anotacoes",
    curadoria: "vc_curadoria",
    semana: "vc_semana_demo",
    a11y: "vc_a11y",
  };
  const FORMSPREE_URL = "https://formspree.io/f/myewnzyr";

  const $app = document.getElementById("app");
  const $srAnuncio = document.getElementById("sr-anuncio");
  const $srAlerta = document.getElementById("sr-alerta");
  const $toast = document.getElementById("toast");
  const $dlg = document.getElementById("dlg-confirmar");
  const $dlgTit = document.getElementById("dlg-tit");
  const $dlgDesc = document.getElementById("dlg-desc");
  const $dlgOk = document.getElementById("dlg-ok");
  const $dlgCancelar = document.getElementById("dlg-cancelar");

  const $dlgRoteiro = document.getElementById("dlg-roteiro");
  const $roteiroTexto = document.getElementById("roteiro-texto");
  const $btRotImprimir = document.getElementById("bt-rot-imprimir");
  const $btRotCopiar = document.getElementById("bt-rot-copiar");
  const $btRotBaixar = document.getElementById("bt-rot-baixar");
  const $btRotFechar = document.getElementById("bt-rot-fechar");
  const $areaImpressao = document.getElementById("area-impressao");

  const $navRoteiroCount = document.getElementById("nav-roteiro-count");
  const $barraRoteiro = document.getElementById("barra-roteiro");
  const $barraRoteiroTxt = document.getElementById("barra-roteiro-txt");
  const $btBarraExportar = document.getElementById("bt-barra-exportar");

  let D = null;
  let filtro = { q: "", cat: null, nec: null, abertoAgora: false };
  let maisFiltrosAberto = false;
  let dialogoCallback = null;
  let dialogoRetornoFoco = null;
  let roteiroRetornoFoco = null;
  let roteiroNomeArquivo = "roteiro-vitrinecentro.txt";

  // Estado da leitura por voz (Web Speech API — Fase 1)
  const voz = {
    ativa: false,
    pausada: false,
    velocidade: 1,
    utterance: null,
  };

  // Estado do Radar de Distância Offline (Haversine — opt-in, estritamente em memória)
  const radar = {
    status: "inativo", // "inativo" | "buscando" | "ativo" | "erro"
    origem: null,
    modo: null, // "gps" | "demo"
    ordenar: true,
    erro: "",
  };

  // Ícones SVG finos e consistentes (1.8px, aria-hidden="true")
  const ICO_RADAR = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12l5.8-5.8"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/></svg>`;
  const ICO_DIST = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6.5-5.7-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.3-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.2"/></svg>`;
  const ICO_SHARE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><line x1="8.4" y1="13.4" x2="15.6" y2="17.6"/><line x1="15.6" y1="6.4" x2="8.4" y2="10.6"/></svg>`;
  const ICO_CHECK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
  const ICO_BUSCA = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7.5"/><line x1="20.5" y1="20.5" x2="16.4" y2="16.4"/></svg>`;
  const ICO_X = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  const ICO_CLOCK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>`;
  const ICO_SLIDERS = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7"/><circle cx="9" cy="7" r="2" fill="currentColor"/><line x1="4" y1="17" x2="20" y2="17"/><circle cx="15" cy="17" r="2" fill="currentColor"/></svg>`;
  const ICO_VOZ = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.8 5.5a9 9 0 0 1 0 13"/></svg>`;
  const ICO_MAP_EMPTY = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>`;
  const ICO_NOTE_EMPTY = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>`;

  function iconeAcesso(tipo) {
    const mapa = {
      degrau: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18h18"/><path d="M5 18L19 9"/></svg>`,
      cao_guia: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7" cy="9" r="1.4"/><circle cx="11" cy="6.5" r="1.4"/><circle cx="15" cy="7.5" r="1.4"/><circle cx="18" cy="11" r="1.4"/><path d="M8.5 14.5c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5c0 1.8-1.4 3-3 3h-2c-1.6 0-3-1.2-3-3z"/></svg>`,
      prioritario: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3"/><path d="M6 20v-1a5 5 0 0 1 10 0v1"/><path d="M18 7l1 2 2 .3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1L15 9.3l2-.3 1-2z"/></svg>`,
      banheiro: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="5.5" r="2"/><path d="M10 10v5h5l2 4"/><path d="M8.5 12.5A4.5 4.5 0 1 0 13 19"/></svg>`,
      braille: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="8" cy="7" r="1.7"/><circle cx="8" cy="12" r="1.7"/><circle cx="8" cy="17" r="1.7"/><circle cx="15.5" cy="7" r="1.7"/><circle cx="15.5" cy="12" r="1.7"/></svg>`,
      atendimento: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 11V6a1.5 1.5 0 0 1 3 0v4"/><path d="M10 10V5a1.5 1.5 0 0 1 3 0v5"/><path d="M13 10V6.5a1.5 1.5 0 0 1 3 0V12"/><path d="M16 11.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7l-2.3-3.5a1.4 1.4 0 0 1 2.2-1.7L7 14"/></svg>`,
      rota: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8.2 18H13a3 3 0 0 0 0-6h-2a3 3 0 0 1 0-6h4.8"/></svg>`,
    };
    return mapa[tipo] || ICO_CHECK;
  }

  // ---------- armazenamento local seguro ----------
  function ler(k, padrao) {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : padrao;
    } catch (_e) {
      return padrao;
    }
  }
  function gravar(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
      return true;
    } catch (_e) {
      anunciar("Não foi possível salvar neste navegador.", true);
      return false;
    }
  }

  // ---------- feedback háptico (navigator.vibrate — Fase 1) ----------
  function vibrar(tipo) {
    if (!lerA11y().vibracao) return;
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
    try {
      const padroes = {
        toque: 18,
        sucesso: [20, 30, 20],
        erro: [45, 35, 45],
      };
      navigator.vibrate(padroes[tipo] || 18);
    } catch (_e) {
      // Alguns navegadores bloqueiam vibração sem gesto ativo
    }
  }

  document.addEventListener("click", (e) => {
    const alvo = e.target && e.target.closest ? e.target.closest("button, a.btn, a.tl, .chip") : null;
    if (alvo && !alvo.disabled) vibrar("toque");
  });

  // ---------- leitura por voz integrada (Web Speech API — Fase 1) ----------
  function temVoz() {
    return (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      typeof window.SpeechSynthesisUtterance === "function"
    );
  }

  function atualizarControlesVoz() {
    const btOuvir = document.getElementById("bt-voz-ouvir");
    const btPausar = document.getElementById("bt-voz-pausar");
    const status = document.getElementById("voz-status");
    if (!btOuvir) return;
    btOuvir.setAttribute("aria-pressed", String(voz.ativa));
    btOuvir.innerHTML = voz.ativa
      ? `${ICO_VOZ} <span>Parar leitura</span>`
      : `${ICO_VOZ} <span>Ouvir ficha em voz alta</span>`;
    if (btPausar) {
      btPausar.hidden = !voz.ativa;
      btPausar.setAttribute("aria-pressed", String(voz.pausada));
      btPausar.textContent = voz.pausada ? "Retomar leitura" : "Pausar leitura";
    }
    if (status) {
      status.textContent = !voz.ativa
        ? "Leitura em português disponível."
        : voz.pausada
          ? "Leitura pausada."
          : `Lendo em voz alta (${voz.velocidade}x)…`;
    }
  }

  function pararVoz(silencioso) {
    if (temVoz()) {
      try {
        window.speechSynthesis.cancel();
      } catch (_e) {}
    }
    const estavaAtiva = voz.ativa;
    voz.ativa = false;
    voz.pausada = false;
    voz.utterance = null;
    atualizarControlesVoz();
    if (!silencioso && estavaAtiva) {
      anunciar("Leitura por voz interrompida.");
    }
  }

  function iniciarLeituraTexto(texto) {
    if (!temVoz()) {
      vibrar("erro");
      anunciar("Leitura por voz não está disponível neste navegador.", true);
      return;
    }
    if (!texto) return;
    pararVoz(true);
    try {
      const utt = new window.SpeechSynthesisUtterance(texto);
      utt.lang = "pt-BR";
      utt.rate = voz.velocidade;
      const vozes = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
      const pt = vozes.find((v) => v.lang && v.lang.toLowerCase().startsWith("pt-br"))
        || vozes.find((v) => v.lang && v.lang.toLowerCase().startsWith("pt"));
      if (pt) utt.voice = pt;

      utt.onstart = () => {
        voz.ativa = true;
        voz.pausada = false;
        atualizarControlesVoz();
      };
      utt.onend = () => {
        voz.ativa = false;
        voz.pausada = false;
        voz.utterance = null;
        atualizarControlesVoz();
        anunciar("Leitura em voz alta concluída.");
      };
      utt.onerror = () => {
        voz.ativa = false;
        voz.pausada = false;
        voz.utterance = null;
        atualizarControlesVoz();
      };

      voz.utterance = utt;
      voz.ativa = true;
      voz.pausada = false;
      atualizarControlesVoz();
      window.speechSynthesis.speak(utt);
      vibrar("sucesso");
      anunciar("Iniciando leitura da ficha em voz alta.");
    } catch (_e) {
      voz.ativa = false;
      atualizarControlesVoz();
      vibrar("erro");
      anunciar("Não foi possível iniciar a leitura por voz neste aparelho.", true);
    }
  }

  function alternarPausaVoz() {
    if (!temVoz() || !voz.ativa) return;
    try {
      if (voz.pausada) {
        window.speechSynthesis.resume();
        voz.pausada = false;
        anunciar("Leitura retomada.");
      } else {
        window.speechSynthesis.pause();
        voz.pausada = true;
        anunciar("Leitura pausada.");
      }
      atualizarControlesVoz();
    } catch (_e) {}
  }

  // ---------- utilidades e anúncios acessíveis (WCAG 4.1.3) ----------
  const { esc, fmtData, ESTADO_TXT, ESTADO_ICONE, NECESSIDADES, ESCALAS_FONTE, ATRIBUTOS_ATITUDINAIS } = C;

  function anunciar(msg, urgente) {
    const alvo = urgente ? $srAlerta : $srAnuncio;
    if (alvo) {
      alvo.textContent = "";
      window.setTimeout(() => {
        alvo.textContent = msg;
      }, 30);
    }
    if ($toast) {
      $toast.textContent = msg;
      $toast.classList.add("on");
      clearTimeout(anunciar._t);
      anunciar._t = setTimeout(() => $toast.classList.remove("on"), 3200);
    }
  }

  function definirTitulo(parte) {
    document.title = parte ? `${parte} — VitrineCentro` : "VitrineCentro — protótipo integrado";
  }

  function estadoBadge(estado, prefixo) {
    const ic = ESTADO_ICONE[estado] || "";
    const txt = ESTADO_TXT[estado] || estado;
    const pre = prefixo ? `${esc(prefixo)}: ` : "";
    return `<span class="estado ${esc(estado)}"><span aria-hidden="true">${ic}</span> ${pre}${esc(txt)}</span>`;
  }

  const negocio = (id) => D.negocios.find((n) => n.id === id);
  const itensDe = (id) => D.itens.filter((i) => i.negocio_id === id && i.ativo);
  const acessoDe = (id) => D.atributos_acesso.filter((a) => a.negocio_id === id);

  // ---------- Radar de Distância Offline (Haversine — sem mapas pagos) ----------
  function distanciaParaNegocio(n) {
    if (!n || radar.status !== "ativo" || !radar.origem) return null;
    return C.calcularDistanciaHaversine(radar.origem.lat, radar.origem.lng, n.lat, n.lng);
  }

  function ativarRadarGPS(focoSeletor) {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      radar.status = "erro";
      radar.erro = "Este navegador não oferece geolocalização. Use a simulação no Centro de Aracaju.";
      vibrar("erro");
      anunciar(radar.erro, true);
      rotear(focoSeletor);
      return;
    }

    radar.status = "buscando";
    radar.erro = "";
    rotear(focoSeletor);
    anunciar("Solicitando localização para o Radar de Distância Offline.");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        radar.status = "ativo";
        radar.modo = "gps";
        radar.origem = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          rotulo: "Sua localização atual (cálculo 100% offline)",
        };
        radar.erro = "";
        vibrar("sucesso");
        anunciar("Radar offline ativado! Distâncias calculadas em linha reta no seu aparelho.");
        rotear(focoSeletor);
      },
      (err) => {
        radar.status = "erro";
        if (err && err.code === 1) {
          radar.erro = "Permissão de localização recusada. Você pode testar agora com a simulação no Centro de Aracaju.";
        } else if (err && err.code === 3) {
          radar.erro = "O GPS demorou para responder. Tente novamente ou use a simulação no Centro de Aracaju.";
        } else {
          radar.erro = "Não foi possível obter sua localização agora. Use a simulação no Centro de Aracaju.";
        }
        vibrar("erro");
        anunciar(radar.erro, true);
        rotear(focoSeletor);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }

  function ativarRadarDemo(focoSeletor) {
    radar.status = "ativo";
    radar.modo = "demo";
    radar.origem = { ...C.PONTO_CENTRO_ARACAJU };
    radar.erro = "";
    vibrar("sucesso");
    anunciar("Radar offline ativado no ponto de demonstração: Praça Fausto Cardoso, Centro de Aracaju.");
    rotear(focoSeletor);
  }

  function desativarRadar(focoSeletor) {
    radar.status = "inativo";
    radar.origem = null;
    radar.modo = null;
    radar.erro = "";
    anunciar("Radar de distância desativado. Coordenadas removidas da memória.");
    rotear(focoSeletor);
  }

  function alternarOrdenacaoRadar(focoSeletor) {
    radar.ordenar = !radar.ordenar;
    rotear(focoSeletor);
    anunciar(
      radar.ordenar
        ? "Lista ordenada da loja mais próxima para a mais distante."
        : "Ordenação padrão restaurada."
    );
  }

  function renderRadarBar() {
    const cls =
      radar.status === "ativo"
        ? " ativo"
        : radar.status === "buscando"
          ? " buscando"
          : "";

    let titulo = "Ver distância a pé";
    let desc =
      "Mostre quantos metros faltam até cada comércio. O cálculo roda no seu aparelho, sem mapas externos nem envio de localização.";
    let acoes = `
      <button type="button" class="btn sec peq" id="bt-radar">Usar meu GPS</button>
      <button type="button" class="btn sec peq" id="bt-radar-demo">Simular no Centro</button>
    `;

    if (radar.status === "buscando") {
      titulo = "Obtendo sua posição…";
      desc = "Autorize a localização no navegador. Suas coordenadas ficam apenas na memória deste aparelho.";
      acoes = `
        <button type="button" class="btn sec peq" id="bt-radar" disabled>Localizando…</button>
        <button type="button" class="btn sec peq" id="bt-radar-demo">Simular no Centro</button>
      `;
    } else if (radar.status === "ativo" && radar.origem) {
      titulo =
        radar.modo === "demo"
          ? "Distâncias a partir da Praça Fausto Cardoso (simulação)"
          : "Distâncias a partir da sua localização";
      desc = `Referência: ${esc(radar.origem.rotulo)}. Distâncias em linha reta com tempo estimado a pé.`;
      acoes = `
        <button type="button" class="btn sec peq" id="bt-radar-ordem" aria-pressed="${radar.ordenar}">Ordenar por mais perto</button>
        <button type="button" class="btn sec peq" id="bt-radar">${radar.modo === "demo" ? "Usar meu GPS" : "Atualizar GPS"}</button>
        <button type="button" class="btn sec peq" id="bt-radar-desativar">Desativar</button>
      `;
    }

    const blocoErro =
      radar.status === "erro" && radar.erro
        ? `<p class="radar-erro" role="alert">${esc(radar.erro)}</p>`
        : "";

    return `<section class="radar-bar${cls}" aria-labelledby="tit-radar">
      <div class="radar-info">
        <div class="radar-icone">${ICO_RADAR}</div>
        <div class="radar-texto">
          <h3 class="radar-titulo" id="tit-radar">${titulo}</h3>
          <p class="radar-desc">${desc}</p>
          ${blocoErro}
        </div>
      </div>
      <div class="radar-acoes">${acoes}</div>
    </section>`;
  }

  function vincularEventosRadar() {
    const btGps = document.getElementById("bt-radar");
    const btDemo = document.getElementById("bt-radar-demo");
    const btOrdem = document.getElementById("bt-radar-ordem");
    const btDesativar = document.getElementById("bt-radar-desativar");

    if (btGps) btGps.addEventListener("click", () => ativarRadarGPS("#bt-radar"));
    if (btDemo) btDemo.addEventListener("click", () => ativarRadarDemo("#bt-radar-ordem"));
    if (btOrdem) btOrdem.addEventListener("click", () => alternarOrdenacaoRadar("#bt-radar-ordem"));
    if (btDesativar) btDesativar.addEventListener("click", () => desativarRadar("#bt-radar"));
  }

  // ---------- Compartilhamento Elegante (Web Share API + Fallback Clipboard) ----------
  async function copiarTextoSeguro(texto) {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(texto);
        return true;
      }
    } catch (_e) {
      // Fallback via textarea oculta abaixo
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = texto;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      ta.style.pointerEvents = "none";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return Boolean(ok);
    } catch (_e) {
      return false;
    }
  }

  function marcarBotaoCompartilhado(botaoEl, rotuloConfirmacao) {
    if (!botaoEl) return;
    if (!botaoEl.dataset.htmlOrig) {
      botaoEl.dataset.htmlOrig = botaoEl.innerHTML;
    }
    botaoEl.classList.add("copiado");
    botaoEl.innerHTML = `${ICO_CHECK} <span>${esc(rotuloConfirmacao)}</span>`;
    clearTimeout(botaoEl._shareTimer);
    botaoEl._shareTimer = window.setTimeout(() => {
      if (!document.contains(botaoEl)) return;
      botaoEl.classList.remove("copiado");
      if (botaoEl.dataset.htmlOrig) {
        botaoEl.innerHTML = botaoEl.dataset.htmlOrig;
      }
    }, 2500);
  }

  async function compartilharPayload(payload, botaoEl) {
    if (!payload) return;

    // 1) Web Share API nativa (mobile e navegadores compatíveis)
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share(payload);
        vibrar("sucesso");
        marcarBotaoCompartilhado(botaoEl, "Compartilhado!");
        anunciar("Ficha compartilhada com sucesso.");
        return;
      } catch (err) {
        if (err && err.name === "AbortError") {
          return; // Usuário cancelou a janela nativa de compartilhamento
        }
        // Se falhar por restrição de iframe/desktop, segue para fallback de cópia
      }
    }

    // 2) Fallback inteligente para desktop: cópia do link direto para área de transferência
    const copiado = await copiarTextoSeguro(payload.url);
    if (copiado) {
      vibrar("sucesso");
      marcarBotaoCompartilhado(botaoEl, "Link copiado!");
      anunciar("Link da ficha copiado! Pronto para colar no WhatsApp, e-mail ou navegador.");
    } else {
      vibrar("erro");
      anunciar("Não foi possível copiar o link automaticamente. Copie o endereço na barra do navegador.", true);
    }
  }

  // ---------- diálogo nativo de confirmação (WCAG 3.3.4) ----------
  function pedirConfirmacao(titulo, descricao, aoConfirmar, gatilho) {
    dialogoCallback = aoConfirmar;
    dialogoRetornoFoco = gatilho || document.activeElement;
    $dlgTit.textContent = titulo;
    $dlgDesc.textContent = descricao;
    if (typeof $dlg.showModal === "function") {
      $dlg.showModal();
      $dlgCancelar.focus();
    } else {
      aoConfirmar();
    }
  }

  function fecharDialogo(confirmado) {
    if ($dlg.open) $dlg.close();
    const cb = dialogoCallback;
    const retorno = dialogoRetornoFoco;
    dialogoCallback = null;
    dialogoRetornoFoco = null;
    if (confirmado && typeof cb === "function") cb();
    if (retorno && document.contains(retorno)) retorno.focus();
  }

  $dlgOk.addEventListener("click", () => fecharDialogo(true));
  $dlgCancelar.addEventListener("click", () => fecharDialogo(false));
  $dlg.addEventListener("cancel", (e) => {
    e.preventDefault();
    fecharDialogo(false);
  });

  // ---------- exportação de roteiro offline (Fase 2: Impressão / PDF / WhatsApp / TXT) ----------
  function abrirExportacaoRoteiro(opcoes, gatilho) {
    const opts = opcoes || {};
    const lojaIds = ler(KEY.lojas, []).filter((id) => negocio(id));
    const itemIds = ler(KEY.itens, []).map((f) => f.item_id);
    const notas = ler(KEY.notas, []);

    const texto = C.gerarTextoRoteiro(D, {
      lojaIds,
      itemIds,
      notas,
      negocioId: opts.negocioId || null,
    });

    roteiroRetornoFoco = gatilho || document.activeElement;
    roteiroNomeArquivo = opts.negocioId
      ? `roteiro-${opts.negocioId}-vitrinecentro.txt`
      : "roteiro-vitrinecentro.txt";

    $roteiroTexto.value = texto;
    if ($areaImpressao) {
      $areaImpressao.innerHTML = `<pre class="folha-impressao">${esc(texto)}</pre>`;
    }

    if (typeof $dlgRoteiro.showModal === "function") {
      $dlgRoteiro.showModal();
      $roteiroTexto.scrollTop = 0;
      $btRotImprimir.focus();
    }
    vibrar("sucesso");
  }

  function fecharExportacaoRoteiro() {
    if ($dlgRoteiro.open) $dlgRoteiro.close();
    const retorno = roteiroRetornoFoco;
    roteiroRetornoFoco = null;
    if (retorno && document.contains(retorno)) retorno.focus();
  }

  $btRotImprimir.addEventListener("click", () => {
    document.body.classList.add("imprimindo-roteiro");
    if ($dlgRoteiro.open) $dlgRoteiro.close();
    window.print();
    window.setTimeout(() => {
      document.body.classList.remove("imprimindo-roteiro");
      if (roteiroRetornoFoco && document.contains(roteiroRetornoFoco)) {
        roteiroRetornoFoco.focus();
      }
    }, 300);
    anunciar("Abrindo janela de impressão ou salvamento em PDF.");
  });

  $btRotCopiar.addEventListener("click", async () => {
    const texto = $roteiroTexto.value;
    let copiado = false;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(texto);
        copiado = true;
      }
    } catch (_e) {
      copiado = false;
    }
    if (!copiado) {
      try {
        $roteiroTexto.focus();
        $roteiroTexto.select();
        copiado = document.execCommand("copy");
      } catch (_e) {
        copiado = false;
      }
    }
    if (copiado) {
      vibrar("sucesso");
      anunciar("Roteiro copiado! Cole no WhatsApp ou bloco de notas.");
    } else {
      vibrar("erro");
      anunciar("Selecione o texto na caixa acima e use Ctrl+C para copiar.", true);
    }
  });

  $btRotBaixar.addEventListener("click", () => {
    try {
      const blob = new Blob([$roteiroTexto.value], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = roteiroNomeArquivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      vibrar("sucesso");
      anunciar("Arquivo de roteiro offline baixado.");
    } catch (_e) {
      vibrar("erro");
      anunciar("Não foi possível baixar o arquivo neste navegador.", true);
    }
  });

  $btRotFechar.addEventListener("click", fecharExportacaoRoteiro);
  $dlgRoteiro.addEventListener("cancel", (e) => {
    e.preventDefault();
    fecharExportacaoRoteiro();
  });

  // ---------- tema da semana ----------
  function temaAtual() {
    const temas = [...D.temas_culturais].sort((a, b) => a.semana_inicio.localeCompare(b.semana_inicio));
    const forcado = ler(KEY.semana, null);
    if (forcado) {
      const t = temas.find((x) => x.id === forcado);
      if (t) return t;
    }
    const hoje = new Date().toISOString().slice(0, 10);
    let atual = temas[0];
    temas.forEach((t) => {
      if (t.semana_inicio <= hoje) atual = t;
    });
    return atual;
  }
  const lugaresDoTema = (t) =>
    D.tema_lugares.filter((x) => x.tema_id === t.id).sort((a, b) => a.ordem - b.ordem);
  const negocioNoTema = (nid, t) =>
    D.tema_lugares.find((x) => x.tema_id === t.id && x.negocio_id === nid);

  // ---------- ilustração acessível (WCAG 1.1.1) ----------
  function ilustracao(n, foto) {
    const cor =
      { "Alimentação": "#c46d22", "Arte e Cultura": "#6d3fb5", "Serviços": "#236c9e" }[n.categoria] ||
      "#666666";
    const titleId = `svg-tit-${esc(n.id)}`;
    return `<figure>
      <svg viewBox="0 0 320 170" role="img" aria-labelledby="${titleId}">
        <title id="${titleId}">${esc(foto.texto_alternativo)}</title>
        <rect width="320" height="170" fill="${cor}" opacity=".22"/>
        <rect x="40" y="40" width="240" height="110" rx="6" fill="${cor}" opacity=".62"/>
        <rect x="135" y="80" width="50" height="70" rx="4" fill="#ffffff" opacity=".9"/>
        <rect x="40" y="28" width="240" height="22" rx="4" fill="${cor}"/>
        <text x="160" y="125" font-size="34" text-anchor="middle" aria-hidden="true">${n.icone}</text>
        <rect x="0" y="150" width="320" height="20" fill="#707070" opacity=".55"/>
      </svg>
      <figcaption>${esc(foto.legenda)}<span class="aut">Texto alternativo: ${esc(foto.texto_alternativo)} · Autorização: exemplo fictício (sem foto real)</span></figcaption>
    </figure>`;
  }

  // ---------- Índice de Acessibilidade Cidadã (Civic Tech — Fase 3) ----------
  function renderIndiceCidadao() {
    const idx = C.calcularIndiceCidadao(D);
    return `<section class="indice-cidadao" aria-labelledby="tit-indice">
      <div class="indice-topo">
        <div>
          <p class="secao-kicker">Panorama cívico · Dados abertos</p>
          <h2 id="tit-indice">Índice de Acessibilidade do Centro</h2>
          <p class="meta">Resumo das condições físicas e de atendimento observadas nos <strong>${idx.totalNegocios} comércios</strong> cadastrados — transparente sobre o que já foi checado e o que ainda precisa de visita.</p>
        </div>
        <button type="button" class="btn sec" id="bt-exportar-inicio">
          Exportar guia offline
        </button>
      </div>

      <div class="indice-resumo" role="list" aria-label="Resumo geral de verificação">
        <div class="indice-kpi" role="listitem">
          <strong>${idx.totalNegocios}</strong>
          <span>comércios mapeados</span>
        </div>
        <div class="indice-kpi" role="listitem">
          <strong>${idx.pctVerificados}%</strong>
          <span>itens verificados (${idx.verificados} de ${idx.totalAtributos})</span>
        </div>
        <div class="indice-kpi indice-kpi-alerta" role="listitem">
          <strong>${idx.pctDesconhecidos}%</strong>
          <span>ainda não verificados (${idx.desconhecidos} de ${idx.totalAtributos})</span>
        </div>
      </div>

      <div class="indice-grid">
        ${idx.indicadores
          .map(
            (ind) => `<article class="indice-card">
              <div class="indice-card-head">
                <span class="indice-grupo">${ind.grupo === "atitudinal" ? "Atendimento e lei" : "Estrutura física"}</span>
                <strong class="indice-pct">${ind.pct}%</strong>
              </div>
              <h3>${esc(ind.rotulo)}</h3>
              <div class="barra-prog" role="progressbar" aria-label="${esc(ind.rotulo)}: ${ind.pct}% dos comércios" aria-valuenow="${ind.pct}" aria-valuemin="0" aria-valuemax="100">
                <div class="barra-prog-fill" style="width:${ind.pct}%"></div>
              </div>
              <p class="meta">
                <strong>${ind.atendidos}</strong> de ${ind.total} confirmados ·
                <strong>${ind.semVerificacao}</strong> sem verificação
              </p>
              <button type="button" class="btn sec peq" data-filtrar-indice="${esc(ind.tipo)}">
                Ver comércios
              </button>
            </article>`
          )
          .join("")}
      </div>
    </section>`;
  }

  // ---------- indicadores do roteiro (header + barra flutuante) ----------
  function atualizarIndicadoresRoteiro() {
    const lojas = D ? ler(KEY.lojas, []).filter((id) => negocio(id)) : ler(KEY.lojas, []);
    const qtd = lojas.length;

    if ($navRoteiroCount) {
      $navRoteiroCount.hidden = qtd === 0;
      $navRoteiroCount.textContent = String(qtd);
      $navRoteiroCount.setAttribute(
        "aria-label",
        qtd === 1 ? "1 comércio salvo no roteiro" : `${qtd} comércios salvos no roteiro`
      );
    }

    if ($barraRoteiro && $barraRoteiroTxt) {
      $barraRoteiro.hidden = qtd === 0;
      $barraRoteiroTxt.textContent =
        qtd === 1 ? "1 comércio no seu roteiro" : `${qtd} comércios no seu roteiro`;
      document.body.classList.toggle("com-barra-roteiro", qtd > 0);
    }
  }

  if ($btBarraExportar) {
    $btBarraExportar.addEventListener("click", () => abrirExportacaoRoteiro({}, $btBarraExportar));
  }

  // ---------- tela: início ----------
  function filtrosAtivos() {
    return Boolean((filtro.q && filtro.q.trim()) || filtro.cat || filtro.nec || filtro.abertoAgora);
  }

  function telaInicio(focoSeletor) {
    definirTitulo("Vitrine do Centro");
    const t = temaAtual();
    const lugares = lugaresDoTema(t);
    const temas = [...D.temas_culturais].sort((a, b) => a.semana_inicio.localeCompare(b.semana_inicio));
    const necFisicas = NECESSIDADES.filter((n) => n.grupo === "fisico");
    const necAtitudinais = NECESSIDADES.filter((n) => n.grupo === "atitudinal");
    const todasAtivo = !filtrosAtivos();
    const temTextoBusca = Boolean(filtro.q && filtro.q.length > 0);

    $app.innerHTML = `
    <section class="hero" aria-labelledby="hero-tit">
      <div class="hero-copy">
        <h1 id="hero-tit">Descubra o comércio do Centro com clareza</h1>
        <p class="hero-sub">Horários, endereços e condições reais de entrada e atendimento para planejar seu passeio a pé.</p>
      </div>

      <div class="hero-busca" role="search" aria-label="Buscar comércios no Centro">
        <label for="q" class="sr-only">Buscar comércio, produto, serviço ou rua</label>
        <div class="busca-box">
          <span class="busca-ico">${ICO_BUSCA}</span>
          <input id="q" type="search" placeholder="Buscar por café, cordel, acarajé, serviços ou rua…" value="${esc(filtro.q)}" autocomplete="off">
          <button type="button" class="btn-limpar-x" id="bt-limpar-q" aria-label="Limpar texto da busca" ${temTextoBusca ? "" : "hidden"}>${ICO_X}</button>
        </div>
      </div>

      <div class="filtros-bar">
        <div class="filtros-rapidos" role="group" aria-label="Filtros rápidos de comércios">
          <button type="button" class="chip chip-quick" id="bt-filtro-todas" data-quick="todas" aria-pressed="${todasAtivo}">Todos</button>
          <button type="button" class="chip chip-quick" data-nec="degrau" aria-pressed="${filtro.nec === "degrau"}">Sem degraus ou rampa</button>
          <button type="button" class="chip chip-quick" data-nec="prioritario" aria-pressed="${filtro.nec === "prioritario"}">Atendimento prioritário</button>
          <button type="button" class="chip chip-quick" data-nec="cao_guia" aria-pressed="${filtro.nec === "cao_guia"}">Aceita cão-guia</button>
          <button type="button" class="chip chip-quick" id="bt-filtro-aberto" data-aberto="true" aria-pressed="${filtro.abertoAgora}">Aberto agora</button>
          <button type="button" class="chip chip-mais" id="bt-mais-filtros" aria-expanded="${maisFiltrosAberto}" aria-controls="painel-mais-filtros">
            ${ICO_SLIDERS} <span>Mais filtros</span>
          </button>
        </div>
        <button type="button" class="btn-limpar-filtros" id="bt-limpar-filtros" ${todasAtivo ? "hidden" : ""}>Limpar filtros</button>
      </div>

      <div id="painel-mais-filtros" class="filtros-avancados" ${maisFiltrosAberto ? "" : "hidden"}>
        <fieldset class="chips">
          <legend>Categoria</legend>
          ${D.categorias
            .map(
              (c) =>
                `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="${filtro.cat === c}">${esc(c)}</button>`
            )
            .join("")}
        </fieldset>
        <fieldset class="chips">
          <legend>Outras condições de acesso (itens ainda não verificados continuam visíveis)</legend>
          ${[...necFisicas, ...necAtitudinais]
            .filter((n) => !["degrau", "prioritario", "cao_guia"].includes(n.tipo))
            .map(
              (n) =>
                `<button type="button" class="chip" data-nec="${esc(n.tipo)}" aria-pressed="${filtro.nec === n.tipo}">${esc(n.rot)}</button>`
            )
            .join("")}
        </fieldset>
      </div>
    </section>

    <section class="secao-lojas" aria-labelledby="tit-busca">
      <div class="secao-lojas-head">
        <h2 id="tit-busca">Comércios no Centro</h2>
        <p class="contador" id="contador" role="status" aria-live="polite" aria-atomic="true"></p>
      </div>
      ${renderRadarBar()}
      <div class="grid" id="lista"></div>
    </section>

    <section class="tema" aria-labelledby="tema-tit">
      <span class="kicker">Roteiro cultural da semana · desde ${fmtData(t.semana_inicio)}</span>
      <h2 id="tema-tit">${esc(t.titulo)}</h2>
      <p>${esc(t.texto)}</p>
      <div class="tema-lugares">
        ${lugares
          .map((l) => {
            const n = negocio(l.negocio_id);
            return `<a class="tl" href="#negocio-${esc(n.id)}">
              <strong>${esc(n.nome)}</strong>
              <span>${esc(l.curiosidade)}</span>
            </a>`;
          })
          .join("")}
      </div>
      <p class="fonte">Fonte: ${esc(t.fonte)} · ${esc(t.aviso_ficticio)}</p>
      <div class="demo-semana">
        <label for="sel-semana">Ver outra semana:</label>
        <select id="sel-semana">
          <option value="">Automático (data atual)</option>
          ${temas
            .map(
              (x) =>
                `<option value="${esc(x.id)}" ${ler(KEY.semana, null) === x.id ? "selected" : ""}>${fmtData(x.semana_inicio)} — ${esc(x.titulo)}</option>`
            )
            .join("")}
        </select>
      </div>
    </section>

    ${renderIndiceCidadao()}`;

    const q = document.getElementById("q");
    const btLimparQ = document.getElementById("bt-limpar-q");
    const btLimpar = document.getElementById("bt-limpar-filtros");
    const btTodas = document.getElementById("bt-filtro-todas");
    const btAberto = document.getElementById("bt-filtro-aberto");
    const btMais = document.getElementById("bt-mais-filtros");
    const painelMais = document.getElementById("painel-mais-filtros");

    function sincronizarBotoesFiltro() {
      const ativo = filtrosAtivos();
      if (btTodas) btTodas.setAttribute("aria-pressed", String(!ativo));
      if (btLimpar) btLimpar.hidden = !ativo;
      if (btLimparQ) btLimparQ.hidden = !q.value.length;
      if (btAberto) btAberto.setAttribute("aria-pressed", String(filtro.abertoAgora));
      $app.querySelectorAll("[data-cat]").forEach((x) => {
        x.setAttribute("aria-pressed", String(filtro.cat === x.dataset.cat));
      });
      $app.querySelectorAll("[data-nec]").forEach((x) => {
        x.setAttribute("aria-pressed", String(filtro.nec === x.dataset.nec));
      });
    }

    q.addEventListener("input", () => {
      filtro.q = q.value;
      sincronizarBotoesFiltro();
      desenharLista(t);
    });

    if (btLimparQ) {
      btLimparQ.addEventListener("click", () => {
        filtro.q = "";
        q.value = "";
        sincronizarBotoesFiltro();
        desenharLista(t);
        anunciar("Texto da busca limpo.");
        q.focus();
      });
    }

    if (btTodas) {
      btTodas.addEventListener("click", () => {
        filtro = { q: "", cat: null, nec: null, abertoAgora: false };
        q.value = "";
        sincronizarBotoesFiltro();
        desenharLista(t);
        anunciar("Exibindo todos os comércios.");
      });
    }

    if (btAberto) {
      btAberto.addEventListener("click", () => {
        filtro.abertoAgora = !filtro.abertoAgora;
        sincronizarBotoesFiltro();
        desenharLista(t);
      });
    }

    if (btMais && painelMais) {
      btMais.addEventListener("click", () => {
        maisFiltrosAberto = !maisFiltrosAberto;
        btMais.setAttribute("aria-expanded", String(maisFiltrosAberto));
        painelMais.hidden = !maisFiltrosAberto;
      });
    }

    $app.querySelectorAll("[data-cat]").forEach((b) => {
      b.addEventListener("click", () => {
        filtro.cat = filtro.cat === b.dataset.cat ? null : b.dataset.cat;
        sincronizarBotoesFiltro();
        desenharLista(t);
      });
    });

    $app.querySelectorAll("[data-nec]").forEach((b) => {
      b.addEventListener("click", () => {
        filtro.nec = filtro.nec === b.dataset.nec ? null : b.dataset.nec;
        sincronizarBotoesFiltro();
        desenharLista(t);
      });
    });

    $app.querySelectorAll("[data-filtrar-indice]").forEach((b) => {
      b.addEventListener("click", () => {
        filtro.nec = b.dataset.filtrarIndice;
        if (!["degrau", "prioritario", "cao_guia"].includes(filtro.nec) && painelMais) {
          maisFiltrosAberto = true;
          painelMais.hidden = false;
          if (btMais) btMais.setAttribute("aria-expanded", "true");
        }
        sincronizarBotoesFiltro();
        desenharLista(t);
        const alvo = document.querySelector(`[data-nec="${filtro.nec}"]`);
        if (alvo) {
          alvo.scrollIntoView({ behavior: "auto", block: "center" });
          alvo.focus();
        }
      });
    });

    btLimpar.addEventListener("click", () => {
      filtro = { q: "", cat: null, nec: null, abertoAgora: false };
      q.value = "";
      sincronizarBotoesFiltro();
      desenharLista(t);
      anunciar("Busca e filtros limpos.");
      q.focus();
    });

    document.getElementById("sel-semana").addEventListener("change", (e) => {
      if (e.target.value) gravar(KEY.semana, e.target.value);
      else localStorage.removeItem(KEY.semana);
      telaInicio("#sel-semana");
      anunciar(`Roteiro cultural atualizado para ${temaAtual().titulo}.`);
    });

    const btExpInicio = document.getElementById("bt-exportar-inicio");
    if (btExpInicio) {
      btExpInicio.addEventListener("click", () => abrirExportacaoRoteiro({}, btExpInicio));
    }

    vincularEventosRadar();
    desenharLista(t);

    if (focoSeletor) {
      const alvo = document.querySelector(focoSeletor);
      if (alvo) alvo.focus();
    }
  }

  function desenharLista(t) {
    const nec = NECESSIDADES.find((n) => n.tipo === filtro.nec) || null;
    let res = C.filtrarNegocios(D, filtro, t.id);
    if (radar.status === "ativo" && radar.origem && radar.ordenar) {
      res = C.ordenarPorDistancia(res, radar.origem);
    }
    const $l = document.getElementById("lista");
    const $cont = document.getElementById("contador");
    const sufixoRadar =
      radar.status === "ativo" && radar.origem
        ? radar.ordenar
          ? " · ordenados por proximidade"
          : " · com distância a pé"
        : "";
    const total = D.negocios.length;
    const textoContagem =
      res.length === total
        ? `Exibindo ${total} ${total === 1 ? "comércio" : "comércios"}${sufixoRadar}`
        : `Exibindo ${res.length} de ${total} ${total === 1 ? "comércio" : "comércios"}${sufixoRadar}`;
    $cont.textContent = textoContagem;

    if (!res.length) {
      $l.innerHTML = `<div class="vazio" style="grid-column:1/-1">
        <div class="vazio-ico">${ICO_BUSCA}</div>
        <h3>Nenhum comércio encontrado</h3>
        <p class="meta">Não encontramos resultados para os filtros atuais. Limpe a busca para explorar todos os comércios do Centro.</p>
        <button type="button" class="btn" id="limpar-vazio">Limpar filtros e ver todos</button>
      </div>`;
      document.getElementById("limpar-vazio").addEventListener("click", () => {
        filtro = { q: "", cat: null, nec: null, abertoAgora: false };
        telaInicio("#q");
        anunciar("Busca e filtros limpos.");
      });
      return;
    }

    const lojasSalvas = ler(KEY.lojas, []);

    $l.innerHTML = res
      .map((n) => {
        const salva = lojasSalvas.includes(n.id);
        const statusHorario = C.estaAbertoAgora(n.horario_informado);
        const seloStatus = statusHorario
          ? `<span class="status-inline ${statusHorario.aberto ? "aberto" : "fechado"}"><span class="status-dot" aria-hidden="true"></span>${esc(statusHorario.rotulo)}</span>`
          : "";

        let seloFiltro = "";
        if (nec) {
          const a = acessoDe(n.id).find((x) => x.tipo === nec.tipo);
          if (a && a.estado === "desconhecido") {
            seloFiltro = `<div class="card-aviso-desc">${estadoBadge(a.estado, nec.rot)}</div>`;
          }
        }

        const dist = distanciaParaNegocio(n);
        const seloDist =
          dist !== null
            ? `<span class="dist-selo" aria-label="Distância em linha reta: ${esc(C.formatarDistancia(dist))}, ${esc(C.estimarCaminhada(dist))}">${ICO_DIST} <span>${esc(C.formatarDistancia(dist))}</span></span>`
            : "";

        const destaques = C.destaquesAcessoNegocio(D, n.id).slice(0, 3);
        const blocoDestaques = destaques.length
          ? `<ul class="card-acesso-lista" aria-label="Condições de acesso observadas em ${esc(n.nome)}">
              ${destaques
                .map(
                  (d) =>
                    `<li class="acesso-tag">${iconeAcesso(d.tipo)} <span>${esc(d.rotulo)}</span></li>`
                )
                .join("")}
            </ul>`
          : `<p class="meta card-sem-destaque">Veja a ficha para conferir as condições de acesso.</p>`;

        return `<article class="card loja-card" aria-labelledby="card-tit-${esc(n.id)}">
          <div class="card-head">
            <span class="card-cat">${esc(n.categoria)}</span>
            <div class="card-head-dir">
              ${seloStatus}
              ${seloDist}
            </div>
          </div>

          <div class="card-body">
            <h3 id="card-tit-${esc(n.id)}" class="card-nome">${esc(n.nome)}</h3>
            <p class="card-end">
              ${ICO_DIST}
              <span><span class="sr-only">Endereço ou referência: </span>${esc(n.referencia_local)}</span>
            </p>
            <p class="card-hor">
              ${ICO_CLOCK}
              <span><span class="sr-only">Horário informado: </span>${esc(n.horario_informado)}</span>
            </p>
            ${blocoDestaques}
            ${seloFiltro}
          </div>

          <div class="card-foot">
            <a class="btn card-btn-detalhes" href="#negocio-${esc(n.id)}">Ver detalhes <span class="sr-only">de ${esc(n.nome)}</span></a>
            <button type="button" class="btn sec card-btn-roteiro${salva ? " no-roteiro" : ""}" data-card-roteiro="${esc(n.id)}" aria-pressed="${salva}" aria-label="${salva ? `Remover ${esc(n.nome)} do meu roteiro` : `Adicionar ${esc(n.nome)} ao meu roteiro`}">
              <span aria-hidden="true">${salva ? "✓" : "+"}</span> <span>${salva ? "No roteiro" : "Roteiro"}</span>
            </button>
          </div>
        </article>`;
      })
      .join("");

    $l.querySelectorAll("[data-card-roteiro]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idLoja = btn.dataset.cardRoteiro;
        const salvoAgora = alternarLoja(idLoja, null, true);
        if (typeof salvoAgora === "boolean") {
          const n = negocio(idLoja);
          btn.classList.toggle("no-roteiro", salvoAgora);
          btn.setAttribute("aria-pressed", String(salvoAgora));
          btn.setAttribute(
            "aria-label",
            salvoAgora
              ? `Remover ${n ? n.nome : "comércio"} do meu roteiro`
              : `Adicionar ${n ? n.nome : "comércio"} ao meu roteiro`
          );
          btn.innerHTML = `<span aria-hidden="true">${salvaTextoIcone(salvoAgora)}</span> <span>${salvoAgora ? "No roteiro" : "Roteiro"}</span>`;
        }
      });
    });
  }

  function salvaTextoIcone(salvo) {
    return salvo ? "✓" : "+";
  }

  // ---------- tela: ficha do negócio ----------
  function telaNegocio(id, focoSeletor) {
    const n = negocio(id);
    if (!n) {
      definirTitulo("Negócio não encontrado");
      $app.innerHTML = `<div class="vazio" role="alert">
        <h1>Negócio não encontrado</h1>
        <p>O endereço informado não corresponde a nenhum negócio cadastrado.</p>
        <a class="btn" href="#inicio">Voltar ao início</a>
      </div>`;
      return;
    }

    definirTitulo(n.nome);
    const t = temaAtual();
    const noTema = negocioNoTema(n.id, t);
    const foto = (D.fotos_autorizadas || []).find((f) => f.negocio_id === n.id);
    const lojas = ler(KEY.lojas, []);
    const salva = lojas.includes(n.id);
    const ordem = Object.keys(D.tipos_acesso);
    const ac = acessoDe(n.id).sort((a, b) => ordem.indexOf(a.tipo) - ordem.indexOf(b.tipo));
    const desc = ac.filter((a) => a.estado === "desconhecido").length;

    const dist = distanciaParaNegocio(n);
    const temCoord = typeof n.lat === "number" && typeof n.lng === "number";
    const blocoDistancia =
      dist !== null
        ? `<div class="dist-ficha" role="region" aria-label="Distância estimada até ${esc(n.nome)}">
            <div class="dist-ficha-info">
              ${ICO_DIST}
              <div>
                <strong>A ${esc(C.formatarDistancia(dist))} de distância</strong> (${esc(C.estimarCaminhada(dist))})
                <span class="dist-ficha-sub">Cálculo 100% offline em linha reta · ${esc(radar.origem.rotulo)}</span>
              </div>
            </div>
            <button type="button" class="btn sec peq" id="bt-ficha-radar-off">Desativar radar</button>
          </div>`
        : temCoord
          ? `<div class="dist-ficha" role="region" aria-label="Radar de distância offline">
              <div class="dist-ficha-info">
                ${ICO_DIST}
                <div>
                  <strong>Quer ver a distância até esta loja?</strong>
                  <span class="dist-ficha-sub">Cálculo offline (Haversine) sem mapas pagos — localização só quando você pedir.</span>
                </div>
              </div>
              <div class="radar-acoes">
                <button type="button" class="btn sec peq" id="bt-ficha-radar-gps">${radar.status === "buscando" ? "Localizando…" : "Ativar Radar"}</button>
                <button type="button" class="btn sec peq" id="bt-ficha-radar-demo">Simular no Centro</button>
              </div>
            </div>`
          : "";

    $app.innerHTML = `
    <nav class="breadcrumb" aria-label="Caminho de navegação">
      <ol>
        <li><a href="#inicio">Vitrine</a></li>
        <li aria-current="page">${esc(n.nome)}</li>
      </ol>
    </nav>

    <div class="ficha-top">
      <section class="info" aria-labelledby="nome-n">
        <p class="secao-kicker">${esc(n.categoria)}</p>
        <h1 id="nome-n">${esc(n.nome)}</h1>
        <dl>
          <dt>Referência</dt><dd>${esc(n.referencia_local)}</dd>
          <dt>Horário</dt><dd>${esc(n.horario_informado)} <em>(informado)</em></dd>
          <dt>Contato</dt><dd>${esc(n.contato_autorizado)}</dd>
          <dt>Confirmado em</dt><dd>${fmtData(n.data_confirmacao)}</dd>
        </dl>

        ${blocoDistancia}

        <div class="barra-voz" role="region" aria-label="Leitura por voz da ficha">
          <button type="button" class="btn" id="bt-voz-ouvir" aria-pressed="false">
            ${ICO_VOZ} <span>Ouvir ficha em voz alta</span>
          </button>
          <button type="button" class="btn sec" id="bt-voz-pausar" aria-pressed="false" hidden>
            Pausar leitura
          </button>
          <label class="voz-vel">
            <span>Velocidade:</span>
            <select id="sel-voz-vel" aria-label="Velocidade da leitura em voz alta">
              <option value="0.85" ${voz.velocidade === 0.85 ? "selected" : ""}>0,85× (devagar)</option>
              <option value="1" ${voz.velocidade === 1 ? "selected" : ""}>1× (normal)</option>
              <option value="1.25" ${voz.velocidade === 1.25 ? "selected" : ""}>1,25× (rápido)</option>
            </select>
          </label>
          <span id="voz-status" class="meta" aria-live="polite">Leitura em português disponível.</span>
        </div>

        <div class="acoes">
          <button type="button" class="btn${salva ? " sec card-btn-roteiro no-roteiro" : ""}" id="bt-loja" aria-pressed="${salva}">
            <span aria-hidden="true">${salva ? "✓" : "+"}</span> <span>${salva ? "No roteiro — remover" : "Adicionar ao roteiro"}</span>
          </button>
          <button type="button" class="btn btn-share" id="bt-compartilhar-negocio">
            ${ICO_SHARE} <span>Compartilhar ficha</span>
          </button>
          <a class="btn sec" href="#anotacoes-${esc(n.id)}">Anotar dúvida</a>
          <button type="button" class="btn sec" id="bt-exp-negocio">Exportar ficha</button>
          <a class="btn sec" href="#sugerir-${esc(n.id)}">Sugerir atualização deste local</a>
        </div>
        ${
          noTema
            ? `<div class="curio"><strong>Roteiro cultural da semana · ${esc(t.titulo)}</strong><p>${esc(noTema.curiosidade)}</p><small>${esc(noTema.fonte_curiosidade)}</small></div>`
            : ""
        }
      </section>
      ${foto ? ilustracao(n, foto) : ""}
    </div>

    <section aria-labelledby="tit-itens">
      <h2 id="tit-itens">O que tem aqui</h2>
      <div class="itens">
        ${
          itensDe(n.id)
            .map(
              (i) => `<article class="card">
                <div class="ic" aria-hidden="true">${i.icone}</div>
                <h3>${esc(i.titulo)}</h3>
                <p class="meta">${esc(i.descricao_curta)}</p>
                <a class="btn sec peq" href="#item-${esc(i.id)}">Ver item <span class="sr-only">${esc(i.titulo)}</span></a>
              </article>`
            )
            .join("") || `<p class="vazio">Nenhum item cadastrado.</p>`
        }
      </div>
    </section>

    <section aria-labelledby="acesso">
      <h2 id="acesso">Condições de acesso (físicas e atitudinais)</h2>
      <p class="meta">Informações por item, com dimensão, estado e fonte. Inclui direitos previstos em lei (cão-guia, atendimento prioritário e Braille). Não é selo de acessibilidade. ${
        desc ? `<strong>${desc} item(ns) ainda desconhecido(s)</strong> — vale confirmar antes de ir.` : ""
      }</p>
      <ul class="legenda-estados" aria-label="Legenda dos estados de acesso">
        <li>${estadoBadge("observado")} <span>a condição foi vista ou informada</span></li>
        <li>${estadoBadge("nao_observado")} <span>a condição não foi vista</span></li>
        <li>${estadoBadge("desconhecido")} <span>ninguém verificou</span></li>
      </ul>
      <table class="acesso" role="table">
        <caption class="sr-only">Condições de acesso físicas e atitudinais de ${esc(n.nome)}</caption>
        <thead role="rowgroup">
          <tr role="row">
            <th scope="col" role="columnheader">Condição</th>
            <th scope="col" role="columnheader">Dimensão</th>
            <th scope="col" role="columnheader">Estado</th>
            <th scope="col" role="columnheader">Descrição</th>
            <th scope="col" role="columnheader">Fonte</th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          ${ac
            .map((a) => {
              const dim = ATRIBUTOS_ATITUDINAIS.has(a.tipo) ? "Atitudinal / Lei" : "Física";
              return `<tr role="row">
                <th scope="row" role="rowheader">${esc(D.tipos_acesso[a.tipo] || a.tipo)}</th>
                <td role="cell" data-label="Dimensão"><span class="tag">${dim}</span></td>
                <td role="cell" data-label="Estado">${estadoBadge(a.estado)}</td>
                <td role="cell" data-label="Descrição">${esc(a.descricao)}</td>
                <td role="cell" data-label="Fonte" class="meta">${esc(a.fonte_observacao)}</td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </section>`;

    document.getElementById("bt-loja").addEventListener("click", () => alternarLoja(n.id, "#bt-loja"));

    const btCompartilhar = document.getElementById("bt-compartilhar-negocio");
    btCompartilhar.addEventListener("click", () => {
      const payload = C.montarDadosCompartilhamento(D, n.id, window.location.href);
      compartilharPayload(payload, btCompartilhar);
    });

    const btFichaGps = document.getElementById("bt-ficha-radar-gps");
    if (btFichaGps) {
      btFichaGps.addEventListener("click", () => ativarRadarGPS("#bt-ficha-radar-off"));
    }
    const btFichaDemo = document.getElementById("bt-ficha-radar-demo");
    if (btFichaDemo) {
      btFichaDemo.addEventListener("click", () => ativarRadarDemo("#bt-ficha-radar-off"));
    }
    const btFichaOff = document.getElementById("bt-ficha-radar-off");
    if (btFichaOff) {
      btFichaOff.addEventListener("click", () => desativarRadar("#bt-ficha-radar-gps"));
    }

    const btExp = document.getElementById("bt-exp-negocio");
    btExp.addEventListener("click", () => abrirExportacaoRoteiro({ negocioId: n.id }, btExp));

    document.getElementById("bt-voz-ouvir").addEventListener("click", () => {
      if (voz.ativa) {
        pararVoz(false);
      } else {
        const roteiroVoz = C.montarTextoNarracaoNegocio(D, n.id, t);
        iniciarLeituraTexto(roteiroVoz);
      }
    });
    document.getElementById("bt-voz-pausar").addEventListener("click", alternarPausaVoz);
    document.getElementById("sel-voz-vel").addEventListener("change", (e) => {
      voz.velocidade = Number(e.target.value) || 1;
      if (voz.ativa) {
        const roteiroVoz = C.montarTextoNarracaoNegocio(D, n.id, t);
        iniciarLeituraTexto(roteiroVoz);
      } else {
        anunciar(`Velocidade de leitura ajustada para ${voz.velocidade} vezes.`);
      }
    });
    atualizarControlesVoz();

    if (focoSeletor) {
      const alvo = document.querySelector(focoSeletor);
      if (alvo) alvo.focus();
    }
  }

  function alternarLoja(id, focoSeletor, semRotear) {
    let l = ler(KEY.lojas, []);
    const n = negocio(id);
    const nome = n ? n.nome : "Loja";
    let salva = false;
    if (l.includes(id)) {
      l = l.filter((x) => x !== id);
      gravar(KEY.lojas, l);
      salva = false;
      anunciar(`${nome} removida do seu roteiro.`);
    } else if (l.length >= LIM_LOJAS) {
      vibrar("erro");
      anunciar(`Limite de ${LIM_LOJAS} lojas no roteiro atingido. Remova uma em Meu Roteiro.`, true);
      return null;
    } else {
      l.push(id);
      gravar(KEY.lojas, l);
      salva = true;
      vibrar("sucesso");
      anunciar(`${nome} adicionada ao seu roteiro!`);
    }
    atualizarIndicadoresRoteiro();
    if (!semRotear) {
      rotear(focoSeletor);
    }
    return salva;
  }

  function alternarItem(id, focoSeletor) {
    let l = ler(KEY.itens, []);
    const item = D.itens.find((x) => x.id === id);
    const nome = item ? item.titulo : "Item";
    if (l.some((f) => f.item_id === id)) {
      l = l.filter((f) => f.item_id !== id);
      gravar(KEY.itens, l);
      anunciar(`${nome} removido dos favoritos.`);
    } else if (l.length >= LIM_ITENS) {
      vibrar("erro");
      anunciar(`Limite de ${LIM_ITENS} itens favoritos atingido. Remova um para salvar outro.`, true);
      return;
    } else {
      l.push({
        id: "fav" + Date.now(),
        item_id: id,
        salvo_em: new Date().toISOString(),
        dispositivo_local: true,
        origem_dado: "exemplo_ficticio",
      });
      gravar(KEY.itens, l);
      vibrar("sucesso");
      anunciar(`${nome} favoritado!`);
    }
    rotear(focoSeletor);
  }

  // ---------- tela: item ----------
  function telaItem(id, focoSeletor) {
    const i = D.itens.find((x) => x.id === id);
    if (!i) {
      definirTitulo("Item não encontrado");
      $app.innerHTML = `<div class="vazio" role="alert">
        <h1>Item não encontrado</h1>
        <p>O item solicitado não está disponível.</p>
        <a class="btn" href="#inicio">Voltar ao início</a>
      </div>`;
      return;
    }
    const n = negocio(i.negocio_id);
    const fav = ler(KEY.itens, []).some((f) => f.item_id === id);
    definirTitulo(i.titulo);

    $app.innerHTML = `
    <nav class="breadcrumb" aria-label="Caminho de navegação">
      <ol>
        <li><a href="#inicio">Início</a></li>
        <li><a href="#negocio-${esc(n.id)}">${esc(n.nome)}</a></li>
        <li aria-current="page">${esc(i.titulo)}</li>
      </ol>
    </nav>
    <article class="card" style="max-width:580px">
      <div class="ic" aria-hidden="true" style="font-size:3rem">${i.icone}</div>
      <h1>${esc(i.titulo)}</h1>
      <p>${esc(i.descricao_curta)}</p>
      <p class="meta">Oferecido por <a href="#negocio-${esc(n.id)}">${esc(n.nome)}</a> · <span aria-hidden="true">🕒</span> <span class="sr-only">Horário: </span>${esc(n.horario_informado)} (informado)</p>
      <p class="meta">Contato: ${esc(n.contato_autorizado)}</p>
      <div class="acoes">
        <button type="button" class="btn" id="bt-fav" aria-pressed="${fav}">
          <span aria-hidden="true">${fav ? "♥" : "♡"}</span> ${fav ? "Favorito — remover" : "Favoritar item"}
        </button>
        <button type="button" class="btn btn-share" id="bt-compartilhar-item">
          ${ICO_SHARE} <span>Compartilhar item</span>
        </button>
        <a class="btn sec" href="#negocio-${esc(n.id)}-acesso">Ver condições de acesso</a>
      </div>
    </article>`;

    document.getElementById("bt-fav").addEventListener("click", () => alternarItem(i.id, "#bt-fav"));
    const btShareItem = document.getElementById("bt-compartilhar-item");
    btShareItem.addEventListener("click", () => {
      const payload = C.montarDadosCompartilhamentoItem(D, i.id, window.location.href);
      compartilharPayload(payload, btShareItem);
    });
    if (focoSeletor) {
      const alvo = document.querySelector(focoSeletor);
      if (alvo) alvo.focus();
    }
  }

  // ---------- tela: meu roteiro / favoritos ----------
  function telaFavoritos(focoSeletor) {
    definirTitulo("Meu Roteiro");
    const fi = ler(KEY.itens, []).filter((f) => D.itens.some((i) => i.id === f.item_id));
    const fl = ler(KEY.lojas, []).filter((id) => negocio(id));

    $app.innerHTML = `
    <h1 id="tit-meu-roteiro" tabindex="-1">Meu Roteiro</h1>
    <p class="meta">Os comércios e itens salvos ficam guardados apenas neste aparelho, prontos para consultar offline ou exportar.</p>
    <div class="acoes">
      <button type="button" class="btn" id="bt-exp-fav">Exportar roteiro</button>
      <a class="btn sec" href="#anotacoes">Minhas anotações e dúvidas</a>
    </div>

    <section aria-labelledby="tit-fav-lojas">
      <h2 id="tit-fav-lojas" tabindex="-1">Comércios no roteiro (${fl.length}/${LIM_LOJAS})</h2>
      ${
        fl.length
          ? `<ul class="lista">${fl
              .map((id) => {
                const n = negocio(id);
                return `<li>
                  <div class="lista-item-info">
                    <a href="#negocio-${esc(n.id)}"><strong>${esc(n.nome)}</strong></a>
                    <span class="meta">${esc(n.referencia_local)} · ${esc(n.horario_informado)}</span>
                  </div>
                  <button type="button" class="btn sec peq" data-rm-loja="${esc(n.id)}" aria-label="Remover ${esc(n.nome)} do meu roteiro">Remover</button>
                </li>`;
              })
              .join("")}</ul>`
          : `<div class="vazio">
              <div class="vazio-ico">${ICO_MAP_EMPTY}</div>
              <h3>Seu roteiro ainda está vazio</h3>
              <p class="meta">Toque em “+ Roteiro” nos comércios da vitrine para montar sua caminhada pelo Centro e exportar para WhatsApp ou PDF.</p>
              <a class="btn" href="#inicio">Explorar vitrine do Centro</a>
            </div>`
      }
    </section>

    <section aria-labelledby="tit-fav-itens">
      <h2 id="tit-fav-itens" tabindex="-1">Itens favoritos (${fi.length}/${LIM_ITENS})</h2>
      ${
        fi.length
          ? `<ul class="lista">${fi
              .map((f) => {
                const i = D.itens.find((x) => x.id === f.item_id);
                const n = negocio(i.negocio_id);
                return `<li>
                  <div class="lista-item-info">
                    <a href="#item-${esc(i.id)}"><strong>${esc(i.titulo)}</strong></a>
                    <span class="meta">${esc(n.nome)}</span>
                  </div>
                  <button type="button" class="btn sec peq" data-rm-item="${esc(i.id)}" aria-label="Remover ${esc(i.titulo)} dos itens favoritos">Remover</button>
                </li>`;
              })
              .join("")}</ul>`
          : `<div class="vazio vazio-compacto">
              <h3>Nenhum item salvo por aqui</h3>
              <p class="meta">Abra a ficha de um comércio para salvar produtos ou serviços específicos que deseja conferir.</p>
              <a class="btn sec" href="#inicio">Ver comércios da vitrine</a>
            </div>`
      }
    </section>`;

    const btExpFav = document.getElementById("bt-exp-fav");
    btExpFav.addEventListener("click", () => abrirExportacaoRoteiro({}, btExpFav));

    $app.querySelectorAll("[data-rm-item]").forEach((b) => {
      b.addEventListener("click", () => alternarItem(b.dataset.rmItem, "#tit-fav-itens"));
    });
    $app.querySelectorAll("[data-rm-loja]").forEach((b) => {
      b.addEventListener("click", () => alternarLoja(b.dataset.rmLoja, "#tit-fav-lojas"));
    });

    if (focoSeletor) {
      const alvo = document.querySelector(focoSeletor);
      if (alvo) alvo.focus();
    }
  }

  // ---------- tela: anotações ----------
  function telaAnotacoes(pre, focoSeletor) {
    definirTitulo("Anotações e dúvidas");
    const notas = ler(KEY.notas, []);
    const lojas = ler(KEY.lojas, []).filter((id) => negocio(id));
    const sugeridas = [];
    lojas.forEach((id) => {
      const n = negocio(id);
      acessoDe(id)
        .filter((a) => a.estado === "desconhecido")
        .forEach((a) => sugeridas.push(`${n.nome}: confirmar "${D.tipos_acesso[a.tipo] || a.tipo}"`));
    });

    $app.innerHTML = `
    <div class="acoes">
      <button type="button" class="btn sec peq" id="bt-voltar-roteiro" aria-label="Voltar para Meu Roteiro">← Voltar para Meu Roteiro</button>
    </div>
    <h1>Minhas anotações e dúvidas</h1>
    <p class="meta">Ficam só neste aparelho. Nada é enviado ao estabelecimento nem publicado.</p>

    <form id="f-nota" novalidate>
      <div class="campo">
        <label class="lbl" for="sel-n">Sobre qual lugar?</label>
        <select id="sel-n" class="campo-sel">
          <option value="">Geral</option>
          ${D.negocios
            .map(
              (n) =>
                `<option value="${esc(n.id)}" ${pre === n.id ? "selected" : ""}>${esc(n.nome)}</option>`
            )
            .join("")}
        </select>
      </div>

      <div class="campo">
        <label class="lbl" for="txt">O que você achou ou quer confirmar? <span aria-hidden="true">*</span><span class="sr-only">(campo obrigatório)</span></label>
        <textarea id="txt" maxlength="280" required aria-required="true" aria-describedby="ajuda-txt cont-txt erro-txt" placeholder="Ex.: Perguntar se o banheiro está liberado ao público."></textarea>
        <div class="ajuda-linha">
          <span id="ajuda-txt" class="meta">Não escreva nomes, telefones ou dados pessoais.</span>
          <span id="cont-txt" class="meta" aria-live="polite">0 de 280 caracteres</span>
        </div>
        <p id="erro-txt" class="msg-erro" role="alert"></p>
      </div>

      <div class="acoes">
        <button class="btn" type="submit">Salvar anotação</button>
        <button type="button" class="btn sec" id="bt-exp-notas">Exportar roteiro e dúvidas</button>
      </div>
    </form>

    <section aria-labelledby="tit-duvidas">
      <h2 id="tit-duvidas">Dúvidas sugeridas</h2>
      <p class="meta">Criadas automaticamente a partir de itens ainda não verificados nos comércios do seu roteiro.</p>
      ${
        sugeridas.length
          ? `<ul class="lista">${sugeridas
              .map((s) => `<li><span>${esc(s)}</span></li>`)
              .join("")}</ul>`
          : `<div class="vazio vazio-compacto">
              <h3>Nenhuma dúvida sugerida ainda</h3>
              <p class="meta">Adicione um comércio ao seu roteiro para receber sugestões do que confirmar antes de sair.</p>
              <a class="btn sec" href="#inicio">Escolher comércios na vitrine</a>
            </div>`
      }
    </section>

    <section aria-labelledby="tit-notas">
      <h2 id="tit-notas" tabindex="-1">Anotações salvas (${notas.length})</h2>
      ${
        notas.length
          ? `<ul class="lista">${notas
              .map((x) => {
                const n = negocio(x.negocio_id);
                const rotuloLugar = n ? n.nome : "Geral";
                return `<li>
                  <div class="lista-item-info">
                    <strong>${esc(rotuloLugar)}</strong>
                    <span>${esc(x.texto)} <span class="meta">(${new Date(x.data).toLocaleDateString("pt-BR")})</span></span>
                  </div>
                  <button type="button" class="btn sec peq" data-rm-nota="${esc(x.id)}" aria-label="Remover anotação sobre ${esc(rotuloLugar)}">Remover</button>
                </li>`;
              })
              .join("")}</ul>`
          : `<div class="vazio">
              <div class="vazio-ico">${ICO_NOTE_EMPTY}</div>
              <h3>Nenhuma anotação salva</h3>
              <p class="meta">Registre lembretes rápidos ou perguntas para fazer ao chegar no comércio. Tudo fica só no seu aparelho.</p>
              <button type="button" class="btn sec" id="bt-focar-nota">Escrever primeira anotação</button>
            </div>`
      }
    </section>`;

    const $txt = document.getElementById("txt");
    const $erro = document.getElementById("erro-txt");
    const $cont = document.getElementById("cont-txt");
    const btExpNotas = document.getElementById("bt-exp-notas");
    const btFocarNota = document.getElementById("bt-focar-nota");

    const btVoltarRoteiro = document.getElementById("bt-voltar-roteiro");
    if (btVoltarRoteiro) {
      btVoltarRoteiro.addEventListener("click", () => {
        definirMenuMobile(false);
        definirPopoverA11y(false);
        pararVoz(true);
        try {
          history.pushState(null, "", "#favoritos");
        } catch {
          location.hash = "#favoritos";
        }
        rotear("#tit-meu-roteiro");
        window.scrollTo(0, 0);
        anunciar(`Página carregada: ${document.title}`);
      });
    }

    btExpNotas.addEventListener("click", () => abrirExportacaoRoteiro({}, btExpNotas));
    if (btFocarNota) {
      btFocarNota.addEventListener("click", () => $txt.focus());
    }

    $txt.addEventListener("input", () => {
      $cont.textContent = `${$txt.value.length} de 280 caracteres`;
      if ($txt.value.trim()) {
        $txt.removeAttribute("aria-invalid");
        $erro.textContent = "";
      }
    });

    document.getElementById("f-nota").addEventListener("submit", (e) => {
      e.preventDefault();
      const txt = $txt.value.trim();
      if (!txt) {
        vibrar("erro");
        $txt.setAttribute("aria-invalid", "true");
        $erro.textContent = "Escreva sua dúvida ou anotação antes de salvar.";
        anunciar("Erro no formulário: escreva sua anotação antes de salvar.", true);
        $txt.focus();
        return;
      }
      const l = ler(KEY.notas, []);
      l.unshift({
        id: "nt" + Date.now(),
        negocio_id: document.getElementById("sel-n").value || null,
        texto: txt,
        data: new Date().toISOString(),
      });
      gravar(KEY.notas, l.slice(0, 30));
      vibrar("sucesso");
      anunciar("Anotação salva neste aparelho.");
      telaAnotacoes(null, "#tit-notas");
    });

    $app.querySelectorAll("[data-rm-nota]").forEach((b) => {
      b.addEventListener("click", () => {
        gravar(
          KEY.notas,
          ler(KEY.notas, []).filter((x) => x.id !== b.dataset.rmNota)
        );
        anunciar("Anotação removida.");
        telaAnotacoes(null, "#tit-notas");
      });
    });

    if (focoSeletor) {
      const alvo = document.querySelector(focoSeletor);
      if (alvo) alvo.focus();
    }
  }

  // ---------- tela: colaborar / curadoria colaborativa (#sugerir) ----------
  function fmtDataHora(iso) {
    try {
      return new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (_e) {
      return String(iso || "");
    }
  }

  function telaSugerir(idLoja, focoSeletor) {
    definirTitulo("Colaborar");
    const lojaPre = idLoja ? negocio(idLoja) : null;
    const estabInicial = lojaPre
      ? `${lojaPre.nome} — ${lojaPre.referencia_local}`
      : "";
    const perfilInicial = lojaPre
      ? C.PERFIS_CURADORIA[2]
      : C.PERFIS_CURADORIA[0];
    const fila = ler(KEY.curadoria, []);

    $app.innerHTML = `<section aria-labelledby="tit-sugerir">
      <h1 id="tit-sugerir">Colaborar com a VitrineCentro</h1>
      <div class="aviso" role="note">
        <p><strong>Curadoria colaborativa:</strong> sua sugestão é enviada para análise da equipe (CDL/Sebrae) quando há conexão com a internet e também fica salva localmente neste navegador (localStorage) para consulta.</p>
      </div>

      ${
        lojaPre
          ? `<p class="meta">Atualizando informações de <strong>${esc(lojaPre.nome)}</strong>. <a href="#negocio-${esc(lojaPre.id)}">Voltar à ficha da loja</a></p>`
          : `<p class="meta">Espaço aberto para lojistas cadastrarem ou atualizarem seus negócios e para cidadãos/visitantes sugerirem correções ou melhorias de acessibilidade.</p>`
      }

      <form id="f-sugerir" class="form-sugerir" novalidate>
        <div class="campo">
          <label class="lbl" for="sug-perfil">Perfil e Tipo</label>
          <select id="sug-perfil" name="perfil" class="campo-sel" required>
            ${C.PERFIS_CURADORIA.map(
              (p) =>
                `<option value="${esc(p)}" ${p === perfilInicial ? "selected" : ""}>${esc(p)}</option>`
            ).join("")}
          </select>
        </div>

        <div class="campo">
          <label class="lbl" for="sug-estabelecimento">Nome do Estabelecimento e Endereço/Rua <span aria-hidden="true">*</span><span class="sr-only">(campo obrigatório)</span></label>
          <input id="sug-estabelecimento" name="estabelecimento" type="text" class="campo-inp" maxlength="160" required aria-required="true" aria-describedby="erro-sug-estab" placeholder="Ex.: Café da Praça — Praça Fausto Cardoso, nº 42" value="${esc(estabInicial)}">
          <p id="erro-sug-estab" class="msg-erro" role="alert"></p>
        </div>

        <div class="campo">
          <label class="lbl" for="sug-informacao">O que deseja informar <span aria-hidden="true">*</span><span class="sr-only">(campo obrigatório)</span></label>
          <textarea id="sug-informacao" name="informacao" maxlength="600" required aria-required="true" aria-describedby="ajuda-sug-info erro-sug-info" placeholder="Ex.: novo horário, telefone, ou condição de acessibilidade (rampa, piso tátil, etc)."></textarea>
          <span id="ajuda-sug-info" class="meta">Descreva o novo horário, contato ou condição de acessibilidade física/atitudinal observada.</span>
          <p id="erro-sug-info" class="msg-erro" role="alert"></p>
        </div>

        <div class="campo">
          <label class="lbl" id="lbl-sug-contato" for="sug-contato">Validação do Lojista — CNPJ ou WhatsApp comercial (obrigatório)</label>
          <input id="sug-contato" name="contato" type="text" class="campo-inp" maxlength="120" required aria-required="true" aria-describedby="ajuda-sug-contato erro-sug-contato" placeholder="Ex.: CNPJ ou WhatsApp oficial da loja para verificação">
          <span id="ajuda-sug-contato" class="meta">Usado pela equipe de curadoria (CDL/Sebrae) para confirmar a veracidade e evitar trotes.</span>
          <p id="erro-sug-contato" class="msg-erro" role="alert"></p>
        </div>

        <div class="acoes">
          <button type="submit" class="btn" id="bt-enviar-sugestao">Enviar para curadoria</button>
        </div>
      </form>

      <section aria-labelledby="tit-curadoria">
        <h2 id="tit-curadoria" tabindex="-1">Solicitações em Análise (Curadoria Local) (${fila.length})</h2>
        <p class="meta">Registro salvo apenas neste aparelho para acompanhamento e demonstração do fluxo de curadoria.</p>
        ${
          fila.length
            ? `<ul class="lista-curadoria">${fila
                .map((item) => {
                  const aprovado = item.status === "aprovado";
                  const seloStatus = aprovado
                    ? `<span class="estado observado"><span aria-hidden="true">✓</span> Aprovado</span>`
                    : `<span class="estado desconhecido"><span aria-hidden="true">⏳</span> Pendente</span>`;
                  const seloEnvio = item.enviadoEmail
                    ? `<span class="badge-envio enviado"><span aria-hidden="true">✉️</span> Enviado à curadoria</span>`
                    : `<span class="badge-envio offline"><span aria-hidden="true">💾</span> Salvo offline</span>`;
                  const textoContato = item.contato ? esc(item.contato) : "Envio anônimo (não informado)";
                  return `<li>
                    <article class="curadoria-item${aprovado ? " aprovado" : ""}">
                      <div class="curadoria-topo">
                        <span class="tag">${esc(item.perfil)}</span>
                        ${seloStatus}
                        ${seloEnvio}
                      </div>
                      <h3>${esc(item.estabelecimento)}</h3>
                      <p>${esc(item.informacao)}</p>
                      <p class="meta"><strong>Validação / Contato:</strong> ${textoContato} · <time datetime="${esc(item.data)}">${esc(fmtDataHora(item.data))}</time></p>
                      <div class="acoes">
                        ${
                          !aprovado
                            ? `<button type="button" class="btn sec peq" data-aprovar-cur="${esc(item.id)}" aria-label="Simular aprovação da solicitação para ${esc(item.estabelecimento)}"><span aria-hidden="true">✓</span> Simular Aprovação</button>`
                            : ""
                        }
                        <button type="button" class="btn sec peq" data-excluir-cur="${esc(item.id)}" aria-label="Excluir solicitação para ${esc(item.estabelecimento)}">Excluir</button>
                      </div>
                    </article>
                  </li>`;
                })
                .join("")}</ul>`
            : `<div class="vazio vazio-compacto">
                <h3>Nenhuma solicitação enviada ainda</h3>
                <p class="meta">Use o formulário acima para cadastrar um comércio ou avisar sobre mudanças de horário e acessibilidade.</p>
                <button type="button" class="btn sec" id="bt-focar-sugerir">Preencher formulário</button>
              </div>`
        }
      </section>
    </section>`;

    const $form = document.getElementById("f-sugerir");
    const $perfil = document.getElementById("sug-perfil");
    const $estab = document.getElementById("sug-estabelecimento");
    const $info = document.getElementById("sug-informacao");
    const $contato = document.getElementById("sug-contato");
    const $lblContato = document.getElementById("lbl-sug-contato");
    const $ajudaContato = document.getElementById("ajuda-sug-contato");
    const $errEstab = document.getElementById("erro-sug-estab");
    const $errInfo = document.getElementById("erro-sug-info");
    const $errContato = document.getElementById("erro-sug-contato");
    const $btEnviar = document.getElementById("bt-enviar-sugestao");

    function atualizarCampoContato() {
      const ehCidadao = $perfil.value === C.PERFIS_CURADORIA[2];
      if (ehCidadao) {
        $contato.required = false;
        $contato.removeAttribute("required");
        $contato.removeAttribute("aria-required");
        $contato.removeAttribute("aria-invalid");
        $errContato.textContent = "";
        $lblContato.textContent = "Seu nome ou contato (opcional — você pode enviar anonimamente)";
        $contato.placeholder = "Opcional (ex.: seu nome ou WhatsApp para retorno)";
        $ajudaContato.textContent =
          "Se preferir, deixe em branco para colaborar anonimamente.";
      } else {
        $contato.required = true;
        $contato.setAttribute("required", "");
        $contato.setAttribute("aria-required", "true");
        $lblContato.textContent = "Validação do Lojista — CNPJ ou WhatsApp comercial (obrigatório)";
        $contato.placeholder = "Ex.: CNPJ ou WhatsApp oficial da loja para verificação";
        $ajudaContato.textContent =
          "Usado pela equipe de curadoria (CDL/Sebrae) para confirmar a veracidade e evitar trotes.";
      }
    }

    atualizarCampoContato();
    $perfil.addEventListener("change", atualizarCampoContato);

    const limparErroCampo = (campo, errEl) => {
      campo.addEventListener("input", () => {
        if (campo.value.trim()) {
          campo.removeAttribute("aria-invalid");
          errEl.textContent = "";
        }
      });
    };
    limparErroCampo($estab, $errEstab);
    limparErroCampo($info, $errInfo);
    limparErroCampo($contato, $errContato);

    const btFocarSugerir = document.getElementById("bt-focar-sugerir");
    if (btFocarSugerir) {
      btFocarSugerir.addEventListener("click", () => $estab.focus());
    }

    $form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const entrada = {
        perfil: $perfil.value,
        estabelecimento: $estab.value,
        informacao: $info.value,
        contato: $contato.value,
        loja_id: lojaPre ? lojaPre.id : null,
      };
      const validacao = C.criarRegistroCuradoria(entrada, false);
      if (!validacao.ok) {
        vibrar("erro");
        let primeiroInvalido = null;
        const pares = [
          ["estabelecimento", $estab, $errEstab],
          ["informacao", $info, $errInfo],
          ["contato", $contato, $errContato],
        ];
        pares.forEach(([chave, el, errEl]) => {
          if (validacao.erros[chave]) {
            el.setAttribute("aria-invalid", "true");
            errEl.textContent = validacao.erros[chave];
            if (!primeiroInvalido) primeiroInvalido = el;
          } else {
            el.removeAttribute("aria-invalid");
            errEl.textContent = "";
          }
        });
        anunciar("Verifique os campos obrigatórios destacados no formulário de colaboração.", true);
        if (primeiroInvalido) primeiroInvalido.focus();
        return;
      }

      $btEnviar.disabled = true;
      $btEnviar.textContent = "Enviando…";

      let enviadoEmail = false;
      if (typeof fetch === "function" && navigator.onLine !== false) {
        try {
          const resp = await fetch(FORMSPREE_URL, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              perfil: validacao.registro.perfil,
              estabelecimento: validacao.registro.estabelecimento,
              informacao: validacao.registro.informacao,
              contato: validacao.registro.contato || "Anônimo (não informado)",
              loja_id: validacao.registro.loja_id,
              origem: "VitrineCentro PWA",
              data: validacao.registro.data,
            }),
          });
          enviadoEmail = Boolean(resp && resp.ok);
        } catch (_err) {
          enviadoEmail = false;
        }
      }

      const registroFinal = { ...validacao.registro, enviadoEmail };
      const atual = ler(KEY.curadoria, []);
      atual.unshift(registroFinal);
      gravar(KEY.curadoria, atual.slice(0, 50));

      vibrar("sucesso");
      anunciar(
        enviadoEmail
          ? "Sugestão enviada à curadoria e salva localmente com status Pendente."
          : "Sem conexão no momento: sugestão salva offline na fila de curadoria local."
      );
      telaSugerir(null, "#tit-curadoria");
    });

    $app.querySelectorAll("[data-aprovar-cur]").forEach((b) => {
      b.addEventListener("click", () => {
        const atual = ler(KEY.curadoria, []);
        const alvoItem = atual.find((x) => x.id === b.dataset.aprovarCur);
        const atualizada = C.aprovarRegistroCuradoria(atual, b.dataset.aprovarCur);
        gravar(KEY.curadoria, atualizada);
        vibrar("sucesso");
        anunciar(
          alvoItem
            ? `Solicitação de ${alvoItem.estabelecimento} marcada como Aprovada na curadoria local.`
            : "Solicitação marcada como Aprovada na curadoria local."
        );
        telaSugerir(idLoja, "#tit-curadoria");
      });
    });

    $app.querySelectorAll("[data-excluir-cur]").forEach((b) => {
      b.addEventListener("click", () => {
        const filtrada = ler(KEY.curadoria, []).filter((x) => x.id !== b.dataset.excluirCur);
        gravar(KEY.curadoria, filtrada);
        anunciar("Solicitação excluída da curadoria local.");
        telaSugerir(idLoja, "#tit-curadoria");
      });
    });

    if (focoSeletor) {
      const alvo = document.querySelector(focoSeletor);
      if (alvo) alvo.focus();
    }
  }

  // ---------- tela: sobre os dados ----------
  function telaSobre() {
    definirTitulo("Sobre os dados");
    $app.innerHTML = `<section class="sobre" aria-labelledby="tit-sobre">
      <h1 id="tit-sobre">Sobre os dados</h1>
      <p>Este é um <strong>protótipo escolar</strong> que integra três propostas:</p>
      <ul>
        <li><strong>T3 · VitrineCentro</strong> — base do projeto: negócios, itens, referência local, horário e contato autorizado.</li>
        <li><strong>A4 · AcessoLoja</strong> — condições de acesso físicas e atitudinais campo a campo (observado, não observado, desconhecido), com fonte e data.</li>
        <li><strong>T2 · PassaporteCentro</strong> — inspiração do <em>tema cultural da semana</em>, com fonte visível e curiosidades.</li>
      </ul>
      <h2>Limites</h2>
      <ul>
        <li>Todos os dados são <strong>fictícios</strong>. Dados reais só entram com autorização dos responsáveis e data de confirmação.</li>
        <li>As condições de acesso <strong>não são certificação</strong>. “Desconhecido” significa que ninguém verificou — nunca é escondido nos filtros.</li>
        <li>Favoritos e anotações ficam <strong>somente neste navegador</strong> (localStorage). Não há conta nem rastreamento: o Radar de Distância Offline só consulta o GPS se você clicar em ativar e mantém a coordenada apenas em memória até você desativar.</li>
        <li>Textos culturais trazem fonte e devem ser conferidos antes de qualquer uso público.</li>
      </ul>
      <h2>Apagar meus dados locais</h2>
      <p>Esta ação remove seus favoritos, lojas salvas, anotações e fila local de curadoria guardados neste aparelho. Suas preferências de acessibilidade continuam preservadas.</p>
      <p><button type="button" class="btn sec" id="bt-limpar">Apagar favoritos, lojas salvas e anotações</button></p>
    </section>`;

    const btLimpar = document.getElementById("bt-limpar");
    btLimpar.addEventListener("click", () => {
      pedirConfirmacao(
        "Apagar dados locais?",
        "Tem certeza de que deseja apagar seus itens favoritos, lojas salvas, anotações e fila de curadoria deste aparelho? Esta ação não pode ser desfeita.",
        () => {
          [KEY.itens, KEY.lojas, KEY.notas, KEY.curadoria, KEY.semana].forEach((k) => {
            try {
              localStorage.removeItem(k);
            } catch (_e) {}
          });
          atualizarIndicadoresRoteiro();
          vibrar("sucesso");
          anunciar("Dados locais apagados com sucesso.");
        },
        btLimpar
      );
    });
  }

  // ---------- tela: declaração e painel de acessibilidade ----------
  function telaAcessibilidade(focoSeletor) {
    definirTitulo("Declaração de Acessibilidade");
    const a = lerA11y();
    $app.innerHTML = `<section class="sobre" aria-labelledby="tit-a11y">
      <h1 id="tit-a11y">Acessibilidade e Declaração de Conformidade</h1>
      <p>A VitrineCentro foi estruturada para garantir acesso pleno a pessoas com deficiência, pessoas idosas, baixa visão, daltonismo, dislexia, mobilidade reduzida ou uso exclusivo de teclado e leitor de tela.</p>

      <h2>Preferências de leitura, áudio e tato</h2>
      <p class="meta">Ajustes salvos apenas neste navegador (sem conta e sem envio de dados).</p>
      <div class="painel-a11y">
        <article class="a11y-card">
          <h3>Aparência (Claro / Escuro)</h3>
          <p>Alterne entre o tema claro para uso ao ar livre e o tema escuro confortável em ambientes com pouca luz.</p>
          <div class="acoes">
            <button type="button" class="btn sec" id="p-tema-claro" aria-pressed="${!a.contraste && a.tema === "claro"}">Modo claro</button>
            <button type="button" class="btn sec" id="p-tema-escuro" aria-pressed="${!a.contraste && a.tema === "escuro"}">Modo escuro</button>
          </div>
        </article>
        <article class="a11y-card">
          <h3>Alto contraste (WCAG AAA)</h3>
          <p>Fundo preto com texto branco e destaques amarelos de altíssimo contraste.</p>
          <div class="acoes">
            <button type="button" class="btn sec" id="p-contraste" aria-pressed="${a.contraste}">${a.contraste ? "Desativar alto contraste" : "Ativar alto contraste"}</button>
          </div>
        </article>
        <article class="a11y-card">
          <h3>Tamanho do texto (${a.escalaFonte}%)</h3>
          <p>Amplie o texto de 100% até 150%, compatível também com zoom do navegador até 400%.</p>
          <div class="acoes">
            <button type="button" class="btn sec" id="p-fonte-menos" aria-label="Diminuir texto" ${a.escalaFonte <= ESCALAS_FONTE[0] ? "disabled" : ""}>A− Menor</button>
            <button type="button" class="btn sec" id="p-fonte-mais" aria-label="Aumentar texto" ${a.escalaFonte >= ESCALAS_FONTE[ESCALAS_FONTE.length - 1] ? "disabled" : ""}>A+ Maior</button>
          </div>
        </article>
        <article class="a11y-card">
          <h3>Espaçamento de leitura</h3>
          <p>Amplia entrelinhas, espaço entre letras, palavras e parágrafos (WCAG 1.4.12).</p>
          <div class="acoes">
            <button type="button" class="btn sec" id="p-espacamento" aria-pressed="${a.espacamento}">${a.espacamento ? "Desativar espaçamento" : "Ativar espaçamento"}</button>
          </div>
        </article>
        <article class="a11y-card">
          <h3>Feedback háptico (Vibração)</h3>
          <p>Resposta tátil discreta ao tocar em botões e salvar ações em celulares compatíveis (<code>navigator.vibrate</code>).</p>
          <div class="acoes">
            <button type="button" class="btn sec" id="p-vibracao" aria-pressed="${a.vibracao}">${a.vibracao ? "Desativar vibração" : "Ativar vibração"}</button>
          </div>
        </article>
        <article class="a11y-card">
          <h3>Sublinhar todos os links</h3>
          <p>Mantém sublinhado visível em todos os links para identificação imediata sem depender de cor.</p>
          <div class="acoes">
            <button type="button" class="btn sec" id="p-links" aria-pressed="${a.sublinharLinks}">${a.sublinharLinks ? "Desativar sublinhado" : "Sublinhar links"}</button>
          </div>
        </article>
        <article class="a11y-card">
          <h3>Reduzir animações</h3>
          <p>Desativa transições visuais (respeita automaticamente a preferência do sistema operacional).</p>
          <div class="acoes">
            <button type="button" class="btn sec" id="p-animacao" aria-pressed="${a.reduzirAnimacao}">${a.reduzirAnimacao ? "Permitir animações" : "Desativar animações"}</button>
          </div>
        </article>
        <article class="a11y-card">
          <h3>Restaurar padrão</h3>
          <p>Volta todas as opções visuais e táteis de acessibilidade para a configuração inicial.</p>
          <div class="acoes">
            <button type="button" class="btn sec" id="p-reset">Restaurar preferências</button>
          </div>
        </article>
      </div>

      <h2>Recursos inclusivos integrados</h2>
      <ul>
        <li><strong>Leitura por Voz (Web Speech API)</strong> — disponível em toda ficha de negócio, com controle de velocidade (0,85× a 1,25×), pausa e parada imediata.</li>
        <li><strong>Exportação de Roteiro Offline (Impressão / PDF / WhatsApp / .TXT)</strong> — gera um resumo legível de alto contraste para pessoas idosas ou em situação de exclusão digital levarem impresso ou receberem por mensagem.</li>
        <li><strong>Atributos Atitudinais e Legais</strong> — além das condições físicas, monitora <em>Aceita cão-guia</em> (Lei nº 11.126/2005), <em>Atendimento prioritário no caixa</em> (Lei nº 10.048/2000), <em>Atendimento em Libras</em> e <em>Cardápio/material em Braille</em>.</li>
        <li><strong>Índice de Acessibilidade Cidadã (Civic Tech)</strong> — painel público no fim da página inicial com percentuais de condições observadas e lacunas desconhecidas para apoiar políticas públicas.</li>
        <li><strong>Radar de Distância Offline (Haversine)</strong> — cálculo de distância em linha reta 100% local (sem APIs externas pagas), ativado somente sob demanda ou em modo de simulação no Centro de Aracaju.</li>
        <li><strong>Compartilhamento Elegante (Web Share API)</strong> — compartilha fichas de lojas e itens nativamente no celular ou copia o link direto com confirmação visual e sonora no computador.</li>
      </ul>

      <h2>Atalhos de teclado (padrão eMAG 3.1)</h2>
      <p>Use os atalhos abaixo combinados com a tecla modificadora do seu navegador (normalmente <kbd>Alt</kbd> + tecla no Windows/Linux ou <kbd>Control</kbd> + <kbd>Option</kbd> + tecla no macOS):</p>
      <ul>
        <li><strong>1</strong> — Ir diretamente para o conteúdo principal</li>
        <li><strong>2</strong> — Ir para o menu principal</li>
        <li><strong>3</strong> — Ir para o campo de busca de negócios</li>
        <li><strong>4</strong> — Ir para o rodapé</li>
        <li><strong>5</strong> — Abrir esta página de Acessibilidade</li>
        <li><strong>C</strong> — Alternar modo de alto contraste</li>
        <li><strong>Tab / Shift+Tab</strong> — Navegar entre todos os elementos interativos com foco visível</li>
        <li><strong>Esc</strong> — Fechar janelas de confirmação ou exportação</li>
      </ul>

      <h2>Normas e legislação observadas</h2>
      <ul>
        <li><strong>WCAG 2.2 (Níveis A, AA e critérios AAA)</strong> — contraste elevado (&ge; 7:1 em textos e &ge; 4,5:1 em bordas de controle), não dependência exclusiva de cor, alvos de toque &ge; 44×44 px, foco visível não obstruído, reflow até 320 px, regiões vivas ARIA, títulos dinâmicos e prevenção de erros com confirmação.</li>
        <li><strong>eMAG 3.1</strong> — barra de acessibilidade e links de salto padronizados no topo, hierarquia semântica de títulos e landmarks, atalhos numéricos 1 a 5 e página dedicada de acessibilidade.</li>
        <li><strong>LBI (Lei nº 13.146/2015, Art. 63), Decreto nº 5.296/2004, Lei nº 11.126/2005 e Lei nº 10.048/2000</strong> — acessibilidade digital, arquitetônica, comunicacional e atitudinal.</li>
        <li><strong>ABNT NBR 17060:2022</strong> — áreas de toque adequadas em dispositivos móveis, suporte a leitores de tela e preservação de foco após interações.</li>
      </ul>
    </section>`;

    document.getElementById("p-tema-claro").addEventListener("click", () => {
      definirTema("claro");
      telaAcessibilidade("#p-tema-claro");
    });
    document.getElementById("p-tema-escuro").addEventListener("click", () => {
      definirTema("escuro");
      telaAcessibilidade("#p-tema-escuro");
    });
    document.getElementById("p-contraste").addEventListener("click", () => {
      atualizarA11y({ contraste: !lerA11y().contraste }, "Alto contraste atualizado.");
      telaAcessibilidade("#p-contraste");
    });
    document.getElementById("p-fonte-menos").addEventListener("click", () => {
      const nova = C.ajustarEscalaFonte(lerA11y().escalaFonte, -1);
      atualizarA11y({ escalaFonte: nova }, `Tamanho do texto ajustado para ${nova}%.`);
      telaAcessibilidade("#p-fonte-menos");
    });
    document.getElementById("p-fonte-mais").addEventListener("click", () => {
      const nova = C.ajustarEscalaFonte(lerA11y().escalaFonte, 1);
      atualizarA11y({ escalaFonte: nova }, `Tamanho do texto ajustado para ${nova}%.`);
      telaAcessibilidade("#p-fonte-mais");
    });
    document.getElementById("p-espacamento").addEventListener("click", () => {
      const proximo = !lerA11y().espacamento;
      atualizarA11y({ espacamento: proximo }, proximo ? "Espaçamento de leitura ativado." : "Espaçamento de leitura desativado.");
      telaAcessibilidade("#p-espacamento");
    });
    document.getElementById("p-vibracao").addEventListener("click", () => {
      const proximo = !lerA11y().vibracao;
      atualizarA11y({ vibracao: proximo }, proximo ? "Feedback háptico ativado." : "Feedback háptico desativado.");
      if (proximo) vibrar("sucesso");
      telaAcessibilidade("#p-vibracao");
    });
    document.getElementById("p-links").addEventListener("click", () => {
      const proximo = !lerA11y().sublinharLinks;
      atualizarA11y({ sublinharLinks: proximo }, proximo ? "Links sublinhados ativados." : "Links sublinhados desativados.");
      telaAcessibilidade("#p-links");
    });
    document.getElementById("p-animacao").addEventListener("click", () => {
      const proximo = !lerA11y().reduzirAnimacao;
      atualizarA11y({ reduzirAnimacao: proximo }, proximo ? "Animações reduzidas." : "Animações permitidas.");
      telaAcessibilidade("#p-animacao");
    });
    document.getElementById("p-reset").addEventListener("click", () => {
      gravar(KEY.a11y, { ...C.A11Y_PADRAO });
      aplicarA11y();
      anunciar("Preferências de acessibilidade restauradas para o padrão.");
      telaAcessibilidade("#p-reset");
    });

    if (focoSeletor) {
      const alvo = document.querySelector(focoSeletor);
      if (alvo) alvo.focus();
    }
  }

  // ---------- roteamento ----------
  function rotear(focoSeletor) {
    const h = location.hash.slice(1) || "inicio";
    if (h === "conteudo" || h === "menu-principal" || h === "rodape" || h === "busca-atalho") {
      return false;
    }
    const m = h.split("-");
    let r = "inicio";
    if (m[0] === "negocio") {
      r = "negocio";
      telaNegocio(m[1], focoSeletor);
    } else if (m[0] === "item") {
      r = "item";
      telaItem(m[1], focoSeletor);
    } else if (m[0] === "favoritos") {
      r = "favoritos";
      telaFavoritos(focoSeletor);
    } else if (m[0] === "anotacoes") {
      r = "anotacoes";
      telaAnotacoes(m[1] || null, focoSeletor);
    } else if (m[0] === "sugerir") {
      r = "sugerir";
      telaSugerir(m[1] || null, focoSeletor);
    } else if (m[0] === "sobre") {
      r = "sobre";
      telaSobre();
    } else if (m[0] === "acessibilidade") {
      r = "acessibilidade";
      telaAcessibilidade(focoSeletor);
    } else {
      telaInicio(focoSeletor);
    }

    document.querySelectorAll("nav.main a").forEach((a) => {
      if (a.dataset.r === r) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    return m[2] === "acesso";
  }

  // ---------- navegação móvel e popover compacto de acessibilidade ----------
  const $btMenuMobile = document.getElementById("bt-menu-mobile");
  const $menuPrincipal = document.getElementById("menu-principal");
  const $btToggleA11y = document.getElementById("bt-toggle-a11y");
  const $popoverA11y = document.getElementById("popover-a11y");
  const $btFecharA11y = document.getElementById("bt-fechar-a11y");
  const $linkDeclaracaoA11y = document.getElementById("link-declaracao-a11y");

  function definirMenuMobile(aberto) {
    if (!$btMenuMobile || !$menuPrincipal) return;
    $menuPrincipal.classList.toggle("menu-aberto", aberto);
    $btMenuMobile.setAttribute("aria-expanded", String(aberto));
    $btMenuMobile.setAttribute(
      "aria-label",
      aberto ? "Fechar menu de navegação" : "Abrir menu de navegação"
    );
    if (aberto) definirPopoverA11y(false);
  }

  function definirPopoverA11y(aberto) {
    if (!$btToggleA11y || !$popoverA11y) return;
    $popoverA11y.hidden = !aberto;
    $btToggleA11y.setAttribute("aria-expanded", String(aberto));
    $btToggleA11y.setAttribute(
      "aria-label",
      aberto ? "Fechar opções de acessibilidade" : "Abrir opções de acessibilidade"
    );
    if (aberto) {
      definirMenuMobile(false);
      const primeiro = $popoverA11y.querySelector("#bt-tema-claro") || $popoverA11y.querySelector("#bt-contraste");
      if (primeiro) primeiro.focus();
    }
  }

  if ($btMenuMobile && $menuPrincipal) {
    $btMenuMobile.addEventListener("click", () => {
      const proximo = $btMenuMobile.getAttribute("aria-expanded") !== "true";
      definirMenuMobile(proximo);
    });
    $menuPrincipal.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => definirMenuMobile(false));
    });
  }

  if ($btToggleA11y && $popoverA11y) {
    $btToggleA11y.addEventListener("click", () => {
      const proximo = $btToggleA11y.getAttribute("aria-expanded") !== "true";
      definirPopoverA11y(proximo);
    });
  }

  if ($btFecharA11y) {
    $btFecharA11y.addEventListener("click", () => {
      definirPopoverA11y(false);
      if ($btToggleA11y) $btToggleA11y.focus();
    });
  }

  if ($linkDeclaracaoA11y) {
    $linkDeclaracaoA11y.addEventListener("click", () => definirPopoverA11y(false));
  }

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if ($btToggleA11y && $btToggleA11y.getAttribute("aria-expanded") === "true") {
      definirPopoverA11y(false);
      $btToggleA11y.focus();
    } else if ($btMenuMobile && $btMenuMobile.getAttribute("aria-expanded") === "true") {
      definirMenuMobile(false);
      $btMenuMobile.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (
      $btMenuMobile &&
      $btMenuMobile.getAttribute("aria-expanded") === "true" &&
      !$menuPrincipal.contains(e.target) &&
      !$btMenuMobile.contains(e.target)
    ) {
      definirMenuMobile(false);
    }
    if (
      $btToggleA11y &&
      $popoverA11y &&
      $btToggleA11y.getAttribute("aria-expanded") === "true" &&
      !$popoverA11y.contains(e.target) &&
      !$btToggleA11y.contains(e.target)
    ) {
      definirPopoverA11y(false);
    }
  });

  if (window.matchMedia) {
    const mqDesktop = window.matchMedia("(min-width: 860px)");
    const limparDrawersDesktop = (ev) => {
      if (ev.matches) {
        definirMenuMobile(false);
      }
    };
    if (typeof mqDesktop.addEventListener === "function") {
      mqDesktop.addEventListener("change", limparDrawersDesktop);
    }
  }

  window.addEventListener("hashchange", () => {
    definirMenuMobile(false);
    definirPopoverA11y(false);
    pararVoz(true);
    const h = location.hash.slice(1);
    if (h === "conteudo" || h === "menu-principal" || h === "rodape") {
      if (h === "menu-principal" && window.innerWidth < 860) {
        definirMenuMobile(true);
      }
      const alvo = document.getElementById(h);
      if (alvo) alvo.focus();
      return;
    }
    const acesso = rotear();
    if (acesso) {
      const el = document.getElementById("acesso");
      if (el) {
        el.setAttribute("tabindex", "-1");
        el.scrollIntoView();
        el.focus({ preventScroll: true });
      }
    } else {
      window.scrollTo(0, 0);
      const main = document.getElementById("conteudo");
      if (main) main.focus({ preventScroll: true });
      anunciar(`Página carregada: ${document.title}`);
    }
  });

  // Atalho "Ir para a busca" (eMAG 3.1 Alt+3)
  const atalhoBusca = document.getElementById("atalho-busca");
  if (atalhoBusca) {
    atalhoBusca.addEventListener("click", (e) => {
      e.preventDefault();
      definirMenuMobile(false);
      if (!document.getElementById("q")) {
        location.hash = "#inicio";
        telaInicio("#q");
      } else {
        document.getElementById("q").focus();
      }
    });
  }

  // ---------- acessibilidade e tema visual (Claro / Escuro / Alto Contraste) ----------
  function sistemaPrefereMenosAnimacao() {
    return Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function sistemaPrefereEscuro() {
    return Boolean(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  function lerA11y() {
    return C.normalizarA11y(ler(KEY.a11y, null), sistemaPrefereMenosAnimacao(), sistemaPrefereEscuro());
  }

  function aplicarA11y() {
    const a = lerA11y();
    const escuroAtivo = a.tema === "escuro";
    document.body.classList.toggle("escuro", escuroAtivo);
    document.body.classList.toggle("contraste", a.contraste);
    document.body.classList.toggle("espacamento", a.espacamento);
    document.documentElement.classList.toggle("espacamento", a.espacamento);
    document.body.classList.toggle("sublinhar-links", a.sublinharLinks);
    document.documentElement.classList.toggle("sem-animacao", a.reduzirAnimacao);
    document.documentElement.style.setProperty("--fs", `${a.escalaFonte}%`);
    document.documentElement.style.colorScheme = a.contraste || escuroAtivo ? "dark" : "light";

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", a.contraste ? "#000000" : escuroAtivo ? "#04392b" : "#064e3b");
    }

    const btTema = document.getElementById("bt-tema");
    const btTemaClaro = document.getElementById("bt-tema-claro");
    const btTemaEscuro = document.getElementById("bt-tema-escuro");
    const btContraste = document.getElementById("bt-contraste");
    const btMenos = document.getElementById("bt-fonte-menos");
    const btMais = document.getElementById("bt-fonte-mais");
    const btEsp = document.getElementById("bt-espacamento");
    const btAnim = document.getElementById("bt-animacao");
    const lblPct = document.getElementById("popover-fonte-pct");

    if (btTema) {
      const emEscuro = !a.contraste && escuroAtivo;
      btTema.setAttribute("aria-pressed", String(emEscuro));
      btTema.setAttribute(
        "aria-label",
        emEscuro ? "Ativar modo claro" : "Ativar modo escuro"
      );
      btTema.setAttribute(
        "title",
        emEscuro ? "Alternar para modo claro" : "Alternar para modo escuro"
      );
    }
    if (btTemaClaro) btTemaClaro.setAttribute("aria-pressed", String(!a.contraste && !escuroAtivo));
    if (btTemaEscuro) btTemaEscuro.setAttribute("aria-pressed", String(!a.contraste && escuroAtivo));
    if (btContraste) btContraste.setAttribute("aria-pressed", String(a.contraste));
    if (btEsp) btEsp.setAttribute("aria-pressed", String(a.espacamento));
    if (btAnim) btAnim.setAttribute("aria-pressed", String(a.reduzirAnimacao));
    if (lblPct) lblPct.textContent = `${a.escalaFonte}%`;
    if (btMenos) {
      btMenos.disabled = a.escalaFonte <= ESCALAS_FONTE[0];
      btMenos.setAttribute("aria-label", `Diminuir tamanho do texto (atual ${a.escalaFonte}%)`);
    }
    if (btMais) {
      btMais.disabled = a.escalaFonte >= ESCALAS_FONTE[ESCALAS_FONTE.length - 1];
      btMais.setAttribute("aria-label", `Aumentar tamanho do texto (atual ${a.escalaFonte}%)`);
    }
  }

  function atualizarA11y(patch, msg) {
    const atual = lerA11y();
    const proximo = { ...atual, ...patch };
    gravar(KEY.a11y, proximo);
    aplicarA11y();
    if (msg) anunciar(msg);
  }

  function definirTema(novoTema) {
    const atual = lerA11y();
    const saiuContraste = atual.contraste;
    const msg =
      novoTema === "escuro"
        ? saiuContraste
          ? "Modo escuro ativado (alto contraste desativado)."
          : "Modo escuro ativado."
        : saiuContraste
          ? "Modo claro ativado (alto contraste desativado)."
          : "Modo claro ativado.";
    atualizarA11y({ tema: novoTema, contraste: false }, msg);
    if (location.hash === "#acessibilidade") telaAcessibilidade();
  }

  const btTemaHeader = document.getElementById("bt-tema");
  if (btTemaHeader) {
    btTemaHeader.addEventListener("click", () => {
      const atual = lerA11y();
      const proximo = !atual.contraste && atual.tema === "escuro" ? "claro" : "escuro";
      definirTema(proximo);
    });
  }

  const btTemaClaroPop = document.getElementById("bt-tema-claro");
  if (btTemaClaroPop) {
    btTemaClaroPop.addEventListener("click", () => definirTema("claro"));
  }

  const btTemaEscuroPop = document.getElementById("bt-tema-escuro");
  if (btTemaEscuroPop) {
    btTemaEscuroPop.addEventListener("click", () => definirTema("escuro"));
  }

  if (window.matchMedia) {
    const mqEscuro = window.matchMedia("(prefers-color-scheme: dark)");
    if (typeof mqEscuro.addEventListener === "function") {
      mqEscuro.addEventListener("change", () => {
        const salvo = ler(KEY.a11y, null);
        if (!salvo || (salvo.tema !== "claro" && salvo.tema !== "escuro")) {
          aplicarA11y();
        }
      });
    }
  }

  document.getElementById("bt-contraste").addEventListener("click", () => {
    const proximo = !lerA11y().contraste;
    atualizarA11y({ contraste: proximo }, proximo ? "Alto contraste ativado." : "Alto contraste desativado.");
    if (location.hash === "#acessibilidade") telaAcessibilidade();
  });

  document.getElementById("bt-fonte-menos").addEventListener("click", () => {
    const nova = C.ajustarEscalaFonte(lerA11y().escalaFonte, -1);
    atualizarA11y({ escalaFonte: nova }, `Tamanho do texto ajustado para ${nova}%.`);
    if (location.hash === "#acessibilidade") telaAcessibilidade();
  });

  document.getElementById("bt-fonte-mais").addEventListener("click", () => {
    const nova = C.ajustarEscalaFonte(lerA11y().escalaFonte, 1);
    atualizarA11y({ escalaFonte: nova }, `Tamanho do texto ajustado para ${nova}%.`);
    if (location.hash === "#acessibilidade") telaAcessibilidade();
  });

  document.getElementById("bt-espacamento").addEventListener("click", () => {
    const proximo = !lerA11y().espacamento;
    atualizarA11y(
      { espacamento: proximo },
      proximo ? "Espaçamento de leitura ativado." : "Espaçamento de leitura desativado."
    );
    if (location.hash === "#acessibilidade") telaAcessibilidade();
  });

  document.getElementById("bt-animacao").addEventListener("click", () => {
    const proximo = !lerA11y().reduzirAnimacao;
    atualizarA11y(
      { reduzirAnimacao: proximo },
      proximo ? "Animações desativadas." : "Animações permitidas."
    );
    if (location.hash === "#acessibilidade") telaAcessibilidade();
  });

  // ---------- instalação PWA offline (beforeinstallprompt + appinstalled) ----------
  const $btInstalarPwa = document.getElementById("bt-instalar-pwa");
  let eventoInstalacaoPwa = null;

  function pwaJaInstalado() {
    return Boolean(
      (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
        window.navigator.standalone === true
    );
  }

  if ($btInstalarPwa) {
    $btInstalarPwa.hidden = true;

    window.addEventListener("beforeinstallprompt", (e) => {
      if (pwaJaInstalado()) return;
      e.preventDefault();
      eventoInstalacaoPwa = e;
      $btInstalarPwa.hidden = false;
    });

    $btInstalarPwa.addEventListener("click", async () => {
      if (!eventoInstalacaoPwa) return;
      const promptPendente = eventoInstalacaoPwa;
      try {
        await promptPendente.prompt();
        const escolha = await promptPendente.userChoice;
        if (escolha && escolha.outcome === "accepted") {
          eventoInstalacaoPwa = null;
          $btInstalarPwa.hidden = true;
          vibrar("sucesso");
          anunciar("Instalação do aplicativo VitrineCentro iniciada.");
        }
      } catch (_e) {
        eventoInstalacaoPwa = null;
        $btInstalarPwa.hidden = true;
      }
    });

    window.addEventListener("appinstalled", () => {
      eventoInstalacaoPwa = null;
      $btInstalarPwa.hidden = true;
      vibrar("sucesso");
      anunciar("VitrineCentro instalado com sucesso para uso offline.");
    });
  }

  // ---------- inicialização ----------
  try {
    if (typeof window.DADOS === "undefined") {
      throw new Error(
        "Arquivo dados/dados.js não carregou ou tem erro de sintaxe (vírgula, aspas ou chave faltando)."
      );
    }
    D = window.DADOS;
    const erros = C.validarDados(D);
    if (erros.length) throw new Error(erros.join("\n"));
    aplicarA11y();
    atualizarIndicadoresRoteiro();
    rotear();
  } catch (e) {
    aplicarA11y();
    definirTitulo("Erro ao carregar dados");
    $app.innerHTML = `<div class="erro" role="alert">
      <h1>Não foi possível carregar os dados</h1>
      <p>O arquivo de dados está inválido ou incompleto. A vitrine não foi exibida para evitar informação errada.</p>
      <pre style="white-space:pre-wrap;font-size:.85rem">${esc(e.message)}</pre>
      <p class="meta">Seus favoritos e anotações continuam guardados neste aparelho.</p>
    </div>`;
  }
})();
