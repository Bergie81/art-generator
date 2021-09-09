const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const { layers, width, height } = require("./input/config");

const myArgs = process.argv.slice(2); // Args entered in the terminal "node index.js X"
const edition = myArgs.length > 0 ? Number(myArgs[0]) : 1;
const metadata = [];
let attributes = [];
let hash = [];
let decodedHash = [];

const canvas = createCanvas(1000, 1000);
const ctx = canvas.getContext("2d");

const saveLayer = (_canvas, _edition) => {
  fs.writeFileSync(`./output/${_edition}.png`, _canvas.toBuffer("image/png"));
};

const addMetadata = (_edition) => {
  const dateTime = Date.now();
  const tempMetadata = {
    hash: hash.join(""),
    decodedHash,
    edition: _edition,
    date: dateTime,
    attributes,
  };
  metadata.push(tempMetadata);
  attributes = [];
  hash = [];
  decodedHash = [];
};

const addAttributes = (_element, _layer) => {
  const tempAttr = {
    id: _element.id,
    layer: _layer.name,
    name: _element.name,
    rarity: _element.rarity,
  };
  attributes.push(tempAttr);
  hash.push(_layer.id);
  hash.push(_element.id);
  decodedHash.push({ [_layer.id]: _element.id });
};

const drawLayer = async (_layer, _edition) => {
  // Pick a random layer element
  const element =
    _layer.elements[Math.floor(Math.random() * _layer.elements.length)];

  addAttributes(element, _layer);
  // Load and save random layer element
  try {
    const image = await loadImage(`${_layer.location}${element.fileName}`);
    ctx.drawImage(
      image,
      _layer.position.x,
      _layer.position.y,
      _layer.size.width,
      _layer.size.height
    ); // draw image on the canvas: image, x, y, width, height

    saveLayer(canvas, _edition);
  } catch (error) {
    console.log("Error:", error);
  }
};

for (let i = 1; i <= edition; i++) {
  layers.forEach((layer) => {
    drawLayer(layer, i);
  });
  addMetadata(i);
  console.log(`Creating edition ${i}`);
}

fs.readFile("./output/_metadata.json", (err, data) => {
  if (err) throw err;
  fs.writeFileSync("./output/_metadata.json", JSON.stringify(metadata));
});
