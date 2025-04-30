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
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser:true, useUnifiedTopology:true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Multer for image uploads
const storage = multer.diskStorage({
  destination: (req,file,cb) =>
    cb(null, path.join(__dirname,'public','uploads')),
  filename: (req,file,cb) =>
    cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Joi schema for validation
const validateRecipe = Joi.object({
  img_name:    Joi.string().min(1).required(),
  name:        Joi.string().min(3).required(),
  description: Joi.string().min(5).required(),
  ingredients: Joi.array().items(Joi.string()).required(),
  instructions:Joi.array().items(Joi.string()).required()
});

// Serve static assets
app.use(express.static(path.join(__dirname,'public')));
app.get('/', (req,res) =>
  res.sendFile(path.join(__dirname,'public','index.html'))
);

// READ all
app.get('/recipes', async (req,res) => {
  const recipes = await Recipe.find().sort('-createdAt');
  res.json(recipes);
});

// READ one
app.get('/recipes/:id', async (req,res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error:'Not found' });
    res.json(recipe);
  } catch {
    res.status(400).json({ error:'Invalid ID' });
  }
});

// CREATE (with picture upload)
app.post('/recipes', upload.single('picture'), async (req,res) => {
  const data = {
    img_name:    req.file ? `uploads/${req.file.filename}` : '',
    name:        req.body.name,
    description: req.body.description,
    ingredients: req.body.ingredients.split(','),
    instructions:req.body.instructions.split(',')
  };
  const { error } = validateRecipe.validate(data);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const recipe = new Recipe(data);
  await recipe.save();
  res.status(201).json(recipe);
});

// UPDATE
app.put('/recipes/:id', upload.single('picture'), async (req,res) => {
  const update = {
    ...(req.file && { img_name:`uploads/${req.file.filename}` }),
    name:        req.body.name,
    description: req.body.description,
    ingredients: req.body.ingredients.split(','),
    instructions:req.body.instructions.split(',')
  };
  const { error } = validateRecipe.validate(update);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, update, { new:true });
    if (!recipe) return res.status(404).json({ error:'Not found' });
    res.json(recipe);
  } catch {
    res.status(400).json({ error:'Invalid ID' });
  }
});

// DELETE
app.delete('/recipes/:id', async (req,res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ error:'Not found' });
    res.json({ message:'Deleted', recipe });
  } catch {
    res.status(400).json({ error:'Invalid ID' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
