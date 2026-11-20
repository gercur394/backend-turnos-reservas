import BookingsDAO from '../dao/bookings.dao.js';

// El bibliotecario de las reservas: pasa los pedidos al DAO, sin reglas de negocio.
class BookingsRepository {
  constructor(dao = new BookingsDAO()) {
    this.dao = dao;
  }

  // Guarda una reserva nueva y devuelve la creada
  async create(data) {
    return await this.dao.create(data);
  }

  // Devuelve una reserva por id, o null si no existe
  async getById(id) {
    return await this.dao.getById(id);
  }

  // Actualiza una reserva y devuelve la actualizada, o null si no existe
  async update(id, data) {
    return await this.dao.update(id, data);
  }
}

export default BookingsRepository;