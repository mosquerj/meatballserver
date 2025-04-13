const express = require('express');
const path = require('path');
const cors = require('cors');
const Joi = require('joi'); // Import Joi for validation

const app = express();

app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Array of meatball recipes
const meatballs = [
  {
    "_id": 1,
    "img_name": "classic.jpg",
    "name": "Classic Meatballs",
    "description": "Juicy and flavorful, these classic meatballs are perfect for pasta or subs.",
    "ingredients": ["1 lb ground beef", "1/2 cup breadcrumbs", "1 egg", "1/4 cup parsley", "Salt and pepper to taste"],
    "instructions": ["Mix all ingredients in a bowl.", "Form into meatballs.", "Bake at 375°F for 20 minutes."]
  },
  {
    "_id": 2,
    "img_name": "spicy.jpg",
    "name": "Spicy Meatballs",
    "description": "Add a kick to your meal with these spicy meatballs, made with chili and garlic.",
    "ingredients": ["1 lb ground beef", "1/2 cup breadcrumbs", "1 egg", "1/4 cup parsley", "1 tsp chili flakes", "2 cloves garlic"],
    "instructions": ["Mix all ingredients in a bowl.", "Form into meatballs.", "Bake at 375°F for 20 minutes."]
  },
  {
    "_id": 3,
    "img_name": "veggie.jpg",
    "name": "Veggie Meatballs",
    "description": "A vegetarian twist on the classic, made with chickpeas and fresh herbs.",
    "ingredients": ["1 can chickpeas", "1/2 cup breadcrumbs", "1 egg", "1/4 cup parsley", "1/4 cup cilantro", "Salt and pepper to taste"],
    "instructions": ["Mash chickpeas in a bowl.", "Mix in other ingredients.", "Form into meatballs.", "Bake at 375°F for 20 minutes."]
  },
  // ... other recipes as needed
];

// Define a Joi schema for validating new recipe data
const recipeSchema = Joi.object({
  img_name: Joi.string().min(3).required(),
  name: Joi.string().min(3).required(),
  description: Joi.string().min(5).required(),
  ingredients: Joi.array().items(Joi.string().min(1)).required(),
  instructions: Joi.array().items(Joi.string().min(1)).required()
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Landing page: Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET endpoint: Return all meatball recipes
app.get('/recipes', (req, res) => {
  res.json(meatballs);
});

// GET endpoint: Return a specific recipe by ID
app.get('/recipes/:id', (req, res) => {
  const recipeId = parseInt(req.params.id, 10);
  const recipe = meatballs.find(item => item._id === recipeId);
  if (recipe) {
    res.json(recipe);
  } else {
    res.status(404).json({ error: 'Recipe not found' });
  }
});

// POST endpoint: Validate and add a new recipe
app.post('/recipes', (req, res) => {
  // Validate the incoming data with Joi
  const { error, value } = recipeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // Generate a new _id (assumes IDs are numeric)
  const newId = meatballs.length > 0 ? Math.max(...meatballs.map(r => r._id)) + 1 : 1;
  const newRecipe = { _id: newId, ...value };

  // Add the new recipe to the array
  meatballs.push(newRecipe);

  return res.status(201).json({ message: 'Recipe added successfully', recipe: newRecipe });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mama's Meatballs server running on port ${PORT}`);
});
