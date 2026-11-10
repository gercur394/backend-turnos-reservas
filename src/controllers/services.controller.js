import ServiceManager from '../managers/ServiceManager.js';

const serviceManager = new ServiceManager();

// GET /api/services
export const getServices = async (req, res) => {
  const services = await serviceManager.getServices(req.query);
  res.status(200).json(services);
};


// GET /api/services/:sid 
export const getServiceById = async (req, res) => {
  const { sid } = req.params;
  const service = await serviceManager.getServiceById(sid);

  if (!service) {
    return res.status(404).json({ error: `Servicio con id ${sid} no encontrado` });
  }

  res.status(200).json(service);
};


// POST /api/services
export const createService = async (req, res) => {
  try {
    const newService = await serviceManager.addService(req.body);

    res.status(201).json(newService);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


//PUT /api/services/:sid   
export const updateService = async (req, res) => {
  const { sid } = req.params; 
  const updated = await serviceManager.updateService(sid, req.body);

  if (!updated) {
    return res.status(404).json({ error: `Servicio con id ${sid} no encontrado` });
  }

  res.status(200).json(updated);
};



//DELETE /api/services/:sid  
export const deleteService = async (req, res) => {
  const { sid } = req.params;
  const deleted = await serviceManager.deleteService(sid);

  if (!deleted) {
    return res.status(404).json({ error: `Servicio con id ${sid} no encontrado` });
  }

  res.status(200).json(deleted);
};