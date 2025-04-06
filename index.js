const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Array of meatball recipes (data from your previous meatballs.json)
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
  {
    "_id": 4,
    "img_name": "swedish.jpg",
    "name": "Swedish Meatballs",
    "description": "Soft and tender meatballs served with a creamy gravy and lingonberry sauce.",
    "ingredients": ["1 lb ground beef", "1/2 cup breadcrumbs", "1 egg", "1/4 cup parsley", "1/4 tsp nutmeg", "1/4 tsp allspice"],
    "instructions": ["Mix all ingredients in a bowl.", "Form into meatballs.", "Bake at 375°F for 20 minutes.", "Serve with creamy gravy and lingonberry sauce."]
  },
  {
    "_id": 5,
    "img_name": "bbq.jpg",
    "name": "BBQ Meatballs",
    "description": "Sweet and tangy BBQ-glazed meatballs, perfect for parties and gatherings.",
    "ingredients": ["1 lb ground beef", "1/2 cup breadcrumbs", "1 egg", "1/4 cup parsley", "1 cup BBQ sauce"],
    "instructions": ["Mix all ingredients except BBQ sauce in a bowl.", "Form into meatballs.", "Bake at 375°F for 20 minutes.", "Toss in BBQ sauce before serving."]
  },
  {
    "_id": 6,
    "img_name": "cheesy.jpg",
    "name": "Cheesy Meatballs",
    "description": "Stuffed with gooey mozzarella, these meatballs are a cheese lover's dream.",
    "ingredients": ["1 lb ground beef", "1/2 cup breadcrumbs", "1 egg", "1/4 cup parsley", "1/2 cup mozzarella cheese"],
    "instructions": ["Mix all ingredients except cheese in a bowl.", "Form into meatballs, stuffing each with a cube of mozzarella.", "Bake at 375°F for 20 minutes."]
  },
  {
    "_id": 7,
    "img_name": "teriyaki.jpg",
    "name": "Teriyaki Meatballs",
    "description": "Sweet and savory teriyaki-glazed meatballs, perfect for an Asian-inspired meal.",
    "ingredients": ["1 lb ground beef", "1/2 cup breadcrumbs", "1 egg", "1/4 cup parsley", "1/2 cup teriyaki sauce"],
    "instructions": ["Mix all ingredients except teriyaki sauce in a bowl.", "Form into meatballs.", "Bake at 375°F for 20 minutes.", "Toss in teriyaki sauce before serving."]
  },
  {
    "_id": 8,
    "img_name": "buffalo.jpg",
    "name": "Buffalo Meatballs",
    "description": "Spicy buffalo sauce-coated meatballs, perfect for game day.",
    "ingredients": ["1 lb ground beef", "1/2 cup breadcrumbs", "1 egg", "1/4 cup parsley", "1/2 cup buffalo sauce"],
    "instructions": ["Mix all ingredients except buffalo sauce in a bowl.", "Form into meatballs.", "Bake at 375°F for 20 minutes.", "Toss in buffalo sauce before serving."]
  }
];

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Landing page: Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint: Get all meatball recipes
app.get('/recipes', (req, res) => {
  res.json(meatballs);
});

// API endpoint: Get a specific recipe by ID
app.get('/recipes/:id', (req, res) => {
  const recipeId = parseInt(req.params.id, 10);
  const recipe = meatballs.find(item => item._id === recipeId);
  if (recipe) {
    res.json(recipe);
  } else {
    res.status(404).json({ error: 'Recipe not found' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mama's Meatballs server running on port ${PORT}`);
});
