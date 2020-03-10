import * as fs from "fs";
import * as cheerio from "cheerio";
import DifficultyEstimator, { Difficulty } from "./utils/DifficultyEstimator";

type CollectionItem = {
  size: number;
  title: string;
  description: string;
  keywords: string;
  date: string;
  path: string;
  difficulty: Difficulty;
};
type Collection = {
  [key: string]: CollectionItem;
};

const collection: Collection = {};

async function fileDetails(file: string): Promise<CollectionItem> {
  const contents = fs.readFileSync(`${__dirname}/images/${file}`, "utf8");
  const $ = cheerio.load(contents);
  const title = $("rdf\\:Description").attr("dc:title");
  const description = $("rdf\\:Description").attr("dc:description");
  const keywords = $("rdf\\:Description")
    .attr("dc:keywords")
    .split(",")
    .map(e => e.trim());
  const date = $("rdf\\:Description").attr("dc:date");
  const estimator = new DifficultyEstimator(`./images/${file}`);

  return {
    size: contents.length,
    title,
    description,
    keywords,
    date,
    path: `images/${file}`,
    difficulty: await estimator.estimate()
  };
}

function collectData() {
  const promisses = [];
  fs.readdirSync("images").forEach(file => {
    const promise = fileDetails(file);
    promise.then(data => {
      collection[file] = data;
    });
    promisses.push(promise);
  });
  Promise.all(promisses).then(() => {
      fs.writeFileSync('./collection.json', JSON.stringify(collection, null, '  '))
  });
}

collectData()
