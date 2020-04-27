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

## Categories

All images are labeled/categorized using `<dc:subject>` tag in `<cc:Work>` section. Currently existing categories are:

> Listed alphabetically -  a-z

* 4+
* 8+
* a
* acb
* alpaca
* animals
* apple
* artwork
* artworks
* b
* beach
* bear
* bird
* birds
* blank
* boy
* boys
* brush-size-0.015
* bunny
* butterfly
* c
* cake
* camel
* caricatures
* cat
* christmas
* cloud
* csk
* d
* dragon
* easter
* egg
* flowers
* frog
* fruits
* girls
* grape
* hasma
* heart
* horse
* insects
* jellyfish
* knight
* ladybug
* landscape
* letters
* magic-animals
* mosaic
* naturmort
* octopus
* p
* paisley
* picasso
* princess
* pumpkin
* rain
* sea
* shapes
* ships
* sizing-cover
* snow
* spring
* summer
* surf
* trees
* underwater
* unicorn
* vegetables
* vermeer
* vpos-b
* zentangle

> totally 71 categories for 62 images

## Generate `collection.json`

After a new image is added, collection data should be updated. This happens through a command `npm run build`. It takes some time, needs patience.

## Consumers
1. 🍧 [Color Splash - Kids](https://play.google.com/store/apps/details?id=com.codeiterator.colorsplashkids)

## 👋 Author

Pavel Kukov <pavelkukov@gmail.com>

## © LICENSE (CC BY-SA 4.0)

See LICENSE in the root directory

## Acknowledgments

See: [Acknowledgments.md](Acknowledgments.md)
