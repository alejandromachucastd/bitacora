// ============================================
// SCRIPT PARA CARGAR TRÁMITES MASIVAMENTE
// ============================================

/**
 * INSTRUCCIONES DE USO:
 * 1. Abre index.html en tu navegador
 * 2. Abre la consola del navegador (F12)
 * 3. Copia y pega todo este código en la consola
 * 4. Presiona Enter
 * 5. Los trámites se cargarán automáticamente
 */

// Array con todos los trámites
const tramitesParaCargar = [
    { nombre: "Recibo de CFE A Color", costo: 15, gasto: 0, link: "" },
    { nombre: "Recibo de CFE Blanco/Negro", costo: 10, gasto: 0, link: "" },
    { nombre: "CURP A Color", costo: 15, gasto: 0, link: "https://www.gob.mx/curp/" },
    { nombre: "CURP Blanco/Negro", costo: 10, gasto: 0, link: "https://www.gob.mx/curp/" },
    { nombre: "Número de Seguridad Social (NSS)", costo: 20, gasto: 0, link: "https://www.imss.gob.mx/tramites/imss02008" },
    { nombre: "Talones ISSSTE", costo: 15, gasto: 0, link: "" },
    { nombre: "Vigencia De Derechos Seguros", costo: 20, gasto: 0, link: "" },
    { nombre: "No Derechohabiencia IMSS e ISSSTE", costo: 15, gasto: 0, link: "" },
    { nombre: "Recibo de CEA A COLOR", costo: 15, gasto: 0, link: "" },
    { nombre: "Recibo de CEA Blanco/Negro", costo: 10, gasto: 0, link: "" },
    { nombre: "Semanas Cotizadas IMSS", costo: 35, gasto: 0, link: "" },
    { nombre: "Buro de Crédito", costo: 40, gasto: 0, link: "" },
    { nombre: "Pago de Tenencia", costo: 15, gasto: 0, link: "" },
    { nombre: "Cita Vehicular", costo: 20, gasto: 0, link: "" },
    { nombre: "Crear Correo", costo: 15, gasto: 0, link: "" },
    
    // Actas de nacimiento por estado
    { nombre: "Acta de nacimiento Aguascalientes", costo: 125, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Baja California", costo: 266, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Baja California Sur", costo: 244, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Campeche", costo: 95, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Chiapas", costo: 147, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Chihuahua", costo: 153, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Ciudad de México", costo: 120, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Coahuila", costo: 179, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Colima", costo: 128, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Durango", costo: 165, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Guanajuato", costo: 124, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Guerrero", costo: 135, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Hidalgo", costo: 171, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Jalisco", costo: 122, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento México", costo: 99, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Michoacán", costo: 187, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Morelos", costo: 139, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Nayarit", costo: 107, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Nuevo León", costo: 95, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Oaxaca", costo: 155, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Puebla", costo: 180, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Querétaro", costo: 176, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Quintana Roo", costo: 84, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento San Luis Potosí", costo: 152, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Sinaloa", costo: 150, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Sonora", costo: 134, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Tabasco", costo: 139, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Tamaulipas", costo: 140, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Tlaxcala", costo: 198, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Veracruz", costo: 220, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Yucatán", costo: 249, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    { nombre: "Acta de nacimiento Zacatecas", costo: 140, gasto: 30, link: "https://www.infobae.com/mexico/2025/02/26/acta-de-nacimiento-2025-este-es-el-costo-para-tramitarla-por-entidad-federativa/" },
    
    // Otros trámites
    { nombre: "CONSTANCIA DEL SAT", costo: 140, gasto: 90, link: "" },
    { nombre: "VALIDACION INE", costo: 10, gasto: 0, link: "" },
    { nombre: "AVISO DE RETENCION", costo: 20, gasto: 0, link: "" },
    { nombre: "ESCRITOS", costo: 15, gasto: 0, link: "" },
    { nombre: "ACTA MATRIMONIO, DEFUNCION, DIVORCIO", costo: 135, gasto: 0, link: "" },
    { nombre: "Semanas cotizadas IMSS proveedor", costo: 75, gasto: 0, link: "" },
    { nombre: "CROQUIS", costo: 20, gasto: 0, link: "" }
];

// Función para cargar los trámites
async function cargarTramitesMasivamente() {
    console.log('🚀 Iniciando carga de trámites...');
    console.log(`📋 Total de trámites a cargar: ${tramitesParaCargar.length}`);
    
    let contador = 0;
    
    for (const tramiteData of tramitesParaCargar) {
        const tramite = {
            id: Date.now().toString() + '-' + contador,
            nombre: tramiteData.nombre,
            costo: tramiteData.costo,
            gasto: tramiteData.gasto,
            link: tramiteData.link
        };
        
        tramites.push(tramite);
        contador++;
        
        // Pequeña pausa para evitar problemas
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    // Guardar todos los trámites
    guardarDatos('tramites', tramites);
    
    // Actualizar la UI
    renderizarTramites();
    renderizarAdminTramites();
    
    console.log(`✅ ¡Carga completada! ${contador} trámites agregados exitosamente.`);
    console.log('📊 Puedes verlos en la sección de Trámites o en Administración.');
    
    alert(`✅ ¡Éxito! Se cargaron ${contador} trámites correctamente.\n\nPuedes verlos en:\n- Sección "Trámites"\n- Sección "Administración" > pestaña "Trámites"`);
}

// Ejecutar la carga
cargarTramitesMasivamente();
