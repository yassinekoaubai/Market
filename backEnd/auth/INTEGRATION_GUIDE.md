# 🔌 Guide d'Intégration

Comment intégrer ce service d'authentification dans votre application cliente.

## 📱 Frontend (React, Vue, etc.)

### 1. Installation des dépendances

```bash
npm install axios   # ou fetch API
```

### 2. Service d'authentification côté client

```typescript
// src/services/authService.ts

const API_URL = 'http://localhost:3000/auth';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  // Register
  async register(email: string, password: string, name: string, phone: string) {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        confirmPassword: password,
        name,
        phone,
      }),
    });
    
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    return data;
  },

  // Login
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    return data;
  },

  // Refresh Token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await fetch(`${API_URL}/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
    }
    return data;
  },

  // Logout
  async logout() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken) {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },
};
```

### 3. Utilisation dans un composant React

```typescript
// src/components/Login.tsx

import { useState } from 'react';
import { authService } from '../services/authService';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(email, password);
      if (response.success) {
        // Rediriger vers dashboard
        window.location.href = '/dashboard';
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
}
```

### 4. Hook personnalisé pour l'authentification

```typescript
// src/hooks/useAuth.ts

import { useEffect, useState } from 'react';
import { authService } from '../services/authService';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setUser(user);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  return { user, loading, isAuthenticated, login: authService.login, logout: authService.logout };
}
```

## 🔐 Axios avec interceptors

```typescript
// src/api/axiosClient.ts

import axios from 'axios';
import { authService } from '../services/authService';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await authService.refreshToken();
        const token = authService.getAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
```

## 🛡️ Route protégeuse (React Router)

```typescript
// src/components/ProtectedRoute.tsx

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'USER' | 'ADMIN';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
}
```

## 🖥️ Backend Node.js (Express)

### 1. Vérifier le token

```typescript
// src/middlewares/authenticate.ts

import { Request, Response, NextFunction } from 'express';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Vérifier le token avec votre service JWT
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}
```

### 2. Utiliser dans vos routes

```typescript
// src/routes/user.routes.ts

import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.get('/profile', authenticate, (req, res) => {
  // req.user contient les infos de l'utilisateur
  res.json({ user: req.user });
});

export default router;
```

## 📡 Configuration API

### CORS pour le frontend

Assurez-vous que votre `.env` contient les bons domaines:

```env
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,https://app.example.com
```

### Appels API depuis le frontend

```typescript
// Options pour fetch
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`,
};

// Options pour axios
const config = {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
};
```

## 🔄 Workflow d'authentification Complet

1. **Utilisateur se connecte** → Frontend appelle `/auth/login`
2. **Tokens réçus** → Stockés localement (localStorage/sessionStorage)
3. **Access token utilisé** → Pour les requêtes API protégeuses
4. **Token expire** → Frontend appelle `/auth/refresh-token`
5. **Nouveau token** → Utilisé pour continuer
6. **Logout** → Tokens supprimés localement et depuis la BD

## 💡 Bonnes Pratiques

✅ Mettez à jour l'access token en arrière-plan
✅ Utilisez httpOnly cookies au lieu de localStorage (plus sécurisé)
✅ Rafraîchissez le token avant expiration
✅ Gérez les erreurs 401 proprement
✅ Naviguez vers login en cas de 401
✅ Loggez les erreurs d'authentification
✅ Utilisez HTTPS en production

## 🚨 Gestion d'Erreurs

```typescript
async function makeAuthenticatedRequest(url: string) {
  try {
    const token = authService.getAccessToken();
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (response.status === 401) {
      // Token expiré
      await authService.refreshToken();
      // Réessayer la requête
      return makeAuthenticatedRequest(url);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}
```

---

C'est tout! Vous avez maintenant intégré le service d'authentification dans votre application. 🎉
