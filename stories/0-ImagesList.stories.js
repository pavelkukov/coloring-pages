import React from "react";
import { storiesOf } from "@storybook/react";
import collection from "../collection";

Object.keys(collection).forEach(fileName => {
  collection[fileName].module = require(`../images/${fileName}`);
});

export default {
  title: "Coloring Pages"
};

const mainStory = storiesOf("Coloring Pages", module);

const ImageBlock = ({ fileName, module, difficulty, source, categories, author }) => {
  return (
    <div style={{maxWidth: 'calc(100% - 80px)'}}>
      <img
        style={{
          maxWidth: "50%",
          maxHeight: "calc(100vh - 150px)",
          float: 'left',
          margin: '20px'
        }}
        src={module}
      />
      <h1>{fileName}</h1>
      <h2>Estimated Difficulty</h2>
      <ul
        style={{
          padding: "10px 10px 0 10px",
          width: "100%"
        }}
      >
        <li>total empty areas: {difficulty.totalAreas}</li>
        <li>small areas: {difficulty.smallAreas}</li>
        <li>medium-small areas: {difficulty.mediumAreas}</li>
      </ul>
      <div>Categories: {categories.join(', ')}</div>
      <div>Author: {author}</div>
      {source !== '' && (<a target="blank" href={source}>Source: {source}</a>)}
      <div>Changes: Yes, changes were made to the original</div>
      <div>License: <a href="http://creativecommons.org/licenses/by-sa/4.0/">Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)</a></div>
    </div>
  );
};

{
  Object.keys(collection).map(fileName => {
    return mainStory.add(fileName, () => (
      <ImageBlock fileName={fileName} {...collection[fileName]} />
    ));
  });
}
