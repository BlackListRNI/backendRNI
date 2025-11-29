# Lista Negra Backend

## Instalación

```bash
npm install
```

## Configuración

Copia `.env.example` a `.env` y configura:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de MongoDB.

## Desarrollo

```bash
npm run dev
```

## Producción

```bash
npm start
```

O con PM2:

```bash
npm run prod
```

## Deploy a la Nube

### Railway / Render

1. Conecta tu repo
2. Variables de entorno: copia de `.env`
3. Build command: `npm install`
4. Start command: `npm start`

### VPS (DigitalOcean, AWS, etc.)

```bash
# Instalar dependencias
npm install --production

# Instalar PM2 globalmente
npm install -g pm2

# Iniciar con PM2
pm2 start core/server.js --name lista-negra-api

# Guardar configuración PM2
pm2 save
pm2 startup
```

MongoDB: usa MongoDB Atlas (gratis) o instala localmente.

## API Endpoints

- `POST /api/reports` - Crear reporte
- `GET /api/reports?country=PE` - Listar reportes
- `GET /api/reports/:id` - Ver reporte
- `PUT /api/reports/:id/verify` - Verificar reporte
- `GET /api/reports/statistics` - Estadísticas
- `POST /api/disputes` - Crear disputa
- `GET /api/disputes/report/:reportId` - Disputas de un reporte
- `GET /api/geo/detect` - Detectar país
- `GET /api/geo/countries` - Países disponibles
- `POST /api/moderation/flag` - Flagear contenido
- `GET /api/moderation/queue` - Cola de moderación
- `PUT /api/moderation/:id` - Moderar item
- `GET /api/users/stats` - Estadísticas de usuario

## Estructura

```
backend/
├── core/           # Servidor, DB, Config
├── modules/        # Features (reports, disputes, etc.)
└── shared/         # Middleware y utilidades
```
