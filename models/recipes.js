var mongoose = require("mongoose");

var ingredientSchema = mongoose.Schema({
	name: String,
	quantity: String,
});
// + isCheckedInShoppingList: Boolean, si on veut garder les elements cochés de la shoppingList

var authorSchema = mongoose.Schema({
	username: String,
	token: String,
});

var commentSchema = mongoose.Schema({
	author: String,
	date: Date,
	content: String,
});

var recipeSchema = mongoose.Schema({
	name: String,
	ingredients: [ingredientSchema],
	directions: String,
	servings: Number, //pour combien de personnes
	prepTime: Number, //en minutes
	cookTime: Number, //en minutes
	tags: Array, //tableau de strings
	author: authorSchema, //personne qui l'a importé ou créé dans hungrybook, et pas le cuisinier qui l'a inventé
	image: String, //url
	comments: [commentSchema],
	likeCount: Number, //nb de likes
	privateStatus: Boolean, //apparait dans le feed ou pas
});

module.exports = mongoose.model("recipes", recipeSchema);
