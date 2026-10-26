// Importamos Express, la librería que nos da el "mostrador"
import express from 'express';
import servicesRouter from './routes/services.router.js';

// Creamos la aplicación. "app" es el mostrador: acá se configuran las reglas
// y, más adelante, se conectan las ventanillas (rutas).
const app = express();

// MIDDLEWARE (el portero): todo pedido pasa por acá antes de llegar a una ruta.
// express.json() lee el body de los pedidos en formato JSON y lo deja
// disponible en req.body. Sin esta línea, req.body sería undefined
// y los POST y PUT no podrían leer los datos que envía el cliente.
app.use(express.json());

// Montamos el router: todo lo que empiece con /api/services se atiende en él.
// Va DESPUÉS del middleware y antes del export.
app.use('/api/services', servicesRouter);

// Exportamos la app para que otros archivos puedan usarla.
// Fijate que acá NO encendemos nada: solo dejamos el mostrador armado.
export default app;