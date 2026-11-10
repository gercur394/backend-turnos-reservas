import BookingManager from '../managers/BookingManager.js';
import ServiceManager from '../managers/ServiceManager.js';

const bookingManager = new BookingManager();
const serviceManager = new ServiceManager();

//POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const newBooking = await bookingManager.createBooking(req.body);
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
//GET /api/bookings/:bid
export const getBookingById = async (req, res) => {
  const { bid } = req.params;

  const booking = await bookingManager.getBookingById(bid);


  if (!booking) {
    return res.status(404).json({ error: `Reserva con id ${bid} no encontrada` });
  }

  res.status(200).json(booking);
};


// POST /api/bookings/:bid/services/:sid -> agrega un servicio a una reserva
export const addServiceToBooking = async (req, res) => {
  const { bid, sid } = req.params;

  // 1. ¿Existe la reserva?
  const booking = await bookingManager.getBookingById(bid);
  if (!booking) {
    return res.status(404).json({ error: `Reserva con id ${bid} no encontrada` });
  }

  // 2. ¿Existe el servicio? Preguntamos al ServiceManager
  const service = await serviceManager.getServiceById(sid);
  if (!service) {
    return res.status(404).json({ error: `Servicio con id ${sid} no encontrado` });
  }

  // 3. Con las dos cosas validadas, el manager suma el servicio a la reserva.
  // pasamos service.id, que ya es un número.
  const updatedBooking = await bookingManager.addServiceToBooking(bid, service.id);
  res.status(200).json(updatedBooking);
};