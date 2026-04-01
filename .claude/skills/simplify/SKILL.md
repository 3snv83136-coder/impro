---
name: simplify
description: Revue du code récemment modifié pour simplifier et améliorer la qualité
---

# Simplify

Analyse le code récemment modifié et propose des simplifications.

## Étapes
1. Identifie les fichiers modifiés récemment (`git diff --name-only HEAD~1`)
2. Lis chaque fichier modifié
3. Cherche : code dupliqué, abstractions inutiles, imports non utilisés, composants trop longs
4. Propose des simplifications concrètes
5. Applique les changements après validation
