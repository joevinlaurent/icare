# IcareClone - Contrats API et Plan d'Intégration Backend

## Architecture de l'Application

### Frontend (Actuel - avec Mock Data)
- ✅ Interface React moderne et responsive
- ✅ Thèmes clair/sombre avec Context API
- ✅ Authentification mockée (demo@icare.com / demo123)
- ✅ Navigation mobile avec React Router
- ✅ Gestion des préférences utilisateur (localStorage)
- ✅ WebView Instagram simulée avec iframe
- ✅ Système de notifications (Toast)

### Backend (À implémenter)
- **Stack**: FastAPI + MongoDB + JWT Authentication
- **Port**: 8001 (mapping interne)
- **Prefix**: `/api` (requis pour ingress Kubernetes)

## Contrats API

### 1. Authentification
```
POST /api/auth/register
Body: { name: string, email: string, password: string }
Response: { success: boolean, user?: User, message?: string }

POST /api/auth/login  
Body: { email: string, password: string }
Response: { success: boolean, user?: User, token?: string, message?: string }

GET /api/auth/me
Headers: { Authorization: Bearer <token> }
Response: { user: User }
```

### 2. Préférences Utilisateur
```
GET /api/user/preferences
Headers: { Authorization: Bearer <token> }
Response: { preferences: UserPreferences }

PUT /api/user/preferences
Headers: { Authorization: Bearer <token> }
Body: { hideReels?: boolean, hideStories?: boolean, hideSuggestions?: boolean, lockMode?: boolean, lockEndTime?: string }
Response: { success: boolean, preferences: UserPreferences }
```

### 3. Statistiques et Temps
```
POST /api/user/time-saved
Headers: { Authorization: Bearer <token> }
Body: { minutes: number, platform: string }
Response: { success: boolean, totalTimeSaved: number }

GET /api/user/stats
Headers: { Authorization: Bearer <token> }
Response: { timeSaved: number, sessionsCount: number, achievements: Achievement[] }
```

### 4. Abonnements (Mock pour version gratuite)
```
POST /api/subscription/create
Headers: { Authorization: Bearer <token> }
Body: { plan: 'premium' }
Response: { success: boolean, subscription: Subscription }

GET /api/subscription/status
Headers: { Authorization: Bearer <token> }
Response: { subscription: Subscription }
```

## Modèles de Données

### User
```javascript
{
  _id: ObjectId,
  name: string,
  email: string,
  password: string, // hashé avec bcrypt
  avatar?: string,
  bio?: string,
  subscription: 'free' | 'premium',
  timeSaved: number, // minutes
  referralCode: string,
  createdAt: Date,
  updatedAt: Date
}
```

### UserPreferences
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  hideReels: boolean,
  hideStories: boolean, 
  hideSuggestions: boolean,
  lockMode: boolean,
  lockEndTime?: Date,
  updatedAt: Date
}
```

### TimeSession
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  platform: string, // 'instagram', 'tiktok', etc.
  timeSpent: number, // secondes
  timeSaved: number, // estimation en minutes
  startTime: Date,
  endTime: Date
}
```

## Données Mockées à Remplacer

### Frontend Mock Data (/utils/mockData.js)
- `mockUsers[]` → Remplacer par vraies requêtes API
- `socialNetworks[]` → Peut rester statique
- `mockStats` → Remplacer par API stats

### Contexts à Modifier
- `AuthContext.js` → Utiliser vraies requêtes au lieu de localStorage
- `UserContext.js` → Synchroniser avec backend via API

## Plan d'Intégration Backend

### Phase 1: Configuration Base
1. Configurer modèles MongoDB avec Pydantic
2. Implémenter JWT authentication avec passlib
3. Créer middleware CORS et error handling
4. Tester endpoints auth de base

### Phase 2: Logique Métier  
1. CRUD préférences utilisateur
2. Système de tracking temps
3. Calculs statistiques
4. Gestion des sessions

### Phase 3: Intégration Frontend
1. Remplacer mock authentication par vraies requêtes
2. Synchroniser préférences avec backend  
3. Implémenter sauvegarde automatique
4. Gestion des erreurs et fallbacks

### Phase 4: Fonctionnalités Avancées
1. Système de parrainage
2. Achievements/succès  
3. Mode verrou avec timestamps serveur
4. Scripts d'injection personnalisés par plateforme

## Variables d'Environnement Nécessaires

Backend (.env):
```
MONGO_URL=mongodb://mongodb:27017
DB_NAME=icare_db  
JWT_SECRET=<secret_key>
JWT_EXPIRE_HOURS=24
BCRYPT_ROUNDS=12
```

## Tests à Effectuer

### Backend Testing
1. Endpoints authentication (register/login/me)
2. CRUD préférences utilisateur
3. Tracking temps et calculs statistiques
4. JWT token validation et expiration
5. Validation des données Pydantic

### Integration Testing  
1. Login/logout flow complet
2. Sauvegarde préférences cross-device
3. Synchronisation temps en temps réel
4. Gestion des erreurs réseau
5. Fallback sur données locales si backend indisponible

L'application frontend actuelle est complètement fonctionnelle avec données mockées et prête pour l'intégration backend.