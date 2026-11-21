const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const core = require('./js/core');

function carregarDados() {
  const codigo = fs.readFileSync(path.join(__dirname, 'dados', 'dados.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(codigo, sandbox);
  return sandbox.window.DADOS;
}

test('paleta padrão atende WCAG 2.2 AAA (>= 7:1) em textos e AA (>= 3:1) em bordas de controle', () => {
  assert.ok(core.razaoContraste('#1b1e23', '#faf7f2') >= 7, 'ink sobre bg deve ser AAA >= 7:1');
  assert.ok(core.razaoContraste('#1b1e23', '#ffffff') >= 7, 'ink sobre card deve ser AAA >= 7:1');
  assert.ok(core.razaoContraste('#474d57', '#faf7f2') >= 7, 'muted sobre bg deve ser AAA >= 7:1');
  assert.ok(core.razaoContraste('#474d57', '#ffffff') >= 7, 'muted sobre card deve ser AAA >= 7:1');

  assert.ok(core.razaoContraste('#8f3808', '#ffffff') >= 7, 'brand sobre branco deve ser AAA >= 7:1');
  assert.ok(core.razaoContraste('#ffffff', '#8f3808') >= 7, 'branco sobre brand deve ser AAA >= 7:1');
  assert.ok(core.razaoContraste('#8f3808', '#fdf0e4') >= 6.5, 'brand sobre brand-soft deve ter alto contraste');

  assert.ok(core.razaoContraste('#143f7a', '#e8f0fa') >= 7, 'observado deve ser AAA >= 7:1');
  assert.ok(core.razaoContraste('#363b42', '#eef0f3') >= 7, 'nao_observado deve ser AAA >= 7:1');
  assert.ok(core.razaoContraste('#614400', '#fff5d6') >= 7, 'desconhecido deve ser AAA >= 7:1');
  assert.ok(core.razaoContraste('#8f1414', '#fdecec') >= 7, 'erro deve ser AAA >= 7:1');

  // Novos tokens do Radar e Compartilhamento
  assert.ok(core.razaoContraste('#ffffff', '#0b1831') >= 15, 'branco sobre marinho radar deve ser AAA');
  assert.ok(core.razaoContraste('#0b1831', '#e9f0fb') >= 12, 'selo de distância deve ser AAA');
  assert.ok(core.razaoContraste('#ffffff', '#0d5c33') >= 7, 'botão copiado deve ser AAA >= 7:1');

  assert.ok(core.razaoContraste('#6b645b', '#ffffff') >= 4.5, 'border-ui sobre branco >= 4.5:1');
  assert.ok(core.razaoContraste('#0044b3', '#ffffff') >= 7, 'foco sobre branco >= 7:1');
});

test('paleta de alto contraste atende WCAG 2.2 AAA (>= 7:1) em todos os pares', () => {
  assert.ok(core.razaoContraste('#ffffff', '#000000') >= 20);
  assert.ok(core.razaoContraste('#ffd400', '#000000') >= 14);
  assert.ok(core.razaoContraste('#000000', '#ffd400') >= 14);
  assert.ok(core.razaoContraste('#7dff9b', '#000000') >= 14);
  assert.ok(core.razaoContraste('#ff9e9e', '#000000') >= 10);
  assert.ok(core.razaoContraste('#00e5ff', '#000000') >= 13);
});

test('preferências de acessibilidade normalizam valores legados, fonte e vibração háptica', () => {
  const legado = core.normalizarA11y({ contraste: true, ampliado: true }, false);
  assert.equal(legado.contraste, true);
  assert.equal(legado.escalaFonte, 130);
  assert.equal(legado.vibracao, true);

  const semVibracao = core.normalizarA11y({ vibracao: false }, false);
  assert.equal(semVibracao.vibracao, false);

  assert.equal(core.ajustarEscalaFonte(100, -1), 100);
  assert.equal(core.ajustarEscalaFonte(100, 1), 115);
  assert.equal(core.ajustarEscalaFonte(130, 1), 150);
  assert.equal(core.ajustarEscalaFonte(150, 1), 150);

  const sist = core.normalizarA11y(null, true);
  assert.equal(sist.reduzirAnimacao, true);
});

test('dados.js inclui coordenadas realistas do Centro de Aracaju e atributos atitudinais legais', () => {
  const dados = carregarDados();
  assert.deepEqual(core.validarDados(dados), []);
  assert.ok(dados.tipos_acesso.cao_guia);
  assert.ok(dados.tipos_acesso.prioritario);
  assert.ok(dados.tipos_acesso.braille);
  assert.equal(dados.atributos_acesso.length, 50, '5 negócios × 10 atributos = 50 registros');

  dados.negocios.forEach((n) => {
    assert.equal(typeof n.lat, 'number', `${n.id} precisa ter lat numérico`);
    assert.equal(typeof n.lng, 'number', `${n.id} precisa ter lng numérico`);
    assert.ok(n.lat < -10.89 && n.lat > -10.93, `${n.id} deve estar na latitude do Centro de Aracaju`);
    assert.ok(n.lng < -37.03 && n.lng > -37.07, `${n.id} deve estar na longitude do Centro de Aracaju`);
  });

  // Regra A4: filtro por Braille mantém desconhecido (n4) visível junto com observado (n1)
  const braille = core.filtrarNegocios(dados, { q: '', cat: null, nec: 'braille' }, 't2');
  const idsBraille = braille.map((n) => n.id);
  assert.ok(idsBraille.includes('n1'));
  assert.ok(idsBraille.includes('n4'));
  assert.ok(!idsBraille.includes('n2'));
});

test('fórmula de Haversine calcula distâncias com precisão, formata em m/km e ordena mais próximos', () => {
  const dados = carregarDados();
  assert.equal(core.calcularDistanciaHaversine(-10.9111, -37.0493, -10.9111, -37.0493), 0);

  // 1 grau de latitude ≈ 111,19 km
  const umGrau = core.calcularDistanciaHaversine(0, 0, 1, 0);
  assert.ok(umGrau > 111000 && umGrau < 111400, `Esperado ~111,19km, recebido ${umGrau}`);

  // Distância entre Café da Praça (n1) e Tabuleiro da Dona Rosa (n3) no Centro de Aracaju (~395m)
  const n1 = dados.negocios.find((n) => n.id === 'n1');
  const n3 = dados.negocios.find((n) => n.id === 'n3');
  const d13 = core.calcularDistanciaHaversine(n1.lat, n1.lng, n3.lat, n3.lng);
  assert.ok(d13 > 350 && d13 < 450, `Esperado ~395m entre n1 e n3, recebido ${Math.round(d13)}m`);

  assert.equal(core.formatarDistancia(84.6), '85 m');
  assert.equal(core.formatarDistancia(999), '999 m');
  assert.equal(core.formatarDistancia(1000), '1,0 km');
  assert.equal(core.formatarDistancia(2450), '2,5 km');
  assert.equal(core.estimarCaminhada(300), '~5 min a pé');

  // Ordenação a partir da Praça Fausto Cardoso coloca Café da Praça (n1) em primeiro
  const ordenados = core.ordenarPorDistancia(dados.negocios, core.PONTO_CENTRO_ARACAJU);
  assert.equal(ordenados[0].id, 'n1');
});

test('montarDadosCompartilhamento gera payload completo para Web Share API e fallback', () => {
  const dados = carregarDados();
  const payload = core.montarDadosCompartilhamento(dados, 'n1', 'https://vitrinecentro.local/index.html#inicio');
  assert.equal(payload.title, 'Café da Praça (exemplo) — VitrineCentro');
  assert.equal(payload.url, 'https://vitrinecentro.local/index.html#negocio-n1');
  assert.match(payload.text, /Café da Praça/);
  assert.match(payload.text, /confirme antes da visita/);

  const payloadItem = core.montarDadosCompartilhamentoItem(dados, 'i1', 'https://vitrinecentro.local/');
  assert.equal(payloadItem.url, 'https://vitrinecentro.local/#item-i1');
});

test('Índice de Acessibilidade Cidadã calcula percentuais corretos de cobertura física e atitudinal', () => {
  const dados = carregarDados();
  const idx = core.calcularIndiceCidadao(dados);
  assert.equal(idx.totalNegocios, 5);
  assert.equal(idx.totalAtributos, 50);
  assert.equal(idx.verificados + idx.desconhecidos, 50);

  const entrada = idx.indicadores.find((x) => x.tipo === 'degrau');
  const caoGuia = idx.indicadores.find((x) => x.tipo === 'cao_guia');
  const braille = idx.indicadores.find((x) => x.tipo === 'braille');

  assert.equal(entrada.atendidos, 3);
  assert.equal(entrada.pct, 60);
  assert.equal(caoGuia.atendidos, 4);
  assert.equal(caoGuia.pct, 80);
  assert.equal(braille.atendidos, 1);
  assert.equal(braille.pct, 20);
});

test('exportação de roteiro offline e narração por voz geram textos completos com aviso e atributos', () => {
  const dados = carregarDados();
  const roteiro = core.gerarTextoRoteiro(dados, {
    lojaIds: ['n1'],
    itemIds: ['i1'],
    notas: [{ id: 'nt1', negocio_id: 'n1', texto: 'Confirmar balcão', data: '2026-11-20T00:00:00.000Z' }],
  });
  assert.match(roteiro, /VITRINECENTRO — ROTEIRO OFFLINE/);
  assert.match(roteiro, /Café da Praça/);
  assert.match(roteiro, /Aceita cão-guia/);
  assert.match(roteiro, /Cardápio ou material em Braille/);
  assert.match(roteiro, /Confirmar balcão/);

  const narracao = core.montarTextoNarracaoNegocio(dados, 'n1', dados.temas_culturais[1]);
  assert.match(narracao, /Ficha de Café da Praça/);
  assert.match(narracao, /não são certificação/);
  assert.match(narracao, /Aceita cão-guia/);
});

test('index.html usa ícone oficial sem emoji de museu e contém diálogo de roteiro offline e landmarks', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  assert.match(html, /<html lang="pt-BR">/);
  assert.match(html, /icon-512\.png/);
  assert.ok(!html.includes('🏛️'), 'emoji de museu deve ter sido substituído pelo ícone oficial');
  assert.match(html, /<dialog id="dlg-confirmar"/);
  assert.match(html, /<dialog id="dlg-roteiro"/);
  assert.match(html, /id="area-impressao"/);
});
