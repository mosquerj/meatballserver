// models/recipe.js
const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  img_name:   { type: String, required: true },
  name:       { type: String, required: true },
  description:{ type: String, required: true },
  ingredients:[String],
  instructions:[String],
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recipe', recipeSchema);
