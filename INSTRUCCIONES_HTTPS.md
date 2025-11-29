# 🔒 Configuración HTTPS con Greenlock Express

## ✅ Cambios Realizados

1. **Instalado greenlock-express** - Obtiene certificados SSL gratis de Let's Encrypt
2. **Creado server-https.js** - Servidor con HTTPS automático
3. **Actualizado frontend/config.js** - Ahora usa HTTPS
4. **Configurado .greenlockrc** - Configuración para tu dominio

## 🚀 Cómo Iniciar el Servidor HTTPS

### Opción 1: Usando el script (RECOMENDADO)

1. **Abre PowerShell o CMD como ADMINISTRADOR** (clic derecho → "Ejecutar como administrador")

2. **Navega a la carpeta backend:**
   ```cmd
   cd E:\PaginasQueHice\ListaNegraDeLasGIrls\backend
   ```

3. **Ejecuta el script:**
   ```cmd
   start-https.bat
   ```

### Opción 2: Comando directo

```cmd
node server-https.js
```

## ⚙️ Requisitos Importantes

### 1. Puerto Forwarding en el Router

Debes abrir estos puertos en tu router:

- **Puerto 80** (HTTP) → Redirige a tu PC
- **Puerto 443** (HTTPS) → Redirige a tu PC

**Pasos:**
1. Accede a tu router (192.168.1.1 o 192.168.0.1)
2. Busca "Port Forwarding" o "Reenvío de puertos"
3. Agrega estas reglas:
   - Puerto Externo: 80, Puerto Interno: 80, IP: [TU_IP_LOCAL]
   - Puerto Externo: 443, Puerto Interno: 443, IP: [TU_IP_LOCAL]

### 2. Firewall de Windows

```powershell
# Ejecutar como Administrador
netsh advfirewall firewall add rule name="HTTP" dir=in action=allow protocol=TCP localport=80
netsh advfirewall firewall add rule name="HTTPS" dir=in action=allow protocol=TCP localport=443
```

### 3. DuckDNS Actualizado

Verifica que `coquettecraft.duckdns.org` apunte a tu IP pública actual:
- Visita: https://www.duckdns.org/
- Confirma que la IP sea correcta

## 🔍 Verificación

### 1. Primera vez (obtención de certificado)

La primera vez que inicies el servidor, Greenlock:
1. Verificará que tu dominio apunte a tu servidor
2. Solicitará un certificado SSL a Let's Encrypt
3. Guardará el certificado en `./greenlock.d/`

**Esto puede tomar 30-60 segundos la primera vez.**

### 2. Probar la conexión

Una vez iniciado, deberías ver:
```
🚀 Server running on port 80 and 443
🔒 HTTPS enabled with Let's Encrypt
```

Prueba en tu navegador:
- https://coquettecraft.duckdns.org/health

### 3. Verificar desde el frontend

1. Ve a: https://registronacionaldeinfieles.netlify.app/verify-config.html
2. Haz clic en "🧪 Probar Conexión API"
3. Deberías ver: ✅ Conexión Exitosa

## 🔄 Actualizar Frontend en Netlify

```bash
cd frontend
git add -A
git commit -m "Update: Usar HTTPS para backend"
git push
```

Netlify redesplegará automáticamente en ~1 minuto.

## 📝 Notas Importantes

### Renovación Automática
- Los certificados se renuevan automáticamente cada 90 días
- No necesitas hacer nada, Greenlock lo maneja

### Logs
- Los certificados se guardan en: `backend/greenlock.d/`
- **NO subas esta carpeta a Git** (ya está en .gitignore)

### Si algo falla

1. **Error "EACCES" o "Permission denied":**
   - Ejecuta como Administrador

2. **Error "Port already in use":**
   - Detén cualquier otro servidor en puerto 80/443
   - Verifica con: `netstat -ano | findstr :80`

3. **Error "Domain verification failed":**
   - Verifica que DuckDNS apunte a tu IP correcta
   - Verifica que los puertos 80 y 443 estén abiertos en el router
   - Espera unos minutos y reintenta

4. **Certificado no se obtiene:**
   - Asegúrate de que tu dominio sea accesible desde internet
   - Prueba: `curl http://coquettecraft.duckdns.org/.well-known/acme-challenge/test`

## 🎯 Resultado Final

Una vez todo configurado:
- ✅ Frontend en HTTPS: https://registronacionaldeinfieles.netlify.app
- ✅ Backend en HTTPS: https://coquettecraft.duckdns.org
- ✅ Sin errores de Mixed Content
- ✅ Certificado SSL válido y confiable
- ✅ Renovación automática

## 🆘 Troubleshooting Rápido

```bash
# Ver si los puertos están escuchando
netstat -ano | findstr :80
netstat -ano | findstr :443

# Probar desde internet (reemplaza con tu IP)
curl http://coquettecraft.duckdns.org/health
curl https://coquettecraft.duckdns.org/health

# Ver logs de Greenlock
# Los logs aparecerán en la consola donde ejecutaste el servidor
```

## 🔐 Seguridad

Greenlock usa Let's Encrypt, que es:
- ✅ Gratis
- ✅ Confiable (usado por millones de sitios)
- ✅ Reconocido por todos los navegadores
- ✅ Renovación automática

¡Tu sitio ahora tendrá el candado verde en el navegador! 🔒✨
