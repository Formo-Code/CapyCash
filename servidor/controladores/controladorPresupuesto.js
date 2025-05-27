const Presupuesto = require('../modelos/Presupuesto');
const mongoose = require('mongoose');

exports.obtenerTodosLosPresupuestos = async (peticion, respuesta, siguiente) => {
    try {
        const presupuestos = await Presupuesto.find({ usuario: peticion.usuarioLogueado._id }).sort({ fecha: -1 });
        respuesta.status(200).json({ exito: true, cantidad: presupuestos.length, datos: presupuestos });
    } catch (error) {
        console.error('Error al obtener presupuestos:', error);
        respuesta.status(500).json({ exito: false, mensaje: 'Error del servidor al obtener presupuestos.' });
    }
};

exports.agregarNuevoPresupuesto = async (peticion, respuesta, siguiente) => {
    // El cliente envía: type, category, amount, date, description
    // El modelo espera: tipo, categoria, monto, fecha, descripcion
    const { type, category, amount, date, description } = peticion.body;
    try {
        const nuevoPresupuesto = await Presupuesto.create({
            usuario: peticion.usuarioLogueado._id,
            tipo: type, // Mapeo
            categoria: category, // Mapeo
            monto: amount, // Mapeo
            fecha: date, // Mapeo
            descripcion: description // Mapeo
        });
        respuesta.status(201).json({ exito: true, datos: nuevoPresupuesto });
    } catch (error) {
        console.error('Error al agregar presupuesto:', error);
        if (error.name === 'ValidationError') {
            return respuesta.status(400).json({ exito: false, mensaje: Object.values(error.errors).map(e => e.message).join(', ') });
        }
        respuesta.status(500).json({ exito: false, mensaje: 'Error del servidor al agregar presupuesto.' });
    }
};

exports.obtenerPresupuestoUnicoPorId = async (peticion, respuesta, siguiente) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(peticion.params.id)) {
            return respuesta.status(400).json({ exito: false, mensaje: 'ID de presupuesto inválido.' });
        }
        const presupuesto = await Presupuesto.findById(peticion.params.id);
        if (!presupuesto) {
            return respuesta.status(404).json({ exito: false, mensaje: 'Presupuesto no encontrado.' });
        }
        if (presupuesto.usuario.toString() !== peticion.usuarioLogueado._id.toString()) {
            return respuesta.status(403).json({ exito: false, mensaje: 'No autorizado.' });
        }
        respuesta.status(200).json({ exito: true, datos: presupuesto });
    } catch (error) {
        console.error('Error al obtener presupuesto por ID:', error);
        respuesta.status(500).json({ exito: false, mensaje: 'Error del servidor.' });
    }
};

exports.actualizarPresupuestoExistente = async (peticion, respuesta, siguiente) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(peticion.params.id)) {
            return respuesta.status(400).json({ exito: false, mensaje: 'ID de presupuesto inválido.' });
        }
        let presupuesto = await Presupuesto.findById(peticion.params.id);
        if (!presupuesto) {
            return respuesta.status(404).json({ exito: false, mensaje: 'Presupuesto no encontrado.' });
        }
        if (presupuesto.usuario.toString() !== peticion.usuarioLogueado._id.toString()) {
            return respuesta.status(403).json({ exito: false, mensaje: 'No autorizado.' });
        }
        
        // Mapear campos del cliente a campos del modelo si es necesario
        const datosParaActualizar = {};
        if (peticion.body.hasOwnProperty('type')) datosParaActualizar.tipo = peticion.body.type;
        if (peticion.body.hasOwnProperty('category')) datosParaActualizar.categoria = peticion.body.category;
        if (peticion.body.hasOwnProperty('amount')) datosParaActualizar.monto = peticion.body.amount;
        if (peticion.body.hasOwnProperty('date')) datosParaActualizar.fecha = peticion.body.date;
        if (peticion.body.hasOwnProperty('description')) datosParaActualizar.descripcion = peticion.body.description;

        presupuesto = await Presupuesto.findByIdAndUpdate(peticion.params.id, datosParaActualizar, { new: true, runValidators: true });
        respuesta.status(200).json({ exito: true, datos: presupuesto });
    } catch (error) {
        console.error('Error al actualizar presupuesto:', error);
        if (error.name === 'ValidationError') {
            return respuesta.status(400).json({ exito: false, mensaje: Object.values(error.errors).map(e => e.message).join(', ') });
        }
        respuesta.status(500).json({ exito: false, mensaje: 'Error del servidor al actualizar.' });
    }
};

exports.eliminarPresupuestoPorId = async (peticion, respuesta, siguiente) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(peticion.params.id)) {
            return respuesta.status(400).json({ exito: false, mensaje: 'ID de presupuesto inválido.' });
        }
        const presupuesto = await Presupuesto.findById(peticion.params.id);
        if (!presupuesto) {
            return respuesta.status(404).json({ exito: false, mensaje: 'Presupuesto no encontrado.' });
        }
        if (presupuesto.usuario.toString() !== peticion.usuarioLogueado._id.toString()) {
            return respuesta.status(403).json({ exito: false, mensaje: 'No autorizado.' });
        }
        await presupuesto.deleteOne();
        respuesta.status(200).json({ exito: true, mensaje: 'Presupuesto eliminado.', datos: {} });
    } catch (error) {
        console.error('Error al eliminar presupuesto:', error);
        respuesta.status(500).json({ exito: false, mensaje: 'Error del servidor al eliminar.' });
    }
};

exports.obtenerResumenDePresupuestos = async (peticion, respuesta, siguiente) => {
    try {
        const idUsuario = peticion.usuarioLogueado._id;
        const agregacion = await Presupuesto.aggregate([
            { $match: { usuario: idUsuario } },
            { $group: { _id: '$tipo', montoTotal: { $sum: '$monto' } } }
        ]);
        let totalIngresos = 0;
        let totalGastos = 0;
        agregacion.forEach(item => {
            if (item._id === 'ingreso') totalIngresos = item.montoTotal;
            else if (item._id === 'gasto') totalGastos = item.montoTotal;
        });
        respuesta.status(200).json({
            exito: true,
            datos: { totalIncome: totalIngresos, totalExpense: totalGastos, balance: totalIngresos - totalGastos }
        });
    } catch (error) {
        console.error('Error al obtener resumen:', error);
        respuesta.status(500).json({ exito: false, mensaje: 'Error del servidor al obtener resumen.' });
    }
};

exports.obtenerPresupuestosAgrupadosPorCategoria = async (peticion, respuesta, siguiente) => {
    try {
        const idUsuario = peticion.usuarioLogueado._id;
        const tipoFiltroCliente = peticion.query.type; // 'income' o 'expense'
        const filtroMatch = { usuario: idUsuario };

        if (tipoFiltroCliente === 'income') filtroMatch.tipo = 'ingreso';
        else if (tipoFiltroCliente === 'expense') filtroMatch.tipo = 'gasto';
        
        const datosAgrupados = await Presupuesto.aggregate([
            { $match: filtroMatch },
            { $group: { _id: '$categoria', totalAmount: { $sum: '$monto' }, count: { $sum: 1 } } },
            { $sort: { totalAmount: -1 } }
        ]);
        respuesta.status(200).json({ exito: true, cantidad: datosAgrupados.length, datos: datosAgrupados });
    } catch (error) {
        console.error('Error al obtener por categoría:', error);
        respuesta.status(500).json({ exito: false, mensaje: 'Error del servidor al obtener por categoría.' });
    }
};