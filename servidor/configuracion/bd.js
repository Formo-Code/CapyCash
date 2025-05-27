const mongoose = require('mongoose');

const conectarBD = async () => {
    try {
        if (!process.env.URL_MONGO) {
            throw new Error('La variable de entorno URL_MONGO no está definida.');
        }
        const conexion = await mongoose.connect(process.env.URL_MONGO);
        console.log(`MongoDB Conectado Exitosamente: ${conexion.connection.host}`);
    } catch (error) {
        console.error(`Error al conectar con MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = conectarBD;