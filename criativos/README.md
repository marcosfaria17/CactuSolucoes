# Cactu · Criativos

Arquivos do pacote:

- `base-criativo.html`: molde visual.
- `criativos.json`: textos, público-alvo, formato, botão e configs.
- `export-creativos.js`: motor que lê o JSON, injeta no HTML e exporta PNGs.

## Como rodar

```bash
npm i -D playwright
npx playwright install chromium
node export-creativos.js
```

As imagens saem na pasta configurada em `criativos.json`, por padrão `exports/`.

## Nome dos arquivos

O padrão é:

```txt
formato-publico-alvo-nome-da-peca@4x.png
```

Exemplo:

```txt
feed-gestores-ilusao-controle@4x.png
```

## Botão do WhatsApp

No `config` geral:

```json
"showWhatsappButton": true
```

Ou em uma peça específica:

```json
"showWhatsappButton": false
```


## Fluxo do feed

No formato `feed`, os itens de `config.flow.items` aparecem abaixo do texto de apoio e antes do botão.

## Botão desligado

Quando `showWhatsappButton` estiver `false`, o botão inteiro some, incluindo o ícone.


## Padronização visual dos 4 temas

No formato `feed`, os 4 temas agora usam o mesmo bloco visual do `story`:

- rótulo de seção
- chips/teminhas
- mesmas cores e linguagem visual

Isso padroniza os dois formatos e elimina o bloco visual antigo do flow no feed.


## Ajuste de respiro vertical

O conteúdo do feed e do story foi levemente deslocado para cima para evitar sobra grande entre a logo e o bloco principal quando o texto for curto.

Ajustes principais no CSS:

- `.feed-base .main-copy { margin-top: 48px; }`
- `.story-base .main-copy { margin-top: 58px; }`

Para subir mais, reduza esses valores. Para descer, aumente.
