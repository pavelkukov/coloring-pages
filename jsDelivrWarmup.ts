const nFetch = require("node-fetch");
const pkg = require("./package.json");
const collection = require("./collection.json")

const getData = async (url: string, attempts = 0): Promise<void> => {
  try {
    await nFetch(url);
    console.log("Success: ", url);
  } catch (error) {
    console.log(error);
    if (attempts < 1) {
        getData(url, attempts + 1)
    }
  }
};

const baseURL =
        'https://cdn.jsdelivr.net/gh/pavelkukov/coloring-pages'
const version = pkg.version
const files = Object.keys(collection)
files.forEach(file => {
    getData(`${baseURL}@${version}/images/thumbnails/${file.replace('.svg', '.png')}`)
    getData(`${baseURL}@${version}/images/${file}`)
})
