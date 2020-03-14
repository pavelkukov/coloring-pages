import * as fs from "fs";
import * as cheerio from 'cheerio'
import DifficultyEstimator, { Difficulty } from "./utils/DifficultyEstimator";

type CollectionItem = {
  size: number;
  difficulty: Difficulty;
  date: string;
  source: string;
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
  const $ = cheerio.load(content)
  const dateTag = $('dc\\:date');
  const sourceTag = $('dc\\:source');
  const date = dateTag.length ? dateTag.text() : '2020-03-01'
  const source = sourceTag.length ? sourceTag.text() : ''
  const estimator = new DifficultyEstimator(`./images/${file}`);

  return {
    size,
    difficulty: await estimator.estimate(),
    date,
    source
  };
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

  let acknowledgments = `## Acknowledgments \n\n`
  Object.keys(collection).forEach(fileName => {
      const {source} = collection[fileName]
      if (source.length) {
          acknowledgments += `* ${fileName} - ${source}\n`
      }
  })
  fs.writeFileSync("./Acknowledgments.md", acknowledgments);
  fs.writeFileSync("./collection.json", JSON.stringify(collection, null, "  "));
}

collectData();
