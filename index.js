// index.js
require('dotenv').config();
const express  = require('express');
const path     = require('path');
const cors     = require('cors');
const Joi      = require('joi');
const mongoose = require('mongoose');
const multer   = require('multer');
const Recipe   = require('./models/recipe');

const app = express();
app.use(cors());
// parse JSON bodies
app.use(express.json());
// parse URL-encoded bodies (for form-data without files)
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Multer storage for file uploads (optional)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'public', 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Joi validation schema
const validateRecipe = Joi.object({
  img_name:    Joi.string().min(1).required(),
  name:        Joi.string().min(3).required(),
  description: Joi.string().min(5).required(),
  ingredients: Joi.array().items(Joi.string().min(1)).required(),
  instructions:Joi.array().items(Joi.string().min(1)).required()
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

// READ all
app.get('/recipes', async (req, res) => {
  const recipes = await Recipe.find().sort('-createdAt');
  res.json(recipes);
});

// READ one
app.get('/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Not found' });
    res.json(recipe);
  } catch {
    res.status(400).json({ error: 'Invalid ID' });
  }
});

// CREATE
app.post('/recipes', upload.single('picture'), async (req, res) => {
  // Handle ingredients/instructions as array or comma-separated string
  const ingredients = Array.isArray(req.body.ingredients)
    ? req.body.ingredients
    : req.body.ingredients.split(',').map(i => i.trim()).filter(Boolean);
  const instructions = Array.isArray(req.body.instructions)
    ? req.body.instructions
    : req.body.instructions.split(',').map(i => i.trim()).filter(Boolean);

  // Determine image name: file upload or JSON field
  const imgName = req.file
    ? `uploads/${req.file.filename}`
    : req.body.img_name;

  const data = {
    img_name: imgName,
    name: req.body.name,
    description: req.body.description,
    ingredients,
    instructions
  };

  const { error } = validateRecipe.validate(data);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const recipe = new Recipe(data);
    await recipe.save();
    res.status(201).json(recipe);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save recipe' });
  }
});

// UPDATE
app.put('/recipes/:id', upload.single('picture'), async (req, res) => {
  const ingredients = Array.isArray(req.body.ingredients)
    ? req.body.ingredients
    : req.body.ingredients.split(',').map(i => i.trim()).filter(Boolean);
  const instructions = Array.isArray(req.body.instructions)
    ? req.body.instructions
    : req.body.instructions.split(',').map(i => i.trim()).filter(Boolean);

  const update = {
    ...(req.file && { img_name: `uploads/${req.file.filename}` }),
    name: req.body.name,
    description: req.body.description,
    ingredients,
    instructions
  };

  const { error } = validateRecipe.validate({
    img_name: update.img_name || req.body.img_name,
    name: update.name,
    description: update.description,
    ingredients: update.ingredients,
    instructions: update.instructions
  });
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!recipe) return res.status(404).json({ error: 'Not found' });
    res.json(recipe);
  } catch {
    res.status(400).json({ error: 'Invalid ID' });
  }
});

// DELETE
app.delete('/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', recipe });
  } catch {
    res.status(400).json({ error: 'Invalid ID' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
