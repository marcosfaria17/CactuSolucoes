const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

/*
  GERADOR DE CRIATIVOS · CACTU
  ------------------------------------------------------------------
  Este arquivo é o motor da fábrica.

  O fluxo agora é:
  - base-criativo.html  = corpo visual fixo
  - criativos.json      = textos, público, temas/chips, config e variações
  - export-creativos.js = lê o JSON, injeta no HTML e exporta os PNGs

  Como usar:
  1. Edite o arquivo criativos.json.
  2. Rode: node export-creativos.js
  3. Pegue as imagens na pasta definida em config.outDir, por padrão exports/.

  Nome dos arquivos:
  O gerador monta o nome assim:
  formato-publico-alvo-nome-da-peca@escala.png

  Exemplo:
  feed-gestores-caos-invisivel@4x.png

  Botão do WhatsApp:
  - No config geral, use: "showWhatsappButton": true ou false
  - Em uma peça específica, use o mesmo campo para sobrescrever só aquela peça.

  Temas/chips:
  - Use "sectionLabel" para o rótulo.
  - Use "chips" para os temas exibidos no feed e no story.
*/

const CONFIG_FILE = 'criativos.json';

const FALLBACK_CONFIG = {
  scale: 4,
  htmlFile: 'base-criativo.html',
  outDir: 'exports',
  showWhatsappButton: true,
  footer: 'cactusolucoes.com.br · (62) 98130-6841',
  sectionLabel: 'Trabalhamos com',
  chips: [
    { text: 'Planilhas', color: 'verde' },
    { text: 'Banco de dados', color: 'azul' },
    { text: 'Sistemas' },
    { text: 'APIs' }
  ]
};

function readJson(fileName) {
  const filePath = path.resolve(__dirname, fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error('Arquivo de configuração não encontrado: ' + fileName);
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error('Erro ao ler ' + fileName + ': ' + error.message);
  }
}

function mergeConfig(base, overrides = {}) {
  return {
    ...base,
    ...overrides,
    flow: { ...base.flow, ...(overrides.flow || {}) },
    chips: overrides.chips || base.chips
  };
}

function templateSelector(format) {
  if (format === 'feed') return '.feed-base';
  if (format === 'story') return '.story-base';
  throw new Error('Formato inválido: ' + format + '. Use "feed" ou "story".');
}

function slugify(value, fallback = 'sem-nome') {
  const slug = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return slug || fallback;
}

function buildOutputName(creative, scale) {
  const format = slugify(creative.format, 'formato');
  const audience = slugify(creative.audience || creative.publicoAlvo, 'publico-geral');
  const name = slugify(creative.name || creative.headline, 'criativo');

  return `${format}-${audience}-${name}@${scale}x.png`;
}

function shouldShowWhatsappButton(creative, config) {
  if (typeof creative.showWhatsappButton === 'boolean') return creative.showWhatsappButton;
  if (typeof creative.whatsappButton === 'boolean') return creative.whatsappButton;
  if (typeof creative.ctaEnabled === 'boolean') return creative.ctaEnabled;
  return Boolean(config.showWhatsappButton);
}

async function waitForAssets(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;

    await Promise.all(
      Array.from(document.images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );
  });
}

async function setText(piece, slot, value, options = {}) {
  const target = piece.locator(`[data-slot="${slot}"]`).first();
  if (!(await target.count())) return;

  await target.evaluate((element, payload) => {
    const text = payload.text || '';
    element.textContent = text;
    if (payload.hideWhenEmpty) {
      element.style.display = text ? '' : 'none';
    }
  }, { text: value || '', hideWhenEmpty: Boolean(options.hideWhenEmpty) });
}

async function setHeadline(piece, headline, highlight) {
  const target = piece.locator('[data-slot="headline"]').first();
  if (!(await target.count())) return;

  await target.evaluate((el, data) => {
    const escapeHtml = value => String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

    const escapeRegExp = value => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const highlights = Array.isArray(data.highlight) ? data.highlight : [data.highlight].filter(Boolean);

    let html = escapeHtml(data.headline || '').replaceAll('\n', '<br>');

    for (const item of highlights) {
      const escapedItem = escapeHtml(item);
      const regex = new RegExp(escapeRegExp(escapedItem), 'gi');
      html = html.replace(regex, match => '<em>' + match + '</em>');
    }

    el.innerHTML = html;
  }, { headline: headline || '', highlight });
}


async function renderPains(piece, pains = []) {
  const target = piece.locator('[data-slot="pains"]').first();
  if (!(await target.count())) return;

  await target.evaluate((el, items) => {
    el.innerHTML = '';

    if (!items || !items.length) {
      el.style.display = 'none';
      return;
    }

    el.style.display = 'flex';

    for (const text of items) {
      const row = document.createElement('div');
      row.className = 'pain-row';
      row.textContent = text;
      el.appendChild(row);
    }
  }, pains);
}

async function renderChips(piece, chips = []) {
  const target = piece.locator('[data-slot="chips"]').first();
  if (!(await target.count())) return;

  await target.evaluate((el, items) => {
    el.innerHTML = '';

    if (!items || !items.length) {
      el.style.display = 'none';
      return;
    }

    el.style.display = 'flex';

    for (const item of items) {
      const data = typeof item === 'string' ? { text: item } : item;
      const chip = document.createElement('div');
      chip.className = ['chip', data.color].filter(Boolean).join(' ');
      chip.textContent = data.text || '';
      el.appendChild(chip);
    }
  }, chips);
}

async function renderWhatsappButton(piece, creative, config) {
  const button = piece.locator('[data-element="whatsapp-button"]').first();

  const enabled = shouldShowWhatsappButton(creative, config);
  const text = creative.cta || '';

  if (await button.count()) {
    await button.evaluate((el, data) => {
      // Esconde o botão inteiro, incluindo ícone, texto, fundo e espaçamento.
      el.style.display = data.enabled && data.text ? '' : 'none';
    }, { enabled, text });
  }

  await setText(piece, 'cta', enabled ? text : '');
}

async function fillCreative(piece, creative, config) {
  const chips = creative.chips || config.chips;

  await setText(piece, 'pill', creative.pill, { hideWhenEmpty: true });
  await setHeadline(piece, creative.headline, creative.highlight);
  await setText(piece, 'sub', creative.sub, { hideWhenEmpty: true });
  await setText(piece, 'footer', creative.footer ?? config.footer, { hideWhenEmpty: true });
  await setText(piece, 'sectionLabel', creative.sectionLabel ?? config.sectionLabel, { hideWhenEmpty: true });

  await renderWhatsappButton(piece, creative, config);
  await renderPains(piece, creative.pains || []);
  await renderChips(piece, chips || []);
}

(async () => {
  const json = readJson(CONFIG_FILE);
  const config = mergeConfig(FALLBACK_CONFIG, json.config || {});
  const creatives = json.creatives || [];

  if (!Array.isArray(creatives) || creatives.length === 0) {
    throw new Error('Nenhum criativo encontrado em criativos.json. Preencha o array "creatives".');
  }

  if (!fs.existsSync(config.outDir)) fs.mkdirSync(config.outDir, { recursive: true });

  const browser = await chromium.launch();
  const htmlPath = 'file://' + path.resolve(__dirname, config.htmlFile);

  for (const creative of creatives) {
    if (creative.enabled === false) {
      console.log('⏭️  Ignorado: ' + (creative.name || creative.headline || 'sem nome'));
      continue;
    }

    const page = await browser.newPage({
      viewport: { width: 2600, height: 3000 },
      deviceScaleFactor: config.scale
    });

    await page.goto(htmlPath, { waitUntil: 'networkidle' });
    await waitForAssets(page);

    const selector = templateSelector(creative.format);
    const piece = page.locator(selector).first();

    if (!(await piece.count())) {
      throw new Error('Molde não encontrado no HTML: ' + selector);
    }

    await fillCreative(piece, creative, config);

    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    const fileName = buildOutputName(creative, config.scale);
    const outputPath = path.join(config.outDir, fileName);

    await piece.screenshot({
      path: outputPath,
      animations: 'disabled',
      scale: 'device'
    });

    console.log('✅ Exportado: ' + outputPath);
    await page.close();
  }

  await browser.close();
})();
