# 🔥 Lista Negra Backend API

Backend API para el sistema de registro comunitario de infieles.

## 🚀 Deploy Rápido a Koyeb (Recomendado)

**HTTPS gratis automático + Deploy desde GitHub**

Ver guía completa: **[DEPLOY_KOYEB.md](./DEPLOY_KOYEB.md)**

## 💻 Desarrollo Local

### Instalación

```bash
npm install
```

### Configuración

1. Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Edita `.env` con tus credenciales:
```env
PORT=3070
MONGODB_URI=mongodb://localhost:27017/lista-negra
FRONTEND_URL=http://localhost:3050
JWT_SECRET=tu-secreto-aqui
```

### Iniciar Servidor

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

El servidor estará disponible en: `http://localhost:3070`

## 🔗 Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login

### Reportes
- `GET /api/reports` - Listar reportes
- `GET /api/reports/:id` - Ver reporte específico
- `POST /api/reports` - Crear reporte
- `PUT /api/reports/:id/verify` - Verificar reporte
- `DELETE /api/reports/:id` - Eliminar reporte

### Comentarios
- `GET /api/comments/:reportId` - Listar comentarios
- `POST /api/comments/:reportId` - Agregar comentario
- `PUT /api/comments/:id/vote` - Votar comentario

### Disputas
- `POST /api/disputes` - Crear disputa

### Usuarios
- `GET /api/users/:id/reports` - Reportes de usuario

### Geolocalización
- `GET /api/geo/detect` - Detectar país por IP

### Moderación
- `GET /api/moderation/reports` - Reportes pendientes
- `PUT /api/moderation/reports/:id/approve` - Aprobar reporte
- `PUT /api/moderation/reports/:id/reject` - Rechazar reporte

## 📁 Estructura del Proyecto

```
backend/
├── core/
│   ├── server.js       # Servidor Express
│   ├── config.js       # Configuración
│   └── database.js     # Conexión MongoDB
├── modules/
│   ├── auth/           # Autenticación
│   ├── reports/        # Reportes
│   ├── comments/       # Comentarios
│   ├── disputes/       # Disputas
│   ├── users/          # Usuarios
│   ├── geo/            # Geolocalización
│   └── moderation/     # Moderación
├── shared/
│   ├── middleware/     # Middlewares
│   └── utils/          # Utilidades
├── .env.example        # Variables de entorno ejemplo
├── package.json
└── README.md
```

## 🛠️ Stack Tecnológico

- **Node.js** - Runtime
- **Express** - Framework web
- **MongoDB** - Base de datos
- **Mongoose** - ODM
- **JWT** - Autenticación
- **Bcrypt** - Hash de contraseñas
- **Helmet** - Seguridad HTTP
- **CORS** - Cross-Origin Resource Sharing
- **Joi** - Validación de datos
- **Multer** - Upload de archivos
- **Sharp** - Procesamiento de imágenes

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT para autenticación
- ✅ Rate limiting
- ✅ Helmet para headers de seguridad
- ✅ CORS configurado
- ✅ Validación de inputs con Joi
- ✅ IP hashing para privacidad

## 📊 Base de Datos

### MongoDB Local
```bash
# Iniciar MongoDB
mongod
```

### MongoDB Atlas (Producción)
1. Crea cuenta en: https://www.mongodb.com/cloud/atlas
2. Crea cluster gratuito
3. Obtén connection string
4. Configura en `.env`

## 🚀 Deploy

### Koyeb (Recomendado)
Ver: [DEPLOY_KOYEB.md](./DEPLOY_KOYEB.md)

### Otras Opciones
- Render
- Railway
- Fly.io
- Heroku

## 🧪 Testing

```bash
# Probar health check
curl http://localhost:3070/health

# Probar registro
curl -X POST http://localhost:3070/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'
```

## 📝 Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | 3070 |
| `MONGODB_URI` | URI de MongoDB | mongodb://localhost:27017/lista-negra |
| `NODE_ENV` | Entorno | development |
| `FRONTEND_URL` | URL del frontend | http://localhost:3050 |
| `JWT_SECRET` | Secreto para JWT | (requerido) |
| `IPAPI_KEY` | API key de ipapi | free |
| `MAX_REPORTS_PER_DAY` | Límite de reportes | 3 |
| `VERIFICATION_THRESHOLD` | Votos para verificar | 3 |
| `DISPUTE_REVIEW_HOURS` | Horas para revisar disputa | 48 |

## 🆘 Troubleshooting

### Error: MongoDB connection failed
→ Verifica que MongoDB esté corriendo
→ Verifica la URI en `.env`

### Error: Port already in use
→ Cambia el puerto en `.env`
→ O mata el proceso: `npx kill-port 3070`

### Error: JWT secret not defined
→ Configura `JWT_SECRET` en `.env`

## 📚 Documentación Adicional

- [DEPLOY_KOYEB.md](./DEPLOY_KOYEB.md) - Deploy a Koyeb
- [.env.example](./.env.example) - Variables de entorno

## 📄 Licencia

MIT

## 👨‍💻 Autor

Lista Negra Team
