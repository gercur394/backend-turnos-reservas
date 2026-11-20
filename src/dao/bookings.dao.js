import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Ubicamos bookings.json (en ESM __dirname no existe, hay que reconstruirlo)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_FILE = path.join(__dirname, '../data/bookings.json');

// Igual que el DAO de services: el único que sabe que los datos viven en un JSON.
// Sin validaciones ni reglas de negocio.
class BookingsDAO {
  constructor(filePath = DEFAULT_FILE) {
    this.filePath = filePath;
  }

  // Auxiliar: abre el archivo y lo convierte de texto a lista de objetos
  async _read() {
    const content = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(content);
  }

  // Auxiliar: guarda la lista completa en el archivo
  async _write(bookings) {
    await fs.writeFile(this.filePath, JSON.stringify(bookings, null, 2));
  }

  // Guarda una reserva nueva y devuelve la reserva creada.
  // El id lo genera el DAO (detalle de cómo se guarda): el mayor + 1, o 1 si está vacío.
  async create(data) {
    const bookings = await this._read();

    const nextId = bookings.length > 0 ? Math.max(...bookings.map((b) => b.id)) + 1 : 1;
    const newBooking = { id: nextId, ...data };

    bookings.push(newBooking);
    await this._write(bookings);
    return newBooking;
  }

  // Devuelve la reserva con ese id, o null si no existe
  async getById(id) {
    const bookings = await this._read();
    const booking = bookings.find((b) => b.id === Number(id));
    return booking ?? null;
  }

  // Actualiza una reserva mezclando lo viejo con lo nuevo.
  // Devuelve la reserva actualizada, o null si no existe.
  async update(id, data) {
    const bookings = await this._read();
    const index = bookings.findIndex((b) => b.id === Number(id));

    if (index === -1) return null;

    bookings[index] = { ...bookings[index], ...data };

    await this._write(bookings);
    return bookings[index];
  }
}

export default BookingsDAO;