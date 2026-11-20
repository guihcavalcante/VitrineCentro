/* VitrineCentro — protótipo integrado (T3 + A4 + tema inspirado no T2)
   Telas, busca, filtros, favoritos e anotações. Dados em dados/dados.js */
(function(){
"use strict";
const LIM_ITENS = 5, LIM_LOJAS = 3;
const KEY = {itens:"vc_fav_itens", lojas:"vc_fav_lojas", notas:"vc_anotacoes", semana:"vc_semana_demo", a11y:"vc_a11y"};
const ESTADO_TXT = {observado:"Observado", nao_observado:"Não observado", desconhecido:"Desconhecido"};
const NECESSIDADES = [
  {tipo:"degrau", rot:"Entrada sem degrau", ok:a=>a.estado==="nao_observado"},
  {tipo:"banheiro", rot:"Banheiro adaptado", ok:a=>a.estado==="observado"},
  {tipo:"atendimento", rot:"Atendimento em Libras", ok:a=>a.estado==="observado"}
];
const $app = document.getElementById("app");
let D = null;

// ---------- armazenamento local seguro ----------
function ler(k, padrao){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : padrao; }catch(e){ return padrao; } }
function gravar(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ toast("Não foi possível salvar neste navegador."); return false; } }

// ---------- utilidades ----------
// ---------- utilidades ----------
function vibrar(padrao = [60]) {
  if ("vibrate" in navigator) {
    try { navigator.vibrate(padrao); } catch(e) {}
  }
}
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm = s => String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
const fmtData = iso => { const [y,m,d] = String(iso).split("-"); return d && m && y ? `${d}/${m}/${y}` : iso; };
function toast(msg){ const t = document.getElementById("toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(toast._t); toast._t = setTimeout(()=>t.classList.remove("on"), 2800); }
const negocio = id => D.negocios.find(n => n.id === id);
const itensDe = id => D.itens.filter(i => i.negocio_id === id && i.ativo);
const acessoDe = id => D.atributos_acesso.filter(a => a.negocio_id === id);

// ---------- validação dos dados ----------
function validar(d){
  const erros = [];
  if(!d || typeof d !== "object") return ["O arquivo de dados não é um objeto JSON."];
  ["negocios","itens","atributos_acesso","temas_culturais","tema_lugares"].forEach(k => { if(!Array.isArray(d[k])) erros.push(`Lista "${k}" ausente.`); });
  if(erros.length) return erros;
  const ids = new Set(d.negocios.map(n => n.id));
  d.itens.forEach(i => { if(!ids.has(i.negocio_id)) erros.push(`Item ${i.id} aponta para negócio inexistente (${i.negocio_id}).`); });
  d.atributos_acesso.forEach(a => { if(!ids.has(a.negocio_id)) erros.push(`Atributo ${a.id} aponta para negócio inexistente.`); if(!ESTADO_TXT[a.estado]) erros.push(`Atributo ${a.id} com estado inválido.`); });
  d.tema_lugares.forEach(t => { if(!ids.has(t.negocio_id)) erros.push(`Tema-lugar ${t.id} aponta para negócio inexistente.`); });
  return erros;
}

// ---------- tema da semana ----------
function temaAtual(){
  const temas = [...D.temas_culturais].sort((a,b) => a.semana_inicio.localeCompare(b.semana_inicio));
  const forcado = ler(KEY.semana, null);
  if(forcado){ const t = temas.find(x => x.id === forcado); if(t) return t; }
  const hoje = new Date().toISOString().slice(0,10);
  let atual = temas[0];
  temas.forEach(t => { if(t.semana_inicio <= hoje) atual = t; });
  return atual;
}
const lugaresDoTema = t => D.tema_lugares.filter(x => x.tema_id === t.id).sort((a,b)=>a.ordem-b.ordem);
const negocioNoTema = (nid, t) => D.tema_lugares.find(x => x.tema_id === t.id && x.negocio_id === nid);

// ---------- ilustração (placeholder sem foto real) ----------
function ilustracao(n, foto){
  const cor = {"Alimentação":"#e7a15a","Arte e Cultura":"#8b5bd1","Serviços":"#3d8bbf"}[n.categoria] || "#999";
  return `<figure>
    <svg viewBox="0 0 320 170" role="img" aria-label="${esc(foto.texto_alternativo)}">
      <rect width="320" height="170" fill="${cor}" opacity=".22"/>
      <rect x="40" y="40" width="240" height="110" rx="6" fill="${cor}" opacity=".55"/>
      <rect x="135" y="80" width="50" height="70" rx="4" fill="#fff" opacity=".85"/>
      <rect x="40" y="28" width="240" height="22" rx="4" fill="${cor}"/>
      <text x="160" y="125" font-size="34" text-anchor="middle">${n.icone}</text>
      <rect x="0" y="150" width="320" height="20" fill="#9a9a9a" opacity=".5"/>
    </svg>
    <figcaption>${esc(foto.legenda)}<span class="aut">Texto alternativo: ${esc(foto.texto_alternativo)} · Autorização: exemplo fictício (sem foto real)</span></figcaption>
  </figure>`;
}

// ---------- telas ----------
let filtro = {q:"", cat:null, nec:null};

function telaInicio(){
  const t = temaAtual();
  const lugares = lugaresDoTema(t);
  const temas = [...D.temas_culturais].sort((a,b)=>a.semana_inicio.localeCompare(b.semana_inicio));
  $app.innerHTML = `
  <section class="tema" aria-labelledby="tema-tit">
    <small>Tema da semana · a partir de ${fmtData(t.semana_inicio)}</small>
    <h2 id="tema-tit"><span aria-hidden="true">${t.icone}</span> ${esc(t.titulo)}</h2>
    <p>${esc(t.texto)}</p>
    <div class="tema-lugares">
      ${lugares.map(l => { const n = negocio(l.negocio_id); return `
        <button class="tl" data-ir="#negocio-${n.id}">
          <b>${n.icone} ${esc(n.nome)}</b>
          <span>${esc(l.curiosidade)}</span>
        </button>`; }).join("")}
    </div>
    <p class="fonte">Fonte: ${esc(t.fonte)} · ${esc(t.aviso_ficticio)}</p>
    <div class="demo-semana">
      <label for="sel-semana">Modo demonstração — ver outra semana:</label>
      <select id="sel-semana">
        <option value="">Automático (pela data de hoje)</option>
        ${temas.map(x => `<option value="${x.id}" ${ler(KEY.semana,null)===x.id?"selected":""}>${fmtData(x.semana_inicio)} — ${esc(x.titulo)}</option>`).join("")}
      </select>
    </div>
  </section>

  <h1>Descubra o Centro</h1>
  <div class="controles">
    <div class="busca" role="search">
      <label for="q" class="skip">Buscar</label>
      <input id="q" type="search" placeholder="Buscar negócio, produto ou serviço…" value="${esc(filtro.q)}" autocomplete="off">
    </div>
    <div class="chips" role="group" aria-label="Filtrar por categoria">
      <span class="rot">Categoria:</span>
      ${D.categorias.map(c => `<button class="chip" data-cat="${esc(c)}" aria-pressed="${filtro.cat===c}">${esc(c)}</button>`).join("")}
    </div>
    <div class="chips" role="group" aria-label="Filtrar por necessidade de acesso">
      <span class="rot">Preciso de:</span>
      ${NECESSIDADES.map(n => `<button class="chip" data-nec="${n.tipo}" aria-pressed="${filtro.nec===n.tipo}">${n.rot}</button>`).join("")}
    </div>
  </div>
  <p class="contador" id="contador"></p>
  <div class="grid" id="lista"></div>`;

  const q = document.getElementById("q");
  q.addEventListener("input", () => { filtro.q = q.value; desenharLista(t); });
  $app.querySelectorAll("[data-cat]").forEach(b => b.onclick = () => { filtro.cat = filtro.cat === b.dataset.cat ? null : b.dataset.cat; telaInicio(); });
  $app.querySelectorAll("[data-nec]").forEach(b => b.onclick = () => { filtro.nec = filtro.nec === b.dataset.nec ? null : b.dataset.nec; telaInicio(); });
  document.getElementById("sel-semana").onchange = e => { e.target.value ? gravar(KEY.semana, e.target.value) : localStorage.removeItem(KEY.semana); telaInicio(); toast("Tema da semana atualizado."); };
  ligarIr();
  desenharLista(t);
}

function desenharLista(t){
  const termo = norm(filtro.q.trim());
  const nec = NECESSIDADES.find(n => n.tipo === filtro.nec);
  let res = D.negocios.filter(n => {
    if(filtro.cat && n.categoria !== filtro.cat) return false;
    if(termo){
      const alvo = norm([n.nome, n.categoria, n.referencia_local, ...itensDe(n.id).map(i => i.titulo + " " + i.descricao_curta)].join(" "));
      if(!alvo.includes(termo)) return false;
    }
    if(nec){
      const a = acessoDe(n.id).find(x => x.tipo === nec.tipo);
      // Regra do A4: nunca ocultar o desconhecido
      if(!a || !(nec.ok(a) || a.estado === "desconhecido")) return false;
    }
    return true;
  });
  // destaque do tema primeiro
  res.sort((a,b) => (negocioNoTema(b.id,t)?1:0) - (negocioNoTema(a.id,t)?1:0));
  const $l = document.getElementById("lista");
  document.getElementById("contador").textContent = `${res.length} de ${D.negocios.length} negócios`;
  if(!res.length){ $l.innerHTML = `<div class="vazio" style="grid-column:1/-1"><p><strong>Nenhum negócio encontrado.</strong></p><p>Tente outro termo ou limpe os filtros.</p><button class="btn sec" id="limpar">Limpar busca e filtros</button></div>`; document.getElementById("limpar").onclick = () => { filtro = {q:"",cat:null,nec:null}; telaInicio(); }; return; }
  $l.innerHTML = res.map(n => {
    let selo = "";
    if(nec){ const a = acessoDe(n.id).find(x => x.tipo === nec.tipo); selo = `<span class="estado ${a.estado}">${nec.rot}: ${ESTADO_TXT[a.estado]}</span>`; }
    return `<article class="card">
      <div class="ic" aria-hidden="true">${n.icone}</div>
      <div><span class="tag">${esc(n.categoria)}</span> ${negocioNoTema(n.id,t)?`<span class="tag tema-tag">Tema da semana</span>`:""}</div>
      <h3>${esc(n.nome)}</h3>
      <p class="meta">📍 ${esc(n.referencia_local)}</p>
      <p class="meta">🕒 ${esc(n.horario_informado)} <em>(informado)</em></p>
      ${selo}
      <a class="btn" href="#negocio-${n.id}">Ver ficha <span class="skip">de ${esc(n.nome)}</span></a>
    </article>`;
  }).join("");
}

function telaNegocio(id){
  const n = negocio(id);
  if(!n){ $app.innerHTML = `<div class="vazio"><p>Negócio não encontrado.</p><a class="btn" href="#inicio">Voltar ao início</a></div>`; return; }
  const t = temaAtual(); const noTema = negocioNoTema(n.id, t);
  const foto = (D.fotos_autorizadas||[]).find(f => f.negocio_id === n.id);
  const lojas = ler(KEY.lojas, []); const salva = lojas.includes(n.id);
  const ordem = Object.keys(D.tipos_acesso);
  const ac = acessoDe(n.id).sort((a,b) => ordem.indexOf(a.tipo) - ordem.indexOf(b.tipo));
  const desc = ac.filter(a => a.estado === "desconhecido").length;
  $app.innerHTML = `
  <p class="breadcrumb"><a href="#inicio">Início</a> › ${esc(n.nome)}</p>
  <div class="ficha-top">
    <section class="info" aria-labelledby="nome-n">
      <span class="tag">${esc(n.categoria)}</span>
      <h1 id="nome-n"><span aria-hidden="true">${n.icone}</span> ${esc(n.nome)}</h1>
      <dl>
        <dt>Referência</dt><dd>${esc(n.referencia_local)}</dd>
        <dt>Horário</dt><dd>${esc(n.horario_informado)} <em>(informado)</em></dd>
        <dt>Contato</dt><dd>${esc(n.contato_autorizado)}</dd>
        <dt>Confirmado em</dt><dd>${fmtData(n.data_confirmacao)}</dd>
      </dl>
      <div class="acoes">
        <button class="btn" id="bt-loja" aria-pressed="${salva}">${salva ? "★ Loja salva — remover" : "☆ Salvar loja"}</button>
        <a class="btn sec" href="#anotacoes-${n.id}">✎ Anotar dúvida</a>
      </div>
      ${noTema ? `<div class="curio"><strong>${t.icone} Tema da semana: ${esc(t.titulo)}</strong><br>${esc(noTema.curiosidade)}<small>${esc(noTema.fonte_curiosidade)}</small></div>` : ""}
    </section>
    ${foto ? ilustracao(n, foto) : ""}
  </div>

  <h2>O que tem aqui</h2>
  <div class="itens">
    ${itensDe(n.id).map(i => `<article class="card"><div class="ic" aria-hidden="true">${i.icone}</div><h3>${esc(i.titulo)}</h3><p class="meta">${esc(i.descricao_curta)}</p><a class="btn sec peq" href="#item-${i.id}">Ver item</a></article>`).join("") || `<p class="vazio">Nenhum item cadastrado.</p>`}
  </div>

  <h2 id="acesso">Condições de acesso</h2>
  <p class="meta">Informações por item, com estado e fonte. Não é selo de acessibilidade. ${desc ? `<strong>${desc} item(ns) ainda desconhecido(s)</strong> — vale confirmar antes de ir.` : ""}</p>
  <div class="legenda-estados" aria-hidden="true"><span class="estado observado">Observado</span> a condição foi vista no local <span class="estado nao_observado">Não observado</span> a condição não foi vista <span class="estado desconhecido">Desconhecido</span> ninguém verificou</div>
  <table class="acesso">
    <caption class="skip">Condições de acesso de ${esc(n.nome)}</caption>
    <thead><tr><th scope="col">Condição</th><th scope="col">Estado</th><th scope="col">Descrição</th><th scope="col">Fonte</th></tr></thead>
    <tbody>${ac.map(a => `<tr><th scope="row">${esc(D.tipos_acesso[a.tipo])}</th><td><span class="estado ${a.estado}">${ESTADO_TXT[a.estado]}</span></td><td>${esc(a.descricao)}</td><td class="meta">${esc(a.fonte_observacao)}</td></tr>`).join("")}</tbody>
  </table>`;
  document.getElementById("bt-loja").onclick = () => alternarLoja(n.id);
}

function alternarLoja(id){
  let l = ler(KEY.lojas, []);
  if(l.includes(id)){ l = l.filter(x => x !== id); gravar(KEY.lojas, l); toast("Loja removida dos salvos."); }
  else if(l.length >= LIM_LOJAS){ toast(`Limite de ${LIM_LOJAS} lojas salvas. Remova uma em Favoritos.`); return; }
  else { l.push(id); gravar(KEY.lojas, l); toast("Loja salva! Veja em Favoritos."); }
  rotear();
}
function alternarItem(id){
  let l = ler(KEY.itens, []);
  if(l.some(f => f.item_id === id)){ l = l.filter(f => f.item_id !== id); gravar(KEY.itens, l); toast("Item removido dos favoritos."); }
  else if(l.length >= LIM_ITENS){ toast(`Limite de ${LIM_ITENS} itens favoritos. Remova um para salvar outro.`); return; }
  else { l.push({id:"fav"+Date.now(), item_id:id, salvo_em:new Date().toISOString(), dispositivo_local:true, origem_dado:"exemplo_ficticio"}); gravar(KEY.itens, l); toast("Item favoritado!"); }
  rotear();
}

function telaItem(id){
  const i = D.itens.find(x => x.id === id);
  if(!i){ $app.innerHTML = `<div class="vazio"><p>Item não encontrado.</p><a class="btn" href="#inicio">Voltar</a></div>`; return; }
  const n = negocio(i.negocio_id);
  const fav = ler(KEY.itens, []).some(f => f.item_id === id);
  $app.innerHTML = `
  <p class="breadcrumb"><a href="#inicio">Início</a> › <a href="#negocio-${n.id}">${esc(n.nome)}</a> › ${esc(i.titulo)}</p>
  <article class="card" style="max-width:560px">
    <div class="ic" aria-hidden="true" style="font-size:3rem">${i.icone}</div>
    <h1>${esc(i.titulo)}</h1>
    <p>${esc(i.descricao_curta)}</p>
    <p class="meta">Oferecido por <a href="#negocio-${n.id}">${esc(n.nome)}</a> · 🕒 ${esc(n.horario_informado)} (informado)</p>
    <p class="meta">Contato: ${esc(n.contato_autorizado)}</p>
    <div class="acoes"><button class="btn" id="bt-fav" aria-pressed="${fav}">${fav ? "♥ Favorito — remover" : "♡ Favoritar item"}</button>
    <a class="btn sec" href="#negocio-${n.id}-acesso">Ver condições de acesso</a></div>
  </article>`;
  document.getElementById("bt-fav").onclick = () => alternarItem(i.id);
}

function telaFavoritos(){
  const fi = ler(KEY.itens, []).filter(f => D.itens.some(i => i.id === f.item_id));
  const fl = ler(KEY.lojas, []).filter(id => negocio(id));
  $app.innerHTML = `
  <h1>Favoritos</h1>
  <p class="meta">Salvos apenas neste aparelho, sem conta e sem envio de dados.</p>
  <h2>Itens favoritos (${fi.length}/${LIM_ITENS})</h2>
  ${fi.length ? `<ul class="lista">${fi.map(f => { const i = D.itens.find(x => x.id === f.item_id); const n = negocio(i.negocio_id); return `<li><span>${i.icone} <a href="#item-${i.id}"><strong>${esc(i.titulo)}</strong></a> <span class="meta">— ${esc(n.nome)}</span></span><button class="btn sec peq" data-rm-item="${i.id}">Remover</button></li>`; }).join("")}</ul>` : `<p class="vazio">Nenhum item favorito ainda. Abra um item e toque em “Favoritar”.</p>`}
  <h2>Lojas salvas (${fl.length}/${LIM_LOJAS})</h2>
  ${fl.length ? `<ul class="lista">${fl.map(id => { const n = negocio(id); return `<li><span>${n.icone} <a href="#negocio-${n.id}"><strong>${esc(n.nome)}</strong></a> <span class="meta">— 🕒 ${esc(n.horario_informado)}</span></span><button class="btn sec peq" data-rm-loja="${n.id}">Remover</button></li>`; }).join("")}</ul>` : `<p class="vazio">Nenhuma loja salva ainda.</p>`}`;
  $app.querySelectorAll("[data-rm-item]").forEach(b => b.onclick = () => alternarItem(b.dataset.rmItem));
  $app.querySelectorAll("[data-rm-loja]").forEach(b => b.onclick = () => alternarLoja(b.dataset.rmLoja));
}

function telaAnotacoes(pre){
  const notas = ler(KEY.notas, []);
  const lojas = ler(KEY.lojas, []).filter(id => negocio(id));
  const sugeridas = [];
  lojas.forEach(id => { const n = negocio(id); acessoDe(id).filter(a => a.estado === "desconhecido").forEach(a => sugeridas.push(`${n.nome}: confirmar "${D.tipos_acesso[a.tipo]}"`)); });
  $app.innerHTML = `
  <h1>Minhas anotações e dúvidas</h1>
  <p class="meta">Ficam só neste aparelho. Nada é enviado ao estabelecimento nem publicado.</p>
  <form id="f-nota">
    <label class="lbl" for="sel-n">Sobre qual lugar?</label>
    <select id="sel-n" class="chip" style="border-radius:10px">
      <option value="">Geral</option>
      ${D.negocios.map(n => `<option value="${n.id}" ${pre===n.id?"selected":""}>${esc(n.nome)}</option>`).join("")}
    </select>
    <label class="lbl" for="txt">O que você achou ou quer confirmar?</label>
    <textarea id="txt" maxlength="280" placeholder="Ex.: Perguntar se o banheiro está liberado ao público."></textarea>
    <p class="meta">Não escreva nomes, telefones ou dados pessoais.</p>
    <button class="btn" type="submit">Salvar anotação</button>
  </form>
  <h2>Dúvidas sugeridas</h2>
  <p class="meta">Geradas a partir dos itens <strong>desconhecidos</strong> das lojas que você salvou.</p>
  ${sugeridas.length ? `<ul class="lista">${sugeridas.map(s => `<li>❓ ${esc(s)}</li>`).join("")}</ul>` : `<p class="vazio">Salve uma loja para ver as dúvidas sugeridas.</p>`}
  <h2>Anotações salvas (${notas.length})</h2>
  ${notas.length ? `<ul class="lista">${notas.map(x => { const n = negocio(x.negocio_id); return `<li><span><strong>${n ? esc(n.nome) : "Geral"}:</strong> ${esc(x.texto)} <span class="meta">(${new Date(x.data).toLocaleDateString("pt-BR")})</span></span><button class="btn sec peq" data-rm-nota="${x.id}">Remover</button></li>`; }).join("")}</ul>` : `<p class="vazio">Nenhuma anotação ainda.</p>`}`;
  document.getElementById("f-nota").onsubmit = e => {
    e.preventDefault();
    const txt = document.getElementById("txt").value.trim();
    if(!txt){ toast("Escreva algo antes de salvar."); document.getElementById("txt").focus(); return; }
    const l = ler(KEY.notas, []); l.unshift({id:"nt"+Date.now(), negocio_id:document.getElementById("sel-n").value || null, texto:txt, data:new Date().toISOString()});
    gravar(KEY.notas, l.slice(0,30)); toast("Anotação salva neste aparelho."); telaAnotacoes(null);
  };
  $app.querySelectorAll("[data-rm-nota]").forEach(b => b.onclick = () => { gravar(KEY.notas, ler(KEY.notas, []).filter(x => x.id !== b.dataset.rmNota)); toast("Anotação removida."); telaAnotacoes(null); });
}

function telaSobre(){
  $app.innerHTML = `<section class="sobre">
  <h1>Sobre os dados</h1>
  <p>Este é um <strong>protótipo escolar</strong> que integra três propostas:</p>
  <ul>
    <li><strong>T3 · VitrineCentro</strong> — base do projeto: negócios, itens, referência local, horário e contato autorizado.</li>
    <li><strong>A4 · AcessoLoja</strong> — condições de acesso campo a campo (observado, não observado, desconhecido), com fonte e data.</li>
    <li><strong>T2 · PassaporteCentro</strong> — inspiração do <em>tema cultural da semana</em>, com fonte visível e curiosidades.</li>
  </ul>
  <h2>Limites</h2>
  <ul>
    <li>Todos os dados são <strong>fictícios</strong>. Dados reais só entram com autorização dos responsáveis e data de confirmação.</li>
    <li>As condições de acesso <strong>não são certificação</strong>. “Desconhecido” significa que ninguém verificou — nunca é escondido nos filtros.</li>
    <li>Favoritos e anotações ficam <strong>somente neste navegador</strong> (localStorage). Não há conta, rastreamento ou GPS.</li>
    <li>Textos culturais trazem fonte e devem ser conferidos antes de qualquer uso público.</li>
  </ul>
  <h2>Apagar meus dados locais</h2>
  <p><button class="btn sec" id="bt-limpar">Apagar favoritos, lojas salvas e anotações</button></p>
  </section>`;
  document.getElementById("bt-limpar").onclick = () => { [KEY.itens, KEY.lojas, KEY.notas, KEY.semana].forEach(k => { try{ localStorage.removeItem(k); }catch(e){} }); toast("Dados locais apagados."); };
}

// ---------- roteamento ----------
function ligarIr(){ $app.querySelectorAll("[data-ir]").forEach(b => b.onclick = () => { location.hash = b.dataset.ir; }); }
function rotear(){
  const h = location.hash.slice(1) || "inicio";
  const m = h.split("-");
  let r = "inicio";
  if(m[0] === "negocio") { r = "negocio"; telaNegocio(m[1]); }
  else if(m[0] === "item") { r = "item"; telaItem(m[1]); }
  else if(m[0] === "favoritos") { r = "favoritos"; telaFavoritos(); }
  else if(m[0] === "anotacoes") { r = "anotacoes"; telaAnotacoes(m[1] || null); }
  else if(m[0] === "sobre") { r = "sobre"; telaSobre(); }
  else telaInicio();
  document.querySelectorAll("nav.main a").forEach(a => { if(a.dataset.r === r) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  return m[2] === "acesso";
}
window.addEventListener("hashchange", () => {
  const acesso = rotear();
  if(acesso){ const el = document.getElementById("acesso"); el && el.scrollIntoView(); }
  else { window.scrollTo(0,0); document.getElementById("conteudo").focus({preventScroll:true}); }
});

// ---------- acessibilidade da página ----------
function aplicarA11y(){
  const a = ler(KEY.a11y, {contraste:false, ampliado:false});
  
  document.body.classList.toggle("contraste", a.contraste);
  document.body.classList.toggle("ampliado", a.ampliado);
  
  // Força o aumento real da fonte em todo o PWA
  document.documentElement.style.fontSize = a.ampliado ? "120%" : "100%";

  const btnContraste = document.getElementById("bt-contraste");
  const btnAmpliar = document.getElementById("bt-ampliar");
  
  if (btnContraste) btnContraste.setAttribute("aria-pressed", a.contraste);
  if (btnAmpliar) {
    btnAmpliar.setAttribute("aria-pressed", a.ampliado);
    btnAmpliar.textContent = a.ampliado ? "A- Texto Normal" : "A+ Texto";
  }
}

["contraste","ampliado"].forEach(k => {
  const el = document.getElementById(k === "contraste" ? "bt-contraste" : "bt-ampliar");
  if (el) {
    el.onclick = () => {
      vibrar([50]); // Feedback tátil ao tocar no botão
      const a = ler(KEY.a11y, {contraste:false, ampliado:false});
      a[k] = !a[k];
      gravar(KEY.a11y, a);
      aplicarA11y();
    };
  }
});

// ---------- inicialização ----------
try{
  if(typeof window.DADOS === "undefined") throw new Error("Arquivo dados/dados.js não carregou ou tem erro de sintaxe (vírgula, aspas ou chave faltando).");
  D = window.DADOS;
  const erros = validar(D);
  if(erros.length) throw new Error(erros.join("\n"));
  aplicarA11y();
  rotear();
}catch(e){
  aplicarA11y();
  $app.innerHTML = `<div class="erro" role="alert"><h1>Não foi possível carregar os dados</h1><p>O arquivo de dados está inválido ou incompleto. A vitrine não foi exibida para evitar informação errada.</p><pre style="white-space:pre-wrap;font-size:.8rem">${esc(e.message)}</pre><p class="meta">Seus favoritos e anotações continuam guardados neste aparelho.</p></div>`;
}
})();
