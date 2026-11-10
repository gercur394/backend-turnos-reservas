import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_FILE = path.join(__dirname, '../data/bookings.json');

class BookingManager {
  
  constructor(filePath = DEFAULT_FILE) {
    this.filePath = filePath;
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

    const booking = bookings.find((b) => b.id === Number(bookingId));
    if (!booking) return null; 

    const id = Number(serviceId);
    const item = booking.services.find((s) => s.service === id);

    if (item) {
      item.quantity += 1; 
    } else {
      booking.services.push({ service: id, quantity: 1 });
    }

    await this._write(bookings);
    return booking;
  }
}

export default BookingManager;