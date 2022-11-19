module.exports = function (str) {
	let resultObj = {};
	//pre treatment
	var arr = str.split("\n");
	arr = arr.filter((x) => x !== "");
	//suppression des lignes vides creees par le split

	//DElimitation de l'array
	var isHomeElement = (element) => element.includes("Home - Ptitchef");
	var indexName = arr.findIndex(isHomeElement) + 1;
	var isEndElement = (element) =>
		element.includes("Signaler une erreur dans le texte de la recette");
	var indexEnd = arr.findIndex(isEndElement);
	let workArr = arr.slice(indexName, indexEnd);

	//Recipe Name
	resultObj.name = arr[indexName];

	//servings
	resultObj.servings = parseInt(
		workArr.find((value) => /^[0-9] parts/.test(value)).match(/[0-9]/)[0]
	);

	//temps de preparation et cuisson
	let regExTime = /^[0-9]+ min/;
	let timings = workArr.filter((x) => x.match(regExTime));
	//attention, ne fonctionne que sur des temps en minutes
	//let regExTime = /^[0-9]+ min|^[0-9] h [0-9]+ m/
	//regex pour inclure resultats en heures selon ptichef puis faire un traitement conditionnel si h ... si min...
	resultObj.prepTime = parseInt(timings[0].match(/[0-9]+/));
	resultObj.cookTime = parseInt(timings[1].match(/[0-9]+/));

	//ingredients

	let ingredients = workArr.filter((value) =>
		/^[0-9]+ (?!min|parts|Kcal|réponse+|h)/.test(value)
	);

	var regExQuantities =
		/[0-9]+ bocal|[0-9]+ ca*s|[0-9]+ quart|[0-9]+ ca*c|[0-9]+ gousses|[0-9]+ gr*|[0-9]+ kg|[0-9]+ cl|^[0-9]+/i;
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
		obj.name = itemCleaned.slice(0, 15);
		ingredientsSorted.push(obj);
		return item;
	});
	resultObj.ingredients = ingredientsSorted;

	//directions

	var isPrepaElement = (element) => /^Préparation$/.test(element);
	var indexBeg = workArr.findIndex(isPrepaElement);
	let directions = [];
	for (let i = indexBeg + 1; i < indexEnd; i++) {
		directions.push(workArr[i]);
	}
	resultObj.directions = directions.join("");

	//image
	let regExImg = /https:.+jpg/i;
	let imgUrl = arr.findIndex((element) => regExImg.test(element));
	resultObj.image = arr[imgUrl];

	return resultObj;
};
