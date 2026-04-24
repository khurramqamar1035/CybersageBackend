import Testimonial from "../models/TestimonialModel.js";
import {
  testimonialCreateSchema,
  testimonialUpdateSchema,
} from "../validators/testimonialschema.js";

export const createTestimonial = async (req, res) => {
  try {
    const data = testimonialCreateSchema.parse(req.body);
    const testimonial = await Testimonial.create(data);
    res.status(201).json(testimonial);
  } catch (err) {
    res.status(400).json({ error: "Operation failed. Please try again." });
  }
};

export const getTestimonials = async (req, res) => {
  const testimonials = await Testimonial.find().sort({ created_at: -1 });
  res.json(testimonials);
};

export const updateTestimonial = async (req, res) => {
  try {
    const data = testimonialUpdateSchema.parse(req.body);

    const testimonial = await Testimonial.findOneAndUpdate(
      { id: req.params.id }, // UUID field
      {
        $set: {
          ...data,
        },
      },
      { new: true }
    );

    if (!testimonial) {
      return res.status(404).json({ error: "Testimonial not found" });
    }

    res.json(testimonial);
  } catch {
    res.status(400).json({ error: "Operation failed. Please try again." });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {

    const testimonial = await Testimonial.findOneAndDelete({
      id: req.params.id, // UUID field
    });

    if (!testimonial) {
      return res.status(404).json({ error: "Testimonial not found" });
    }

    res.json({ message: "Testimonial deleted successfully" });
  } catch {
    res.status(400).json({ error: "Operation failed. Please try again." });
  }
};
