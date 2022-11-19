var express = require("express");
var router = express.Router();
const { default: mongoose } = require("mongoose");
const puppeteer = require("puppeteer");
const treatText = require("./text_treatment_function");
const treatWeb = require("./web_treatment_function");
// const Tesseract = require("tesseract.js");
const tesseract = require("node-tesseract-ocr");

//-------ROUTE TESSERACT - POST
router.post("/tesseract", async function (req, res, next) {
    var image = req.body.image;

    const config = {
        lang: "fra",
        oem: 3,
        psm: 3,
    };
    tesseract
        .recognize(image, config)
        .then((text) => {
            var resultObj = treatText(text);

            res.json({ recipeTreated: resultObj });
        })
        .catch((error) => {
            res.json({ message: "err" });
        });

    // Tesseract.recognize(image, "fra", { logger: (m) => console.log(m) })
    // 	.then(({ data: { text } }) => {
    // 		var resultObj = treatText(text);

    // 		res.json({ recipeTreated: resultObj });
    // 	})
    // 	.catch((error) => {
    // 		res.json({ message: "err" });
    // 	});
});

//------ROUTE URL SCRAPPER-POST
router.post("/url-scrapper", async function (req, res, next) {
    const iPhone = puppeteer.devices["iPhone 13"];

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    /*  await page.emulate(iPhone); */

    await page.goto(req.body.url);
    const html = await page.content();

    var htmlArr = html.split("\n");
    htmlArr = htmlArr.filter((x) => x !== "");
    var htmlArrShort = htmlArr.slice(0, 30);

    var isImg = (element) =>
        element.includes(
            'meta property="og:image" content="https://www.ptitchef.com/imgupl/'
        );
    var indexImg = htmlArrShort.findIndex(isImg);
    var img = htmlArrShort[indexImg];
    let regExImg = /https:.+jpg/i;
    let imgUrl = img.match(regExImg)[0];

    //prend code source, mais certaines pages n'affichent rien comme React
    // const extractedText = await page.$eval('*', (el) => el.innerText);

    //fais un copier coller à la main
    var extractedText1 = await page.$eval("*", (el) => {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNode(el);
        selection.removeAllRanges();
        selection.addRange(range);
        return window.getSelection().toString();
    });

    // await page.screenshot({ path: './tmp/puppeteer/url_screenshot.jpg', fullPage: true });
    // await page.pdf({ path: './tmp/puppeteer/puppet.pdf', format: 'a4' });

    const dimensions = await page.evaluate(() => {
        return {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
            deviceScaleFactor: window.devicePixelRatio,
        };
    });

    await browser.close();
    extractedText1 = extractedText1 + imgUrl;
    var resultObj = treatWeb(extractedText1);

    res.json({ status: true, recipe: resultObj });
});

router.get("/tesseract", async function (req, res, next) {
    var image = "./tests/images/ok/ochazuke_9.png";

    const config = {
        lang: "fra",
        oem: 3,
        psm: 3,
    };
    tesseract
        .recognize(image, config)
        .then((text) => {
            var resultObj = treatText(text);
            res.json({ resultObj });
        })
        .catch((error) => {
            res.json({ message: "err" });
        });
});

module.exports = router;
