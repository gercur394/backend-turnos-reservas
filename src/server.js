// Importamos la configuración. Al importar este archivo se ejecuta la validación:
// si falta alguna variable de entorno, la app se frena acá con un mensaje claro.
import config from './config/env.config.js';

// Importamos la aplicación ya armada
import app from './app.js';

// listen() abre la puerta del local: le dice a Node "empezá a escuchar
// pedidos en este puerto". El puerto sale del .env a través de config,
// por eso no escribimos 8080 a mano.
// La función de adentro se ejecuta una sola vez, cuando el servidor ya está listo.
app.listen(config.port, () => {
  console.log(`Servidor escuchando en el puerto ${config.port}`);
});