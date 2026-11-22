import mongoose from 'mongoose';

// El schema es el "formulario" de un servicio: qué campos tiene y de qué tipo.
// No incluimos id: MongoDB genera solo el campo _id al guardar cada documento.
const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true }, // en minutos
    price: { type: Number, required: true },
    category: { type: String, required: true },
    available: { type: Boolean, required: true },
  },
  {
    // Por defecto Mongoose agrega un campo __v a cada documento. No lo necesitamos
    // y ensucia las respuestas, así que lo desactivamos.
    versionKey: false,
  },
  {
 timestamps: true
 }
);

// El modelo es el "empleado" que usa el formulario. 'Service' se convierte
// automáticamente en la colección "services" (en minúscula y plural).
const ServiceModel = mongoose.model('Service', serviceSchema);

export default ServiceModel;