# 🖥️ Sistema de Gestión para Cyber Café

Sistema completo de bitácora y punto de venta para Cyber Café desarrollado con HTML, CSS y JavaScript puro.

## 📋 Características

### Módulos Principales

1. **Módulo Cyber (Renta de Equipos)**
   - Gestión de equipos (PC1, PC2, etc.)
   - Control de tiempo en tiempo real
   - Cálculo automático de tarifas
   - Servicios extra (impresiones, escaneos)
   - Estados: Libre/Ocupado

2. **Módulo de Trámites**
   - Catálogo de trámites disponibles
   - Registro de ventas
   - Links de referencia
   - Control de costos y gastos

3. **Módulo de Impresiones y Escaneos**
   - Precios base: $1 impresión, $4 escaneo
   - Sistema de promociones por volumen
   - Venta independiente o agregada a equipos

4. **Módulo de Papelería/Inventario**
   - Control de stock automático
   - Alertas de inventario bajo
   - Registro de ventas con descuento automático

5. **Módulo de Gastos**
   - Registro de gastos diarios
   - Categorización
   - Inclusión en corte diario

6. **Corte Diario y Reportes**
   - Horario: 8:00 PM - 12:00 AM
   - Resumen completo del día
   - Historial de cortes
   - Exportación a PDF
   - Limpieza automática de datos

## 🚀 Instalación y Configuración

### Opción 1: Uso Local (Sin Firebase)

1. Abre el archivo `index.html` en tu navegador
2. El sistema funcionará con localStorage automáticamente
3. Los datos se guardarán en tu navegador local

### Opción 2: Uso con Firebase

1. **Crear proyecto en Firebase:**
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Crea un nuevo proyecto
   - Activa Realtime Database o Firestore

2. **Obtener credenciales:**
   - En configuración del proyecto, copia las credenciales
   - Ve a "Configuración del proyecto" > "Tus apps" > "SDK setup and configuration"

3. **Configurar en el código:**
   - Abre `app.js`
   - Reemplaza las credenciales en la sección de configuración:

```javascript
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    databaseURL: "TU_DATABASE_URL",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
};
```

4. **Configurar reglas de Firebase:**
   - En Realtime Database, usa estas reglas para desarrollo:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**⚠️ IMPORTANTE:** Para producción, configura reglas de seguridad adecuadas.

## 💰 Lógica de Precios

### Equipos
- **< 30 minutos:** $3 (mínimo)
- **30-60 minutos:** $5
- **> 1 hora:** $10/hora (proporcional)

### Impresiones y Escaneos
- **Impresión:** $1 por hoja (base)
- **Escaneo:** $4 por hoja (base)
- **Promociones:** Definidas por el administrador

### Servicios Extra
- Se suman al total del equipo
- Pueden venderse por separado

## 📊 Corte Diario

### Horario Permitido
- **Generación de corte:** 8:00 PM - 12:00 AM
- **Exportación PDF:** 8:00 PM - 12:00 AM

### Reglas Automáticas
- Si no se hace corte antes de las 10:00 PM, se borra toda la información
- PDFs generados después de las 12:00 AM se borran automáticamente

### Datos Guardados en Corte
- Total generado
- Total de gastos
- Total neto
- Detalle de gastos del día

### Datos Eliminados Después del Corte
- Sesiones de equipos
- Ventas de trámites
- Ventas de impresiones/escaneos
- Ventas de papelería
- Gastos del día

## 🎨 Diseño

- **Modo oscuro** por defecto
- **Responsive** para todos los dispositivos
- **Dashboard** intuitivo con navegación lateral
- **Actualizaciones en tiempo real**

## 🔒 Seguridad

### Acceso a Administración
- **Contraseña por defecto:** `admin123`
- Para cambiar la contraseña, edita la variable `ADMIN_PASSWORD` en `app.js` línea 45
- El acceso administrativo se requiere para:
  - Agregar/editar/eliminar equipos
  - Agregar/editar/eliminar trámites
  - Agregar/editar/eliminar promociones
  - Agregar/editar/eliminar productos de papelería

### Cambiar Contraseña
1. Abre `app.js`
2. Busca la línea: `const ADMIN_PASSWORD = 'admin123';`
3. Cambia `'admin123'` por tu contraseña deseada
4. Guarda el archivo

## 📱 Uso del Sistema

### Acceder a Administración
1. Ve a la sección "Administración"
2. Ingresa la contraseña (por defecto: `admin123`)
3. Click en "Acceder"
4. Ahora puedes gestionar todos los elementos

### Iniciar Sesión en Equipo
1. Ve a "Equipos"
2. Selecciona un equipo libre
3. Click en "Iniciar"
4. El timer comenzará automáticamente

### Agregar Servicios Extra
1. Con equipo ocupado, click en "+ Servicio"
2. Selecciona tipo (impresión/escaneo/otro)
3. Ingresa cantidad
4. Se suma automáticamente al total

### Cerrar Equipo
1. Click en "Cerrar" en el equipo ocupado
2. Se calcula el total automáticamente
3. Se guarda para el corte del día

### Registrar Ventas
1. Ve al módulo correspondiente
2. Click en "+ Registrar Venta" o "+ Nueva Venta"
3. Selecciona producto/servicio
4. Ingresa cantidad
5. Confirma la venta

### Administración
1. Ve a "Administración"
2. Selecciona la pestaña correspondiente
3. Agrega, edita o elimina elementos
4. Los cambios se reflejan inmediatamente

### Generar Corte
1. Entre 8:00 PM y 12:00 AM
2. Click en "Corte Diario"
3. Revisa el resumen
4. Click en "Generar Corte"
5. Opcionalmente exporta a PDF

## 🔧 Estructura de Archivos

```
cybercafe/
│
├── index.html          # Estructura principal
├── styles.css          # Estilos en modo oscuro
├── app.js             # Lógica de la aplicación
└── README.md          # Este archivo
```

## 📝 Notas Importantes

1. **Sin autenticación:** El sistema no requiere login
2. **Datos locales:** Si usas localStorage, los datos solo están en tu navegador
3. **Firebase opcional:** Puedes usar Firebase para sincronización en la nube
4. **Horarios críticos:** Respeta los horarios de corte para evitar pérdida de datos
5. **Backup:** Exporta PDFs regularmente como respaldo

## 🆘 Solución de Problemas

### El sistema no guarda datos
- Verifica que localStorage esté habilitado en tu navegador
- Si usas Firebase, verifica las credenciales

### No puedo generar corte
- Verifica que sea entre 8:00 PM y 12:00 AM
- Revisa la consola del navegador para errores

### Los equipos no actualizan el tiempo
- Refresca la página
- Verifica que JavaScript esté habilitado

### Firebase no conecta
- Verifica las credenciales en `app.js`
- Revisa las reglas de seguridad en Firebase Console
- Asegúrate de tener conexión a internet

## 📄 Licencia

Este proyecto es de uso libre para Cyber Cafés.

## 🤝 Soporte

Para soporte o preguntas, consulta la documentación de Firebase:
- [Firebase Realtime Database](https://firebase.google.com/docs/database)
- [Firebase Console](https://console.firebase.google.com/)

---

**Desarrollado con ❤️ para Cyber Cafés**
