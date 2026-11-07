import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ServiceManager from './ServiceManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_FILE = path.join(__dirname, '../data/bookings.json');

class BookingManager {
  constructor(filePath = DEFAULT_FILE, serviceManager = new ServiceManager()) {
    this.filePath = filePath;
    this.serviceManager = serviceManager;
  }

  async _read() {
    const content = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(content);
  }

  async _write(bookings) {
    await fs.writeFile(this.filePath, JSON.stringify(bookings, null, 2));
  }

  async createBooking(bookingData) {
    const requiredFields = ['clientName', 'clientEmail', 'date', 'time'];
 
    const missing = requiredFields.filter(
      (field) =>
        bookingData?.[field] === undefined ||
        bookingData?.[field] === null ||
        bookingData?.[field] === ''
    );

    if (missing.length > 0) {
      throw new Error(`Reserva incompleta. Faltan: ${missing.join(', ')}`);
    }

    const bookings = await this._read();

    const nextId = bookings.length > 0 ? Math.max(...bookings.map((s) => s.id)) + 1 : 1;

    
    const { clientName, clientEmail , date, time, status } = bookingData;
    const newBooking = { id: nextId, clientName, clientEmail, date, time, status: status ?? 'pending', services: [] };

    bookings.push(newBooking);
    await this._write(bookings);
    return newBooking;
  }

  async getBookingById(id) { 
    const bookings = await this._read();
    const booking = bookings.find((s) => s.id === Number(id));
    return booking ?? null;
   }

  async addServiceToBooking(bookingId, serviceId) {
    const bookings = await this._read();

    // 1. Buscamos la reserva. find() devuelve el objeto que está DENTRO de la lista,
    //    así que si lo modificamos, la lista cambia también (lo usamos más abajo).
    const booking = bookings.find((b) => b.id === Number(bookingId));
    if (!booking) {
      throw new Error(`Reserva con id ${bookingId} no encontrada`);
    }

    // 2. Le preguntamos al ServiceManager si el servicio existe.
    //    Es el encargado de la agenda consultando al del catálogo.
    const service = await this.serviceManager.getServiceById(serviceId);
    if (!service) {
      throw new Error(`Servicio con id ${serviceId} no encontrado`);
    }

    // 3. Buscamos si la reserva ya tiene ese servicio.
    //    Usamos service.id (que ya es un NÚMERO, porque viene del JSON) y no
    //    serviceId (que viene de la URL como texto). Así evitamos la trampa
    //    de comparar "1" con 1, que con === da falso.
    const item = booking.services.find((s) => s.service === service.id);

    if (item) {
      item.quantity += 1;
    } else {
      booking.services.push({ service: service.id, quantity: 1 });
    }

    // 4. Guardamos la lista completa y devolvemos la reserva actualizada.
    //    Como "booking" es una referencia a un elemento de "bookings",
    //    el cambio ya está dentro de la lista y alcanza con guardarla.
    await this._write(bookings);
    return booking;
  }  
}

export default BookingManager;