# Coloring Pages
Coloring pages for kids in vector format (SVG). Each image is drawn with pure black lines on a transparent background.

## collection.json
List of all images from the "images" folder with difficulty estimate per image.

## Difficulty calculation
The difficulty is calculated based on fill areas and their size. An image with many small areas to fill is considered more difficult.

```
type Difficulty = {
    totalAreas: number;
    smallAreas: number;
    mediumAreas: number;
    difficultyNumber: number;
}
```

## Generate `collection.json`
After a new image is added, collection data should be updated. This happens through a command `npm run build`. It takes some time, needs patience.

## 👋 Author
Pavel Kukov <pavelkukov@gmail.com>

## © LICENSE (CC BY-SA 4.0)
See LICENSE in the root directory