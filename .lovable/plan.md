
## Plan d'implémentation — Prompt 2

Ce prompt couvre 7 parties majeures. Voici le plan d'exécution :

### Phase 1 — Stripe (Partie A)
1. **Activer l'intégration Stripe** via l'outil Lovable Stripe
2. **Créer la table `stripe_webhook_logs`** + migration
3. **Edge Functions** : `create-checkout-session`, `stripe-webhook`, `create-portal-session`
4. **Page `/pricing`** avec 3 plans (Starter 99€/an, Pro 29€/mois, Performance 99€/mois)
5. **Câbler les boutons CTA** Landing + Onboarding + Account

### Phase 2 — State Machine vivante (Partie B)
6. **Refactorer `/introductions/:id`** : appels RPC réels, formulaires par statut, toasts d'erreur
7. **Composant `TitanProofUpload`** : drag & drop, SHA-256 client, Storage bucket `proofs`
8. **Calcul automatique commissions** sur transition WON
9. **Migration** : bucket Storage `proofs`

### Phase 3 — Prospection IA (Partie C)
10. **Edge Function `ai-scan-prospects`** : génération mockée + cron quotidien
11. **Edge Function `ai-generate-message`** : template personnalisé V1
12. **Besoins Fantômes** : logique de création + affichage Hub Facilitateur

### Phase 4 — Emails transactionnels (Partie D)
13. **Configurer le domaine email** Lovable
14. **11 templates React Email** dans `_shared/transactional-email-templates/`
15. **Câbler les triggers** dans le code (signup, transitions, commissions, etc.)

### Phase 5 — QR Weapon & Parrainage (Partie E)
16. **Migration** : colonne `referred_by` sur `profiles`
17. **Page `/join`** avec pré-remplissage du parrain
18. **QR code** dans Hub Facilitateur avec `qrcode.react`

### Phase 6 — Anti-fraude (Partie F)
19. **Edge Function `fraud-detection`** : 4 règles de détection
20. **Dégradation `reputation_score`** automatique

### Phase 7 — Dashboard dynamique (Partie G)
21. **Remplacer tous les mocks** par des queries Supabase réelles
22. **Fallback cockpit vide** : Besoins Fantômes + métriques réseau

### ⚠️ Remarques
- **Stripe** nécessite votre clé secrète Stripe — je vous la demanderai
- **Emails** : j'utiliserai l'infrastructure email intégrée de Lovable (pas Resend directement, car Lovable Cloud gère ça nativement)
- **Estimation** : ce plan sera exécuté en plusieurs étapes, phase par phase
