import ServicesRepository from '../repositories/services.repository.js';

// El service contiene las reglas de negocio: qué es obligatorio, qué se puede
// modificar, cómo se filtra. No conoce req/res (no sabe de HTTP) y tampoco toca
// archivos: solo habla con el repository.
//
// Cómo avisa que algo salió mal, sin usar res:
//   - devuelve null  -> "ese servicio no existe"   (el controller lo traduce a 404)
//   - lanza un Error -> "el pedido es inválido"    (el controller lo traduce a 400)
class ServicesService {
  constructor(repository = new ServicesRepository()) {
    this.repository = repository;
  }

  // Devuelve los servicios. Acepta filtros opcionales: { category, available }.
  async getServices(filters = {}) {
    // Pedimos la lista completa al repository y filtramos acá:
    // qué mostrarle al cliente es una decisión del service, no un detalle de cómo se guardan los datos.
    let services = await this.repository.getAll();

    // Filtro por categoría, sin distinguir mayúsculas ("Peluquería" = "peluquería")
    if (filters.category) {
      services = services.filter(
        (s) => s.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Filtro por disponibilidad. En la URL available llega como texto ("true"/"false"),
    // pero en el JSON es un booleano: String(...) lo pasa a texto para poder comparar.
    if (filters.available) {
      services = services.filter(
        (s) => String(s.available) === filters.available.toLowerCase()
      );
    }

    return services;
  }

  // Devuelve un servicio por id, o null si no existe
  async getServiceById(id) {
    return await this.repository.getById(id);
  }

  // Crea un servicio nuevo. Lanza un Error si faltan campos.
  async createService(serviceData) {
    const requiredFields = ['name', 'description', 'duration', 'price', 'category', 'available'];

    // Detectamos los campos ausentes. Comparamos contra undefined, null y '' (y no con "!campo")
    // para que valores válidos como false o 0 no se confundan con "falta el dato".
    const missing = requiredFields.filter(
      (field) =>
        serviceData?.[field] === undefined ||
        serviceData?.[field] === null ||
        serviceData?.[field] === ''
    );

    // Regla de negocio: se rechaza el servicio incompleto, indicando qué falta
    if (missing.length > 0) {
      throw new Error(`Servicio incompleto. Faltan: ${missing.join(', ')}`);
    }

    // Nos quedamos SOLO con los campos permitidos. Si el cliente manda un "id",
    // acá se descarta: el id lo genera el DAO, nunca viene de afuera.
    const { name, description, duration, price, category, available } = serviceData;
    const newData = { name, description, duration, price, category, available };

    return await this.repository.create(newData);
  }

  // Actualiza un servicio. Devuelve el actualizado, o null si no existe.
  async updateService(id, updatedData = {}) {
    // Regla de negocio: el id NO se puede modificar.
    // Esta desestructuración separa el campo "id" (que guardamos en _ignored y no usamos)
    // y junta todo lo demás en "changes". Así el id nunca llega al repository.
    // El "= {}" evita un error si alguien manda un PUT sin body.
    const { id: _ignored, ...changes } = updatedData;

    return await this.repository.update(id, changes);
  }

  // Elimina un servicio. Devuelve el eliminado, o null si no existe
  async deleteService(id) {
    return await this.repository.delete(id);
  }
}

export default ServicesService;