import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Ubicamos services.json. En ESM no existe __dirname, así que lo reconstruimos
// para que el archivo se encuentre sin importar desde qué carpeta se ejecute el proyecto.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_FILE = path.join(__dirname, '../data/services.json');

// El DAO es el único que sabe que los datos viven en un archivo JSON.
// Su trabajo es mecánico: leer, modificar la lista y guardar.
// NO valida, NO decide, NO tiene reglas de negocio: confía en lo que le llega.
class ServicesDAO {
  constructor(filePath = DEFAULT_FILE) {
    this.filePath = filePath;
  }

  // Auxiliar: abre el archivo y lo convierte de texto a lista de objetos
  async _read() {
    const content = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(content);
  }

  // Auxiliar: guarda la lista completa en el archivo (con sangría de 2 espacios para que se lea bien)
  async _write(services) {
    await fs.writeFile(this.filePath, JSON.stringify(services, null, 2));
  }

  // Devuelve todos los servicios, tal cual están guardados
  async getAll() {
    return await this._read();
  }

  // Devuelve el servicio con ese id, o null si no existe.
  // Number(id) hace que funcione tanto con 2 como con "2" (de la URL llega texto).
  async getById(id) {
    const services = await this._read();
    const service = services.find((s) => s.id === Number(id));
    return service ?? null; // find devuelve undefined si no encuentra; lo pasamos a null
  }

  // Guarda un servicio nuevo y devuelve el servicio creado.
  // Generar el id es un detalle de CÓMO se guarda,
  // por eso vive acá y no en el service.
  async create(data) {
    const services = await this._read();

    // Id nuevo = el mayor id existente + 1 (o 1 si la lista está vacía)
    const nextId = services.length > 0 ? Math.max(...services.map((s) => s.id)) + 1 : 1;

    // Ponemos el id primero y después los datos, para que el id quede arriba en el JSON.
    // No filtramos campos acá: el service es quien se asegura de pasar solo los permitidos.
    const newService = { id: nextId, ...data };

    services.push(newService);
    await this._write(services);
    return newService;
  }

  // Actualiza un servicio y devuelve el servicio actualizado, o null si no existe.
  // Mezcla lo viejo con lo nuevo. La regla "el id no se puede modificar" la aplica
  // el service (quita el id de los datos antes de llamar acá), no el DAO.
  async update(id, data) {
    const services = await this._read();
    const index = services.findIndex((s) => s.id === Number(id));

    if (index === -1) return null; // no existe

    services[index] = { ...services[index], ...data };

    await this._write(services);
    return services[index];
  }

  // Elimina un servicio y devuelve el servicio eliminado, o null si no existe.
  // "delete" es palabra reservada, pero como nombre de método se puede usar sin problema.
  async delete(id) {
    const services = await this._read();
    const index = services.findIndex((s) => s.id === Number(id));

    if (index === -1) return null; // no existe

    const [deleted] = services.splice(index, 1); // saca 1 elemento y lo devuelve
    await this._write(services);
    return deleted;
  }
}

export default ServicesDAO;