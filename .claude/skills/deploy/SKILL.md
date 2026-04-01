---
name: deploy
description: Build, commit, push et deploy sur Vercel production
disable-model-invocation: true
---

# Deploy

Déploie l'application sur Vercel en production.

## Étapes
1. Vérifie que le build passe (`npx tsc --noEmit && npx vite build`)
2. Si des changements non commités existent, demande à l'utilisateur s'il veut commiter
3. Push sur GitHub (`git push origin main`)
4. Deploy sur Vercel (`npx vercel deploy --prod --yes`)
5. Affiche l'URL de production
