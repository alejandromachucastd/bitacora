// ============================================
// ARCHIVO DE CONFIGURACIÓN Y CONSTANTES
// ============================================

/**
 * Configuración global del sistema
 * Este archivo contiene todas las constantes y configuraciones
 * centralizadas para facilitar el mantenimiento
 */

// ============================================
// PRECIOS BASE
// ============================================

const PRECIOS = {
    // Equipos
    EQUIPO_MINIMO: 3,           // Menos de 30 minutos
    EQUIPO_MEDIA_HORA: 5,       // 30-60 minutos
    EQUIPO_POR_HORA: 10,        // Más de 1 hora
    
    // Impresiones y escaneos
    IMPRESION_BASE: 1,          // Por hoja
    ESCANEO_BASE: 4,            // Por hoja
};

// ============================================
// TIEMPOS Y HORARIOS
// ============================================

const HORARIOS = {
    // Corte diario
    CORTE_INICIO: 20,           // 8:00 PM
    CORTE_FIN: 24,              // 12:00 AM (medianoche)
    AUTO_LIMPIEZA: 22,          // 10:00 PM
    
    // Intervalos de actualización (milisegundos)
    ACTUALIZAR_TIMERS: 1000,    // 1 segundo
    ACTUALIZAR_DASHBOARD: 5000, // 5 segundos
    VERIFICAR_CORTE: 60000,     // 1 minuto
    OCULTAR_LOADING: 500,       // 0.5 segundos
    AUTO_CERRAR_TOAST: 5000,    // 5 segundos
};

// ============================================
// UMBRALES DE INVENTARIO
// ============================================

const INVENTARIO = {
    STOCK_BAJO: 5,              // Alerta amarilla
    STOCK_AGOTADO: 0,           // Alerta roja
};

// ============================================
// CATEGORÍAS
// ============================================

const CATEGORIAS_GASTOS = [
    'servicios',
    'compras',
    'mantenimiento',
    'otros'
];

const TIPOS_SERVICIO = [
    'tramite',
    'impresion',
    'escaneo',
    'copia'
];

// ============================================
// MESES DEL AÑO
// ============================================

const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 
    'Mayo', 'Junio', 'Julio', 'Agosto',
    'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// ============================================
// MENSAJES DEL SISTEMA
// ============================================

const MENSAJES = {
    // Éxito
    VENTA_REGISTRADA: 'Venta Registrada',
    CORTE_GENERADO: 'Corte generado exitosamente',
    DATOS_GUARDADOS: 'Datos guardados correctamente',
    META_GUARDADA: 'Meta Guardada',
    
    // Advertencias
    CORTE_HORARIO: 'El corte diario solo se puede realizar entre las 8:00 PM y las 12:00 AM',
    PDF_HORARIO: 'Los PDFs solo se pueden exportar entre las 8:00 PM y las 12:00 AM',
    STOCK_INSUFICIENTE: 'No hay suficiente stock disponible',
    AUTO_LIMPIEZA: '¡ATENCIÓN! No se realizó el corte diario. Se borrará toda la información.',
    
    // Errores
    PASSWORD_INCORRECTA: 'Contraseña incorrecta',
    SELECCIONAR_TRAMITE: 'Selecciona un trámite',
    CONFIRMAR_ACCION: 'Debes confirmar la acción',
    
    // Confirmaciones
    CONFIRMAR_ELIMINAR: '¿Está seguro de eliminar este elemento?',
    CONFIRMAR_CORTE: '¿Está seguro de generar el corte diario? Esta acción eliminará todos los datos temporales.',
    CONFIRMAR_LIMPIAR: '¿ESTÁS COMPLETAMENTE SEGURO? Esta acción eliminará TODOS los datos del día y NO se puede deshacer.',
};

// ============================================
// CONFIGURACIÓN DE GRÁFICAS
// ============================================

const GRAFICAS_CONFIG = {
    // Colores para Chart.js
    COLORES: {
        EQUIPOS: '#4a9eff',
        TRAMITES: '#10b981',
        IMPRESIONES: '#f59e0b',
        PAPELERIA: '#8b5cf6',
        LINEA: '#4a9eff',
        LINEA_BG: 'rgba(74, 158, 255, 0.1)',
    },
    
    // Opciones comunes
    RESPONSIVE: true,
    MAINTAIN_ASPECT_RATIO: false,
};

// ============================================
// LÍMITES Y VALIDACIONES
// ============================================

const LIMITES = {
    MAX_ACTIVIDAD_RECIENTE: 10,     // Máximo de items en actividad reciente
    MAX_EQUIPOS_EN_USO: 50,         // Máximo de equipos simultáneos
    MIN_CANTIDAD: 1,                // Cantidad mínima en ventas
    MAX_NOMBRE_LENGTH: 100,         // Longitud máxima de nombres
};

// ============================================
// CLAVES DE ALMACENAMIENTO
// ============================================

const STORAGE_KEYS = {
    EQUIPOS: 'equipos',
    TRAMITES: 'tramites',
    PROMOCIONES: 'promociones',
    PRODUCTOS: 'productos',
    GASTOS: 'gastos',
    VENTAS_TRAMITES: 'ventasTramites',
    VENTAS_IMPRESIONES: 'ventasImpresiones',
    VENTAS_PAPELERIA: 'ventasPapeleria',
    SESIONES_EQUIPOS: 'sesionesEquipos',
    CORTES_HISTORIAL: 'cortesHistorial',
    METAS_DIARIAS: 'metasDiarias',
    TEMA: 'tema',
};

// ============================================
// EXPORTAR CONFIGURACIÓN
// ============================================

// Si se usa como módulo ES6, descomentar:
// export { PRECIOS, HORARIOS, INVENTARIO, CATEGORIAS_GASTOS, TIPOS_SERVICIO, 
//          MESES, MENSAJES, GRAFICAS_CONFIG, LIMITES, STORAGE_KEYS };
