import * as fs from "fs";
import * as cheerio from "cheerio";
import DifficultyEstimator, { Difficulty } from "./utils/DifficultyEstimator";

type CollectionItem = {
  size: number;
  difficulty: Difficulty;
  date: string;
  source: string;
  categories: Array<string>;
};
type Collection = {
  [key: string]: CollectionItem;
};
let collection: Collection;

try {
  collection = require("./collection.json");
} catch (e) {
  collection = {};
}

const targetFiles = process.argv.slice(2).map(filePath => {
  return filePath
    .replace("\\", "/")
    .split("/")
    .pop();
});

async function fileDetails(file: string): Promise<CollectionItem> {
  const { size } = fs.statSync(`${__dirname}/images/${file}`);
  const content = fs.readFileSync(`${__dirname}/images/${file}`);
  const $ = cheerio.load(content);
  const dateTag = $("dc\\:date");
  const sourceTag = $("dc\\:source");
  const date = dateTag.length ? dateTag.text() : "2020-03-01";
  const source = sourceTag.length ? sourceTag.text() : "";
  const estimator = new DifficultyEstimator(`./images/${file}`);
  const categories = [];
  const keywords = $("rdf\\:Bag  rdf\\:li");
  keywords.each(function() {
    categories.push($(this).text());
  });
  return {
    size,
    difficulty: await estimator.estimate(),
    date,
    source,
    categories
  };
}

function updateReadMe(collection: Collection): void {
  let readMe = fs.readFileSync("./README.md", "utf8").toString();
  let categories = [];
  Object.keys(collection).forEach(fileName => {
    categories = categories.concat(collection[fileName].categories);
  });
  categories = categories.filter((v, i, a) => a.indexOf(v) === i)
  const catsStr = categories.sort().join("\n* ");
  readMe = readMe.replace(
    /> Listed alphabetically -  a-z[\s\S]{0,}(.*?)[\s\S]{0,}> totally/gim,
    `> Listed alphabetically -  a-z\n\n* ${catsStr}\n\n> totally`
  );
  const totalText = `totally ${categories.length} categories for ${
    Object.keys(collection).length
  } images`;
  readMe = readMe.replace(
    /totally [0-9]{1,} categories for [0-9]{1,} images/gi,
    totalText
  );
  fs.writeFileSync("./README.md", readMe);
}

function updateAcknowledgments(collection) {
  let acknowledgments = `## Acknowledgments \n\n`;
  Object.keys(collection).forEach(fileName => {
    const { source } = collection[fileName];
    if (source.length) {
      acknowledgments += `* ${fileName} - ${source}\n`;
    }
  });
  fs.writeFileSync("./Acknowledgments.md", acknowledgments);
}

async function collectData() {
  const promisses = [];
  fs.readdirSync("images").forEach(file => {
    if (targetFiles.length && !targetFiles.includes(file)) {
      return;
    }
    const promise = fileDetails(file);
    promise.then(data => {
      collection[file] = data;
    });
    promisses.push(promise);
  });

  await Promise.all(promisses);

  updateAcknowledgments(collection);
  updateReadMe(collection);

  fs.writeFileSync("./collection.json", JSON.stringify(collection, null, "  "));
}

collectData();
