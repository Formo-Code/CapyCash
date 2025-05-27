const mongoose = require('mongoose');

const EsquemaPresupuesto = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.ObjectId,
        ref: 'Usuario',
        required: true
    },
    tipo: { // 'ingreso' o 'gasto'
        type: String,
        enum: {
            values: ['ingreso', 'gasto'],
            message: 'El tipo debe ser "ingreso" o "gasto".'
        },
        required: [true, 'El tipo (ingreso/gasto) es obligatorio.']
    },
    categoria: {
        type: String,
        required: [true, 'La categoría es obligatoria.'],
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    monto: {
        type: Number,
        required: [true, 'El monto es obligatorio.'],
        validate: {
            validator: (valor) => valor > 0,
            message: 'El monto debe ser un número positivo.'
        }
    },
    fecha: { // Fecha de la transacción
        type: Date,
        required: [true, 'La fecha de la transacción es obligatoria.'],
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

EsquemaPresupuesto.index({ usuario: 1, fecha: -1 });

module.exports = mongoose.model('Presupuesto', EsquemaPresupuesto);