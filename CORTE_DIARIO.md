# 📊 Explicación del Corte Diario

## ¿Qué es el Corte Diario?

El **Corte Diario** es el proceso de cerrar el día de operaciones, calcular totales y limpiar los datos temporales para comenzar un nuevo día.

## 🕐 Horario de Corte

- **Horario permitido:** 8:00 PM a 12:00 AM (20:00 - 00:00)
- **Horario crítico:** Si no se hace antes de las 10:00 PM, se borra toda la información automáticamente
- **PDFs:** Los PDFs generados después de las 12:00 AM se eliminan automáticamente

## 📋 ¿Qué se GUARDA al hacer el Corte?

Cuando generas el corte diario, el sistema **GUARDA** la siguiente información en el historial:

### ✅ Datos que se GUARDAN:
1. **Total generado del día** (suma de todas las ventas)
2. **Cambio para el siguiente día** (efectivo disponible)
3. **Gastos del día** (todos los gastos registrados)
4. **Fecha y hora del corte**
5. **Desglose por categoría:**
   - Total de equipos
   - Total de trámites
   - Total de impresiones/escaneos
   - Total de papelería

### 📁 Dónde se guarda:
- En el array `cortesHistorial` 
- Se guarda en Firebase/localStorage
- Puedes verlo en la sección **"Reportes"** → **"Historial de Cortes"**

## 🗑️ ¿Qué se BORRA al hacer el Corte?

El sistema **ELIMINA** todos los datos temporales del día:

### ❌ Datos que se BORRAN:
1. **Todas las ventas de trámites** (ventasTramites = [])
2. **Todas las ventas de impresiones/escaneos** (ventasImpresiones = [])
3. **Todas las ventas de papelería** (ventasPapeleria = [])
4. **Todas las sesiones de equipos** - activas e inactivas (sesionesEquipos = [])
5. **Todos los gastos** (gastos = [])

### ✅ Datos que NO se borran:
- Equipos configurados
- Trámites disponibles
- Promociones
- Productos de papelería (inventario)
- **Historial de cortes anteriores**

## 🔄 Proceso del Corte Diario

```
1. Usuario hace click en "Corte Diario"
   ↓
2. Sistema verifica horario (8PM - 12AM)
   ↓
3. Sistema calcula totales:
   - Total equipos
   - Total trámites
   - Total impresiones
   - Total papelería
   - Total gastos
   ↓
4. Sistema GUARDA en historial:
   {
     fecha: "2024-01-15",
     totalGenerado: $1500.00,
     cambio: $200.00,
     gastos: $300.00,
     desglose: {
       equipos: $800,
       tramites: $400,
       impresiones: $200,
       papeleria: $100
     }
   }
   ↓
5. Sistema BORRA datos temporales:
   - ventasTramites = []
   - ventasImpresiones = []
   - ventasPapeleria = []
   - sesionesEquipos = []
   - gastos = []
   ↓
6. Sistema genera PDF (opcional)
   ↓
7. Listo para el siguiente día
```

## 📈 Ver Historial de Cortes

Para ver los cortes anteriores:

1. Ve a la sección **"Reportes"**
2. Busca **"Historial de Cortes"**
3. Verás todos los cortes guardados con:
   - Fecha del corte
   - Total generado
   - Cambio
   - Gastos
   - Desglose detallado

## 💡 Ejemplo Práctico

### Día 1 (15 de Enero):
- Ventas de equipos: $800
- Ventas de trámites: $400
- Ventas de impresiones: $200
- Ventas de papelería: $100
- Gastos: $300
- **Total del día: $1,500**

### Al hacer el Corte:
**Se GUARDA:**
```javascript
{
  fecha: "2024-01-15",
  totalGenerado: 1500,
  cambio: 200,
  gastos: 300,
  desglose: {
    equipos: 800,
    tramites: 400,
    impresiones: 200,
    papeleria: 100
  }
}
```

**Se BORRA:**
- Todas las ventas del día
- Todas las sesiones de equipos
- Todos los gastos

### Día 2 (16 de Enero):
- Comienza desde $0
- Puedes ver el corte del día anterior en "Historial de Cortes"

## 🔒 Diferencia con "Limpiar Día"

### Corte Diario:
- ✅ GUARDA el resumen en historial
- ✅ Genera PDF
- ✅ Registra totales y gastos
- ❌ Borra datos temporales

### Limpiar Día:
- ❌ NO guarda nada
- ❌ NO genera PDF
- ❌ NO registra en historial
- ❌ Solo borra todo (útil para pruebas)

## 📊 Resumen

| Acción | Datos Temporales | Historial | Configuración |
|--------|-----------------|-----------|---------------|
| **Corte Diario** | ❌ Se borran | ✅ Se guarda | ✅ Se mantiene |
| **Limpiar Día** | ❌ Se borran | ❌ Se borra | ✅ Se mantiene |

## 🎯 Recomendaciones

1. **Haz el corte diario entre 8PM y 10PM** para evitar pérdida de datos
2. **Exporta el PDF** antes de las 12AM si lo necesitas
3. **Revisa el historial** regularmente para análisis
4. **Usa "Limpiar Día"** solo para pruebas o errores graves
5. **El corte es irreversible** - los datos temporales no se pueden recuperar

---

**Nota:** El sistema está diseñado para proteger tus datos. El historial de cortes se mantiene permanentemente para que puedas consultar el desempeño de días anteriores.
