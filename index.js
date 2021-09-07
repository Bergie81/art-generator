const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const { layers, width, height } = require("./input/config");

const canvas = createCanvas(1000, 1000);
const ctx = canvas.getContext("2d");

const saveLayer = (_canvas) => {
  fs.writeFileSync("./newImage.png", _canvas.toBuffer("image/png"));
  console.log("Image created");
};

const drawLayer = async () => {
  try {
    const image = await loadImage("./test-image.jpg");
    ctx.drawImage(image, 0, 0, width, height); // draw image on the canvas: image, x, y, width, height
    console.log("ok");
    saveLayer(canvas);
  } catch (error) {
    console.log("Error:", error);
  }
};

drawLayer();
