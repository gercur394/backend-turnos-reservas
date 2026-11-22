import mongoose from 'mongoose';
import BookingModel from '../models/booking.model.js';

// El DAO de reservas: el único que sabe CÓMO se guardan los datos (ahora en MongoDB).
// Sin reglas de negocio: guarda lo que le pasan.
class BookingsDAO {
  // Guarda una reserva nueva y devuelve la reserva creada.
  // El _id lo genera MongoDB.
  async create(data) {
    const created = await BookingModel.create(data);
    return created.toObject(); // de documento de Mongoose a objeto simple
  }

  // Devuelve la reserva con ese id, o null si no existe.
  async getById(id) {
    // Un id sin forma de ObjectId (por ejemplo "abc") haría que Mongoose lance un error.
    // Lo tratamos como "no existe" para seguir respondiendo 404.
    if (!mongoose.isValidObjectId(id)) return null;

    const booking = await BookingModel.findById(id).lean();
    return booking ?? null;
  }

  // Actualiza una reserva con los datos recibidos y devuelve la reserva ya actualizada,
  // o null si no existe.
  async update(id, data) {
    if (!mongoose.isValidObjectId(id)) return null;

    const updated = await BookingModel.findByIdAndUpdate(id, data, {
      new: true, // devuelve el documento YA actualizado
      runValidators: true, // aplica las reglas del schema también al actualizar
    }).lean();

    return updated ?? null;
  }
}

export default BookingsDAO;