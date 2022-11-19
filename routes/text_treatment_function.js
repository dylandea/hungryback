module.exports = function (str) {
	let resultObj = {};
	//pre treatment
	var arr = str.split("\n");
	arr = arr.filter((x) => x !== "");
	//suppression des lignes vides creees par le split

	//title
	resultObj.name = arr[0];

	//ingredients : nom et quantite
	var regExIngredients = /^[+-]/;
	var ingredients = arr
		.filter((x) => x.match(regExIngredients))
		.map((x) => x.substring(2));
	//isole les ingredients, supprime la puce et le premier espace

	var regExQuantities =
		/[0-9]+ bocal|[0-9]+ ca*s|[0-9]+ quart|[0-9]+ ca*c|[0-9]+ gousses|[0-9]+gr*|[0-9]+kg|[0-9]+cl|^[0-9]+/i;
	//si les ingredients contiennent l'une des indications de quantites ciblees (1 nombre puis 1 texte cible), la filtre, sinon filtre juste le nombre
	var ingredientsSorted = [];
	ingredients.map((item, i) => {
		let obj = {};
		obj.quantity = item.match(regExQuantities)
			? item.match(regExQuantities)[0]
			: "";
		//si les ingredients ne contiennent pas de quantite chiffree, renvoie une string vide

		//traitement du nom de l'ingredient : supression des espaces et du "de" ou "d'"
		itemCleaned = item.replace(regExQuantities, "");
		itemCleaned = itemCleaned.trim();
		var regExDe = /^de |^d'/;
		if (itemCleaned.match(regExDe)) {
			itemCleaned = itemCleaned.substring(2);
			itemCleaned = itemCleaned.trim();
		}
		obj.name = itemCleaned;
		ingredientsSorted.push(obj);
		return item;
	});
	resultObj.ingredients = ingredientsSorted;

	//temps
	var regExTimings = /^tem/i;
	var timings = arr.filter((x) => x.match(regExTimings));
	//isole les str qui commencent par "tem"
	if (timings.length > 0) {
		var regExCookTime = /cui/i;
		var regExPrepTime = /pr/i;
		var cookTime = timings.filter((x) => x.match(regExCookTime));
		var prepTime = timings.filter((x) => x.match(regExPrepTime));
		//isole parmi les strings qui commencent par 'tem' celle qui contient "cui" ou "pr"

		var regTime = /[0-9]+/;
		var regMinutes = /min/;
		if (cookTime.length > 0) {
			var cookTimeNum = parseInt(cookTime[0].match(regTime));
			//transforme le cookTime en number si present
			if (!cookTime[0].match(regMinutes)) {
				cookTimeNum = cookTimeNum * 60;
				// si le cooktime n'est pas en minutes, le convertit en minutes
			}
			resultObj.cookTime = cookTimeNum;
		} else {
			resultObj.cookTime = "";
			//renvoie une string vide si le cooking time n'est pas recupere
		}
		if (prepTime.length > 0) {
			//meme principe que pour le cooktime
			var prepTimeNum = parseInt(prepTime[0].match(regTime));
			if (!prepTime[0].match(regMinutes)) {
				prepTimeNum = prepTimeNum * 60;
			}
			resultObj.prepTime = prepTimeNum;
		} else {
			resultObj.prepTime = "";
		}
	} else {
		resultObj.prepTime = "";
		resultObj.cookTime = "";
	}

	//nb personnes
	var regPax = /^Pour/i;
	var regPaxNumber = /[0-9]+/;
	let pax = parseInt(
		arr.filter((x) => x.match(regPax))[0].match(regPaxNumber)
	);
	//filtre le nombre de personnes a partir de "pour" et prend le prenier resultat de l'array (le seul)
	resultObj.servings = pax;

	//deroule
	var regExInstructions = /^Ins/;
	let directionBeginning =
		arr.findIndex((x) => x.match(regExInstructions)) + 1;
	//trouve l'index de "Instructions" dans l'array de la recette et ajoute 1
	resultObj.directions = arr.slice(directionBeginning).join("");
	// recupere tous les elements de l'array se situant apres "instructions"

	return resultObj;
};
