import TeamMember from "../models/TeamMemberModel.js";
import Office from "../models/OfficeModel.js";
import { createTeamMemberSchema } from "../validators/teamMemberValidator.js";
import { createOfficeSchema } from "../validators/officeValidator.js";

// GET TEAM
export const getTeamMembers = async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ createdAt: 1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE TEAM
export const createTeamMember = async (req, res) => {
  try {
    const data = createTeamMemberSchema.parse(req.body);
    const member = await TeamMember.create(data);
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET OFFICES
export const getOffices = async (req, res) => {
  try {
    const offices = await Office.find().sort({ createdAt: 1 });
    res.json(offices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE OFFICE
export const createOffice = async (req, res) => {
  try {
    const data = createOfficeSchema.parse(req.body);
    const office = await Office.create(data);
    res.status(201).json(office);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
