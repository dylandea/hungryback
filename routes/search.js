var express = require("express");
var router = express.Router();

var recipeModel = require("../models/recipes");
var userModel = require("../models/users");

router.post("/initial-fetch-myrecipes", async function (req, res, next) {
	var myAccount = await userModel
		.findOne({ token: req.body.token })
		.populate("addedRecipes")
		.populate("likedRecipes")
		.exec();

	let addedRecipes = myAccount.addedRecipes.reverse();
	let likedRecipes = myAccount.likedRecipes.reverse();

	res.json({
		addedRecipes: addedRecipes,
		likedRecipes: likedRecipes,
	});
});

module.exports = router;

router.post("/initial-fetch-feedrecipes", async function (req, res, next) {
	let allRecipes = await recipeModel.find();
	let allPublicRecipes = allRecipes.filter((x) => x.privateStatus === false);
	allPublicRecipes.reverse();

	res.json({ allPublicRecipes });
});

module.exports = router;
