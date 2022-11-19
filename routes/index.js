var express = require("express");
var router = express.Router();
var recipeModel = require("../models/recipes");
var userModel = require("../models/users");
var uniqid = require("uniqid");
var fs = require("fs");
var cloudinary = require("cloudinary").v2;

cloudinary.config({
	cloud_name: "cloud022",
	api_key: "252989959543114",
	api_secret: "yRgI4lzdRpXEzwUrzgzbn5dXN4s",
});

router.get("/", function (req, res, next) {
	res.send("respond with a resource");
});

//----- ROUTE AFFICHAGE FEED - GET USEEFFECT d'INITIALISATION
router.get("/get-feed", function (req, res, next) {
	res.send("respond with a resource");
});

//ROUTE VALIDATION FICHE RECETTE -POST ONPRESS
router.post("/upload-image", async function (req, res, next) {
	var filePath = "./tmp/" + uniqid() + ".jpg";
	var resultCopy = await req.files.image.mv(filePath);
	if (!resultCopy) {
		var resultCloud = await cloudinary.uploader.upload(filePath);

		//fonctionne sur l'OCR mais plus sur le load simple...
		let resultObj = {
			imageUrl: resultCloud.url,
		};
		fs.unlinkSync(filePath);
		res.json({ result: true, message: "File uploaded!", resultObj });
	} else {
		res.json({ result: false, message: resultCopy });
	}
});

router.post("/upload-image-camera", async function (req, res, next) {
	var filePath = "./tmp/" + uniqid() + ".jpg";
	var resultCopy = await req.files.image.mv(filePath);
	if (!resultCopy) {
		var resultCloud = await cloudinary.uploader.upload(filePath, {
			angle: 90,
		});
		//fonctionne sur l'OCR mais plus sur le load simple...
		let resultObj = {
			imageUrl: resultCloud.url,
		};

		fs.unlinkSync(filePath);
		res.json({ result: true, message: "File uploaded!", resultObj });
	} else {
		res.json({ result: false, message: resultCopy });
	}
});

router.post("/validate-form", async function (req, res, next) {
	//filtre les ingredients vides
	let ingredients = req.body.recipe.ingredients.filter((x) => x.name !== "");

	if (!req.body.recipe._id) {
		//creation de la recette dans la BDD
		var newRecipe = new recipeModel({
			name: req.body.recipe.name,
			ingredients: ingredients,
			directions: req.body.recipe.directions,
			servings: req.body.recipe.servings,
			prepTime: req.body.recipe.prepTime,
			cookTime: req.body.recipe.cookTime,
			tags: req.body.recipe.tags,
			author: { username: req.body.userName, token: req.body.userToken },
			image: req.body.recipe.image,
			comments: [],
			likeCount: 1,
			privateStatus: req.body.recipe.privateStatus,
		});
		var recipeSaved = await newRecipe.save();

		//enregistrement de la recette dans les likes de l'auteur user en cle etrangere
		var author = await userModel.findOne({ token: req.body.userToken });
		author.addedRecipes.push(recipeSaved._id);
		authorSaved = await author.save();

		let result = false;
		if (recipeSaved && authorSaved) {
			result = true;

			res.json({ result, recipeSaved });
		} else {
			res.json({ result });
		}
	} else {
		const filter = { _id: req.body.recipe._id };
		const update = {
			name: req.body.recipe.name,
			ingredients: ingredients,
			directions: req.body.recipe.directions,
			servings: req.body.recipe.servings,
			prepTime: req.body.recipe.prepTime,
			cookTime: req.body.recipe.cookTime,
			tags: req.body.recipe.tags,
			image: req.body.recipe.image,
			privateStatus: req.body.recipe.privateStatus,
		};

		let recipeUpdated = await recipeModel.findOneAndUpdate(filter, update, {
			new: true,
		});
		let result = false;
		if (recipeUpdated) {
			result = true;
			res.json({ result, recipeSaved: recipeUpdated });
		} else {
			res.json({ result });
		}
	}
});

router.post("/initial-fetch-calendar", async function (req, res, next) {
	var myAccount = await userModel
		.findOne({ token: req.body.token })
		.populate({
			path: "weeklyPlan",
			populate: {
				path: "meal",
				model: "recipes",
			},
		})
		.exec();

	let weeklyPlan = await myAccount.weeklyPlan;

	res.json({
		weeklyPlan,
	});
});

router.get("/ajout-auto-recettes-bdd", async function (req, res, next) {
	const name = [
		"pain perdu",
		"nougat",
		"Raviolis",
		"Gaufres",
		"Nutella Maison",
		"Pizza",
		"Burger",
		"Quiche",
		"Molotof",
		"Poulet basquaise",
		"Steak-frite",
	];
	const ingredients = [
		{ name: "Lait", quantity: "20cl" },
		{ name: "Carottes", quantity: "1" },
		{ name: "Farine", quantity: "20g" },
	];
	const directions =
		"Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela ! Faire ceci puis cela !";
	const servings = 2;
	const prepTime = "20mn";
	const cookTime = "30mn";
	const tags = [
		"entrée",
		"plat",
		"dessert",
		"amuse-bouche",
		"boisson",
		"asiatique",
		"américain",
		"italien",
		"diététique",
		"végétarien",
		"rapide",
		"gastronomique",
		"recette de fête",
		"brunch",
	];
	const author = {
		username: "Test",
		token: "mgUDphTfzF-cbidoQw3oELP89TK9Jj0R",
	};
	const image = [
		"http://res.cloudinary.com/cloud022/image/upload/v1659521229/vbf6mpmtrgciynrjxldt.jpg",
		"http://res.cloudinary.com/cloud022/image/upload/v1659535480/erwazj8fekuu8jyxld25.jpg",
		"http://res.cloudinary.com/cloud022/image/upload/v1659541191/p8yg4da5nvs755ws779o.jpg",
		"https://res.cloudinary.com/cloud022/image/upload/v1659520138/default-placeholder_ddf2uy.png",
		"http://res.cloudinary.com/cloud022/image/upload/v1659543413/mrztdjsmkhdc8as30gfj.jpg",
		"http://res.cloudinary.com/cloud022/image/upload/v1659544251/eib4cwazsb8eocsmmqfk.jpg",
		"http://res.cloudinary.com/cloud022/image/upload/v1659544857/vvdxzw8axpdfiof1bkxp.jpg",
	];
	const privateStatus = [true, false];

	//creation des recettes dans la BDD

	for (let i = 0; i < name.length; i++) {
		let newRecipe = new recipeModel({
			name: name[Math.floor(Math.random() * 11)],
			ingredients: ingredients,
			directions: directions,
			servings: servings,
			prepTime: prepTime,
			cookTime: cookTime,
			tags: [tags[Math.floor(Math.random() * 14)]],
			author: author,
			image: image[Math.floor(Math.random() * 7)],
			comments: [],
			likeCount: 1,
			privateStatus: privateStatus[Math.floor(Math.random() * 2)],
		});
		let recipeSaved = await newRecipe.save();
	}

	res.json({});
});

module.exports = router;
