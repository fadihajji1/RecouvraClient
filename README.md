# Recouvra+ Client

> Application Angular de gestion du recouvrement de créances — Frontend moderne connecté à l'API RecouvraApi.

---

## 📋 Présentation du Projet

**Recouvra+** est une solution complète de gestion du recouvrement de créances destinée aux entreprises et cabinets de recouvrement. Cette application frontend, développée avec **Angular 19**, offre une interface utilisateur premium et intuitive permettant de centraliser la gestion des clients débiteurs, le suivi des factures impayées, l'enregistrement des paiements et la planification des actions de recouvrement.

L'application communique avec le backend **RecouvraApi** (Express.js / MongoDB) via une API RESTful sécurisée par JWT.

---

## 🎯 Objectifs

- **Centraliser** la gestion des créances dans une interface unique et ergonomique
- **Automatiser** le suivi des factures impayées et des échéances
- **Faciliter** la planification et le suivi des actions de recouvrement (appels, emails, mises en demeure)
- **Sécuriser** l'accès aux données avec un système d'authentification JWT et un contrôle d'accès basé sur les rôles (Agent, Manager, Admin)
- **Offrir** une vue d'ensemble en temps réel via un tableau de bord statistique

---

## ✨ Fonctionnalités

### Authentification & Sécurité

- Connexion / Inscription avec validation
- Gestion automatique du token JWT (injection via interceptor HTTP)
- Contrôle d'accès par rôle : **Agent**, **Manager**, **Admin**
- Redirection automatique selon l'état d'authentification
- Déconnexion avec nettoyage de session

### Tableau de Bord

- Cartes statistiques : nombre de clients, factures, montants, retards
- Répartition des factures par statut (Brouillon, Envoyée, Payée, Annulée)
- Liste des paiements récents
- Actions de recouvrement à venir

### Gestion des Clients

- Liste complète avec recherche instantanée
- Création et modification via modal
- Informations : nom, email, téléphone, entreprise, adresse
- Suppression avec confirmation

### Gestion des Factures

- Liste avec filtre par statut et pagination
- Création avec articles dynamiques (ajout/suppression de lignes)
- Sélection du client, date d'échéance, taux de taxe
- Modification du statut (Brouillon → Envoyée → Payée / Annulée)

### Gestion des Paiements

- Enregistrement de paiements liés aux factures
- Filtre par méthode de paiement (Virement, Chèque, Espèces, Carte)
- Suivi avec référence et notes
- Pagination

### Actions de Recouvrement

- Planification d'actions : Email, Appel, Réunion, Rappel, Mise en demeure
- Suivi par statut : Planifiée, Terminée, Annulée
- Date de prochaine action et résultat
- Filtre et pagination

### Administration (Admin uniquement)

- Liste des utilisateurs avec rôles
- Suppression de comptes

### Design & UX

- Thème sombre premium avec effets glassmorphism
- Dégradés indigo/violet, typographie Inter
- Interface responsive (desktop / tablette)
- Animations et transitions fluides
- Sidebar de navigation avec indicateur de rôle

---

## 🏗️ Architecture du Projet

```
src/
├── app/
│   ├── core/
│   │   ├── guards/              # AuthGuard, GuestGuard, AdminGuard
│   │   ├── interceptors/        # Intercepteur JWT (injection automatique du token)
│   │   ├── models/              # Interfaces TypeScript (User, Client, Invoice, Payment, RecoveryAction)
│   │   └── services/            # Services HTTP (Auth, Client, Invoice, Payment, RecoveryAction, Statistics, User)
│   ├── layout/                  # Composant principal (sidebar + navbar + router-outlet)
│   ├── pages/
│   │   ├── login/               # Page de connexion
│   │   ├── register/            # Page d'inscription
│   │   ├── dashboard/           # Tableau de bord statistique
│   │   ├── clients/             # CRUD Clients
│   │   ├── invoices/            # CRUD Factures (avec articles)
│   │   ├── payments/            # CRUD Paiements
│   │   ├── recovery-actions/    # CRUD Actions de recouvrement
│   │   └── users/               # Gestion utilisateurs (admin)
│   └── shared/
│       └── components/          # Sidebar, Navbar
├── environments/                # Configuration API (dev / prod)
└── styles.scss                  # Thème global et design system
```

---

## 🛠️ Technologies


| Technologie    | Version | Rôle                       |
| -------------- | ------- | -------------------------- |
| Angular        | 19      | Framework frontend         |
| TypeScript     | 5.x     | Langage principal          |
| SCSS           | —       | Styles et thème            |
| RxJS           | 7.x     | Gestion asynchrone         |
| Angular Router | 19      | Navigation et lazy loading |
| HttpClient     | 19      | Communication API REST     |


---

## ⚡ Installation Rapide

### Prérequis

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MongoDB** en cours d'exécution (pour le backend)
- **Backend RecouvraApi** configuré et démarré

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd recouvraClient1
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l'environnement

Le fichier `src/environments/environment.ts` pointe par défaut vers :

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api'
};
```

> Modifiez `apiUrl` si votre backend tourne sur un autre port.

### 4. Démarrer le backend

```bash
cd "../RecouvraApi v1  mongo compass"
npm install
npm start
# → API disponible sur http://localhost:3001
```

### 5. Lancer le frontend

```bash
cd recouvraClient1
npm start 
# OR ng serve 
# → Application disponible sur http://localhost:4200
```

### 6. Accéder à l'application

Ouvrez votre navigateur sur **[http://localhost:4200](http://localhost:4200)** et connectez-vous avec un compte existant ou créez-en un via la page d'inscription.

---

## 👥 Rôles Utilisateurs


| Rôle        | Accès                                                            |
| ----------- | ---------------------------------------------------------------- |
| **Agent**   | Dashboard, Clients, Factures, Paiements, Actions de recouvrement |
| **Manager** | Même accès qu'Agent                                              |
| **Admin**   | Accès complet + Gestion des utilisateurs                         |


---

## 📡 API Backend

L'application consomme les endpoints suivants du backend RecouvraApi :


| Module       | Endpoint                                | Méthodes               |
| ------------ | --------------------------------------- | ---------------------- |
| Auth         | `/api/auth/login`, `/api/auth/register` | POST                   |
| Clients      | `/api/clients`                          | GET, POST, PUT, DELETE |
| Factures     | `/api/invoices`                         | GET, POST, PUT, DELETE |
| Paiements    | `/api/payments`                         | GET, POST, DELETE      |
| Recouvrement | `/api/recovery-actions`                 | GET, POST, PUT, DELETE |
| Statistiques | `/api/statistics`                       | GET                    |
| Utilisateurs | `/api/users`                            | GET, DELETE            |


> Le backend doit avoir **CORS activé** (`app.use(cors())` dans `app.js`) pour autoriser les requêtes depuis `localhost:4200`.

---

## 📄 Licence

Projet académique — Tous droits réservés.