import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_FILE = path.join(__dirname, '../data/services.json');

class ServiceManager {
  
  constructor(filePath = DEFAULT_FILE) {
    this.filePath = filePath;
  }

  
  async _read() {
    const content = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(content);
  }

  
  async _write(services) {
    await fs.writeFile(this.filePath, JSON.stringify(services, null, 2));
  }

  
    // Devuelve los servicios. Acepta filtros opcionales: { category, available }.
  // El "= {}" hace que siga funcionando igual si se lo llama sin argumentos.
  async getServices(filters = {}) {
    let services = await this._read();

    if (filters.category) {
      services = services.filter(
        (s) => s.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    
    if (filters.available) {
      services = services.filter(
        (s) => String(s.available) === filters.available.toLowerCase()
      );
    }

    return services;
  }

  
  async getServiceById(id) {
    const services = await this._read();
    const service = services.find((s) => s.id === Number(id));
    return service ?? null; // si find no encuentra nada devuelve undefined; lo pasamos a null
  }


    // Agrega un servicio nuevo. El id lo genera el manager, nunca se recibe de afuera.
  async addService(serviceData) {
    const requiredFields = ['name', 'description', 'duration', 'price', 'category', 'available'];

    // Detectamos los campos ausentes (false y 0 sí son valores válidos)
    const missing = requiredFields.filter(
      (field) =>
        serviceData?.[field] === undefined ||
        serviceData?.[field] === null ||
        serviceData?.[field] === ''
    );

    // Rechazamos el servicio incompleto avisando cuáles campos faltan
    if (missing.length > 0) {
      throw new Error(`Servicio incompleto. Faltan: ${missing.join(', ')}`);
    }

    const services = await this._read();

    // Id nuevo = el mayor id existente + 1 (o 1 si la lista está vacía)
    const nextId = services.length > 0 ? Math.max(...services.map((s) => s.id)) + 1 : 1;

    // Tomamos solo los campos conocidos: si alguien manda un "id", se ignora
    const { name, description, duration, price, category, available } = serviceData;
    const newService = { id: nextId, name, description, duration, price, category, available };

    services.push(newService);
    await this._write(services);
    return newService;
  }

  // Actualiza un servicio. Devuelve null si no existe. El id nunca cambia.
  async updateService(id, updatedData) {
    const services = await this._read();
    const index = services.findIndex((s) => s.id === Number(id));

    if (index === -1) return null;

    // Mezclamos lo viejo con lo nuevo; el id original va al final para que no se pise
    services[index] = { ...services[index], ...updatedData, id: services[index].id };

    await this._write(services);
    return services[index];
  }

  // Elimina un servicio. Devuelve el servicio eliminado, o null si no existe.
  async deleteService(id) {
    const services = await this._read();
    const index = services.findIndex((s) => s.id === Number(id));

    if (index === -1) return null;

    const [deleted] = services.splice(index, 1); // saca 1 elemento y lo devuelve
    await this._write(services);
    return deleted;
  }
}

export default ServiceManager;