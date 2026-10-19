# Lab 5 reference solution (TF copy)

Run:
1. cd road-story
2. npm install
3. npm run dev   -> open http://localhost:5173

Files that matter:
- src/routes/+page.svelte : `step` $state, Scrollama in onMount, scenes table, $derived measure/xDomain/highlightedYear, step text
- src/lib/LineChart.svelte : props data/measure/xDomain/highlightedYear; Svelte renders path + {#each} dots; D3 scales/axes/line; Tween animates each single change; zero-based y-axis
- STORYBOARD.md : 7 scenes, Freytag order, one change per transition
- CLAUDE.md : lab rules + #lib alias + hour-sum quirk

Not committed. Review first, then:
  git init && git add -A && git commit -m "Lab 5 reference solution"
