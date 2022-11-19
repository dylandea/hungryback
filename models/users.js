var mongoose = require("mongoose");

var weeklyPlanSchema = mongoose.Schema({
	date: String,
	meal: { type: mongoose.Schema.Types.ObjectId, ref: "recipes" }
});

var shoppingListSchema = mongoose.Schema({
	name: String,
	quantity: String
});

var userSchema = mongoose.Schema({
	username: String,
	email: String,
	password: String,
	token: String,
	avatar: String, //url
	description: String,
	premiumStatus: Boolean,
	weeklyPlan: [weeklyPlanSchema],
	shoppingList: [shoppingListSchema],
	addedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "recipes" }],
	likedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "recipes" }],
});

module.exports = mongoose.model("users", userSchema);
