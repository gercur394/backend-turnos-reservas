import config from './config/env.config.js';
import ServiceManager from './managers/ServiceManager.js';

console.log(`Entorno: ${config.nodeEnv} | Puerto configurado: ${config.port}\n`);

const manager = new ServiceManager();

async function demo() {
  // Listar todos los servicios
  const services = await manager.getServices();
  console.log(`Servicios disponibles: ${services.length}`);

  // Buscar por id (existente y no existente)
  console.log('Servicio id 1:', await manager.getServiceById(1));
  console.log('Servicio id 99:', await manager.getServiceById(99));

  // Agregar un servicio nuevo (el id lo genera el manager)
  const nuevo = await manager.addService({
    name: 'Barba',
    description: 'Perfilado y recorte de barba',
    duration: 20,
    price: 5000,
    category: 'Peluquería',
    available: true,
  });
  console.log('Agregado:', nuevo);

  // Intentar agregar un servicio incompleto
  try {
    await manager.addService({ name: 'Servicio incompleto' });
  } catch (error) {
    console.log('Rechazado:', error.message);
  }

  // Actualizar (el id no se puede modificar)
  console.log('Actualizado:', await manager.updateService(nuevo.id, { price: 6000 }));

  // Eliminar el servicio de prueba para dejar el JSON como estaba
  console.log('Eliminado:', await manager.deleteService(nuevo.id));
}

// Si algo falla inesperadamente, mostramos el error y salimos con código 1
demo().catch((error) => {
  console.error('Error inesperado:', error.message);
  process.exit(1);
});