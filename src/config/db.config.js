import mongoose from 'mongoose';
import config from './env.config.js';

// Abre la conexión con MongoDB Atlas. Se llama UNA vez, al arrancar el servidor.
const connectDB = async () => {
  try {
    // mongoose.connect devuelve una promesa: con await esperamos a que la conexión esté lista.
    await mongoose.connect(config.mongoUri);
    console.log('Conectado a MongoDB');
  } catch (error) {
    // Si no se puede conectar, no tiene sentido seguir: avisamos y cortamos (fallar rápido).
    // Mostramos solo error.message y NUNCA la URI, porque contiene la contraseña.
    console.error('No se pudo conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;