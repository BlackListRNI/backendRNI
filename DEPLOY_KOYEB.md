# 🚀 Deploy a Koyeb - Guía Completa

## ✅ Ventajas de Koyeb

- ✅ HTTPS automático y gratis
- ✅ Deploy desde GitHub automático
- ✅ Plan gratuito generoso
- ✅ Sin configuración de SSL necesaria
- ✅ Dominio personalizado incluido

## 📋 Requisitos Previos

### 1. Crear cuenta en MongoDB Atlas (Base de datos en la nube)

**Koyeb no incluye MongoDB, necesitas una base de datos externa:**

1. Ve a: https://www.mongodb.com/cloud/atlas/register
2. Crea una cuenta gratuita
3. Crea un cluster (selecciona el plan FREE - M0)
4. En "Security" → "Network Access" → Agrega `0.0.0.0/0` (permitir desde cualquier IP)
5. En "Security" → "Database Access" → Crea un usuario con contraseña
6. Obtén tu connection string:
   - Clic en "Connect" → "Connect your application"
   - Copia el string: `mongodb+srv://usuario:password@cluster.mongodb.net/lista-negra`

### 2. Subir el código a GitHub

```bash
cd backend

# Inicializar git si no está inicializado
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Preparado para deploy en Koyeb"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/TU_USUARIO/lista-negra-backend.git
git branch -M main
git push -u origin main
```

## 🚀 Deploy en Koyeb

### Paso 1: Crear Cuenta en Koyeb

1. Ve a: https://www.koyeb.com/
2. Clic en "Sign Up" (puedes usar GitHub para login rápido)
3. Verifica tu email

### Paso 2: Crear Nueva App

1. En el dashboard, clic en "Create App"
2. Selecciona "GitHub" como fuente
3. Conecta tu cuenta de GitHub (autoriza Koyeb)
4. Selecciona el repositorio `lista-negra-backend`
5. Selecciona la rama `main`

### Paso 3: Configurar el Servicio

**Build and deployment settings:**
- Build command: (dejar vacío, usa npm install automáticamente)
- Run command: `npm start`

**Instance:**
- Tipo: `Nano` (gratis)
- Región: `Washington, D.C. (was)` o la más cercana

**Ports:**
- Port: `3070`
- Protocol: `HTTP`

**Health check:**
- Path: `/health`
- Port: `3070`

### Paso 4: Configurar Variables de Entorno

En la sección "Environment variables", agrega:

```
NODE_ENV=production
PORT=3070
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/lista-negra
FRONTEND_URL=https://registronacionaldeinfieles.netlify.app
JWT_SECRET=tu-secreto-super-seguro-aqui-cambiar
IPAPI_KEY=free
MAX_REPORTS_PER_DAY=3
VERIFICATION_THRESHOLD=3
DISPUTE_REVIEW_HOURS=48
```

**IMPORTANTE:** Reemplaza:
- `MONGODB_URI` con tu connection string de MongoDB Atlas
- `JWT_SECRET` con un string aleatorio seguro

### Paso 5: Deploy

1. Clic en "Deploy"
2. Espera 2-3 minutos mientras Koyeb:
   - Clona tu repositorio
   - Instala dependencias
   - Inicia el servidor
   - Configura HTTPS automáticamente

### Paso 6: Obtener la URL

Una vez desplegado, verás:
- ✅ Estado: "Healthy"
- 🔗 URL: `https://tu-app-nombre.koyeb.app`

**Prueba tu API:**
```
https://tu-app-nombre.koyeb.app/health
```

Deberías ver:
```json
{"status":"ok","timestamp":"...","environment":"production"}
```

## 🔄 Actualizar Frontend

Actualiza `frontend/config.js`:

```javascript
'registronacionaldeinfieles.netlify.app': {
    apiUrl: 'https://tu-app-nombre.koyeb.app/api',
    environment: 'production'
}
```

Luego:
```bash
cd frontend
git add config.js
git commit -m "Update: API URL a Koyeb"
git push
```

Netlify redesplegará automáticamente en ~1 minuto.

## 🎯 Verificación Final

1. ✅ Backend en Koyeb: `https://tu-app-nombre.koyeb.app/health`
2. ✅ Frontend en Netlify: `https://registronacionaldeinfieles.netlify.app`
3. ✅ Probar registro/login
4. ✅ Probar crear reporte
5. ✅ Verificar que todo funcione sin errores

## 🔄 Auto-Deploy

Cada vez que hagas `git push` a tu repositorio, Koyeb redesplegará automáticamente. ¡No necesitas hacer nada más!

## 💰 Costos

**Plan Gratuito de Koyeb incluye:**
- 1 servicio web
- 512 MB RAM
- 2 GB almacenamiento
- HTTPS gratis
- Dominio personalizado gratis
- Auto-deploy desde GitHub

**MongoDB Atlas Free Tier:**
- 512 MB almacenamiento
- Conexiones compartidas
- Suficiente para empezar

**Total: $0/mes** 🎉

## 🆘 Troubleshooting

### Error: "Application failed to start"
→ Verifica los logs en Koyeb dashboard
→ Asegúrate de que `MONGODB_URI` sea correcto

### Error: "Health check failed"
→ Verifica que el puerto sea 3070
→ Verifica que `/health` endpoint exista

### Error: "Cannot connect to MongoDB"
→ Verifica que MongoDB Atlas permita conexiones desde `0.0.0.0/0`
→ Verifica usuario y contraseña en connection string

### Frontend no conecta al backend
→ Verifica que `FRONTEND_URL` en Koyeb incluya la URL de Netlify
→ Verifica que `config.js` del frontend tenga la URL correcta de Koyeb
→ Limpia caché del navegador

## 📊 Monitoreo

En el dashboard de Koyeb puedes ver:
- 📈 Uso de CPU y memoria
- 📝 Logs en tiempo real
- 🔄 Historial de deploys
- 📊 Métricas de requests

## 🎉 ¡Listo!

Tu backend ahora está:
- ✅ Desplegado en la nube
- ✅ Con HTTPS automático
- ✅ Auto-deploy desde GitHub
- ✅ Escalable y confiable
- ✅ Gratis

**URL Final:**
- Backend: `https://tu-app-nombre.koyeb.app`
- Frontend: `https://registronacionaldeinfieles.netlify.app`
