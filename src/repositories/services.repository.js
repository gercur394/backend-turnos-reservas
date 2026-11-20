import ServicesDAO from '../dao/services.dao.js';

// El repository ofrece métodos de acceso a datos, sin reglas de negocio.
// Es el único que conoce al DAO: el service de arriba solo habla con el repository.
class ServicesRepository {
  // Recibe el DAO como parámetro, y si no le pasan uno, crea el suyo por defecto.
  // Así, el día que cambie la persistencia, se le puede dar otro DAO sin tocar este archivo.
  constructor(dao = new ServicesDAO()) {
    this.dao = dao;
  }

  // Devuelve todos los servicios
  async getAll() {
    return await this.dao.getAll();
  }

  // Devuelve un servicio por id, o null si no existe
  async getById(id) {
    return await this.dao.getById(id);
  }

  // Guarda un servicio nuevo y devuelve el servicio creado
  async create(data) {
    return await this.dao.create(data);
  }

  // Actualiza un servicio y devuelve el actualizado, o null si no existe
  async update(id, data) {
    return await this.dao.update(id, data);
  }

  // Elimina un servicio y devuelve el eliminado, o null si no existe
  async delete(id) {
    return await this.dao.delete(id);
  }
}

export default ServicesRepository;