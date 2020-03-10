# Coloring Pages
Coloring pages for kids in vector format (SVG). Each image is drawn with pure black lines on a transparent background.

## collection.json
List of all images from "images" folder. Details are available against each image. They include metadata, path and difficulty estimate.

## Metadata
Keywords, description, title and date are contained in the `<metadata>` section of each file.

```
<metadata>
  <rdf:RDF>
    <rdf:Description about=""
      dc:title="Octo"
      dc:description="Underwater world with octopus and turtle"
      dc:keywords="Underwater, sea creatures, octopus, 5-6 years"
      dc:date="2020-03-10"
    ></rdf:Description>
  </rdf:RDF>
</metadata>
```

## Difficulty calculation
Difficulty is calculated automatically bases on fill areas of the image.

```
type Difficulty = {
    totalAreas: number;
    smallAreas: number;
    mediumAreas: number;
    difficultyNumber: number;
}
```

## Generate `collection.json`
After a new image is added, collection data should be updated. This happens through a command `npm run build`. It takes some time. Needs patience.

## 👋 Author
Pavel Kukov <pavelkukov@gmail.com>

## © LICENSE (CC BY-SA 4.0)
See LICENSE in the root directory