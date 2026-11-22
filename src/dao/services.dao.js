import mongoose from 'mongoose';
import ServiceModel from '../models/service.model.js';

// El DAO sigue siendo el único que sabe CÓMO se guardan los datos.
// Antes abría un archivo JSON; ahora le pide las cosas al modelo de Mongoose.
// Sigue sin tener reglas de negocio.
class ServicesDAO {
  // Devuelve todos los servicios. lean() devuelve objetos simples de JavaScript.
  async getAll() {
    return await ServiceModel.find().lean();
  }

  // Devuelve el servicio con ese id, o null si no existe.
  async getById(id) {
    // Un id que no tiene forma de ObjectId (por ejemplo "abc") haría que Mongoose
    // lance un error. Lo tratamos como "no existe" para seguir respondiendo 404.
    if (!mongoose.isValidObjectId(id)) return null;

    const service = await ServiceModel.findById(id).lean();
    return service ?? null;
  }

  // Guarda un servicio nuevo y devuelve el servicio creado.
  // El _id lo genera MongoDB: ya no hay que calcular el "mayor + 1".
  async create(data) {
    const created = await ServiceModel.create(data);
    return created.toObject(); // de documento de Mongoose a objeto simple
  }

  // Actualiza un servicio y devuelve el actualizado, o null si no existe.
  async update(id, data) {
    if (!mongoose.isValidObjectId(id)) return null;

    try {
      const updated = await ServiceModel.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      }).lean();

      return updated ?? null;
    } catch (error) {
      // Mongoose avisa con estos dos tipos de error cuando los datos no cumplen el schema
      // (un texto donde va un número, un campo obligatorio vacío...).
      // El DAO es el único que conoce Mongoose, así que acá los traducimos a un error
      // etiquetado, sin hablar de HTTP: las capas de arriba no necesitan saber qué es un CastError.
      if (error.name === 'CastError' || error.name === 'ValidationError') {
        const invalid = new Error(error.message);
        invalid.code = 'INVALID_DATA';
        throw invalid;
      }

      throw error; // cualquier otro error es inesperado: sigue su camino
    }
  }

  // Elimina un servicio y devuelve el eliminado, o null si no existe.
  async delete(id) {
    if (!mongoose.isValidObjectId(id)) return null;

    const deleted = await ServiceModel.findByIdAndDelete(id).lean();
    return deleted ?? null;
  }
}

export default ServicesDAO;