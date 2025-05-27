const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const conectarBD = require('./configuracion/bd');
const path = require('path');

// Carga el .env de la raíz del proyecto (CAPYCASH_PROYECTO/.env)
dotenv.config({ path: '../.env' });

// Conectar a la Base de Datos
conectarBD();

// Importar archivos de rutas
const rutasUsuario = require('./rutas/rutasUsuario');
const rutasPresupuesto = require('./rutas/rutasPresupuesto');

const aplicacion = express();

// Middlewares principales
aplicacion.use(cors());
aplicacion.use(express.json());
aplicacion.use(express.urlencoded({ extended: false }));


aplicacion.use(express.static(path.join(__dirname, '../cliente')));


// Rutas de la API (prefijo /api para todas las rutas del backend)
aplicacion.use('/api/usuarios', rutasUsuario);
aplicacion.use('/api/presupuestos', rutasPresupuesto);


aplicacion.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../cliente', 'index.html'));
});


aplicacion.use((error, peticion, respuesta, siguiente) => {
    console.error("Error no manejado en el servidor:", error.stack);
    respuesta.status(error.statusCode || 500).json({
        exito: false,
        mensaje: error.message || 'Error interno del servidor.'
    });
});

// Configuración del puerto y arranque del servidor
const PUERTO = process.env.PUERTO || 5000;
const ENTORNO = process.env.ENTORNO_DESARROLLO || 'development';

const instanciaServidor = aplicacion.listen(
    PUERTO,
    () => console.log(`Servidor CapyCash corriendo en modo ${ENTORNO} en el puerto ${PUERTO}`)
);

// Manejo de promesas rechazadas no controladas (para evitar que el servidor crashee silenciosamente)
process.on('unhandledRejection', (error, promesa) => {
    console.error(`Error de Promesa Rechazada no Controlada: ${error.message}`);
    
    instanciaServidor.close(() => process.exit(1));
});