const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");

const canvas = createCanvas(1000, 1000);
const ctx = canvas.getContext("2d");

const saveLayer = (_canvas) => {
  fs.writeFileSync("./newImage.png", _canvas.toBuffer("image/png"));
};

const drawLayer = async () => {
  try {
    const image = await loadImage("./test-image.jpg");
    ctx.drawImage(image, 0, 0, 1000, 1000); // image, x, y, width, height
    console.log("ok");
  } catch (error) {
    console.log("Error:", error);
  }
};

drawLayer();
