var express = require("express");
var router = express.Router();

var recipeModel = require("../models/recipes");
var userModel = require("../models/users");

router.post("/check-author", async function (req, res, next) {
	var myAccount = await userModel
		.findOne({ token: req.body.token })
		.populate("addedRecipes")
		.populate("likedRecipes")
		.exec();

	var AmITheAuthor = false;
	myAccount.addedRecipes.includes(req.body._id)
		? (AmITheAuthor = true)
		: (AmITheAuthor = false);

	res.json({ AmITheAuthor });
});

router.post("/like-recipe", async function (req, res, next) {
	var likedRecipe = await recipeModel.findOne({ _id: req.body.id });
	likedRecipe.likeCount = Number(likedRecipe.likeCount) + 1;
	likedRecipeSaved = await likedRecipe.save();

	var user = await userModel.findOne({ token: req.body.token });
	user.likedRecipes.push(likedRecipeSaved._id);
	userSaved = await user.save();

	res.json({
		likedRecipes: userSaved.likedRecipes,
		likeCount: likedRecipeSaved.likeCount,
	});
});

router.post("/dislike-recipe", async function (req, res, next) {
	var likedRecipe = await recipeModel.findOne({ _id: req.body.id });
	likedRecipe.likeCount = Number(likedRecipe.likeCount) - 1;
	likedRecipeSaved = await likedRecipe.save();

	var user = await userModel.findOne({ token: req.body.token });
	var index = user.likedRecipes.findIndex((x) => x == likedRecipeSaved._id);
	user.likedRecipes.splice(index, 1);
	userSaved = await user.save();

	res.json({
		likedRecipes: userSaved.likedRecipes,
		likeCount: likedRecipeSaved.likeCount,
	});
});

router.post("/delete-recipe", async function (req, res, next) {
	var deleteRecipe = await recipeModel.deleteOne({ _id: req.body.id });

	var result = false;
	if (deleteRecipe.deletedCount == 1) {
		result = true;
	}
	res.json({ result });
});

router.post("/save-comment", async function (req, res, next) {
	var recipe = await recipeModel.findOne({ _id: req.body.id });

	recipe.comments.push({
		author: req.body.username,
		date: new Date(),
		content: req.body.content,
	});
	var newRecipe = await recipe.save();

	res.json({ newComments: JSON.stringify(newRecipe.comments) });
});

//ROUTE AJOUT A recipesAdded HOMESCREEN
router.post("/add-recipe-to-myrecipes", async function (req, res, next) {
	var recipe = JSON.parse(req.body.recipe);
	var user = await userModel.findOne({ token: req.body.token });
	user.addedRecipes.push(recipe._id);
	var newUser = await user.save();

	res.json({ addedRecipes: JSON.stringify(newUser.addedRecipes) });
});

router.post("/delete-recipe-to-myrecipes", async function (req, res, next) {
	var recipe = JSON.parse(req.body.recipe);

	var user = await userModel.findOne({ token: req.body.token });

	var index = user.addedRecipes.findIndex((x) => x == recipe._id);

	user.addedRecipes.splice(index, 1);

	var newUser = await user.save();

	res.json({ addedRecipes: JSON.stringify(newUser.addedRecipes) });
});

router.post("/initial-fetch-recipesheet", async function (req, res, next) {
	var user = await userModel.findOne({ token: req.body.token });
	/* var recipe = await recipeModel.findOne({ _id: req.body.id}) */ //pour mettre à jour commentaires dès qu'il y en a un nouveau, ou même les addedRecipes, LikedRecipes et n'importe quel changement dans la page

	res.json({
		addedRecipes: user.addedRecipes,
		likedRecipes: user.likedRecipes,
	});
});

//ROUTE AJOUT A LA SHOPPING LIST
router.post("/addToShoppingList", async function (req, res, next) {
	var recipe = JSON.parse(req.body.recipe);
	var user = await userModel.findOne({ token: req.body.token });
	// var oldShoppingListeNames = user.shoppingList.filter(x=>x.name)
	// var oldShoppingListequantity = user.shoppingList.filter(x=>x.quantity)
	// var newShoppingListe = []
	recipe.ingredients.forEach((x) => {
		// if (oldShoppingListe.includes()) {

		// }
		user.shoppingList.push({ name: x.name, quantity: x.quantity });
	});

	var newUser = await user.save();

	res.json({ shoppingList: newUser.shoppingList });
});

router.post("/initial-fetch-shoppingList", async function (req, res, next) {
	var user = await userModel.findOne({ token: req.body.token });

	res.json({ shoppingList: user.shoppingList });
});

router.post("/delete-selected-shoppingList", async function (req, res, next) {
	var user = await userModel.findOne({ token: req.body.token });
	user.shoppingList = user.shoppingList.filter(
		(x) => !JSON.parse(req.body.selection).includes(x._id)
	);
	newUser = await user.save();
	res.json({ shoppingList: newUser.shoppingList });
});

router.post("/delete-all-shoppingList", async function (req, res, next) {
	var user = await userModel.findOne({ token: req.body.token });
	user.shoppingList = [];
	newUser = await user.save();

	res.json({ shoppingList: [] });
});

//ROUTE AJOUT AU SEMAINIER
router.post("/addToWeeklyList", async function (req, res, next) {
	var user = await userModel.findOne({ token: req.body.token });
	let meal = {
		date: req.body.date,
		meal: req.body.recipe,
	};
	user.weeklyPlan.push(meal);
	var userSaved = await user.save();
	if (userSaved) {
		res.json({ result: true });
	} else {
		res.json({ result: false });
	}
});

module.exports = router;
