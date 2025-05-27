const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const conectarBD = require('./configuracion/bd');

dotenv.config({ path: '../.env' }); // Carga el .env de la raíz

conectarBD();

const rutasUsuario = require('./rutas/rutasUsuario');
const rutasPresupuesto = require('./rutas/rutasPresupuesto');

const aplicacion = express();

aplicacion.use(cors());
aplicacion.use(express.json());
aplicacion.use(express.urlencoded({ extended: false }));

aplicacion.use('/api/usuarios', rutasUsuario);
aplicacion.use('/api/presupuestos', rutasPresupuesto);

aplicacion.use((peticion, respuesta, siguiente) => {
    respuesta.status(404).json({ exito: false, mensaje: 'Ruta no encontrada en el servidor.' });
});

aplicacion.use((error, peticion, respuesta, siguiente) => {
    console.error("Error no manejado en el servidor:", error.stack);
    respuesta.status(error.statusCode || 500).json({
        exito: false,
        mensaje: error.message || 'Error interno del servidor.'
    });
});

const PUERTO = process.env.PUERTO || 5000;
const ENTORNO = process.env.ENTORNO_DESARROLLO || 'development';

const instanciaServidor = aplicacion.listen(
    PUERTO,
    () => console.log(`Servidor CapyCash corriendo en modo ${ENTORNO} en el puerto ${PUERTO}`)
);

process.on('unhandledRejection', (error, promesa) => {
    console.error(`Error de Promesa Rechazada no Controlada: ${error.message}`);
    instanciaServidor.close(() => process.exit(1));
});