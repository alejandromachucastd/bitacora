# 📚 DOCUMENTACIÓN TÉCNICA - Sistema Cyber Café

## 📋 Arquitectura del Sistema

### Tecnologías
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Firebase Realtime Database (opcional) / localStorage
- **Librerías**: Chart.js v4.4.0, jsPDF v2.5.1, Firebase SDK v9.22.0

### Estructura de Archivos
```
cybercafe/
├── index.html          # UI principal (984 líneas)
├── styles.css          # Estilos (1,960 líneas)
├── app.js             # Lógica completa (2,322 líneas)
├── firebase-config-ejemplo.js
└── README.md
```

## 🔧 Módulos Principales (app.js)

### 1. Configuración (líneas 1-136)
- Inicialización Firebase/localStorage
- Variables globales: `equipos`, `tramites`, `productos`, `ventas*`, `sesionesEquipos`, etc.
- Función `inicializarApp()`: Carga datos y renderiza UI

### 2. Equipos (líneas 224-503)
- `renderizarEquipos()`: Muestra estado de equipos
- `iniciarEquipo()`: Inicia sesión con timestamp
- `cerrarEquipo()`: Calcula total y cierra sesión
- `calcularTotalEquipo()`: Lógica de precios (< 30min: $3, 30-60min: $5, >1h: $10/h)

### 3. Trámites (líneas 504-644)
- `ventaRapidaTramite()`: Venta rápida
- `registrarVentaTramite()`: Venta desde modal
- `renderizarVentasTramites()`: Lista de ventas

### 4. Impresiones/Escaneos (líneas 645-804)
- `calcularPrecioImpresion()`: Aplica promociones (base: $1/hoja)
- `calcularPrecioEscaneo()`: Aplica promociones (base: $4/hoja)
- `registrarVentaImpresion()`: Registra venta

### 5. Papelería (líneas 806-957)
- `renderizarPapeleria()`: Inventario con búsqueda
- `registrarVentaPapeleria()`: Vende y actualiza stock
- Alertas: Stock < 5 (amarillo), Stock = 0 (rojo)

### 6. Gastos (líneas 959-1028)
- `guardarGasto()`: Registra gasto con categoría
- `eliminarGasto()`: Elimina gasto
- Categorías: Servicios, Compras, Mantenimiento, Otros

### 7. Reportes y Corte (líneas 1030-1298)
- `renderizarReportes()`: Calcula totales del día
- `generarCorte()`: Guarda corte y limpia datos
- `exportarPDF()`: Exporta a PDF
- Horario: 8PM-12AM, auto-limpieza a las 10PM

### 8. Administración (líneas 1300-1738)
- CRUD para equipos, trámites, promociones, productos
- Contraseña: `admin123` (línea 46)
- Funciones: `guardar*()`, `eliminar*()`, `editar*()`

### 9. Dashboard (líneas 1769-1979)
- `actualizarDashboard()`: Actualiza cada 5s
- `renderizarActividadReciente()`: Últimas 10 transacciones
- `actualizarSidebarTotal()`: Total y progreso de meta

### 10. Gráficas (líneas 2108-2246)
- Chart.js: Últimos 7 días, Distribución, Tendencia, vs Meta
- `renderizarGraficas()`: Genera todas las gráficas

### 11. Utilidades (líneas 1740-2321)
- `mostrarToast()`: Notificaciones
- `toggleTheme()`: Tema claro/oscuro
- `cerrarModal()`: Cierra modales
- `cambiarSeccion()`: Navegación

## 💾 Estructura de Datos

### Sesión de Equipo
```javascript
{
  id: "timestamp",
  equipoId: "id",
  inicio: "ISO date",
  fin: "ISO date",
  serviciosExtra: [{tipo, cantidad, precio}],
  total: number,
  activa: boolean
}
```

### Venta
```javascript
{
  id: "timestamp",
  [tipo]Id: "id",
  cantidad: number,
  total: number,
  fecha: "ISO date"
}
```

### Corte Diario
```javascript
{
  id: "timestamp",
  fecha: "DD/MM/YYYY",
  totalGenerado: number,
  totalGastos: number,
  totalNeto: number,
  gastos: array
}
```

## 🔄 Flujos Principales

### Venta de Trámite
1. Seleccionar trámite → `ventaRapidaTramite()`
2. Crear objeto venta
3. Guardar → `guardarDatos('ventasTramites')`
4. Actualizar UI → `renderizarVentasTramites()`
5. Notificar → `mostrarToast()`

### Sesión de Equipo
1. Iniciar → `iniciarEquipo()` (crea sesión con timestamp)
2. Timer actualiza cada 1s → `actualizarTimersEquipos()`
3. Agregar servicios → `agregarServicioExtra()`
4. Cerrar → `cerrarEquipo()` (calcula total)
5. Guardar sesión inactiva

### Corte Diario
1. Click "Corte" (8PM-12AM)
2. Calcular totales → `mostrarModalCorte()`
3. Confirmar → `generarCorte()`
4. Guardar en historial
5. Limpiar datos → `limpiarDatosDiarios()`
6. Exportar PDF (opcional)

## 🎨 CSS (styles.css)

### Variables CSS (líneas 1-29)
- Modo oscuro: `--bg-primary: #0f172a`
- Modo claro: `body.light-mode`
- Colores: `--success`, `--warning`, `--danger`, `--accent-primary`

### Componentes Principales
- `.sidebar`: Navegación lateral (líneas 79-323)
- `.stat-card`: Tarjetas de estadísticas (líneas 1428-1486)
- `.modal`: Sistema de modales (líneas 1029-1093)
- `.toast`: Notificaciones (líneas 1700-1770)
- `.equipo-card`: Tarjetas de equipos (líneas 598-697)

### Animaciones
- `slideInUp`, `slideInRight`, `pulse` (líneas 1661-1698)
- `spin` para loading (líneas 1800-1804)

## 🛠️ Guía de Desarrollo

### Agregar Nuevo Módulo
1. Definir variable global: `let miModulo = [];`
2. Crear función renderizado: `renderizarMiModulo()`
3. Crear CRUD: `agregar*()`, `editar*()`, `eliminar*()`
4. Agregar a `inicializarApp()`
5. Guardar datos: `guardarDatos('miModulo', miModulo)`

### Mejores Prácticas
- **Nomenclatura**: camelCase para funciones/variables
- **IDs HTML**: kebab-case
- **Validaciones**: Siempre al inicio de funciones
- **Actualización**: Guardar → Renderizar → Notificar
- **Timestamps**: `Date.now().toString()` para IDs
- **Fechas**: `new Date().toISOString()` para almacenar

### Funciones Clave
- `guardarDatos(key, data)`: Persiste en localStorage/Firebase
- `cargarDatos(key)`: Carga datos (async)
- `mostrarToast(titulo, mensaje, tipo)`: Notificación
- `cerrarModal(modalId)`: Cierra modal
- `renderizar*()`: Actualiza UI de cada módulo

## 🔒 Seguridad

- Contraseña admin: Línea 46 de `app.js`
- Acceso a reportes: Misma contraseña
- Firebase: Configurar reglas de seguridad en producción
- Sin autenticación de usuarios (sistema local)

## 📊 Métricas del Sistema

- **Total líneas**: ~5,266
- **Funciones**: ~150+
- **Modales**: 10
- **Secciones**: 8
- **Colecciones de datos**: 10
