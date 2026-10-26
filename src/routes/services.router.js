import { Router } from 'express';
import ServiceManager from '../managers/ServiceManager.js';

const router = Router();

const manager = new ServiceManager();

router.get('/', async (req, res) => {
  const services = await manager.getServices(req.query);
  res.status(200).json(services);
});


router.get('/:sid', async (req, res) => {
  // req.params guarda los parámetros de la URL. Acá sid llega como texto ("3").
  const { sid } = req.params;

  const service = await manager.getServiceById(sid);

  if (!service) {
    return res.status(404).json({ error: `Servicio con id ${sid} no encontrado` });
  }

  res.status(200).json(service);
});

// POST /api/services -> crea un servicio con los datos del body
router.post('/', async (req, res) => {
  try {
    // req.body trae el JSON que envió el cliente (gracias a express.json() en app.js).
    // El id NO se lee de acá: lo genera el manager internamente.
    const newService = await manager.addService(req.body);

    // 201 = "creado" (distinto de 200, que es "todo bien" en general)
    res.status(201).json(newService);
  } catch (error) {
    // addService lanza un error si faltan campos: respondemos 400 (pedido mal hecho)
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/services/:sid -> actualiza un servicio
router.put('/:sid', async (req, res) => {
  const { sid } = req.params; // el id sale de la URL
  const updated = await manager.updateService(sid, req.body); // los cambios salen del body

  // Si el manager devolvió null, el servicio no existe
  if (!updated) {
    return res.status(404).json({ error: `Servicio con id ${sid} no encontrado` });
  }

  res.status(200).json(updated);
});

// DELETE /api/services/:sid -> elimina un servicio
router.delete('/:sid', async (req, res) => {
  const { sid } = req.params;
  const deleted = await manager.deleteService(sid);

  if (!deleted) {
    return res.status(404).json({ error: `Servicio con id ${sid} no encontrado` });
  }

  // Devolvemos el servicio eliminado para que el cliente vea qué se borró
  res.status(200).json(deleted);
});

// Exportamos el router para montarlo en app.js
export default router;