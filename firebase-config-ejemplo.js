// ============================================
// CONFIGURACIÓN DE FIREBASE - EJEMPLO
// ============================================

/*
  INSTRUCCIONES PARA CONFIGURAR FIREBASE:

  1. Ve a https://console.firebase.google.com/
  2. Crea un nuevo proyecto o selecciona uno existente
  3. Ve a "Configuración del proyecto" (ícono de engranaje)
  4. En la sección "Tus apps", selecciona la app web (</>) o créala
  5. Copia la configuración que te proporciona Firebase
  6. Reemplaza los valores en app.js con tus credenciales reales

  EJEMPLO DE CONFIGURACIÓN:
*/

const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "tu-proyecto.firebaseapp.com",
    databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};

/*
  CONFIGURAR REALTIME DATABASE:

  1. En Firebase Console, ve a "Realtime Database"
  2. Click en "Crear base de datos"
  3. Selecciona una ubicación (preferiblemente cercana a tu región)
  4. Inicia en modo de prueba o producción

  REGLAS DE SEGURIDAD PARA DESARROLLO (NO USAR EN PRODUCCIÓN):
  {
    "rules": {
      ".read": true,
      ".write": true
    }
  }

  REGLAS DE SEGURIDAD RECOMENDADAS PARA PRODUCCIÓN:
  {
    "rules": {
      "equipos": {
        ".read": true,
        ".write": true
      },
      "tramites": {
        ".read": true,
        ".write": true
      },
      "promociones": {
        ".read": true,
        ".write": true
      },
      "productos": {
        ".read": true,
        ".write": true
      },
      "gastos": {
        ".read": true,
        ".write": true
      },
      "ventasTramites": {
        ".read": true,
        ".write": true
      },
      "ventasImpresiones": {
        ".read": true,
        ".write": true
      },
      "ventasPapeleria": {
        ".read": true,
        ".write": true
      },
      "sesionesEquipos": {
        ".read": true,
        ".write": true
      },
      "cortesHistorial": {
        ".read": true,
        ".write": true
      }
    }
  }

  ESTRUCTURA DE DATOS EN FIREBASE:

  /equipos
    /{equipoId}
      - id: string
      - nombre: string
      - caracteristicas: string

  /tramites
    /{tramiteId}
      - id: string
      - nombre: string
      - costo: number
      - gasto: number
      - link: string

  /promociones
    /{promocionId}
      - id: string
      - tipo: "impresion" | "escaneo"
      - cantidad: number
      - precio: number

  /productos
    /{productoId}
      - id: string
      - nombre: string
      - precio: number
      - costo: number
      - cantidad: number

  /gastos
    /{gastoId}
      - id: string
      - concepto: string
      - monto: number
      - categoria: string
      - fecha: string (ISO)

  /ventasTramites
    /{ventaId}
      - id: string
      - tramiteId: string
      - cantidad: number
      - total: number
      - fecha: string (ISO)

  /ventasImpresiones
    /{ventaId}
      - id: string
      - tipo: "impresion" | "escaneo"
      - cantidad: number
      - total: number
      - equipoId: string | null
      - fecha: string (ISO)

  /ventasPapeleria
    /{ventaId}
      - id: string
      - productoId: string
      - cantidad: number
      - total: number
      - fecha: string (ISO)

  /sesionesEquipos
    /{sesionId}
      - id: string
      - equipoId: string
      - inicio: string (ISO)
      - fin: string (ISO) | null
      - serviciosExtra: array
      - total: number
      - activa: boolean

  /cortesHistorial
    /{corteId}
      - id: string
      - fecha: string
      - totalGenerado: number
      - totalGastos: number
      - totalNeto: number
      - gastos: array

  PASOS PARA USAR FIREBASE EN TU APLICACIÓN:

  1. Copia tus credenciales de Firebase
  2. Abre el archivo app.js
  3. Busca la sección "CONFIGURACIÓN FIREBASE"
  4. Reemplaza los valores de firebaseConfig con tus credenciales
  5. Guarda el archivo
  6. Abre index.html en tu navegador
  7. El sistema detectará automáticamente Firebase y lo usará

  MODO LOCAL (SIN FIREBASE):

  Si no configuras Firebase, el sistema usará localStorage automáticamente.
  Los datos se guardarán solo en tu navegador local.

  VENTAJAS DE USAR FIREBASE:
  - Sincronización en la nube
  - Acceso desde múltiples dispositivos
  - Backup automático
  - Escalabilidad

  DESVENTAJAS DE USAR LOCALSTORAGE:
  - Solo disponible en un navegador
  - Se pierde si borras el caché
  - No hay sincronización
  - Limitado a ~5-10MB

  RECOMENDACIÓN:
  Usa Firebase para un entorno de producción real.
  Usa localStorage solo para pruebas o demos.
*/

// ============================================
// FUNCIONES AUXILIARES PARA FIREBASE
// ============================================

/*
  MIGRAR DE LOCALSTORAGE A FIREBASE:

  Si ya tienes datos en localStorage y quieres migrarlos a Firebase:

  1. Abre la consola del navegador (F12)
  2. Copia y pega este código:

  async function migrarAFirebase() {
    const keys = [
      'equipos', 'tramites', 'promociones', 'productos',
      'gastos', 'ventasTramites', 'ventasImpresiones',
      'ventasPapeleria', 'sesionesEquipos', 'cortesHistorial'
    ];

    for (const key of keys) {
      const data = localStorage.getItem(key);
      if (data) {
        await db.ref(key).set(JSON.parse(data));
        console.log(`${key} migrado exitosamente`);
      }
    }

    console.log('Migración completada');
  }

  migrarAFirebase();

  3. Presiona Enter
  4. Espera a que termine la migración
  5. Verifica en Firebase Console que los datos estén ahí
*/

/*
  HACER BACKUP DE FIREBASE A LOCAL:

  Para descargar todos los datos de Firebase:

  async function backupFirebase() {
    const keys = [
      'equipos', 'tramites', 'promociones', 'productos',
      'gastos', 'ventasTramites', 'ventasImpresiones',
      'ventasPapeleria', 'sesionesEquipos', 'cortesHistorial'
    ];

    const backup = {};

    for (const key of keys) {
      const snapshot = await db.ref(key).once('value');
      backup[key] = snapshot.val();
    }

    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_${new Date().toISOString()}.json`;
    link.click();

    console.log('Backup descargado');
  }

  backupFirebase();
*/

/*
  RESTAURAR BACKUP:

  Para restaurar un backup JSON a Firebase:

  async function restaurarBackup(backupData) {
    for (const [key, value] of Object.entries(backupData)) {
      await db.ref(key).set(value);
      console.log(`${key} restaurado`);
    }
    console.log('Restauración completada');
  }

  // Uso:
  // 1. Carga el archivo JSON
  // 2. Parsea el contenido
  // 3. Llama a restaurarBackup(jsonData)
*/

// ============================================
// TIPS Y MEJORES PRÁCTICAS
// ============================================

/*
  1. SEGURIDAD:
     - Nunca compartas tus credenciales de Firebase públicamente
     - Usa reglas de seguridad apropiadas en producción
     - Considera agregar autenticación para mayor seguridad

  2. RENDIMIENTO:
     - Firebase tiene límites de lectura/escritura gratuitos
     - Optimiza las consultas para no exceder los límites
     - Considera usar índices para consultas complejas

  3. COSTOS:
     - Plan Spark (gratuito): 1GB almacenamiento, 10GB/mes transferencia
     - Monitorea tu uso en Firebase Console
     - Configura alertas de facturación

  4. MANTENIMIENTO:
     - Haz backups regulares
     - Limpia datos antiguos periódicamente
     - Monitorea errores en la consola

  5. DESARROLLO:
     - Usa un proyecto de Firebase diferente para desarrollo y producción
     - Prueba los cambios localmente antes de desplegar
     - Documenta cualquier cambio en la estructura de datos
*/
