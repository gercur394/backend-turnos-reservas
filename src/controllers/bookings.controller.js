import BookingsService from '../services/bookings.service.js';

// El controller ahora habla con UN solo service. Ya no importa ningún manager
// ni el ServiceManager: comprobar que el servicio exista es regla de negocio,
// y esa regla vive en bookings.service.js.
const bookingsService = new BookingsService();

// POST /api/bookings -> crea una reserva con los datos del body
export const createBooking = async (req, res) => {
  try {
    // req.body trae el JSON del cliente. El id y services se ignoran en el service.
    const newBooking = await bookingsService.createBooking(req.body);
    res.status(201).json(newBooking);
  } catch (error) {
    // El service lanza un Error si faltan campos: 400 (pedido mal hecho)
    res.status(400).json({ error: error.message });
  }
};

// GET /api/bookings/:bid -> devuelve una reserva por id
export const getBookingById = async (req, res) => {
  const { bid } = req.params;

  const booking = await bookingsService.getBookingById(bid);

  // El service devuelve null si no existe: 404
  if (!booking) {
    return res.status(404).json({ error: `Reserva con id ${bid} no encontrada` });
  }

  res.status(200).json(booking);
};

// POST /api/bookings/:bid/services/:sid -> agrega un servicio a una reserva
export const addServiceToBooking = async (req, res) => {
  const { bid, sid } = req.params;

  try {
    const updatedBooking = await bookingsService.addServiceToBooking(bid, sid);
    res.status(200).json(updatedBooking);
  } catch (error) {
    // Si el service avisa "no encontrado" (reserva o servicio), respondemos 404
    // con el mismo mensaje de siempre.
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ error: error.message });
    }

    // Cualquier otro error es inesperado (por ejemplo, se rompe la lectura del archivo).
    // No lo disfrazamos de 404: lo relanzamos y Express responde con un 500.
    throw error;
  }
};