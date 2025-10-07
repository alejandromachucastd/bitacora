/*
 * ============================================
 * SISTEMA DE GESTION CYBER CAFE - BITACORA V1.0
 * ============================================
 * 
 * (c) 2025 STD TEC - Todos los derechos reservados
 * Desarrollado por: Alex Machuca
 * 
 * Este software es propiedad de STD TEC y esta protegido por
 * las leyes de derechos de autor. Queda prohibida su reproduccion,
 * distribucion o modificacion sin autorizacion expresa.
 * 
 * Para soporte tecnico o consultas, contactar a STD TEC.
 * ============================================
 */

// ============================================
// CONFIGURACION FIREBASE
// ============================================

/**
 * Configuracion de Firebase Realtime Database
 * Credenciales del proyecto: bitacora-82487
 */
const firebaseConfig = {
    apiKey: "AIzaSyDK4ugL7gs5JFE6T4dOs_clf6iZa_RjQss",
    authDomain: "bitacora-82487.firebaseapp.com",
    databaseURL: "https://bitacora-82487-default-rtdb.firebaseio.com", // Añadida para Realtime Database
    projectId: "bitacora-82487",
    storageBucket: "bitacora-82487.firebasestorage.app",
    messagingSenderId: "279427939077",
    appId: "1:279427939077:web:790cabc98f340c9bab156c"
};

/**
 * Variables de conexión a Firebase
 * @type {firebase.database.Database|null} db - Instancia de Firebase Database
 * @type {boolean} useLocalStorage - Flag para usar localStorage como fallback
 */
let db;
let useLocalStorage = true;

// Intentar inicializar Firebase, usar localStorage como fallback
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    useLocalStorage = false;
    console.log('✅ Firebase inicializado correctamente');
} catch (error) {
    console.warn('⚠️ Firebase no configurado, usando localStorage:', error);
    useLocalStorage = true;
}

// ============================================
// VARIABLES GLOBALES
// ============================================

/**
 * Colecciones de datos principales
 * Estas variables almacenan el estado de la aplicación
 */

// Catálogos base
let equipos = [];              // Lista de equipos del cyber (PC1, PC2, etc.)
let tramites = [];             // Catálogo de trámites disponibles
let promociones = [];          // Promociones de impresión/escaneo por volumen
let productos = [];            // Inventario de papelería

// Transacciones del día
let gastos = [];               // Gastos registrados en el día
let ventasTramites = [];       // Ventas de trámites del día
let ventasImpresiones = [];    // Ventas de impresiones/escaneos del día
let ventasPapeleria = [];      // Ventas de papelería del día
let sesionesEquipos = [];      // Sesiones de equipos (activas e inactivas)

// Historial y configuración
let cortesHistorial = [];      // Historial de cortes diarios
let metasDiarias = {           // Metas diarias por mes (1=Enero, 12=Diciembre)
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0,
    7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0
};

// Estado de la aplicación
let adminAutenticado = false;     // Flag de acceso administrativo
let reportesAutenticado = false;  // Flag de acceso a reportes
let actividadReciente = [];       // Cache de actividad reciente
let temaActual = 'dark';          // Tema actual: 'dark' o 'light'
let sistemaBloqueado = false;     // Flag de sistema bloqueado

/**
 * Contraseñas del sistema
 * IMPORTANTE: Cambiar estos valores en producción por seguridad
 */
const ADMIN_PASSWORD = 'stdtec2025@';  // Para administración y eliminar cortes
const CORTE_PASSWORD = 'admin123';     // Para generar el corte diario

// ============================================
// FUNCIONES DE ALMACENAMIENTO
// ============================================

/**
 * Guarda datos en localStorage o Firebase según configuración
 * @param {string} key - Nombre de la colección/clave
 * @param {any} data - Datos a guardar (será serializado a JSON en localStorage)
 * @example
 * guardarDatos('equipos', equipos);
 */
function guardarDatos(key, data) {
    if (useLocalStorage) {
        localStorage.setItem(key, JSON.stringify(data));
    } else {
        db.ref(key).set(data);
    }
}

/**
 * Carga datos desde localStorage o Firebase
 * @param {string} key - Nombre de la colección/clave
 * @returns {Promise<any>} Datos cargados o array vacío si no existen
 * @example
 * const equipos = await cargarDatos('equipos');
 */
async function cargarDatos(key) {
    if (useLocalStorage) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } else {
        const snapshot = await db.ref(key).once('value');
        return snapshot.val() || [];
    }
}

// INICIALIZACIÓN
// ============================================

/**
 * Punto de entrada principal de la aplicación
 * Se ejecuta cuando el DOM está listo
 */
// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el sistema estaba bloqueado
    if (localStorage.getItem('sistemaBloqueado') === 'true') {
        setTimeout(() => {
            bloquearSistema();
        }, 500);
    }
    
    inicializarApp();
});
/**
 * Inicializa la aplicación completa
 * - Carga todos los datos desde almacenamiento
 * - Renderiza todos los componentes de la UI
 * - Configura intervalos y eventos
 * @async
 */
async function inicializarApp() {
    // Cargar todas las colecciones de datos
    equipos = await cargarDatos('equipos') || [];
    tramites = await cargarDatos('tramites') || [];
    promociones = await cargarDatos('promociones') || [];
    productos = await cargarDatos('productos') || [];
    gastos = await cargarDatos('gastos') || [];
    ventasTramites = await cargarDatos('ventasTramites') || [];
    ventasImpresiones = await cargarDatos('ventasImpresiones') || [];
    ventasPapeleria = await cargarDatos('ventasPapeleria') || [];
    sesionesEquipos = await cargarDatos('sesionesEquipos') || [];
    cortesHistorial = await cargarDatos('cortesHistorial') || [];
    metasDiarias = await cargarDatos('metasDiarias') || {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0,
        7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0
    };

    // Renderizar todos los componentes de la UI
    renderizarEquipos();
    renderizarTramites();
    renderizarPromociones();
    renderizarPapeleria();
    renderizarGastos();
    renderizarVentasTramites();
    renderizarVentasImpresiones();
    renderizarVentasPapeleria();
    renderizarReportes();
    renderizarHistorialCortes();
    
    // Configurar actualización de timers cada segundo
    setInterval(actualizarTimersEquipos, 1000);
    
    // Inicializar navegación
    inicializarNavegacion();
    
    // Inicializar reloj
    inicializarReloj();
    
    // Verificar horario de corte cada minuto
    verificarHorarioCorte();
    setInterval(verificarHorarioCorte, 60000);
    
    // Inicializar funcionalidad de búsqueda
    inicializarBusquedas();
    
    // Actualizar dashboard cada 5 segundos
    actualizarDashboard();
    setInterval(actualizarDashboard, 5000);
    
    // Cargar tema guardado (claro/oscuro)
    cargarTema();
    
    // Mostrar sección inicial (dashboard)
    cambiarSeccion('dashboard');
    
    // Ocultar overlay de carga después de 500ms
    setTimeout(() => {
        document.getElementById('loadingOverlay').classList.remove('active');
    }, 500);
}

// ============================================
// NAVEGACIÓN
// ============================================

/**
 * Inicializa el sistema de navegación entre secciones
 * Configura event listeners para los botones de navegación y tabs de admin
 */
function inicializarNavegacion() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.dataset.section;
            
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));
            
            item.classList.add('active');
            document.getElementById(sectionId).classList.add('active');
        });
    });

    // Admin tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const adminContents = document.querySelectorAll('.admin-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            tabBtns.forEach(tab => tab.classList.remove('active'));
            adminContents.forEach(content => content.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// ============================================
// RELOJ Y HORARIO
// ============================================

/**
 * Inicializa el reloj en tiempo real del header
 * Actualiza cada segundo
 */
function inicializarReloj() {
    actualizarReloj();
    setInterval(actualizarReloj, 1000);
}

/**
 * Actualiza el reloj mostrado en el header
 * Formato: "día de la semana, día de mes de año - HH:MM:SS"
 */
function actualizarReloj() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    const dateString = now.toLocaleDateString('es-MX', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    document.getElementById('currentTime').textContent = `${dateString} - ${timeString}`;
}

/** 
 * Verifica el horario para el corte diario automático
 * - A las 12:00 AM: Si no hay corte del día, genera corte automáticamente
 * - A las 12:00 AM: Limpia PDFs antiguos (placeholder)
 * Se ejecuta cada minuto
 */
function verificarHorarioCorte() {
    const now = new Date();
    const hora = now.getHours();
    const minutos = now.getMinutes();
    
    // Si son las 12:00 AM (medianoche) y no se ha hecho corte, generar corte automático
    if (hora === 0 && minutos === 0) {
        const ultimoCorte = cortesHistorial[cortesHistorial.length - 1];
        const hoy = new Date().toLocaleDateString('es-MX');
        
        if (!ultimoCorte || ultimoCorte.fecha !== hoy) {
            alert('⏰ Son las 12:00 AM. Generando corte automático...');
            generarCorteAutomatico();
        }
    }
    
    // Borrar PDFs después de las 12 AM (placeholder para futura implementación)
    if (hora === 0 && minutos === 0) {
        console.log('🗑️ Borrando PDFs antiguos...');
        // TODO: Implementar limpieza de PDFs si se almacenan localmente
    }
}

// ============================================
// MÓDULO EQUIPOS
// ============================================

/**
 * Renderiza la lista de equipos con su estado actual
 * - Muestra equipos libres y ocupados
 * - Para equipos ocupados: muestra timer, servicios extra y total
 * - Actualiza contadores de equipos libres/ocupados
 */
function renderizarEquipos() {
    const grid = document.getElementById('equiposGrid');
    grid.innerHTML = '';
    
    let libres = 0;
    let ocupados = 0;
    
    equipos.forEach(equipo => {
        const sesion = sesionesEquipos.find(s => s.equipoId === equipo.id && s.activa);
        const estado = sesion ? 'ocupado' : 'libre';
        
        if (estado === 'libre') libres++;
        else ocupados++;
        
        const card = document.createElement('div');
        card.className = `equipo-card ${estado}`;
        
        let contenido = `
            <div class="equipo-header">
                <div class="equipo-nombre">${equipo.nombre}</div>
                <div class="equipo-estado ${estado}">${estado === 'libre' ? 'Libre' : 'Ocupado'}</div>
            </div>
        `;
        
        if (equipo.caracteristicas) {
            contenido += `<div class="equipo-info">${equipo.caracteristicas}</div>`;
        }
        
        if (sesion) {
            const tiempoTranscurrido = calcularTiempoTranscurrido(sesion.inicio);
            const total = calcularTotalEquipo(sesion);
            
            contenido += `
                <div class="equipo-tiempo" id="timer-${equipo.id}">${tiempoTranscurrido}</div>
            `;
            
            // Mostrar servicios extra si existen
            if (sesion.serviciosExtra && sesion.serviciosExtra.length > 0) {
                contenido += '<div class="servicios-extra"><strong>Servicios:</strong><ul>';
                sesion.serviciosExtra.forEach(servicio => {
                    contenido += `<li>${servicio.descripcion || servicio.tipo}: $${servicio.precio.toFixed(2)}</li>`;
                });
                contenido += '</ul></div>';
            }
            
            contenido += `
                <div class="equipo-total" id="total-${equipo.id}">Total: $${total.toFixed(2)}</div>
                <div class="equipo-actions">
                    <button class="btn-warning" onclick="agregarServicioExtra('${equipo.id}')">+ Servicio</button>
                    <button class="btn-danger" onclick="cerrarEquipo('${equipo.id}')">Cerrar</button>
                </div>
            `;
        } else {
            contenido += `
                <div class="equipo-actions">
                    <button class="btn-success" onclick="iniciarEquipo('${equipo.id}')">Iniciar</button>
                </div>
            `;
        }
        
        card.innerHTML = contenido;
        grid.appendChild(card);
    });
    
    document.getElementById('equiposLibres').textContent = libres;
    document.getElementById('equiposOcupados').textContent = ocupados;
}

/**
 * Inicia una sesión en un equipo
 * @param {string} equipoId - ID del equipo a iniciar
 */
function iniciarEquipo(equipoId) {
    const sesion = {
        id: Date.now().toString(),
        equipoId: equipoId,
        inicio: new Date().toISOString(),
        serviciosExtra: [],
        activa: true
    };
    
    sesionesEquipos.push(sesion);
    guardarDatos('sesionesEquipos', sesionesEquipos);
    renderizarEquipos();
}

function agregarServicioExtra(equipoId) {
    document.getElementById('servicioEquipoId').value = equipoId;
    document.getElementById('servicioTipo').value = '';
    document.getElementById('servicioTramiteGroup').style.display = 'none';
    document.getElementById('servicioCantidadGroup').style.display = 'none';
    document.getElementById('servicioTotalPreview').textContent = '';
    
    // Cargar trámites en el selector
    const select = document.getElementById('servicioTramiteSelect');
    select.innerHTML = '<option value="">Seleccionar trámite...</option>';
    tramites.forEach(tramite => {
        const option = document.createElement('option');
        option.value = tramite.id;
        option.textContent = `${tramite.nombre} - $${tramite.costo.toFixed(2)}`;
        select.appendChild(option);
    });
    
    // Agregar opción "Otro" para trámite personalizado
    const optionOtro = document.createElement('option');
    optionOtro.value = 'otro_equipo';
    optionOtro.textContent = '➕ Otro (personalizado)';
    select.appendChild(optionOtro);
    
    document.getElementById('modalServicioExtra').classList.add('active');
}

function toggleTramitePersonalizadoEquipo() {
    const select = document.getElementById('servicioTramiteSelect');
    const group = document.getElementById('servicioTramitePersonalizadoGroup');
    
    if (select.value === 'otro_equipo') {
        group.style.display = 'block';
        // Limpiar campos
        document.getElementById('servicioTramitePersonalizadoNombre').value = '';
        document.getElementById('servicioTramitePersonalizadoPrecio').value = '';
        document.getElementById('servicioTramitePersonalizadoCosto').value = '';
    } else {
        group.style.display = 'none';
    }
    
    calcularTotalServicio();
}

function cambiarTipoServicio() {
    const tipo = document.getElementById('servicioTipo').value;
    const tramiteGroup = document.getElementById('servicioTramiteGroup');
    const cantidadGroup = document.getElementById('servicioCantidadGroup');
    
    tramiteGroup.style.display = 'none';
    cantidadGroup.style.display = 'none';
    
    if (tipo === 'tramite') {
        tramiteGroup.style.display = 'block';
    } else if (tipo === 'impresion' || tipo === 'escaneo' || tipo === 'copia') {
        cantidadGroup.style.display = 'block';
    }
    
    calcularTotalServicio();
}

function calcularTotalServicio() {
    const tipo = document.getElementById('servicioTipo').value;
    const preview = document.getElementById('servicioTotalPreview');
    
    if (!tipo) {
        preview.textContent = '';
        return;
    }
    
    let total = 0;
    let descripcion = '';
    
    if (tipo === 'tramite') {
        const tramiteId = document.getElementById('servicioTramiteSelect').value;
        if (tramiteId === 'otro_equipo') {
            // Trámite personalizado
            const precio = parseFloat(document.getElementById('servicioTramitePersonalizadoPrecio').value) || 0;
            const nombre = document.getElementById('servicioTramitePersonalizadoNombre').value || 'Trámite personalizado';
            total = precio;
            descripcion = nombre;
        } else if (tramiteId) {
            // Trámite existente
            const tramite = tramites.find(t => t.id === tramiteId);
            if (tramite) {
                total = tramite.costo;
                descripcion = tramite.nombre;
            }
        }
    } else if (tipo === 'impresion') {
        const cantidad = parseInt(document.getElementById('servicioCantidad').value) || 0;
        total = calcularPrecioImpresion(cantidad);
        descripcion = `${cantidad} impresiones`;
    } else if (tipo === 'escaneo') {
        const cantidad = parseInt(document.getElementById('servicioCantidad').value) || 0;
        total = calcularPrecioEscaneo(cantidad);
        descripcion = `${cantidad} escaneos`;
    } else if (tipo === 'copia') {
        const cantidad = parseInt(document.getElementById('servicioCantidad').value) || 0;
        total = calcularPrecioImpresion(cantidad); // Mismo precio que impresión
        descripcion = `${cantidad} copias`;
    }
    
    if (total > 0) {
        preview.textContent = `${descripcion}: $${total.toFixed(2)}`;
    } else {
        preview.textContent = '';
    }
}

function agregarServicioExtraModal(event) {
    event.preventDefault();
    
    const equipoId = document.getElementById('servicioEquipoId').value;
    const tipo = document.getElementById('servicioTipo').value;
    
    const sesion = sesionesEquipos.find(s => s.equipoId === equipoId && s.activa);
    if (!sesion) return;
    
    const equipo = equipos.find(e => e.id === equipoId);
    const nombreEquipo = equipo ? equipo.nombre : `Equipo ${equipoId}`;
    
    let servicio = {
        tipo: tipo,
        cantidad: 1,
        precio: 0,
        descripcion: '',
        equipoNombre: nombreEquipo
    };
    
    if (tipo === 'tramite') {
        const tramiteId = document.getElementById('servicioTramiteSelect').value;
        
        if (tramiteId === 'otro_equipo') {
            // Trámite personalizado
            const nombre = document.getElementById('servicioTramitePersonalizadoNombre').value;
            const precio = parseFloat(document.getElementById('servicioTramitePersonalizadoPrecio').value);
            const costo = parseFloat(document.getElementById('servicioTramitePersonalizadoCosto').value) || 0;
            
            if (!nombre || !precio) {
                alert('Por favor completa el nombre y precio del trámite');
                return;
            }
            
            servicio.precio = precio;
            servicio.descripcion = nombre;
            servicio.tramiteId = 'personalizado_' + Date.now();
            servicio.esPersonalizado = true;
            servicio.costoTramite = costo;
            
            // Registrar en ventas de trámites
            const ventaTramite = {
                id: Date.now().toString(),
                tramiteId: servicio.tramiteId,
                tramiteNombre: nombre,
                cantidad: 1,
                total: precio,
                fecha: new Date().toISOString(),
                esPersonalizado: true,
                equipoNombre: nombreEquipo
            };
            
            ventasTramites.push(ventaTramite);
            
            // Registrar gasto si tiene costo
            if (costo > 0) {
                const gasto = {
                    id: Date.now().toString() + '_costo',
                    concepto: `Costo de trámite: ${nombre} (${nombreEquipo})`,
                    monto: costo,
                    fecha: new Date().toISOString(),
                    categoria: 'Trámites'
                };
                gastos.push(gasto);
                guardarDatos('gastos', gastos);
            }
            
        } else {
            // Trámite existente
            const tramite = tramites.find(t => t.id === tramiteId);
            if (!tramite) return;
            
            servicio.precio = tramite.costo;
            servicio.descripcion = tramite.nombre;
            servicio.tramiteId = tramiteId;
            servicio.costoTramite = tramite.gasto || 0;
            
            // Registrar en ventas de trámites
            const ventaTramite = {
                id: Date.now().toString(),
                tramiteId: tramiteId,
                tramiteNombre: tramite.nombre,
                cantidad: 1,
                total: tramite.costo,
                fecha: new Date().toISOString(),
                esPersonalizado: false,
                equipoNombre: nombreEquipo
            };
            
            ventasTramites.push(ventaTramite);
            
            // Registrar gasto si tiene costo
            if (tramite.gasto && tramite.gasto > 0) {
                const gasto = {
                    id: Date.now().toString() + '_costo',
                    concepto: `Costo de trámite: ${tramite.nombre} (${nombreEquipo})`,
                    monto: tramite.gasto,
                    fecha: new Date().toISOString(),
                    categoria: 'Trámites'
                };
                gastos.push(gasto);
                guardarDatos('gastos', gastos);
            }
        }
        
        guardarDatos('ventasTramites', ventasTramites);
    } else if (tipo === 'impresion' || tipo === 'escaneo' || tipo === 'copia') {
        const cantidad = parseInt(document.getElementById('servicioCantidad').value);
        servicio.cantidad = cantidad;
        
        let tipoImpresion, precioUnitario, promocionAplicada = null;
        
        if (tipo === 'impresion' || tipo === 'copia') {
            servicio.precio = calcularPrecioImpresion(cantidad);
            tipoImpresion = 'impresion';
            precioUnitario = 1.00;
            
            // Verificar promociones para impresión B/N
            const promocionesAplicables = promociones.filter(p => 
                p.tipo === 'impresion' && cantidad >= p.cantidadMinima
            ).sort((a, b) => a.precio - b.precio);
            
            if (promocionesAplicables.length > 0) {
                promocionAplicada = promocionesAplicables[0];
                precioUnitario = promocionAplicada.precio;
                servicio.precio = precioUnitario * cantidad;
            }
            
        } else {
            servicio.precio = calcularPrecioEscaneo(cantidad);
            tipoImpresion = 'escaneo';
            precioUnitario = 4.00;
            
            // Verificar promociones para escaneo
            const promocionesAplicables = promociones.filter(p => 
                p.tipo === 'escaneo' && cantidad >= p.cantidadMinima
            ).sort((a, b) => a.precio - b.precio);
            
            if (promocionesAplicables.length > 0) {
                promocionAplicada = promocionesAplicables[0];
                precioUnitario = promocionAplicada.precio;
                servicio.precio = precioUnitario * cantidad;
            }
        }
        
        servicio.descripcion = `${cantidad} ${tipo}${cantidad > 1 ? 's' : ''}`;
        
        // Registrar en ventas de impresiones
        const ventaImpresion = {
            id: Date.now().toString(),
            tipo: tipoImpresion,
            cantidad: cantidad,
            precioUnitario: precioUnitario,
            total: servicio.precio,
            fecha: new Date().toISOString(),
            promocionId: promocionAplicada ? promocionAplicada.id : null,
            equipoNombre: nombreEquipo
        };
        
        ventasImpresiones.push(ventaImpresion);
        guardarDatos('ventasImpresiones', ventasImpresiones);
    }
    
    if (!sesion.serviciosExtra) {
        sesion.serviciosExtra = [];
    }
    
    sesion.serviciosExtra.push(servicio);
    
    guardarDatos('sesionesEquipos', sesionesEquipos);
    renderizarEquipos();
    renderizarVentasTramites();
    renderizarVentasImpresiones();
    renderizarGastos();
    renderizarReportes();
    cerrarModal('modalServicioExtra');
    
    const mensaje = servicio.esPersonalizado && servicio.costoTramite > 0
        ? `${servicio.descripcion} - $${servicio.precio.toFixed(2)} (Costo: $${servicio.costoTramite.toFixed(2)} agregado a gastos)`
        : `${servicio.descripcion} - $${servicio.precio.toFixed(2)}`;
    
    mostrarToast('Servicio Agregado', mensaje, 'success');
    
    document.getElementById('formServicioExtra').reset();
    document.getElementById('servicioTramitePersonalizadoGroup').style.display = 'none';
}

/**
 * Cierra la sesión activa de un equipo
 * Calcula el total según tiempo transcurrido y servicios extra
 * @param {string} equipoId - ID del equipo a cerrar
 */
function cerrarEquipo(equipoId) {
    const sesion = sesionesEquipos.find(s => s.equipoId === equipoId && s.activa);
    if (!sesion) return;
    
    sesion.fin = new Date().toISOString();
    sesion.activa = false;
    
    const total = calcularTotalEquipo(sesion);
    sesion.total = total;
    
    guardarDatos('sesionesEquipos', sesionesEquipos);
    renderizarEquipos();
    renderizarReportes();
    
    alert(`Equipo cerrado. Total: $${total.toFixed(2)}`);
}

/**
 * Calcula el tiempo transcurrido desde un momento dado
 * @param {string} inicio - Fecha/hora de inicio en formato ISO
 * @returns {string} Tiempo en formato HH:MM:SS
 */
function calcularTiempoTranscurrido(inicio) {
    const ahora = new Date();
    const inicioDate = new Date(inicio);
    const diff = ahora - inicioDate;
    
    const horas = Math.floor(diff / 3600000);
    const minutos = Math.floor((diff % 3600000) / 60000);
    const segundos = Math.floor((diff % 60000) / 1000);
    
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

/**
 * Calcula el total a cobrar por una sesión de equipo
 * Lógica de precios:
 * - Menos de 30 minutos: $3 (mínimo)
 * - 30-60 minutos: $5
 * - Más de 1 hora: $10 por hora (proporcional)
 * - Suma servicios extra (impresiones, trámites, etc.)
 * @param {Object} sesion - Objeto sesión con inicio, fin y serviciosExtra
 * @returns {number} Total a cobrar en pesos
 */
function calcularTotalEquipo(sesion) {
    const inicio = new Date(sesion.inicio);
    const fin = sesion.fin ? new Date(sesion.fin) : new Date();
    const minutos = (fin - inicio) / 60000;
    
    let total = 0;
    
    // Calcular precio por tiempo
    if (minutos < 30) {
        total = 3; // Mínimo
    } else if (minutos <= 60) {
        total = 5; // 30-60 min
    } else {
        const horas = minutos / 60;
        total = horas * 10; // $10 por hora
    }
    
    // Agregar servicios extra
    if (sesion.serviciosExtra && sesion.serviciosExtra.length > 0) {
        sesion.serviciosExtra.forEach(servicio => {
            total += parseFloat(servicio.precio) || 0;
        });
    }
    
    return total;
}

/**
 * Actualiza los timers de todos los equipos activos
 * Se ejecuta cada segundo mediante setInterval
 */
function actualizarTimersEquipos() {
    sesionesEquipos.forEach(sesion => {
        if (sesion.activa) {
            const timerElement = document.getElementById(`timer-${sesion.equipoId}`);
            if (timerElement) {
                timerElement.textContent = calcularTiempoTranscurrido(sesion.inicio);
            }
        }
    });
}

// ============================================
// MÓDULO TRÁMITES
// ============================================

function renderizarTramites(filtro = '') {
    // Actualizar selector de venta rápida
    actualizarSelectorVentaRapida();
}

function actualizarSelectorVentaRapida() {
    const select = document.getElementById('tramiteVentaRapida');
    select.innerHTML = '<option value="">Seleccionar trámite...</option>';
    
    tramites.forEach(tramite => {
        const option = document.createElement('option');
        option.value = tramite.id;
        option.textContent = `${tramite.nombre} - $${tramite.costo.toFixed(2)}`;
        select.appendChild(option);
    });
    
    // Agregar opción "Otro" para trámite personalizado
    const optionOtro = document.createElement('option');
    optionOtro.value = 'otro_rapido';
    optionOtro.textContent = '➕ Otro (personalizado)';
    select.appendChild(optionOtro);
}

function ventaRapidaTramite() {
    const tramiteId = document.getElementById('tramiteVentaRapida').value;
    const cantidad = parseInt(document.getElementById('cantidadVentaRapida').value) || 1;
    
    if (!tramiteId) {
        mostrarToast('Error', 'Selecciona un trámite', 'error');
        return;
    }
    
    // Si seleccionó "Otro", abrir el modal detallado con "Otro" preseleccionado
    if (tramiteId === 'otro_rapido') {
        mostrarModalVentaTramite('otro');
        return;
    }
    
    const tramite = tramites.find(t => t.id === tramiteId);
    if (!tramite) {
        mostrarToast('Error', 'Trámite no encontrado', 'error');
        return;
    }
    
    const total = tramite.costo * cantidad;
    const costoTramite = tramite.gasto || 0;
    
    const venta = {
        id: Date.now().toString(),
        tramiteId: tramiteId,
        tramiteNombre: tramite.nombre,
        cantidad: cantidad,
        total: total,
        fecha: new Date().toISOString(),
        esPersonalizado: false
    };
    
    ventasTramites.push(venta);
    
    // Solo registrar gasto si el trámite tiene costo
    if (costoTramite > 0) {
        const gasto = {
            id: Date.now().toString() + '_costo',
            concepto: `Costo de trámite: ${tramite.nombre}`,
            monto: costoTramite * cantidad,
            fecha: new Date().toISOString(),
            categoria: 'Trámites'
        };
        gastos.push(gasto);
        guardarDatos('gastos', gastos);
    }
    
    guardarDatos('ventasTramites', ventasTramites);
    
    renderizarVentasTramites();
    renderizarGastos();
    renderizarReportes();
    
    document.getElementById('tramiteVentaRapida').value = '';
    document.getElementById('cantidadVentaRapida').value = 1;
    
    // Mensaje dinámico según si tiene costo o no
    const mensaje = costoTramite > 0 
        ? `${tramite.nombre} x${cantidad} - $${total.toFixed(2)}. Costo de $${(costoTramite * cantidad).toFixed(2)} agregado a gastos.`
        : `${tramite.nombre} x${cantidad} - $${total.toFixed(2)}. Sin costo asociado.`;
    
    mostrarToast('Venta Registrada', mensaje, 'success');
}


function renderizarVentasTramites() {
    const tbody = document.getElementById('ventasTramitesHoy');
    tbody.innerHTML = '';
    
    ventasTramites.forEach(venta => {
        let nombreTramite;
        
        if (venta.esPersonalizado) {
            // Trámite personalizado
            nombreTramite = venta.tramiteNombre + ' (Personalizado)';
        } else {
            // Trámite existente
            const tramite = tramites.find(t => t.id === venta.tramiteId);
            if (!tramite) return;
            nombreTramite = tramite.nombre;
        }
        
        const fecha = new Date(venta.fecha);
        const hora = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        
        const tr = document.createElement('tr');
        const equipoInfo = venta.equipoNombre ? ` (${venta.equipoNombre})` : '';
        tr.innerHTML = `
            <td>${nombreTramite}${equipoInfo}</td>
            <td>${venta.cantidad}</td>
            <td><strong class="badge success">$${venta.total.toFixed(2)}</strong></td>
            <td>${hora}</td>
        `;
        tbody.appendChild(tr);
    });
    
    if (ventasTramites.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 1rem;">No hay ventas registradas</td></tr>';
    }
}

function mostrarModalVentaTramite(tramiteId = null) {
    const modal = document.getElementById('modalVentaTramite');
    const select = document.getElementById('ventaTramiteSelect');
    
    if (!select) {
        console.error('No se encontró el elemento ventaTramiteSelect');
        return;
    }
    
    select.innerHTML = '<option value="">Seleccionar trámite...</option>';
    
    // Agregar trámites existentes
    tramites.forEach(tramite => {
        const option = document.createElement('option');
        option.value = tramite.id;
        option.textContent = `${tramite.nombre} - $${tramite.costo.toFixed(2)}`;
        if (tramiteId && tramite.id === tramiteId) {
            option.selected = true;
        }
        select.appendChild(option);
    });
    
    // Agregar opción "Otro" SIEMPRE al final
    const optionOtro = document.createElement('option');
    optionOtro.value = 'otro';
    optionOtro.textContent = '➕ Otro (personalizado)';
    if (tramiteId === 'otro') {
        optionOtro.selected = true;
    }
    select.appendChild(optionOtro);
    
    // Resetear campos personalizados
    document.getElementById('tramitePersonalizadoGroup').style.display = 'none';
    
    modal.classList.add('active');
    
    // Si se preseleccionó "otro", mostrar los campos
    if (tramiteId === 'otro') {
        toggleTramitePersonalizado();
    }
    
    calcularTotalTramite();
}

function toggleTramitePersonalizado() {
    const select = document.getElementById('ventaTramiteSelect');
    const group = document.getElementById('tramitePersonalizadoGroup');
    
    if (select.value === 'otro') {
        group.style.display = 'block';
        // Limpiar campos para que el usuario los llene
        document.getElementById('tramitePersonalizadoNombre').value = '';
        document.getElementById('tramitePersonalizadoPrecio').value = '';
        document.getElementById('tramitePersonalizadoCosto').value = '';
    } else {
        group.style.display = 'none';
        // Limpiar campos
        document.getElementById('tramitePersonalizadoNombre').value = '';
        document.getElementById('tramitePersonalizadoPrecio').value = '';
        document.getElementById('tramitePersonalizadoCosto').value = '';
    }
    
    calcularTotalTramite();
}

function calcularTotalTramite() {
    const tramiteId = document.getElementById('ventaTramiteSelect').value;
    const cantidad = parseInt(document.getElementById('ventaTramiteCantidad').value) || 0;
    
    if (!tramiteId) {
        document.getElementById('ventaTramiteTotal').textContent = '';
        return;
    }
    
    let total = 0;
    
    if (tramiteId === 'otro') {
        // Trámite personalizado
        const precio = parseFloat(document.getElementById('tramitePersonalizadoPrecio').value) || 0;
        total = precio * cantidad;
    } else {
        // Trámite existente
        const tramite = tramites.find(t => t.id === tramiteId);
        if (tramite) {
            total = tramite.costo * cantidad;
        }
    }
    
    document.getElementById('ventaTramiteTotal').textContent = `Total: $${total.toFixed(2)}`;
}

function registrarVentaTramite(event) {
    event.preventDefault();
    
    const tramiteId = document.getElementById('ventaTramiteSelect').value;
    const cantidad = parseInt(document.getElementById('ventaTramiteCantidad').value);
    
    let tramite, total, costoTramite, nombreTramite;
    
    if (tramiteId === 'otro') {
        // Trámite personalizado
        nombreTramite = document.getElementById('tramitePersonalizadoNombre').value;
        const precio = parseFloat(document.getElementById('tramitePersonalizadoPrecio').value);
        costoTramite = parseFloat(document.getElementById('tramitePersonalizadoCosto').value);
        
        if (!nombreTramite || !precio || !costoTramite) {
            alert('Por favor completa todos los campos del trámite personalizado');
            return;
        }
        
        total = precio * cantidad;
        
        // Crear objeto tramite temporal para la venta
        tramite = {
            id: 'personalizado_' + Date.now(),
            nombre: nombreTramite,
            costo: precio
        };
    } else {
        // Trámite existente
        tramite = tramites.find(t => t.id === tramiteId);
        if (!tramite) {
            alert('Trámite no encontrado');
            return;
        }
        
        nombreTramite = tramite.nombre;
        total = tramite.costo * cantidad;
        costoTramite = tramite.costoReal || (tramite.costo * 0.6); // Si no tiene costo real, usar 60% del precio
    }
    
    const venta = {
        id: Date.now().toString(),
        tramiteId: tramite.id,
        tramiteNombre: nombreTramite,
        cantidad: cantidad,
        total: total,
        fecha: new Date().toISOString(),
        esPersonalizado: tramiteId === 'otro'
    };
    
    // Registrar el costo del trámite como gasto
    const gasto = {
        id: Date.now().toString() + '_costo',
        concepto: `Costo de trámite: ${nombreTramite}`,
        monto: costoTramite * cantidad,
        fecha: new Date().toISOString(),
        categoria: 'Trámites'
    };
    
    ventasTramites.push(venta);
    gastos.push(gasto);
    
    guardarDatos('ventasTramites', ventasTramites);
    guardarDatos('gastos', gastos);
    
    renderizarVentasTramites();
    renderizarGastos();
    renderizarReportes();
    
    cerrarModal('modalVentaTramite');
    mostrarToast('Venta Registrada', `${nombreTramite} vendido exitosamente. Costo agregado a gastos.`, 'success');
    
    document.getElementById('formVentaTramite').reset();
    document.getElementById('tramitePersonalizadoGroup').style.display = 'none';
}

// ============================================
// MÓDULO IMPRESIONES Y ESCANEOS
// ============================================

function ventaRapidaImpresion() {
    const tipoServicio = document.getElementById('impresionVentaRapida').value;
    const cantidad = parseInt(document.getElementById('cantidadImpresionRapida').value) || 1;
    
    if (!tipoServicio) {
        mostrarToast('Error', 'Selecciona un servicio', 'error');
        return;
    }
    
    let tipo, precioBase, nombreServicio;
    
    switch (tipoServicio) {
        case 'impresion_bn':
            tipo = 'impresion';
            precioBase = 1.00;
            nombreServicio = 'Impresión B/N';
            break;
        case 'impresion_color_1':
            tipo = 'impresion_color';
            precioBase = 3.00;
            nombreServicio = 'Impresión Color Calidad 1';
            break;
        case 'impresion_color_2':
            tipo = 'impresion_color';
            precioBase = 5.00;
            nombreServicio = 'Impresión Color Calidad 2';
            break;
        case 'impresion_color_3':
            tipo = 'impresion_color';
            precioBase = 7.00;
            nombreServicio = 'Impresión Color Calidad 3';
            break;
        case 'escaneo':
            tipo = 'escaneo';
            precioBase = 4.00;
            nombreServicio = 'Escaneo';
            break;
        default:
            mostrarToast('Error', 'Servicio no válido', 'error');
            return;
    }
    
    // Calcular precio con promociones (solo para B/N y escaneo)
    let precioFinal = precioBase;
    let promocionAplicada = null;
    
    if (tipo === 'impresion' || tipo === 'escaneo') {
        const promocionesAplicables = promociones.filter(p => 
            p.tipo === tipo && cantidad >= p.cantidadMinima
        ).sort((a, b) => a.precio - b.precio);
        
        if (promocionesAplicables.length > 0) {
            promocionAplicada = promocionesAplicables[0];
            precioFinal = promocionAplicada.precio;
        }
    }
    
    const total = precioFinal * cantidad;
    
    const venta = {
        id: Date.now().toString(),
        tipo: tipo,
        cantidad: cantidad,
        precioUnitario: precioFinal,
        total: total,
        fecha: new Date().toISOString(),
        promocionId: promocionAplicada ? promocionAplicada.id : null
    };
    
    ventasImpresiones.push(venta);
    guardarDatos('ventasImpresiones', ventasImpresiones);
    
    renderizarVentasImpresiones();
    renderizarReportes();
    
    // Resetear formulario
    document.getElementById('impresionVentaRapida').value = '';
    document.getElementById('cantidadImpresionRapida').value = 1;
    
    // Mensaje informativo
    const mensaje = promocionAplicada 
        ? `${nombreServicio} x${cantidad} - $${total.toFixed(2)} (Promoción aplicada: $${precioFinal.toFixed(2)} c/u)`
        : `${nombreServicio} x${cantidad} - $${total.toFixed(2)} ($${precioBase.toFixed(2)} c/u)`;
    
    mostrarToast('Venta Registrada', mensaje, 'success');
}

function renderizarPromociones() {
    const tbody = document.getElementById('promocionesLista');
    tbody.innerHTML = '';
    promociones.forEach(promo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="badge info">${promo.tipo === 'impresion' ? 'Impresión' : 'Escaneo'}</span></td>
            <td>${promo.cantidad}+ hojas</td>
            <td><strong>$${promo.precio.toFixed(2)}</strong></td>
        `;
        tbody.appendChild(tr);
    });
    
    if (promociones.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 1rem;">No hay promociones activas</td></tr>';
    }
}

function renderizarVentasImpresiones() {
    const tbody = document.getElementById('ventasImpresionesHoy');
    tbody.innerHTML = '';
    
    ventasImpresiones.forEach(venta => {
        const fecha = new Date(venta.fecha);
        const hora = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        
        // Determinar el tipo y badge
        let tipoTexto = '';
        let badgeClass = '';
        
        if (venta.tipo === 'impresion') {
            tipoTexto = 'Impresión B/N';
            badgeClass = 'info';
        } else if (venta.tipo === 'impresion_color') {
            tipoTexto = `Impresión Color`;
            badgeClass = 'primary';
        } else if (venta.tipo === 'escaneo') {
            tipoTexto = 'Escaneo';
            badgeClass = 'warning';
        }
        
        const equipoInfo = venta.equipoNombre || 'Venta directa';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="badge ${badgeClass}">${tipoTexto}</span></td>
            <td>${venta.cantidad} hojas</td>
            <td><strong class="badge success">$${venta.total.toFixed(2)}</strong></td>
            <td>${equipoInfo}</td>
            <td>${hora}</td>
        `;
        tbody.appendChild(tr);
    });
    
    if (ventasImpresiones.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 1rem;">No hay ventas registradas</td></tr>';
    }
}

function mostrarModalVentaImpresion() {
    const modal = document.getElementById('modalVentaImpresion');
    modal.classList.add('active');
    actualizarEquiposSelect();
    mostrarOpcionesColor();
    calcularTotalImpresion();
}

/**
 * Muestra u oculta las opciones de calidad de color
 */
function mostrarOpcionesColor() {
    const tipo = document.getElementById('ventaImpresionTipo').value;
    const colorGroup = document.getElementById('colorCostGroup');
    
    if (tipo === 'impresion-color') {
        colorGroup.style.display = 'block';
    } else {
        colorGroup.style.display = 'none';
    }
    
    calcularTotalImpresion();
}

function actualizarEquiposSelect() {
    const select = document.getElementById('ventaImpresionEquipo');
    select.innerHTML = '<option value="">Seleccionar equipo...</option>';
    
    equipos.forEach(equipo => {
        const sesion = sesionesEquipos.find(s => s.equipoId === equipo.id && s.activa);
        if (sesion) {
            const option = document.createElement('option');
            option.value = equipo.id;
            option.textContent = equipo.nombre;
            select.appendChild(option);
        }
    });
}

function toggleEquipoSelect() {
    const checkbox = document.getElementById('ventaImpresionAgregarEquipo');
    const group = document.getElementById('equipoSelectGroup');
    group.style.display = checkbox.checked ? 'block' : 'none';
}

function calcularPrecioImpresion(cantidad) {
    // Buscar promoción aplicable - Precio base: $1 por hoja
    const promosImpresion = promociones
        .filter(p => p.tipo === 'impresion' && cantidad >= p.cantidad)
        .sort((a, b) => b.cantidad - a.cantidad);
    
    if (promosImpresion.length > 0) {
        return promosImpresion[0].precio * cantidad;
    }
    
    return cantidad * 1; // Precio base $1 por hoja
}

function calcularPrecioEscaneo(cantidad) {
    // Buscar promoción aplicable
    const promosEscaneo = promociones
        .filter(p => p.tipo === 'escaneo' && cantidad >= p.cantidad)
        .sort((a, b) => b.cantidad - a.cantidad);
    
    if (promosEscaneo.length > 0) {
        return promosEscaneo[0].precio * cantidad;
    }
    
    return cantidad * 4; // Precio base $4
}

function calcularTotalImpresion() {
    const tipo = document.getElementById('ventaImpresionTipo').value;
    const cantidad = parseInt(document.getElementById('ventaImpresionCantidad').value) || 0;
    
    let total = 0;
    if (tipo === 'impresion') {
        total = calcularPrecioImpresion(cantidad);
    } else if (tipo === 'impresion-color') {
        const costoColor = parseInt(document.getElementById('ventaImpresionColorCosto').value) || 3;
        total = cantidad * costoColor;
    } else {
        total = calcularPrecioEscaneo(cantidad);
    }
    
    document.getElementById('ventaImpresionTotal').textContent = `Total: $${total.toFixed(2)}`;
}

function registrarVentaImpresion(event) {
    event.preventDefault();
    
    const tipo = document.getElementById('ventaImpresionTipo').value;
    const cantidad = parseInt(document.getElementById('ventaImpresionCantidad').value);
    const agregarEquipo = document.getElementById('ventaImpresionAgregarEquipo').checked;
    const equipoId = agregarEquipo ? document.getElementById('ventaImpresionEquipo').value : null;
    
    let total = 0;
    let calidad = null;
    
    if (tipo === 'impresion') {
        total = calcularPrecioImpresion(cantidad);
    } else if (tipo === 'impresion-color') {
        const costoColor = parseInt(document.getElementById('ventaImpresionColorCosto').value) || 3;
        total = cantidad * costoColor;
        calidad = costoColor === 3 ? 'C1' : costoColor === 5 ? 'C2' : 'C3';
    } else {
        total = calcularPrecioEscaneo(cantidad);
    }
    
    const venta = {
        id: Date.now().toString(),
        tipo: tipo,
        cantidad: cantidad,
        total: total,
        calidad: calidad, // Solo para impresiones a color
        equipoId: equipoId,
        fecha: new Date().toISOString()
    };
    
    ventasImpresiones.push(venta);
    guardarDatos('ventasImpresiones', ventasImpresiones);
    
    // Si se agrega a un equipo, agregar como servicio extra
    if (equipoId) {
        const sesion = sesionesEquipos.find(s => s.equipoId === equipoId && s.activa);
        if (sesion) {
            const descripcion = tipo === 'impresion-color' ? 
                `Impresión Color ${calidad}` : 
                tipo === 'impresion' ? 'Impresión B/N' : 'Escaneo';
            
            sesion.serviciosExtra.push({
                tipo: tipo,
                descripcion: descripcion,
                cantidad: cantidad,
                precio: total
            });
            guardarDatos('sesionesEquipos', sesionesEquipos);
            renderizarEquipos();
        }
    }
    
    renderizarVentasImpresiones();
    renderizarReportes();
    cerrarModal('modalVentaImpresion');
    
    // Limpiar formulario
    document.getElementById('formVentaImpresion').reset();
    document.getElementById('colorCostGroup').style.display = 'none';
    document.getElementById('equipoSelectGroup').style.display = 'none';
    
    // Determinar texto para notificación
    const tipoTexto = tipo === 'impresion-color' ? 
        `Impresión Color ${calidad}` : 
        tipo === 'impresion' ? 'Impresión B/N' : 'Escaneo';
    
    mostrarToast('Venta Registrada', `${tipoTexto} - $${total.toFixed(2)}`, 'success');
}

// ============================================
// MÓDULO PAPELERÍA
// ============================================

function renderizarPapeleria(filtro = '') {
    const tbody = document.getElementById('papeleriaTableBody');
    tbody.innerHTML = '';
    
    const productosFiltrados = productos.filter(p => 
        p.nombre.toLowerCase().includes(filtro.toLowerCase())
    );
    
    productosFiltrados.forEach(producto => {
        let estadoBadge = '';
        let estadoClass = '';
        
        if (producto.cantidad === 0) {
            estadoBadge = 'AGOTADO';
            estadoClass = 'danger';
        } else if (producto.cantidad < 5) {
            estadoBadge = 'Stock Bajo';
            estadoClass = 'warning';
        } else {
            estadoBadge = 'Disponible';
            estadoClass = 'success';
        }
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${producto.nombre}</strong></td>
            <td><span class="badge success">$${producto.precio.toFixed(2)}</span></td>
            <td>${producto.cantidad}</td>
            <td><span class="badge ${estadoClass}">${estadoBadge}</span></td>
        `;
        tbody.appendChild(tr);
    });
    
    if (productosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">No se encontraron productos</td></tr>';
    }
}

function renderizarVentasPapeleria() {
    const tbody = document.getElementById('ventasPapeleriaHoy');
    tbody.innerHTML = '';
    
    ventasPapeleria.forEach(venta => {
        const producto = productos.find(p => p.id === venta.productoId);
        if (!producto) return;
        
        const fecha = new Date(venta.fecha);
        const hora = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${producto.nombre}</td>
            <td>${venta.cantidad}</td>
            <td><strong class="badge success">$${venta.total.toFixed(2)}</strong></td>
            <td>${hora}</td>
        `;
        tbody.appendChild(tr);
    });
    
    if (ventasPapeleria.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 1rem;">No hay ventas registradas</td></tr>';
    }
}

function mostrarModalVentaPapeleria() {
    const modal = document.getElementById('modalVentaPapeleria');
    const select = document.getElementById('ventaPapeleriaSelect');
    
    select.innerHTML = '<option value="">Seleccionar producto...</option>';
    productos.forEach(producto => {
        if (producto.cantidad > 0) {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = `${producto.nombre} - $${producto.precio.toFixed(2)}`;
            select.appendChild(option);
        }
    });
    
    modal.classList.add('active');
}

function actualizarStockDisponible() {
    const productoId = document.getElementById('ventaPapeleriaSelect').value;
    const stockDiv = document.getElementById('stockDisponible');
    
    if (!productoId) {
        stockDiv.textContent = '';
        return;
    }
    
    const producto = productos.find(p => p.id === productoId);
    stockDiv.textContent = `Stock disponible: ${producto.cantidad}`;
    calcularTotalPapeleria();
}

function calcularTotalPapeleria() {
    const productoId = document.getElementById('ventaPapeleriaSelect').value;
    const cantidad = parseInt(document.getElementById('ventaPapeleriaCantidad').value) || 0;
    
    if (!productoId) {
        document.getElementById('ventaPapeleriaTotal').textContent = '';
        return;
    }
    
    const producto = productos.find(p => p.id === productoId);
    const total = producto.precio * cantidad;
    
    document.getElementById('ventaPapeleriaTotal').textContent = `Total: $${total.toFixed(2)}`;
}

function registrarVentaPapeleria(event) {
    event.preventDefault();
    
    const productoId = document.getElementById('ventaPapeleriaSelect').value;
    const cantidad = parseInt(document.getElementById('ventaPapeleriaCantidad').value);
    
    const producto = productos.find(p => p.id === productoId);
    
    if (producto.cantidad < cantidad) {
        alert('No hay suficiente stock disponible');
        return;
    }
    
    const total = producto.precio * cantidad;
    
    const venta = {
        id: Date.now().toString(),
        productoId: productoId,
        cantidad: cantidad,
        total: total,
        fecha: new Date().toISOString()
    };
    
    // Reducir inventario
    producto.cantidad -= cantidad;
    guardarDatos('productos', productos);
    
    ventasPapeleria.push(venta);
    guardarDatos('ventasPapeleria', ventasPapeleria);
    
    renderizarPapeleria();
    renderizarVentasPapeleria();
    renderizarAdminPapeleria();
    renderizarReportes();
    cerrarModal('modalVentaPapeleria');
    
    document.getElementById('formVentaPapeleria').reset();
}

// ============================================
// MÓDULO GASTOS
// ============================================

function renderizarGastos() {
    const tbody = document.getElementById('gastosLista');
    tbody.innerHTML = '';
    
    let totalGastos = 0;
    
    gastos.forEach(gasto => {
        totalGastos += gasto.monto;
        
        const fecha = new Date(gasto.fecha);
        const hora = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${gasto.concepto}</strong></td>
            <td><span class="badge info">${gasto.categoria}</span></td>
            <td><strong class="badge danger">$${gasto.monto.toFixed(2)}</strong></td>
            <td>${hora}</td>
            <td>
                <button class="btn-icon delete" onclick="eliminarGasto('${gasto.id}')" title="Eliminar">❌</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    if (gastos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 1rem;">No hay gastos registrados</td></tr>';
    }
    
    document.getElementById('totalGastos').textContent = totalGastos.toFixed(2);
}

function eliminarGasto(gastoId) {
    if (!confirm('¿Está seguro de eliminar este gasto?')) return;
    
    gastos = gastos.filter(g => g.id !== gastoId);
    guardarDatos('gastos', gastos);
    renderizarGastos();
    renderizarReportes();
}

function mostrarModalGasto() {
    const modal = document.getElementById('modalGasto');
    modal.classList.add('active');
}

function guardarGasto(event) {
    event.preventDefault();
    
    const gasto = {
        id: Date.now().toString(),
        concepto: document.getElementById('gastoConcepto').value,
        monto: parseFloat(document.getElementById('gastoMonto').value),
        categoria: document.getElementById('gastoCategoria').value,
        fecha: new Date().toISOString()
    };
    
    gastos.push(gasto);
    guardarDatos('gastos', gastos);
    
    renderizarGastos();
    renderizarReportes();
    cerrarModal('modalGasto');
    
    document.getElementById('formGasto').reset();
}

// ============================================
// REPORTES Y CORTE DIARIO
// ============================================

function renderizarReportes() {
    // Calcular totales
    const totalEquipos = sesionesEquipos
        .filter(s => !s.activa)
        .reduce((sum, s) => sum + (s.total || 0), 0);
    
    const totalTramites = ventasTramites
        .reduce((sum, v) => sum + v.total, 0);
    
    const totalImpresiones = ventasImpresiones
        .reduce((sum, v) => sum + v.total, 0);
    
    const totalPapeleria = ventasPapeleria
        .reduce((sum, v) => sum + v.total, 0);
    
    const totalGastos = gastos
        .reduce((sum, g) => sum + g.monto, 0);
    
    const totalNeto = totalEquipos + totalTramites + totalImpresiones + totalPapeleria - totalGastos;
    
    // Actualizar UI
    document.getElementById('totalEquipos').textContent = totalEquipos.toFixed(2);
    document.getElementById('totalTramites').textContent = totalTramites.toFixed(2);
    document.getElementById('totalImpresiones').textContent = totalImpresiones.toFixed(2);
    document.getElementById('totalPapeleria').textContent = totalPapeleria.toFixed(2);
    document.getElementById('totalGastosReporte').textContent = totalGastos.toFixed(2);
    document.getElementById('totalNeto').textContent = totalNeto.toFixed(2);
}

/**
 * Renderiza el historial de cortes diarios
 * Muestra diferencias entre monto calculado y real si existen
 * Incluye botón para eliminar cortes (requiere contraseña)
 */
function renderizarHistorialCortes() {
    const container = document.getElementById('historialCortes');
    container.innerHTML = '';
    
    cortesHistorial.slice().reverse().forEach((corte, index) => {
        const item = document.createElement('div');
        item.className = 'corte-item';
        
        // Mostrar diferencia si existe
        let infoDiferencia = '';
        if (corte.montoReal !== null && corte.montoReal !== undefined) {
            const diferencia = corte.diferencia || 0;
            if (Math.abs(diferencia) > 0.01) {
                const tipo = diferencia > 0 ? '📈 Sobrante' : '📉 Faltante';
                const color = diferencia > 0 ? 'var(--success)' : 'var(--danger)';
                infoDiferencia = `<br><span style="color: ${color}; font-size: 0.85rem;">${tipo}: $${Math.abs(diferencia).toFixed(2)}</span>`;
            }
        }
        
        const esAutomatico = corte.automatico ? ' <span style="background: var(--warning); padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">AUTO</span>' : '';
        
        item.innerHTML = `
            <div style="flex: 1;">
                <strong>${corte.fecha}${esAutomatico}</strong>
                <div style="color: var(--text-secondary); font-size: 0.9rem;">
                    Total: $${corte.totalGenerado.toFixed(2)} | Gastos: $${corte.totalGastos.toFixed(2)}
                    ${corte.montoReal !== null && corte.montoReal !== undefined ? `<br>Real: $${corte.montoReal.toFixed(2)}` : ''}${infoDiferencia}
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="font-size: 1.2rem; font-weight: 600; color: var(--success);">
                    $${corte.totalNeto.toFixed(2)}
                </div>
                <button class="btn-icon delete" onclick="eliminarCorte('${corte.id}')" title="Eliminar corte">🗑️</button>
            </div>
        `;
        container.appendChild(item);
    });
}

/**
 * Elimina un corte del historial
 * Requiere contraseña de administrador
 * @param {string} corteId - ID del corte a eliminar
 */
function eliminarCorte(corteId) {
    const password = prompt('🔒 Ingresa la contraseña de administrador para eliminar este corte:');
    
    if (password !== ADMIN_PASSWORD) {
        alert('❌ Contraseña incorrecta');
        return;
    }
    
    if (!confirm('¿Estás seguro de eliminar este corte?\n\nEsta acción NO se puede deshacer.')) {
        return;
    }
    
    cortesHistorial = cortesHistorial.filter(c => c.id !== corteId);
    guardarDatos('cortesHistorial', cortesHistorial);
    renderizarHistorialCortes();
    
    mostrarToast('Corte Eliminado', 'El corte ha sido eliminado del historial', 'warning');
}

document.getElementById('btnCorte').addEventListener('click', () => {
    const now = new Date();
    const hora = now.getHours();
    const minutos = now.getMinutes();
    
    // Verificar horario permitido (7:00 PM a 11:45 PM)
    const horarioValido = (hora === 19) || (hora >= 20 && hora < 23) || (hora === 23 && minutos <= 45);
    
    if (!horarioValido) {
        alert('El corte diario solo se puede realizar entre las 7:00 PM y las 11:45 PM');
        return;
    }
    
    mostrarModalCorte();
});

function mostrarModalCorte() {
    const modal = document.getElementById('modalCorte');
    const contenido = document.getElementById('corteContenido');
    
    // Calcular totales
    const totalEquipos = sesionesEquipos
        .filter(s => !s.activa)
        .reduce((sum, s) => sum + (s.total || 0), 0);
    
    const totalTramites = ventasTramites
        .reduce((sum, v) => sum + v.total, 0);
    
    const totalImpresiones = ventasImpresiones
        .reduce((sum, v) => sum + v.total, 0);
    
    const totalPapeleria = ventasPapeleria
        .reduce((sum, v) => sum + v.total, 0);
    
    const totalGastos = gastos
        .reduce((sum, g) => sum + g.monto, 0);
    
    const totalGenerado = totalEquipos + totalTramites + totalImpresiones + totalPapeleria;
    const totalNeto = totalGenerado - totalGastos;
    
    contenido.innerHTML = `
        <div style="background: var(--bg-tertiary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem;">
            <h3>Resumen del Día</h3>
            <div style="margin-top: 1rem;">
                <p>Equipos: <strong>$${totalEquipos.toFixed(2)}</strong></p>
                <p>Trámites: <strong>$${totalTramites.toFixed(2)}</strong></p>
                <p>Impresiones/Escaneos: <strong>$${totalImpresiones.toFixed(2)}</strong></p>
                <p>Papelería: <strong>$${totalPapeleria.toFixed(2)}</strong></p>
                <hr style="margin: 1rem 0; border-color: var(--border);">
                <p>Total Generado: <strong style="color: var(--success);">$${totalGenerado.toFixed(2)}</strong></p>
                <p>Total Gastos: <strong style="color: var(--danger);">$${totalGastos.toFixed(2)}</strong></p>
                <p style="font-size: 1.3rem;">Total Neto: <strong style="color: var(--accent-primary);">$${totalNeto.toFixed(2)}</strong></p>
            </div>
        </div>
        <div style="background: var(--bg-tertiary); padding: 1.5rem; border-radius: 8px;">
            <h4>Gastos del Día</h4>
            ${gastos.map(g => `
                <div style="display: flex; justify-content: space-between; margin: 0.5rem 0;">
                    <span>${g.concepto} (${g.categoria})</span>
                    <strong>$${g.monto.toFixed(2)}</strong>
                </div>
            `).join('')}
        </div>
    `;
    
    modal.classList.add('active');
    document.getElementById('btnExportarPDF').style.display = 'inline-block';
}

/**
 * Genera el corte diario con validación de monto real
 * Solicita al usuario el monto real en efectivo para comparar con el calculado
 * Requiere contraseña específica para generar corte
 */
function generarCorte() {
    // Solicitar contraseña para generar corte
    const password = prompt('🔒 Ingresa la contraseña para generar el corte:');
    
    if (password !== CORTE_PASSWORD) {
        alert('❌ Contraseña incorrecta. No se puede generar el corte.');
        return;
    }
    
    // Calcular totales del sistema
    const totalEquipos = sesionesEquipos
        .filter(s => !s.activa)
        .reduce((sum, s) => sum + (s.total || 0), 0);
    
    const totalTramites = ventasTramites
        .reduce((sum, v) => sum + v.total, 0);
    
    const totalImpresiones = ventasImpresiones
        .reduce((sum, v) => sum + v.total, 0);
    
    const totalPapeleria = ventasPapeleria
        .reduce((sum, v) => sum + v.total, 0);
    
    const totalGastos = gastos
        .reduce((sum, g) => sum + g.monto, 0);
    
    const totalGenerado = totalEquipos + totalTramites + totalImpresiones + totalPapeleria;
    const totalNeto = totalGenerado - totalGastos;
    
    // Solicitar monto real en efectivo
    const montoRealStr = prompt(
        `💰 VERIFICACIÓN DE CORTE\n\n` +
        `Total calculado por el sistema: $${totalGenerado.toFixed(2)}\n` +
        `Total de gastos: $${totalGastos.toFixed(2)}\n` +
        `Total neto esperado: $${totalNeto.toFixed(2)}\n\n` +
        `Por favor, ingresa el MONTO REAL en efectivo que tienes:`
    );
    
    // Si cancela, no hacer nada
    if (montoRealStr === null) {
        return;
    }
    
    const montoReal = parseFloat(montoRealStr) || 0;
    const diferencia = montoReal - totalGenerado;
    const diferenciaAbsoluta = Math.abs(diferencia);
    
    // Mostrar diferencia si existe
    let mensajeDiferencia = '';
    if (diferenciaAbsoluta > 0.01) {
        const tipo = diferencia > 0 ? 'SOBRANTE' : 'FALTANTE';
        mensajeDiferencia = `\n\n⚠️ ${tipo}: $${diferenciaAbsoluta.toFixed(2)}`;
        
        if (!confirm(
            `Se detectó una diferencia:\n\n` +
            `Sistema: $${totalGenerado.toFixed(2)}\n` +
            `Real: $${montoReal.toFixed(2)}\n` +
            `${tipo}: $${diferenciaAbsoluta.toFixed(2)}\n\n` +
            `¿Deseas continuar con el corte?`
        )) {
            return;
        }
    }
    
    // Confirmación final
    if (!confirm('¿Está seguro de generar el corte diario? Esta acción eliminará todos los datos temporales.')) {
        return;
    }
    
    // Guardar corte en historial
    const corte = {
        id: Date.now().toString(),
        fecha: new Date().toLocaleDateString('es-MX'),
        totalGenerado: totalGenerado,
        totalGastos: totalGastos,
        totalNeto: totalNeto,
        montoReal: montoReal,
        diferencia: diferencia,
        gastos: [...gastos]
    };
    
    cortesHistorial.push(corte);
    guardarDatos('cortesHistorial', cortesHistorial);
    
    // Limpiar datos temporales
    limpiarDatosDiarios();
    
    alert(`✅ Corte generado exitosamente\n\nTotal sistema: $${totalGenerado.toFixed(2)}\nTotal real: $${montoReal.toFixed(2)}${mensajeDiferencia}`);
    cerrarModal('modalCorte');
    renderizarHistorialCortes();
}

/**
 * Genera el corte automático a las 10 PM sin intervención del usuario
 * Usa el total calculado por el sistema
 */
function generarCorteAutomatico() {
    // Calcular totales
    const totalEquipos = sesionesEquipos
        .filter(s => !s.activa)
        .reduce((sum, s) => sum + (s.total || 0), 0);
    
    const totalTramites = ventasTramites
        .reduce((sum, v) => sum + v.total, 0);
    
    const totalImpresiones = ventasImpresiones
        .reduce((sum, v) => sum + v.total, 0);
    
    const totalPapeleria = ventasPapeleria
        .reduce((sum, v) => sum + v.total, 0);
    
    const totalGastos = gastos
        .reduce((sum, g) => sum + g.monto, 0);
    
    const totalGenerado = totalEquipos + totalTramites + totalImpresiones + totalPapeleria;
    const totalNeto = totalGenerado - totalGastos;
    
    // Guardar corte automático
    const corte = {
        id: Date.now().toString(),
        fecha: new Date().toLocaleDateString('es-MX'),
        totalGenerado: totalGenerado,
        totalGastos: totalGastos,
        totalNeto: totalNeto,
        montoReal: null,
        diferencia: null,
        automatico: true,
        gastos: [...gastos]
    };
    
    cortesHistorial.push(corte);
    guardarDatos('cortesHistorial', cortesHistorial);
    
    // Limpiar datos temporales
    limpiarDatosDiarios();
    
    console.log('✅ Corte automático generado a las 12:00 AM');
}

function limpiarDatosDiarios() {
    ventasTramites = [];
    ventasImpresiones = [];
    ventasPapeleria = [];
    sesionesEquipos = [];
    gastos = [];
    
    guardarDatos('ventasTramites', ventasTramites);
    guardarDatos('ventasImpresiones', ventasImpresiones);
    guardarDatos('ventasPapeleria', ventasPapeleria);
    guardarDatos('sesionesEquipos', sesionesEquipos);
    guardarDatos('gastos', gastos);
    
    renderizarEquipos();
    renderizarVentasTramites();
    renderizarVentasImpresiones();
    renderizarVentasPapeleria();
    renderizarGastos();
    renderizarReportes();
}

function exportarPDF() {
    const now = new Date();
    const hora = now.getHours();
    const minutos = now.getMinutes();
    
    // Verificar horario permitido (7:00 PM a 11:45 PM)
    const horarioValido = (hora === 19) || (hora >= 20 && hora < 23) || (hora === 23 && minutos <= 45);
    
    if (!horarioValido) {
        alert('Los PDFs solo se pueden exportar entre las 7:00 PM y las 11:45 PM');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Corte Diario - Cyber Café', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 20, 30);
    
    // Resumen
    let y = 45;
    doc.setFontSize(14);
    doc.text('Resumen de Ventas', 20, y);
    
    y += 10;
    doc.setFontSize(11);
    
    const totalEquipos = sesionesEquipos
        .filter(s => !s.activa)
        .reduce((sum, s) => sum + (s.total || 0), 0);
    
    const totalTramites = ventasTramites
        .reduce((sum, v) => sum + v.total, 0);
    
    const totalImpresiones = ventasImpresiones
        .reduce((sum, v) => sum + v.total, 0);
    
    const totalPapeleria = ventasPapeleria
        .reduce((sum, v) => sum + v.total, 0);
    
    const totalGastos = gastos
        .reduce((sum, g) => sum + g.monto, 0);
    
    const totalGenerado = totalEquipos + totalTramites + totalImpresiones + totalPapeleria;
    const totalNeto = totalGenerado - totalGastos;
    
    doc.text(`Equipos: $${totalEquipos.toFixed(2)}`, 20, y);
    y += 7;
    doc.text(`Trámites: $${totalTramites.toFixed(2)}`, 20, y);
    y += 7;
    doc.text(`Impresiones/Escaneos: $${totalImpresiones.toFixed(2)}`, 20, y);
    y += 7;
    doc.text(`Papelería: $${totalPapeleria.toFixed(2)}`, 20, y);
    y += 10;
    doc.text(`Total Generado: $${totalGenerado.toFixed(2)}`, 20, y);
    y += 7;
    doc.text(`Total Gastos: $${totalGastos.toFixed(2)}`, 20, y);
    y += 10;
    doc.setFontSize(14);
    doc.text(`Total Neto: $${totalNeto.toFixed(2)}`, 20, y);
    
    // Gastos
    y += 15;
    doc.setFontSize(14);
    doc.text('Gastos del Día', 20, y);
    y += 10;
    doc.setFontSize(11);
    
    gastos.forEach(gasto => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        doc.text(`${gasto.concepto} (${gasto.categoria}): $${gasto.monto.toFixed(2)}`, 20, y);
        y += 7;
    });
    
    // Guardar PDF
    doc.save(`corte_${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}.pdf`);
}

// ============================================
// SEGURIDAD ADMINISTRACIÓN
// ============================================

function verificarAccesoAdmin(event) {
    event.preventDefault();
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        adminAutenticado = true;
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        
        // Renderizar datos de admin
        renderizarAdminEquipos();
        renderizarAdminTramites();
        renderizarAdminPromociones();
        renderizarAdminPapeleria();
        cargarMetas();
        
        // Limpiar password
        document.getElementById('adminPassword').value = '';
    } else {
        alert('Contraseña incorrecta');
        document.getElementById('adminPassword').value = '';
    }
}

function cerrarSesionAdmin() {
    adminAutenticado = false;
    document.getElementById('adminLogin').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
}

// ============================================
// BÚSQUEDAS
// ============================================

function inicializarBusquedas() {
    const searchTramites = document.getElementById('searchTramites');
    if (searchTramites) {
        searchTramites.addEventListener('input', (e) => {
            renderizarTramites(e.target.value);
        });
    }
    
    const searchPapeleria = document.getElementById('searchPapeleria');
    if (searchPapeleria) {
        searchPapeleria.addEventListener('input', (e) => {
            renderizarPapeleria(e.target.value);
        });
    }
}

// ============================================
// ADMINISTRACIÓN - EQUIPOS
// ============================================

function renderizarAdminEquipos() {
    if (!adminAutenticado) return;
    
    const tbody = document.getElementById('adminEquiposList');
    tbody.innerHTML = '';
    
    equipos.forEach(equipo => {
        const sesion = sesionesEquipos.find(s => s.equipoId === equipo.id && s.activa);
        const estado = sesion ? 'Ocupado' : 'Libre';
        const estadoClass = sesion ? 'danger' : 'success';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${equipo.nombre}</strong></td>
            <td>${equipo.caracteristicas || '-'}</td>
            <td><span class="badge ${estadoClass}">${estado}</span></td>
            <td class="table-actions">
                <button class="btn-icon edit" onclick="editarEquipo('${equipo.id}')" title="Editar">✏️</button>
                <button class="btn-icon delete" onclick="eliminarEquipo('${equipo.id}')" title="Eliminar">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    if (equipos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">No hay equipos registrados</td></tr>';
    }
}

function mostrarModalEquipo(equipoId = null) {
    const modal = document.getElementById('modalAdminEquipo');
    const title = document.getElementById('modalAdminEquipoTitle');
    
    if (equipoId) {
        const equipo = equipos.find(e => e.id === equipoId);
        title.textContent = 'Editar Equipo';
        document.getElementById('equipoId').value = equipo.id;
        document.getElementById('equipoNombre').value = equipo.nombre;
        document.getElementById('equipoCaracteristicas').value = equipo.caracteristicas || '';
    } else {
        title.textContent = 'Agregar Equipo';
        document.getElementById('formEquipo').reset();
    }
    
    modal.classList.add('active');
}

function editarEquipo(equipoId) {
    mostrarModalEquipo(equipoId);
}

function guardarEquipo(event) {
    event.preventDefault();
    
    const equipoId = document.getElementById('equipoId').value;
    const nombre = document.getElementById('equipoNombre').value;
    const caracteristicas = document.getElementById('equipoCaracteristicas').value;
    
    if (equipoId) {
        // Editar
        const equipo = equipos.find(e => e.id === equipoId);
        equipo.nombre = nombre;
        equipo.caracteristicas = caracteristicas;
    } else {
        // Nuevo
        const equipo = {
            id: Date.now().toString(),
            nombre: nombre,
            caracteristicas: caracteristicas
        };
        equipos.push(equipo);
    }
    
    guardarDatos('equipos', equipos);
    renderizarEquipos();
    renderizarAdminEquipos();
    cerrarModal('modalAdminEquipo');
    
    document.getElementById('formEquipo').reset();
}

function eliminarEquipo(equipoId) {
    if (!confirm('¿Está seguro de eliminar este equipo?')) return;
    
    equipos = equipos.filter(e => e.id !== equipoId);
    guardarDatos('equipos', equipos);
    renderizarEquipos();
    renderizarAdminEquipos();
}

// ============================================
// ADMINISTRACIÓN - TRÁMITES
// ============================================

function renderizarAdminTramites() {
    if (!adminAutenticado) return;
    
    const tbody = document.getElementById('adminTramitesList');
    tbody.innerHTML = '';
    
    tramites.forEach(tramite => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${tramite.nombre}</strong></td>
            <td><span class="badge success">$${tramite.costo.toFixed(2)}</span></td>
            <td>$${(tramite.gasto || 0).toFixed(2)}</td>
            <td>${tramite.link ? `<a href="${tramite.link}" target="_blank" style="color: var(--accent-primary);">Ver</a>` : '-'}</td>
            <td class="table-actions">
                <button class="btn-icon edit" onclick="editarTramite('${tramite.id}')" title="Editar">✏️</button>
                <button class="btn-icon delete" onclick="eliminarTramite('${tramite.id}')" title="Eliminar">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    if (tramites.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">No hay trámites registrados</td></tr>';
    }
}

function mostrarModalTramite(tramiteId = null) {
    const modal = document.getElementById('modalTramite');
    const title = document.getElementById('modalTramiteTitle');
    
    if (tramiteId) {
        const tramite = tramites.find(t => t.id === tramiteId);
        title.textContent = 'Editar Trámite';
        document.getElementById('tramiteId').value = tramite.id;
        document.getElementById('tramiteNombre').value = tramite.nombre;
        document.getElementById('tramiteCosto').value = tramite.costo;
        document.getElementById('tramiteGasto').value = tramite.gasto || '';
        document.getElementById('tramiteLink').value = tramite.link || '';
    } else {
        title.textContent = 'Agregar Trámite';
        document.getElementById('formTramite').reset();
    }
    
    modal.classList.add('active');
}

function editarTramite(tramiteId) {
    mostrarModalTramite(tramiteId);
}

function guardarTramite(event) {
    event.preventDefault();
    
    const tramiteId = document.getElementById('tramiteId').value;
    const nombre = document.getElementById('tramiteNombre').value;
    const costo = parseFloat(document.getElementById('tramiteCosto').value);
    const gasto = parseFloat(document.getElementById('tramiteGasto').value) || 0;
    const link = document.getElementById('tramiteLink').value;
    
    if (tramiteId) {
        // Editar
        const tramite = tramites.find(t => t.id === tramiteId);
        tramite.nombre = nombre;
        tramite.costo = costo;
        tramite.gasto = gasto;
        tramite.link = link;
    } else {
        // Nuevo
        const tramite = {
            id: Date.now().toString(),
            nombre: nombre,
            costo: costo,
            gasto: gasto,
            link: link
        };
        tramites.push(tramite);
    }
    
    guardarDatos('tramites', tramites);
    renderizarTramites();
    renderizarAdminTramites();
    cerrarModal('modalTramite');
    
    document.getElementById('formTramite').reset();
}

function eliminarTramite(tramiteId) {
    if (!confirm('¿Está seguro de eliminar este trámite?')) return;
    
    tramites = tramites.filter(t => t.id !== tramiteId);
    guardarDatos('tramites', tramites);
    renderizarTramites();
    renderizarAdminTramites();
}

// ============================================
// ADMINISTRACIÓN - PROMOCIONES
// ============================================

function renderizarAdminPromociones() {
    if (!adminAutenticado) return;
    
    const tbody = document.getElementById('adminPromocionesList');
    tbody.innerHTML = '';
    
    promociones.forEach(promo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="badge ${promo.tipo === 'impresion' ? 'info' : 'warning'}">${promo.tipo === 'impresion' ? 'Impresión' : 'Escaneo'}</span></td>
            <td>${promo.cantidad}+ hojas</td>
            <td><strong>$${promo.precio.toFixed(2)}</strong></td>
            <td class="table-actions">
                <button class="btn-icon edit" onclick="editarPromocion('${promo.id}')" title="Editar">✏️</button>
                <button class="btn-icon delete" onclick="eliminarPromocion('${promo.id}')" title="Eliminar">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    if (promociones.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">No hay promociones registradas</td></tr>';
    }
}

function mostrarModalPromocion(promocionId = null) {
    const modal = document.getElementById('modalPromocion');
    const title = document.getElementById('modalPromocionTitle');
    
    if (promocionId) {
        const promo = promociones.find(p => p.id === promocionId);
        title.textContent = 'Editar Promoción';
        document.getElementById('promocionId').value = promo.id;
        document.getElementById('promocionTipo').value = promo.tipo;
        document.getElementById('promocionCantidad').value = promo.cantidad;
        document.getElementById('promocionPrecio').value = promo.precio;
    } else {
        title.textContent = 'Agregar Promoción';
        document.getElementById('formPromocion').reset();
    }
    
    modal.classList.add('active');
}

function editarPromocion(promocionId) {
    mostrarModalPromocion(promocionId);
}

function guardarPromocion(event) {
    event.preventDefault();
    
    const promocionId = document.getElementById('promocionId').value;
    const tipo = document.getElementById('promocionTipo').value;
    const cantidad = parseInt(document.getElementById('promocionCantidad').value);
    const precio = parseFloat(document.getElementById('promocionPrecio').value);
    
    if (promocionId) {
        // Editar
        const promo = promociones.find(p => p.id === promocionId);
        promo.tipo = tipo;
        promo.cantidad = cantidad;
        promo.precio = precio;
    } else {
        // Nuevo
        const promo = {
            id: Date.now().toString(),
            tipo: tipo,
            cantidad: cantidad,
            precio: precio
        };
        promociones.push(promo);
    }
    
    guardarDatos('promociones', promociones);
    renderizarPromociones();
    renderizarAdminPromociones();
    cerrarModal('modalPromocion');
    
    document.getElementById('formPromocion').reset();
}

function eliminarPromocion(promocionId) {
    if (!confirm('¿Está seguro de eliminar esta promoción?')) return;
    
    promociones = promociones.filter(p => p.id !== promocionId);
    guardarDatos('promociones', promociones);
    renderizarPromociones();
    renderizarAdminPromociones();
}

// ============================================
// ADMINISTRACIÓN - PAPELERÍA
// ============================================

function renderizarAdminPapeleria() {
    if (!adminAutenticado) return;
    
    const tbody = document.getElementById('adminPapeleriaList');
    tbody.innerHTML = '';
    
    productos.forEach(producto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${producto.nombre}</strong></td>
            <td><span class="badge success">$${producto.precio.toFixed(2)}</span></td>
            <td>$${producto.costo.toFixed(2)}</td>
            <td>${producto.cantidad}</td>
            <td class="table-actions">
                <button class="btn-icon edit" onclick="editarProducto('${producto.id}')" title="Editar">✏️</button>
                <button class="btn-icon delete" onclick="eliminarProducto('${producto.id}')" title="Eliminar">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">No hay productos registrados</td></tr>';
    }
}

function mostrarModalProducto(productoId = null) {
    const modal = document.getElementById('modalProducto');
    const title = document.getElementById('modalProductoTitle');
    
    if (productoId) {
        const producto = productos.find(p => p.id === productoId);
        title.textContent = 'Editar Producto';
        document.getElementById('productoId').value = producto.id;
        document.getElementById('productoNombre').value = producto.nombre;
        document.getElementById('productoPrecio').value = producto.precio;
        document.getElementById('productoCosto').value = producto.costo;
        document.getElementById('productoCantidad').value = producto.cantidad;
    } else {
        title.textContent = 'Agregar Producto';
        document.getElementById('formProducto').reset();
    }
    
    modal.classList.add('active');
}

function editarProducto(productoId) {
    mostrarModalProducto(productoId);
}

function guardarProducto(event) {
    event.preventDefault();
    
    const productoId = document.getElementById('productoId').value;
    const nombre = document.getElementById('productoNombre').value;
    const precio = parseFloat(document.getElementById('productoPrecio').value);
    const costo = parseFloat(document.getElementById('productoCosto').value);
    const cantidad = parseInt(document.getElementById('productoCantidad').value);
    
    if (productoId) {
        // Editar
        const producto = productos.find(p => p.id === productoId);
        producto.nombre = nombre;
        producto.precio = precio;
        producto.costo = costo;
        producto.cantidad = cantidad;
    } else {
        // Nuevo
        const producto = {
            id: Date.now().toString(),
            nombre: nombre,
            precio: precio,
            costo: costo,
            cantidad: cantidad
        };
        productos.push(producto);
    }
    
    guardarDatos('productos', productos);
    renderizarPapeleria();
    renderizarAdminPapeleria();
    cerrarModal('modalProducto');
    
    document.getElementById('formProducto').reset();
}

function eliminarProducto(productoId) {
    if (!confirm('¿Está seguro de eliminar este producto?')) return;
    
    productos = productos.filter(p => p.id !== productoId);
    guardarDatos('productos', productos);
    renderizarPapeleria();
    renderizarAdminPapeleria();
}

// ============================================
// UTILIDADES - MODALES
// ============================================

function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Cerrar modal al hacer click fuera
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Event listeners para cálculos en tiempo real
document.getElementById('ventaTramiteSelect')?.addEventListener('change', calcularTotalTramite);
document.getElementById('ventaTramiteCantidad')?.addEventListener('input', calcularTotalTramite);
document.getElementById('tramitePersonalizadoPrecio')?.addEventListener('input', calcularTotalTramite);
document.getElementById('tramitePersonalizadoCosto')?.addEventListener('input', calcularTotalTramite);
document.getElementById('ventaImpresionTipo')?.addEventListener('change', calcularTotalImpresion);
document.getElementById('ventaImpresionCantidad')?.addEventListener('input', calcularTotalImpresion);
document.getElementById('ventaPapeleriaSelect')?.addEventListener('change', actualizarStockDisponible);
document.getElementById('ventaPapeleriaCantidad')?.addEventListener('input', calcularTotalPapeleria);

// Event listeners para servicio extra
document.getElementById('servicioTramiteSelect')?.addEventListener('change', calcularTotalServicio);
document.getElementById('servicioCantidad')?.addEventListener('input', calcularTotalServicio);
document.getElementById('servicioTramitePersonalizadoPrecio')?.addEventListener('input', calcularTotalServicio);
document.getElementById('servicioTramitePersonalizadoCosto')?.addEventListener('input', calcularTotalServicio);

// ============================================
// DASHBOARD
// ============================================

function actualizarDashboard() {
    // Calcular totales
    const totalEquipos = sesionesEquipos
        .filter(s => !s.activa)
        .reduce((sum, s) => sum + (s.total || 0), 0);
    
    const totalTramites = ventasTramites
        .reduce((sum, v) => sum + v.total, 0);
    
    const totalImpresiones = ventasImpresiones
        .reduce((sum, v) => sum + v.total, 0);
    
    const totalPapeleria = ventasPapeleria
        .reduce((sum, v) => sum + v.total, 0);
    
    const totalGastos = gastos
        .reduce((sum, g) => sum + g.monto, 0);
    
    const totalDia = totalEquipos + totalTramites + totalImpresiones + totalPapeleria;
    
    // Actualizar sidebar
    actualizarSidebarTotal(totalDia, totalEquipos, totalTramites, totalImpresiones, totalPapeleria, totalGastos);
    
    // Actualizar estadísticas
    document.getElementById('dashTotalDia').textContent = totalDia.toFixed(2);
    
    const equiposActivos = sesionesEquipos.filter(s => s.activa).length;
    document.getElementById('dashEquiposActivos').textContent = equiposActivos;
    document.getElementById('dashTotalEquipos').textContent = equipos.length;
    
    const totalVentas = ventasTramites.length + ventasImpresiones.length + ventasPapeleria.length;
    document.getElementById('dashVentasHoy').textContent = totalVentas;
    
    const stockBajo = productos.filter(p => p.cantidad < 5 && p.cantidad > 0).length;
    document.getElementById('dashStockBajo').textContent = stockBajo;
    
    // Actualizar gráfico
    const maxTotal = Math.max(totalEquipos, totalTramites, totalImpresiones, totalPapeleria, 1);
    
    document.getElementById('chartEquipos').style.width = `${(totalEquipos / maxTotal) * 100}%`;
    document.getElementById('chartEquiposVal').textContent = totalEquipos.toFixed(2);
    
    document.getElementById('chartTramites').style.width = `${(totalTramites / maxTotal) * 100}%`;
    document.getElementById('chartTramitesVal').textContent = totalTramites.toFixed(2);
    
    document.getElementById('chartImpresiones').style.width = `${(totalImpresiones / maxTotal) * 100}%`;
    document.getElementById('chartImpresionesVal').textContent = totalImpresiones.toFixed(2);
    
    document.getElementById('chartPapeleria').style.width = `${(totalPapeleria / maxTotal) * 100}%`;
    document.getElementById('chartPapeleriaVal').textContent = totalPapeleria.toFixed(2);
    
    // Actualizar actividad reciente
    renderizarActividadReciente();
    
    // Actualizar equipos en uso
    renderizarEquiposEnUso();
}

function renderizarActividadReciente() {
    const container = document.getElementById('actividadReciente');
    container.innerHTML = '';
    
    const actividades = [];
    
    // Agregar ventas de trámites
    ventasTramites.slice(-5).reverse().forEach(venta => {
        const tramite = tramites.find(t => t.id === venta.tramiteId);
        if (tramite) {
            actividades.push({
                icon: '📋',
                titulo: tramite.nombre,
                detalle: `${venta.cantidad} x $${tramite.costo.toFixed(2)}`,
                tiempo: obtenerTiempoRelativo(venta.fecha),
                fecha: new Date(venta.fecha)
            });
        }
    });
    
    // Agregar ventas de impresiones
    ventasImpresiones.slice(-5).reverse().forEach(venta => {
        actividades.push({
            icon: venta.tipo === 'impresion' ? '🖨️' : '📄',
            titulo: venta.tipo === 'impresion' ? 'Impresión' : 'Escaneo',
            detalle: `${venta.cantidad} hojas - $${venta.total.toFixed(2)}`,
            tiempo: obtenerTiempoRelativo(venta.fecha),
            fecha: new Date(venta.fecha)
        });
    });
    
    // Agregar ventas de papelería
    ventasPapeleria.slice(-5).reverse().forEach(venta => {
        const producto = productos.find(p => p.id === venta.productoId);
        if (producto) {
            actividades.push({
                icon: '📦',
                titulo: producto.nombre,
                detalle: `${venta.cantidad} unidades - $${venta.total.toFixed(2)}`,
                tiempo: obtenerTiempoRelativo(venta.fecha),
                fecha: new Date(venta.fecha)
            });
        }
    });
    
    // Ordenar por fecha y tomar las últimas 10
    actividades.sort((a, b) => b.fecha - a.fecha);
    actividades.slice(0, 10).forEach(act => {
        const item = document.createElement('div');
        item.className = 'actividad-item';
        item.innerHTML = `
            <div class="actividad-icon">${act.icon}</div>
            <div class="actividad-content">
                <div class="actividad-titulo">${act.titulo}</div>
                <div class="actividad-detalle">${act.detalle}</div>
            </div>
            <div class="actividad-tiempo">${act.tiempo}</div>
        `;
        container.appendChild(item);
    });
    
    if (actividades.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 2rem;">No hay actividad reciente</p>';
    }
}

function renderizarEquiposEnUso() {
    const container = document.getElementById('equiposEnUso');
    container.innerHTML = '';
    
    const sesionesActivas = sesionesEquipos.filter(s => s.activa);
    
    sesionesActivas.forEach(sesion => {
        const equipo = equipos.find(e => e.id === sesion.equipoId);
        if (equipo) {
            const tiempo = calcularTiempoTranscurrido(sesion.inicio);
            const item = document.createElement('div');
            item.className = 'equipo-activo-item';
            item.innerHTML = `
                <div class="equipo-activo-nombre">${equipo.nombre}</div>
                <div class="equipo-activo-tiempo">${tiempo}</div>
            `;
            container.appendChild(item);
        }
    });
    
    if (sesionesActivas.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 2rem;">No hay equipos en uso</p>';
    }
}

function obtenerTiempoRelativo(fecha) {
    const ahora = new Date();
    const entonces = new Date(fecha);
    const diff = ahora - entonces;
    
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);
    
    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos}m`;
    if (horas < 24) return `Hace ${horas}h`;
    return `Hace ${dias}d`;
}

function actualizarSidebarTotal(total, equipos, tramites, impresiones, papeleria, gastos) {
    document.getElementById('sidebarTotal').textContent = `$${total.toFixed(2)}`;
    
    // Actualizar meta y progreso
    const metaActual = obtenerMetaActual();
    document.getElementById('sidebarMeta').textContent = metaActual.toFixed(2);
    
    const porcentaje = metaActual > 0 ? (total / metaActual) * 100 : 0;
    document.getElementById('sidebarPorcentaje').textContent = `${Math.min(porcentaje, 100).toFixed(0)}%`;
    document.getElementById('sidebarProgress').style.width = `${Math.min(porcentaje, 100)}%`;
    
    // Cambiar color según progreso
    const progressBar = document.getElementById('sidebarProgress');
    if (porcentaje >= 100) {
        progressBar.style.background = 'linear-gradient(90deg, var(--success), #059669)';
    } else if (porcentaje >= 75) {
        progressBar.style.background = 'linear-gradient(90deg, var(--accent-primary), var(--success))';
    } else if (porcentaje >= 50) {
        progressBar.style.background = 'linear-gradient(90deg, var(--warning), var(--accent-primary))';
    } else {
        progressBar.style.background = 'linear-gradient(90deg, var(--danger), var(--warning))';
    }
}

function cambiarSeccion(seccionId) {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');
    
    navItems.forEach(nav => {
        if (nav.dataset.section === seccionId) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    });
    
    sections.forEach(sec => {
        if (sec.id === seccionId) {
            sec.classList.add('active');
        } else {
            sec.classList.remove('active');
        }
    });
}

// ============================================
// NOTIFICACIONES TOAST
// ============================================

function mostrarToast(titulo, mensaje, tipo = 'success') {
    const container = document.getElementById('toastContainer');
    
    const iconos = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `
        <div class="toast-icon">${iconos[tipo]}</div>
        <div class="toast-content">
            <div class="toast-title">${titulo}</div>
            <div class="toast-message">${mensaje}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(toast);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// ============================================
// MEJORAS EN FUNCIONES EXISTENTES
// ============================================

// Sobrescribir funciones para agregar notificaciones

const registrarVentaImpresionOriginal = registrarVentaImpresion;
window.registrarVentaImpresion = function(event) {
    registrarVentaImpresionOriginal(event);
    const tipo = document.getElementById('ventaImpresionTipo').value;
    mostrarToast('Venta Registrada', `${tipo === 'impresion' ? 'Impresión' : 'Escaneo'} registrado`, 'success');
};

const registrarVentaPapeleriaOriginal = registrarVentaPapeleria;
window.registrarVentaPapeleria = function(event) {
    registrarVentaPapeleriaOriginal(event);
    mostrarToast('Venta Registrada', 'Producto vendido exitosamente', 'success');
};

// ============================================
// ACCESO A REPORTES
// ============================================

function verificarAccesoReportes(event) {
    event.preventDefault();
    const password = document.getElementById('reportesPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        reportesAutenticado = true;
        document.getElementById('reportesLogin').style.display = 'none';
        document.getElementById('reportesPanel').style.display = 'block';
        
        // Renderizar gráficas
        renderizarGraficas();
        
        // Limpiar password
        document.getElementById('reportesPassword').value = '';
    } else {
        mostrarToast('Error', 'Contraseña incorrecta', 'error');
        document.getElementById('reportesPassword').value = '';
    }
}

function cerrarSesionReportes() {
    reportesAutenticado = false;
    document.getElementById('reportesLogin').style.display = 'flex';
    document.getElementById('reportesPanel').style.display = 'none';
}

// ============================================
// METAS DIARIAS
// ============================================

function guardarMeta(mes) {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const inputId = `meta${meses[mes - 1]}`;
    const valor = parseFloat(document.getElementById(inputId).value) || 0;
    
    metasDiarias[mes] = valor;
    guardarDatos('metasDiarias', metasDiarias);
    
    mostrarToast('Meta Guardada', `Meta de ${meses[mes - 1]}: $${valor.toFixed(2)}`, 'success');
    
    // Actualizar dashboard
    actualizarDashboard();
}

function cargarMetas() {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    meses.forEach((mes, index) => {
        const inputId = `meta${mes}`;
        const input = document.getElementById(inputId);
        if (input) {
            input.value = metasDiarias[index + 1] || '';
        }
    });
}

function obtenerMetaActual() {
    const mesActual = new Date().getMonth() + 1;
    return metasDiarias[mesActual] || 0;
}

// ============================================
// GRÁFICAS
// ============================================

function renderizarGraficas() {
    if (!reportesAutenticado) return;
    
    // Gráfica de últimos 7 días
    renderizarGrafica7Dias();
    
    // Gráfica vs Meta
    renderizarGraficaVsMeta();
}

/**
 * Renderiza gráfica de últimos 7 días
 * Corregido: Parsea correctamente las fechas en formato DD/MM/YYYY
 */
function renderizarGrafica7Dias() {
    const ctx = document.getElementById('chartUltimos7Dias');
    if (!ctx) return;
    
    // Obtener últimos 7 cortes
    const ultimos7 = cortesHistorial.slice(-7);
    
    // Parsear fechas correctamente (formato: DD/MM/YYYY)
    const labels = ultimos7.map(c => {
        const partes = c.fecha.split('/');
        if (partes.length === 3) {
            const fecha = new Date(partes[2], partes[1] - 1, partes[0]);
            return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
        }
        return c.fecha;
    });
    const datos = ultimos7.map(c => c.totalGenerado || 0);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length > 0 ? labels : ['Sin datos'],
            datasets: [{
                label: 'Total Generado',
                data: datos.length > 0 ? datos : [0],
                borderColor: '#4a9eff',
                backgroundColor: 'rgba(74, 158, 255, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Gráficas de Distribución y Tendencia eliminadas por solicitud del usuario

function renderizarGraficaVsMeta() {
    const ctx = document.getElementById('chartVsMeta');
    if (!ctx) return;
    
    const totalDia = sesionesEquipos.filter(s => !s.activa).reduce((sum, s) => sum + (s.total || 0), 0) +
                     ventasTramites.reduce((sum, v) => sum + v.total, 0) +
                     ventasImpresiones.reduce((sum, v) => sum + v.total, 0) +
                     ventasPapeleria.reduce((sum, v) => sum + v.total, 0);
    
    const metaActual = obtenerMetaActual();
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Actual', 'Meta'],
            datasets: [{
                label: 'Comparación',
                data: [totalDia, metaActual],
                backgroundColor: ['#4a9eff', '#10b981']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// ============================================
// SISTEMA DE BLOQUEO
// ============================================

/**
 * Bloquea el sistema mostrando la pantalla de bloqueo
 * Requiere contraseña admin123 para desbloquear
 */
function bloquearSistema() {
    const lockScreen = document.getElementById('lockScreen');
    lockScreen.classList.add('active');
    sistemaBloqueado = true;
    
    // Guardar estado de bloqueo
    localStorage.setItem('sistemaBloqueado', 'true');
    
    // Limpiar campo de contraseña
    document.getElementById('unlockPassword').value = '';
    document.getElementById('lockError').textContent = '';
    
    // Enfocar el campo de contraseña
    setTimeout(() => {
        document.getElementById('unlockPassword').focus();
    }, 300);
    
    // Actualizar reloj en pantalla de bloqueo
    actualizarRelojBloqueo();
    const intervalBloqueo = setInterval(() => {
        if (lockScreen.classList.contains('active')) {
            actualizarRelojBloqueo();
        } else {
            clearInterval(intervalBloqueo);
        }
    }, 1000);
}

/**
 * Desbloquea el sistema si la contraseña es correcta
 * @param {Event} event - Evento del formulario
 */
function desbloquearSistema(event) {
    event.preventDefault();
    
    const password = document.getElementById('unlockPassword').value;
    const lockError = document.getElementById('lockError');
    
    if (password === CORTE_PASSWORD) {
        // Contraseña correcta
        document.getElementById('lockScreen').classList.remove('active');
        document.getElementById('unlockPassword').value = '';
        lockError.textContent = '';
        sistemaBloqueado = false;
        
        // Eliminar estado de bloqueo
        localStorage.removeItem('sistemaBloqueado');
        
        mostrarToast('Sistema Desbloqueado', 'Bienvenido de vuelta', 'success');
    } else {
        // Contraseña incorrecta
        lockError.textContent = '❌ Contraseña incorrecta';
        document.getElementById('unlockPassword').value = '';
        document.getElementById('unlockPassword').focus();
        
        // Animación de error
        const lockContent = document.querySelector('.lock-content');
        lockContent.style.animation = 'shake 0.5s';
        setTimeout(() => {
            lockContent.style.animation = '';
        }, 500);
    }
}

/**
 * Actualiza el reloj en la pantalla de bloqueo
 */
function actualizarRelojBloqueo() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    const dateString = now.toLocaleDateString('es-MX', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const lockTime = document.getElementById('lockTime');
    if (lockTime) {
        lockTime.textContent = `${dateString} - ${timeString}`;
    }
}

// ============================================
// TEMA CLARO/OSCURO
// ============================================

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    if (temaActual === 'dark') {
        body.classList.add('light-mode');
        themeIcon.textContent = '☀️';
        temaActual = 'light';
    } else {
        body.classList.remove('light-mode');
        themeIcon.textContent = '🌙';
        temaActual = 'dark';
    }
    
    // Guardar preferencia
    localStorage.setItem('tema', temaActual);
}

function cargarTema() {
    const temaGuardado = localStorage.getItem('tema');
    if (temaGuardado === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('themeIcon').textContent = '☀️';
        temaActual = 'light';
    }
}

// ============================================
// LIMPIAR DATOS DEL DÍA
// ============================================

function mostrarModalLimpiarDia() {
    document.getElementById('passwordLimpiarDia').value = '';
    document.getElementById('confirmarLimpiar').checked = false;
    document.getElementById('modalLimpiarDia').classList.add('active');
}

function confirmarLimpiarDia(event) {
    event.preventDefault();
    
    const password = document.getElementById('passwordLimpiarDia').value;
    const confirmado = document.getElementById('confirmarLimpiar').checked;
    
    // Verificar contraseña de administrador
    if (password !== ADMIN_PASSWORD) {
        mostrarToast('Error', 'Contraseña incorrecta', 'error');
        return;
    }
    
    if (!confirmado) {
        mostrarToast('Error', 'Debes confirmar la acción', 'error');
        return;
    }
    
    // Confirmar una vez más
    if (!confirm('¿ESTÁS COMPLETAMENTE SEGURO? Esta acción eliminará TODOS los datos del día y NO se puede deshacer.')) {
        return;
    }
    
    // Limpiar todos los datos del día
    limpiarDatosDiarios();
    
    cerrarModal('modalLimpiarDia');
    mostrarToast('Datos Eliminados', 'Todos los datos del día han sido eliminados', 'warning');
    
    // Recargar la página para refrescar todo
    setTimeout(() => {
        location.reload();
    }, 1500);
}

// ============================================
// FUNCIONES DEL FOOTER
// ============================================

/**
 * Abre la página web del negocio en una nueva pestaña
 */
function abrirWebNegocio() {
    // Cambiar por la URL real del negocio
    const urlNegocio = 'https://stdtec.com.mx'; // Ejemplo - cambiar por la URL real
    window.open(urlNegocio, '_blank');
    mostrarToast('Abriendo Web', 'Redirigiendo al sitio web del negocio', 'info');
}

/**
 * Abre el sistema de folios en una nueva pestaña
 */
function abrirSistemaFolios() {
    // Cambiar por la URL real del sistema de folios
    const urlFolios = 'https://folios.stdtec.com.mx'; // Ejemplo - cambiar por la URL real
    window.open(urlFolios, '_blank');
    mostrarToast('Abriendo Folios', 'Redirigiendo al sistema de folios', 'info');
}

// ============================================
// PRECIOS BASE DEL SISTEMA
// ============================================
// Impresión B/N: $1 por hoja (con promociones disponibles)
// Escaneo: $4 por hoja (con promociones disponibles)
// Impresión Color Calidad 1: $3 por hoja (sin promociones)
// Impresión Color Calidad 2: $5 por hoja (sin promociones)
// Impresión Color Calidad 3: $7 por hoja (sin promociones)
