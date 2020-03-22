import { readFileSync } from "fs";

const regularInter = readFileSync(
  `${__dirname}/../fonts/Inter-Regular.woff2`
).toString("base64");
const boldInter = readFileSync(
  `${__dirname}/../fonts/Inter-Bold.woff2`
).toString("base64");

function getCss(width: number, height: number, imagesLength = 450) {
  const areaRoot = Math.floor(
    Math.sqrt(((width - 64) * (height - 64)) / imagesLength)
  );
  const marginSize = Math.floor(areaRoot / 8);
  const safetyMargin = 2;
  const imageWidth = areaRoot - 2 * marginSize - safetyMargin;
  const frontMargin = Math.floor(imageWidth * 0.4);
  return `
  @font-face {
    font-family: 'Inter';
    font-style:  normal;
    font-weight: normal;
    src: url(data:font/woff2;charset=utf-8;base64,${regularInter}) format('woff2');
}
@font-face {
    font-family: 'Inter';
    font-style:  normal;
    font-weight: bold;
    src: url(data:font/woff2;charset=utf-8;base64,${boldInter}) format('woff2');
}

* {
  box-sizing: border-box;
}

body {
  width: ${width}px;
  height: ${height}px;
  margin: 0;
  background: linear-gradient(-45deg, rgba(55,55,55,1) 0%, rgba(25,25,25,1) 25%, rgba(10,10,10,1) 100%);
  align-items: center;
  display: flex;
  justify-content: center;
  padding: 2rem;
  flex-direction: column;
}

.data-wrapper {
  display: flex;
  flex-flow: wrap row;
  height: 100%;
  justify-content: center;
  align-items: flex-start;
  line-height: 2rem;
  letter-spacing: 4px;
  font-size: 1.5rem;
}

.person {
  width: ${imageWidth}px;
  margin: ${marginSize}px;
}

.img {
  position: absolute;
  width: ${imageWidth}px;
}

.back {
  z-index: 0;
  filter: contrast(0.5);
}

.front {
  z-index: 2;
  margin-top: ${frontMargin}px;
  margin-left: ${frontMargin}px;
  width: ${imageWidth - frontMargin}px;
}

  `;
}

interface ParsedRequest {
  emojis: string[];
  width: number;
  height: number;
}

export function getHtml(parsedReq: ParsedRequest) {
  const { emojis, width, height } = parsedReq;
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Generated Image</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        ${getCss(width, height, emojis.length)}
    </style>
    <script src="https://cdn.rawgit.com/fnando/sparkline/master/dist/sparkline.js"></script>
  </head>
  <body>
    <div class="data-wrapper font-inter" >
      ${emojis.join("")}
    <div>
  </body>
</html>`;
}
