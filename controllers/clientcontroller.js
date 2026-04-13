import Client from "../models/ClientModel.js";
import {
  clientCreateSchema,
  clientUpdateSchema,
} from "../validators/clientschema.js";

export const createClient = async (req, res) => {
  try {
    const data = clientCreateSchema.parse(req.body);
    const client = await Client.create(data);
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ error: "Operation failed. Please try again." });
  }
};

export const getClients = async (req, res) => {
  const clients = await Client.find().sort({ order: 1, created_at: -1 });
  res.json(clients);
};

export const updateClient = async (req, res) => {
  try {
    const data = clientUpdateSchema.parse(req.body);

    const client = await Client.findOneAndUpdate(
      { id: req.params.id }, // UUID field
      {
        $set: {
          ...data,
        },
      },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json(client);
  } catch (err) {
    console.error("[CLIENT]", err.message);
    res.status(400).json({ error: "Operation failed. Please try again." });
  }
};

export const deleteClient = async (req, res) => {
  try {

    const client = await Client.findOneAndDelete({
      id: req.params.id, // UUID field
    });

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    res.json({ message: "Client deleted successfully" });
  } catch (err) {
    console.error("[CLIENT]", err.message);
    res.status(400).json({ error: "Operation failed. Please try again." });
  }
};
