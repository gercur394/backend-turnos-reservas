// Esta línea lee el archivo .env y carga sus valores en process.env.
// Tiene que ir primero, antes de leer cualquier variable.
import 'dotenv/config';

// Lista de variables que la app necesita para arrancar.
// Si mañana sumás otra (por ejemplo DB_URL), solo la agregás acá.
const REQUIRED_VARS = ['PORT', 'NODE_ENV'];

// Recorremos la lista y nos quedamos solo con las que NO tienen valor.
// "!process.env[name]" es verdadero si la variable no existe o está vacía.
const missing = REQUIRED_VARS.filter((name) => !process.env[name]);

// Si hay alguna faltante, avisamos cuáles son y frenamos la app.
if (missing.length > 0) {
  console.error(`Faltan variables de entorno requeridas: ${missing.join(', ')}`);
  console.error('Revisá tu archivo .env (podés guiarte con .env.example).');
  process.exit(1); // el 1 indica "terminó con error"
}

// Si llegamos hasta acá, están todas. Armamos un objeto prolijo
// para que el resto de la app use esto y no toque process.env directamente.
const config = {
  port: Number(process.env.PORT), // process.env siempre da texto, lo pasamos a número
  nodeEnv: process.env.NODE_ENV,
};

export default config;