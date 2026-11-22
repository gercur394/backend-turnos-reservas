import mongoose from 'mongoose';

// Sub-formulario para cada servicio dentro de una reserva: { service, quantity }.
// "service" NO guarda el servicio completo, sino su ObjectId: una referencia al
// servicio (la idea de la comanda: "plato 7, x2" y no una copia del plato).
// _id: false evita que MongoDB le ponga un _id propio a cada elemento de la lista.
const bookingServiceSchema = new mongoose.Schema(
  {
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    date: { type: String, required: true }, // por ejemplo "2026-11-20"
    time: { type: String, required: true }, // por ejemplo "15:30"
    status: { type: String, default: 'pending' },
    // Lista de servicios de la reserva. Arranca vacía.
    services: { type: [bookingServiceSchema], default: [] },
  },
  { versionKey: false }
);

const BookingModel = mongoose.model('Booking', bookingSchema);

export default BookingModel;