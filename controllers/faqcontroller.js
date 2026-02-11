import FAQ from "../models/FAQModel.js";
import {
  faqCreateSchema,
  faqUpdateSchema,
} from "../validators/faqschema.js";

export const createFAQ = async (req, res) => {
  try {
    const data = faqCreateSchema.parse(req.body);
    const faq = await FAQ.create(data);
    res.status(201).json(faq);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getFAQs = async (req, res) => {
  const faqs = await FAQ.find().sort({ order: 1 });
  res.json(faqs);
};

export const updateFAQ = async (req, res) => {
  try {
    console.log("update faq hit ----------");
    console.log("UUID:", req.params.id);

    const data = faqUpdateSchema.parse(req.body);

    const faq = await FAQ.findOneAndUpdate(
      { id: req.params.id }, // UUID field
      {
        $set: {
          ...data,
          updated_at: new Date(),
        },
      },
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({ error: "FAQ not found" });
    }

    res.json(faq);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};


export const deleteFAQ = async (req, res) => {
  try {
    console.log("delete faq hit ----------");
    console.log("UUID:", req.params.id);

    const faq = await FAQ.findOneAndDelete({
      id: req.params.id, // UUID field
    });

    if (!faq) {
      return res.status(404).json({ error: "FAQ not found" });
    }

    res.json({ message: "FAQ deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
