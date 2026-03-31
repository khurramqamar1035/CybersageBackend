import Service from '../models/ServiceModel.js';


// ✅ Create new service
export const createService = async (req, res) => {
  try {
    const { serviceId, name, description, defaultSelected } = req.body;

    const existing = await Service.findOne({ serviceId });
    if (existing) {
      return res.status(400).json({ message: 'Service already exists' });
    }

    const service = new Service({
      serviceId,
      name,
      description,
      defaultSelected
    });

    await service.save();

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Get all services
export const getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ serviceId: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Get single service
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findOne({ serviceId: req.params.id });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Update service
export const updateService = async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { serviceId: req.params.id },
      req.body,
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Delete service
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({ serviceId: req.params.id });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};