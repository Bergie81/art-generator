const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const {
  layers,
  width,
  height,
  description,
  baseImageUri,
  editionSize,
  startEditionFrom,
  endEditionAt,
  rarityWeights,
} = require("./input/config");

// const myArgs = process.argv.slice(2); // Args entered in the terminal "node index.js X"
// const editionSize = myArgs.length > 0 ? Number(myArgs[0]) : 1;
const metadataList = [];
let attributesList = [];
let dnaList = [];

const canvas = createCanvas(1000, 1000);
const ctx = canvas.getContext("2d");

const saveImage = (_editionCount) => {
  fs.writeFileSync(
    `./output/${_editionCount}.png`,
    canvas.toBuffer("image/png")
  );
};

const signImage = (_sign) => {
  console.log(_sign);
  ctx.fillStyle = "#000";
  ctx.font = "bold 30pt Courier";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillText(_sign, 40, 40);
};

// INFO: Creates pastel background -> not needed, background almost not visible and defined in layers
const genColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const pastel = `hsl(${hue}, 100%, 85%)`;
  return pastel;
};
const drawBackground = () => {
  ctx.fillStyle = genColor();
  ctx.fillRect(0, 0, width, height);
};

const addMetadata = (_dna, _edition) => {
  const dateTime = Date.now();
  const tempMetadata = {
    dna: _dna.join(""),
    name: `#${_edition}`,
    description,
    image: `${baseImageUri}/${_edition}`,
    edition: _edition,
    date: dateTime,
    attributes: attributesList,
  };
  metadataList.push(tempMetadata);
  attributesList = [];
};

const addAttributes = (_element) => {
  let { selectedElement } = _element.layer;
  attributesList.push({
    name: selectedElement.name,
    rarity: selectedElement.rarity,
  });
};

const loadLayerImg = async (_layer) =>
  new Promise(async (resolve) => {
    const image = await loadImage(`${_layer.selectedElement.path}`);
    resolve({ layer: _layer, loadedImage: image });
  });
// Pick a random layer element
// const element =
//   _layer.elements[Math.floor(Math.random() * _layer.elements.length)];

const drawElement = (_element) => {
  ctx.drawImage(
    _element.loadedImage,
    _element.layer.position.x,
    _element.layer.position.y,
    _element.layer.size.width,
    _element.layer.size.height
  ); // draw image on the canvas: image, x, y, width, height
  addAttributes(_element);
};

const constructLayerToDna = (_dna = [], _layers = [], _rarity) => {
  let mappedDnaToLayers = _layers.map((layer, index) => {
    let selectedElement = layer.elements[_rarity][_dna[index]];
    return {
      location: layer.location,
      position: layer.position,
      size: layer.size,
      selectedElement,
    };
  });
  return mappedDnaToLayers;
};

// returns "original" or "rare" or "super_rare"
const getRarity = (_editionCount) => {
  let rarity = "";
  rarityWeights.forEach((rarityWeight) => {
    if (
      _editionCount >= rarityWeight.from &&
      _editionCount <= rarityWeight.to
    ) {
      rarity = rarityWeight.value;
    }
  });
  return rarity;
};

const isDnaUnique = (_DnaList = [], _dna = []) => {
  const foundDna = _DnaList.find((i) => i.join("") === _dna.join(""));
  return foundDna === undefined; // is true when undefined and therefore unique
};

const createDNA = (_layers, _rarity) => {
  let randNum = [];
  _layers.forEach((layer) => {
    let num = Math.floor(Math.random() * layer.elements[_rarity].length);
    randNum.push(num);
  });
  return randNum;
};

const writeMetaData = (_data) => {
  fs.writeFileSync("./output/_metadata.json", _data);
};

// Minting
const startCreating = async () => {
  writeMetaData("");
  let editionCount = startEditionFrom;

  while (editionCount <= endEditionAt) {
    console.log("Edition Count:", editionCount);

    let rarity = getRarity(editionCount);
    console.log(rarity);

    let newDna = createDNA(layers, rarity);
    console.log("DNA List:", dnaList);

    // only when DNA is unique
    if (isDnaUnique(dnaList, newDna)) {
      let loadedElements = []; // promise array

      let results = constructLayerToDna(newDna, layers, rarity);
      results.forEach((layer) => {
        loadedElements.push(loadLayerImg(layer)); // promise
      });

      await Promise.all(loadedElements).then((elementArray) => {
        ctx.clearRect(0, 0, width, height);
        drawBackground();
        elementArray.forEach((element) => {
          drawElement(element);
        });
        signImage(`#${editionCount}`);
        saveImage(editionCount);
        addMetadata(newDna, editionCount);
        console.log(`Created edition ${editionCount} with DNA: ${newDna}`);
      });
      dnaList.push(newDna);
      editionCount++;
    } else {
      console.log("DNA exists");
    }
  }
  writeMetaData(JSON.stringify(metadataList));
};

startCreating();
