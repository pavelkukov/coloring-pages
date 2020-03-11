import * as fs from "fs";
import DifficultyEstimator, { Difficulty } from "./utils/DifficultyEstimator";

const targetFiles = process.argv.slice(2).map(filePath => {
  return filePath
    .replace("\\", "/")
    .split("/")
    .pop();
});

type CollectionItem = {
  size: number;
  difficulty: Difficulty;
};
type Collection = {
  [key: string]: CollectionItem;
};
const collection: Collection = require("./collection.json");

async function fileDetails(file: string): Promise<CollectionItem> {
  const { size } = fs.statSync(`${__dirname}/images/${file}`);
  const estimator = new DifficultyEstimator(`./images/${file}`);

  return {
    size,
    difficulty: await estimator.estimate()
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

  fs.writeFileSync("./collection.json", JSON.stringify(collection, null, "  "));
}

process.nextTick(async () => {
    await collectData();
    setTimeout(() => {}, 10000)
})
