# Morfopedia

**Morfopedia** — etimologia da nomenclatura anatômica e médica. 2.038 verbetes com raízes gregas e latinas, resumo, fonte e três modos de pesquisa (termo, órgão/sistema, região do corpo).

## O que tem no site

- **Pesquisa por termo** com autocompletar, busca por raiz (ex.: *kardia*) e por trechos do texto.
- **Pesquisa por órgão / sistema** (15 sistemas, com nomes em latim da Terminologia Anatômica) → escolha da região → filtro de termo.
- **Pesquisa por região / membro** com mapa do corpo clicável → escolha do órgão → filtro de termo.
- **Verbete único** (modo foco, pensado para TDAH), com raízes e significados, resumo, idioma de origem, recomendados em ordem alfabética no contexto da busca, termos da mesma raiz, citação ABNT para copiar e impressão.
- **Organograma interativo** do fluxo de pesquisa e página de **requisitos** (RF01–RF05, RNF).
- **Sobre e fontes**: autores e referências bibliográficas.
- Modo claro/escuro, responsivo (celular e computador) e **funciona off-line** depois do primeiro acesso (PWA).

Não precisa de instalação nem de build: é HTML, CSS e JavaScript puros.

## Ver no computador

Abra o arquivo `index.html` no navegador (duplo clique). Tudo funciona, exceto o modo off-line, que só é ativado quando o site está publicado.

## Publicar no GitHub Pages

1. Crie um repositório novo no GitHub (por exemplo `morfopedia`).
2. Envie **todo o conteúdo desta pasta** para a raiz do repositório (botão *Add file → Upload files*, arraste os arquivos e pastas e clique em *Commit changes*).
3. No repositório, vá em **Settings → Pages**.
4. Em *Source*, escolha **Deploy from a branch**, branch **main** e pasta **/ (root)**. Salve.
5. Em 1–2 minutos o site estará em `https://SEU-USUARIO.github.io/morfopedia/`.

## Estrutura

```
index.html              página única (rotas por #)
manifest.webmanifest    instalação como app (PWA)
sw.js                   cache off-line
assets/css/style.css    visual
assets/js/app.js        busca, rotas e telas
assets/js/icons.js      ícones e mapa do corpo (SVG originais)
assets/js/data.js       verbetes (gerado do PDF + dados complementares)
assets/fonts/           fontes Fraunces e Montserrat (off-line)
assets/img/             ícone e logotipos EPM/UNIFESP
```

Para mudar textos ou cores, edite `assets/css/style.css` (variáveis no topo) e `assets/js/app.js`.

## Fontes e créditos

- **Fonte principal (1.323 verbetes):** *Dicionário etimológico de termos médicos* — Manuel de Jesus Simões, 2008 (PDF).
- **Fonte complementar (715 verbetes):** Simões RS, Girão JHRC, Sasso GRS, Silva RF, Alonso LG, Marques SR. *Dicionário de etimologia de termos morfológicos*. EPM/UNIFESP, 2014. Versão digital: https://github.com/deusanyjunior/dicionarioetimologico
- Quando um termo existe nas duas obras, vale o texto da fonte principal. Cada verbete mostra a sua fonte.
- A classificação por órgão/sistema e por região foi feita automaticamente por palavras-chave e é apenas auxiliar.
- Fontes tipográficas Fraunces e Montserrat (SIL Open Font License), incluídas em `assets/fonts/`.
- Recomenda-se confirmar a permissão de uso com os autores das obras antes de publicar.
