require('dotenv').config()
const express  = require('express')
const path     = require('path')
const cors     = require('cors')
const Joi      = require('joi')
const mongoose = require('mongoose')
const multer   = require('multer')
const Recipe   = require('./models/recipe')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'public', 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
})
const upload = multer({ storage })

const schema = Joi.object({
  img_name:    Joi.string().min(1).required(),
  name:        Joi.string().min(3).required(),
  description: Joi.string().min(5).required(),
  ingredients: Joi.array().items(Joi.string().min(1)).required(),
  instructions:Joi.array().items(Joi.string().min(1)).required()
})

app.use(express.static(path.join(__dirname, 'public')))
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')))

app.get('/recipes', async (req, res) => {
  const recipes = await Recipe.find().sort('-createdAt')
  res.json(recipes)
})

app.get('/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
    if (!recipe) return res.status(404).json({ error: 'Not found' })
    res.json(recipe)
  } catch {
    res.status(400).json({ error: 'Invalid ID' })
  }
})

app.post('/recipes', upload.single('picture'), async (req, res) => {
  const ingredients = Array.isArray(req.body.ingredients)
    ? req.body.ingredients
    : (req.body.ingredients || '').split(',').map(s => s.trim()).filter(Boolean)
  const instructions = Array.isArray(req.body.instructions)
    ? req.body.instructions
    : (req.body.instructions || '').split(',').map(s => s.trim()).filter(Boolean)
  const data = {
    img_name: req.file ? `uploads/${req.file.filename}` : req.body.img_name,
    name: req.body.name,
    description: req.body.description,
    ingredients,
    instructions
  }
  const { error } = schema.validate(data)
  if (error) return res.status(400).json({ error: error.details[0].message })
  try {
    const recipe = new Recipe(data)
    await recipe.save()
    res.status(201).json(recipe)
  } catch {
    res.status(500).json({ error: 'Failed to save recipe' })
  }
})

app.put('/recipes/:id', upload.single('picture'), async (req, res) => {
  const ingredients = Array.isArray(req.body.ingredients)
    ? req.body.ingredients
    : (req.body.ingredients || '').split(',').map(s => s.trim()).filter(Boolean)
  const instructions = Array.isArray(req.body.instructions)
    ? req.body.instructions
    : (req.body.instructions || '').split(',').map(s => s.trim()).filter(Boolean)
  const update = {
    ...(req.file && { img_name: `uploads/${req.file.filename}` }),
    name: req.body.name,
    description: req.body.description,
    ingredients,
    instructions
  }
  const { error } = schema.validate({
    img_name: update.img_name || req.body.img_name,
    name: update.name,
    description: update.description,
    ingredients: update.ingredients,
    instructions: update.instructions
  })
  if (error) return res.status(400).json({ error: error.details[0].message })
  try {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!recipe) return res.status(404).json({ error: 'Not found' })
    res.json(recipe)
  } catch {
    res.status(400).json({ error: 'Invalid ID' })
  }
})

app.delete('/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id)
    if (!recipe) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Deleted', recipe })
  } catch {
    res.status(400).json({ error: 'Invalid ID' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
