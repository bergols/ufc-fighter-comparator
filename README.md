# UFC Fighter Comparator — Versão 1

Projeto pronto para GitHub Pages, separado em HTML, CSS, JS e JSON.

## Como publicar

1. Envie todos estes arquivos para um repositório no GitHub.
2. Renomeie nada: mantenha `index.html` na raiz.
3. Vá em **Settings → Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**.
5. Escolha a branch `main` e a pasta `/root`.
6. Abra o link gerado pelo GitHub Pages.

## Estrutura

```txt
index.html
style.css
app.js
data/fighters.json
assets/fighters/
assets/img/fighter-placeholder.svg
```

## Base de lutadores

> **Atenção:** a base ainda está em revisão manual. Os números abaixo refletem o estado atual — dados marcados como "em revisão" podem conter recordes, rankings ou status de campeão desatualizados. Não confie nesses campos sem verificar em fontes oficiais (UFC.com, UFCStats).

| Status | Quantidade |
|---|---|
| **Total de lutadores** | **193** |
| Perfis completos (stats + histórico + foto) | 62 |
| Perfis em revisão (dados não verificados) | 131 |
| Perfis básicos | 0 |

As 11 divisões cobertas: Flyweight, Bantamweight, Featherweight, Lightweight, Welterweight, Middleweight, Light Heavyweight, Heavyweight, Women's Strawweight, Women's Flyweight, Women's Bantamweight.

### O que significa cada status

- **Perfil completo** — tem stats reais, histórico de lutas e foto. Radar e comparativo funcionam plenamente.
- **Em revisão** — tem nome, divisão, recorde e dados básicos, mas **stats, histórico e fotos ainda não foram verificados manualmente**. O radar não é exibido para evitar dados incorretos.
- **Básico** — apenas nome e divisão. Aparece na busca mas não entra na comparação aleatória.

## Como completar um perfil em revisão

Abra `data/fighters.json`, encontre o lutador pelo `id` e preencha os campos em branco:

```json
{
  "age": 30,
  "height": "5'10\"",
  "weight": "155 lbs",
  "reach": "72\"",
  "stance": "Orthodox",
  "team": "Nome do Gym",
  "record": {"w": 20, "l": 3, "d": 0},
  "fin": {"ko": 8, "sub": 6, "dec": 6},
  "stats": {
    "slpm": 4.2, "sacc": 48, "sdef": 60,
    "tdavg": 1.2, "tdacc": 35, "tddef": 70,
    "subavg": 0.6, "kdavg": 0.3
  },
  "fights": [
    {"r": "W", "opp": "Nome", "meth": "DEC", "ev": "UFC 300", "rnd": 3, "t": "5:00"}
  ],
  "remotePhoto": "https://url-da-foto.png",
  "status": "profile",
  "dataQuality": "manual",
  "dataStatus": "complete"
}
```

Fontes recomendadas para revisão manual:

- **UFCStats** — estatísticas e histórico completo
- **UFC.com** — rankings e resultados oficiais
- **Tapology** — histórico de lutas detalhado

## Fotos

A página tenta carregar nesta ordem:

1. `remotePhoto` (URL no JSON)
2. Proxy via weserv.nl (fallback automático)
3. `localPhoto` (`assets/fighters/id-do-lutador.png`)
4. Placeholder padrão

Para adicionar foto local, salve o arquivo com o `id` do lutador:

```txt
assets/fighters/alex-pereira.png
assets/fighters/islam-makhachev.png
assets/fighters/jon-jones.png
```

## Funcionalidades

- Busca sem acento, tolerante a erros de digitação
- Filtro por divisão (11 categorias)
- Comparação lado a lado com radar de estatísticas
- Badge por nível de dado: completo · em revisão · básico
- Radar e stats ocultados automaticamente quando dados não verificados
- Histórico de lutas com fallback para "ainda não verificado"
- Botão de comparação aleatória
- Fotos com cadeia de fallback (sem quebrar o layout)
- Compatível com GitHub Pages (100% estático)

## Histórico de versões

### V1.1 — 30/05/2026

- Base ampliada para 193 lutadores únicos (11 divisões, top 15 por categoria).
- Dedupe automático: 238 registros → 193 únicos, preservando sempre o perfil mais completo.
- Três níveis de dado: `profile` (completo), `review` (em revisão), `basic`.
- Radar e stats ocultados quando dados não verificados — sem gráfico vazio.
- Histórico exibe "ainda não verificado" em vez de campo vazio.
- Proxy de fotos corrigido (removido `output=webp` que causava falha silenciosa).
- Badge amarelo para perfis em revisão.

### V1.0 — 29/05/2026

- Versão inicial para GitHub Pages.
- 62 perfis completos com stats, histórico e fotos.
- Sistema de fotos com fallback (remota → proxy → local → placeholder).
- Busca inteligente, filtro por divisão, comparação aleatória.
