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

- Total nesta versão: **116 lutadores**.
- Perfis completos importados do teu código original: **62**.
- Perfis básicos adicionados para ampliar a busca: **54**.

Os perfis básicos aparecem na busca, mas ficam marcados como `perfil básico`. Para completar, edite `data/fighters.json` e preencha:

```json
{
  "age": 30,
  "height": "5'10"",
  "weight": "155 lbs",
  "reach": "72"",
  "record": {"w": 20, "l": 3, "d": 0},
  "fin": {"ko": 8, "sub": 6, "dec": 6},
  "stats": {"slpm": 4.2, "sacc": 48, "sdef": 60, "tdavg": 1.2, "tdacc": 35, "tddef": 70, "subavg": 0.6, "kdavg": 0.3},
  "fights": [
    {"r": "W", "opp": "Nome", "meth": "DEC", "ev": "UFC 300", "rnd": 3, "t": "5:00"}
  ]
}
```

## Fotos

A página tenta carregar nesta ordem:

1. Foto local: `assets/fighters/nome-do-lutador.png`
2. Foto remota já existente no JSON
3. Placeholder padrão

Para deixar as fotos certas no GitHub, salve as imagens com o mesmo `id` do lutador. Exemplo:

```txt
assets/fighters/alex-pereira.png
assets/fighters/islam-makhachev.png
assets/fighters/jon-jones.png
```

## Atualização do histórico

Esta versão não usa API paga. O histórico fica em `data/fighters.json` no campo `fights`.

Fontes úteis para revisão manual:

- UFCStats — eventos completos
- UFC.com — resultados e rankings
- UFC Record Book — estatísticas oficiais

## Melhorias feitas

- Separação de arquivos para GitHub Pages.
- Busca sem acento e mais tolerante a erros.
- Filtro por divisão.
- Botão de comparação aleatória.
- Fotos com fallback para não quebrar o layout.
- Perfis básicos marcados visualmente.
- Base ampliada sem travar a página.
