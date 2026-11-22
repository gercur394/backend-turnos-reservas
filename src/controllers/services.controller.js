import ServicesService from "../services/services.service.js";

const servicesService = new ServicesService();

// GET /api/services
export const getServices = async (req, res) => {
  const services = await servicesService.getServices(req.query);
  res.status(200).json(services);
};


// GET /api/services/:sid 
export const getServiceById = async (req, res) => {
  const { sid } = req.params;
  const service = await servicesService.getServiceById(sid);

  if (!service) {
    return res.status(404).json({ error: `Servicio con id ${sid} no encontrado` });
  }

  res.status(200).json(service);
};


// POST /api/services
export const createService = async (req, res) => {
  try {
    const newService = await servicesService.createService(req.body);

    res.status(201).json(newService);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


//PUT /api/services/:sid
export const updateService = async (req, res) => {
  const { sid } = req.params;

  try {
    const updated = await servicesService.updateService(sid, req.body);

    if (!updated) {
      return res.status(404).json({ error: `Servicio con id ${sid} no encontrado` });
    }

    res.status(200).json(updated);
  } catch (error) {
    // Datos inválidos: el cliente se equivocó, no el servidor -> 400
    if (error.code === 'INVALID_DATA') {
      return res.status(400).json({ error: error.message });
    }

    // Cualquier otro error es inesperado: lo dejamos pasar para que Express responda 500
    throw error;
  }
};



//DELETE /api/services/:sid  
export const deleteService = async (req, res) => {
  const { sid } = req.params;
  const deleted = await servicesService.deleteService(sid);

  if (!deleted) {
    return res.status(404).json({ error: `Servicio con id ${sid} no encontrado` });
  }

  res.status(200).json(deleted);
};