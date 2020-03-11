import * as fs from "fs";
import DifficultyEstimator, { Difficulty } from "./utils/DifficultyEstimator";

const collection: Collection = require("./collection.json");
const targetFiles = process.argv.slice(2);

console.log(targetFiles)

type CollectionItem = {
  size: number;
  difficulty: Difficulty;
};
type Collection = {
  [key: string]: CollectionItem;
};

async function fileDetails(file: string): Promise<CollectionItem> {
  const { size } = fs.statSync(`${__dirname}/images/${file}`);
  const estimator = new DifficultyEstimator(`./images/${file}`);

  return {
    size,
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
    fs.writeFileSync(
      "./collection.json",
      JSON.stringify(collection, null, "  ")
    );
  });
}

// collectData();
