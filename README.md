# Coloring Pages
Coloring pages for kids in vector format (SVG). Each image is drawn with pure black lines on a transparent background.
A list of all files from the "images" folder plus difficulty estimate per drawing is generated as "./collection.json". The difficulty calculation is based on the number of empty areas and their sizes.

## Preview pictures
All pictures are listed in a storybook.
https://pavelkukov.github.io/coloring-pages/

## Difficulty calculation
The difficulty is calculated based on the number of empty areas and their sizes.
See: `utils/DifficultyEstimator.ts` for details.

```
type Difficulty = {
    totalAreas: number;
    smallAreas: number;
    mediumAreas: number;
    difficultyNumber: number; // total + (medium * 1.5) + (small * 2)
}
```

## Generate `collection.json`
After a new image is added, collection data should be updated. This happens through a command `npm run build`. It takes some time, needs patience.

## 👋 Author
Pavel Kukov <pavelkukov@gmail.com>

## © LICENSE (CC BY-SA 4.0)
See LICENSE in the root directory

## Acknowledgments
See: [Acknowledgments.md](Acknowledgments.md)