# Menu Magique - Serveur Backend

Ce serveur Node.js gère la base de données PostgreSQL pour le système de gestion de restaurant Menu Magique.

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (version 16 ou supérieure)
- PostgreSQL installé et en cours d'exécution
- Base de données `RestaurantMangement` créée

### 1. Installer les dépendances
```bash
cd server
npm install
```

### 2. Configuration de la base de données
Le fichier `config.env` contient déjà la configuration par défaut :
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=RestaurantMangement
DB_USER=postgres
DB_PASSWORD=admin
```

**Modifiez ces valeurs selon votre configuration PostgreSQL.**

### 3. Démarrer le serveur
```bash
# Mode développement (avec rechargement automatique)
npm run dev

# Mode production
npm start
```

Le serveur démarrera sur le port 3001.

## 📊 Structure de la Base de Données

### Table `menu_items`
```sql
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  category VARCHAR(100) NOT NULL,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 API Endpoints

### Santé du serveur
- `GET /api/health` - Vérifier l'état du serveur et de la base de données

### Gestion des plats
- `GET /api/menu-items/all` - Récupérer tous les plats
- `GET /api/menu-items/:id` - Récupérer un plat par ID
- `GET /api/menu-items/category/:category` - Récupérer les plats par catégorie
- `POST /api/menu-items/add` - Ajouter un nouveau plat
- `PUT /api/menu-items/update/:id` - Mettre à jour un plat
- `DELETE /api/menu-items/delete/:id` - Supprimer un plat
- `PATCH /api/menu-items/toggle/:id` - Basculer la disponibilité d'un plat
- `GET /api/menu-items/stats/overview` - Statistiques du menu

## 🛠️ Fonctionnalités

- ✅ Connexion automatique à PostgreSQL
- ✅ Création automatique des tables
- ✅ Insertion de données d'exemple
- ✅ Validation des données
- ✅ Gestion des erreurs
- ✅ Logs détaillés
- ✅ Sécurité avec Helmet
- ✅ CORS activé
- ✅ Gestion gracieuse de l'arrêt

## 🔍 Test de la Connexion

Une fois le serveur démarré, testez la connexion :
```bash
curl http://localhost:3001/api/health
```

Vous devriez recevoir :
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "environment": "development",
  "database": {
    "host": "localhost",
    "port": "5432",
    "name": "RestaurantMangement"
  }
}
```

## 🚨 Dépannage

### Erreur de connexion à PostgreSQL
1. Vérifiez que PostgreSQL est en cours d'exécution
2. Vérifiez les informations de connexion dans `config.env`
3. Assurez-vous que la base de données `RestaurantMangement` existe

### Port déjà utilisé
Si le port 3001 est occupé, modifiez la variable `PORT` dans `config.env`.

### Erreurs de permissions
Assurez-vous que l'utilisateur PostgreSQL a les droits suffisants sur la base de données.

## 📝 Logs

Le serveur affiche des logs détaillés dans la console :
- ✅ Connexions réussies
- ❌ Erreurs de connexion
- 📊 Opérations de base de données
- 🚀 Démarrage du serveur

## 🔒 Sécurité

- Headers de sécurité avec Helmet
- Validation des entrées
- Gestion des erreurs sans exposition d'informations sensibles
- CORS configuré pour le développement

## 🗑️ Suppression

Cette page est temporaire et peut être supprimée après les tests. Pour la supprimer :

1. Supprimez le fichier `src/pages/TempDatabaseFill.tsx`
2. Supprimez la route dans `src/App.tsx`
3. Supprimez le dossier `server/` entier


