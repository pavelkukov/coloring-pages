import React from "react";
import { storiesOf } from "@storybook/react";
import collection from "../collection";

Object.keys(collection).forEach(fileName => {
  const path = collection[fileName].path;
  collection[fileName].module = require(`../${path}`);
});

export default {
  title: "Coloring Pages"
};

const mainStory = storiesOf("Coloring Pages", module);

const ImageBlock = ({ fileName, module, path, difficulty, keywords }) => {
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
      <ul
        style={{
          padding: "10px 10px 0 10px",
          width: "100%"
        }}
      >
        <li>difficulty: {difficulty}</li>
        <li>keywords: {`"${keywords.join('", "')}"`}</li>
        <li>path: {path}</li>
      </ul>
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
