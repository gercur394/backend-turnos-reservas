import BookingsRepository from '../repositories/bookings.repository.js';
import ServicesService from './services.service.js';

// Crea un error "no encontrado" con una etiqueta (code) que el controller
// sabe traducir a un 404. El service no habla de códigos HTTP: solo dice QUÉ pasó.
const notFound = (message) => {
  const error = new Error(message);
  error.code = 'NOT_FOUND';
  return error;
};

// Reglas de negocio de las reservas. No conoce req/res ni toca archivos.
class BookingsService {
  // Necesita al service de servicios para comprobar que un servicio exista.
  // Un service puede hablar con otro service; lo que no puede es tocar archivos.
  constructor(repository = new BookingsRepository(), servicesService = new ServicesService()) {
    this.repository = repository;
    this.servicesService = servicesService;
  }

  // Crea una reserva. Lanza un Error si faltan campos obligatorios.
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

    // Solo tomamos los campos permitidos: un "id" o un "services" que mande el cliente se ignoran.
    // Reglas por defecto: status arranca como 'pending' y services siempre arranca vacío.
    const { clientName, clientEmail, date, time, status } = bookingData;
    const newData = {
      clientName,
      clientEmail,
      date,
      time,
      status: status ?? 'pending',
      services: [],
    };

    return await this.repository.create(newData);
  }

  // Devuelve una reserva por id, o null si no existe
  async getBookingById(id) {
    return await this.repository.getById(id);
  }

  // Agrega un servicio a una reserva. Si el servicio ya estaba, suma 1 a su quantity.
  // Lanza un error NOT_FOUND si no existe la reserva o el servicio.
  async addServiceToBooking(bookingId, serviceId) {
    // 1. ¿Existe la reserva?
    const booking = await this.repository.getById(bookingId);
    if (!booking) {
      throw notFound(`Reserva con id ${bookingId} no encontrada`);
    }

    // 2. ¿Existe el servicio? Se lo preguntamos al service de servicios.
    const service = await this.servicesService.getServiceById(serviceId);
    if (!service) {
      throw notFound(`Servicio con id ${serviceId} no encontrado`);
    }

    // 3. REGLA DE NEGOCIO: si el servicio ya estaba en la reserva, no se duplica:
    //    se incrementa quantity. Si no estaba, se agrega con cantidad 1.
    //    Usamos service.id (ya es un número) para comparar y guardar.
    const item = booking.services.find((s) => s.service === service.id);

    if (item) {
      item.quantity += 1;
    } else {
      booking.services.push({ service: service.id, quantity: 1 });
    }

    // 4. Le pedimos al repository que guarde solo lo que cambió: la lista de servicios.
    //    La lógica de la cantidad se queda acá; el DAO solo guarda el resultado.
    return await this.repository.update(booking.id, { services: booking.services });
  }
}

export default BookingsService;