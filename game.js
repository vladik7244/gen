const canvas = document.getElementById('view');
const w = window.innerWidth;
const h = window.innerHeight;
canvas.width = w;
canvas.height = h;
/*
document.body.addEventListener('click', () => {
  canvas.webkitRequestFullScreen();
})
*/
const stage = new createjs.Stage("view");
const width = 8;
const height = 8;
const size = Math.min(w - 128, h - 128) / 8;

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].reverse();
const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
const createCell = (x, y) => {
  const number = numbers[x];
  const letter = letters[y];
  const cell = new createjs.Shape();
  cell.addEventListener('click', () => {
    console.log(number, letter);
  });
  const col = (x % 2 == 0) ^ (y % 2 == 0);
  cell.graphics
    .beginFill(col ? '#555' : '#cc9')
    .drawRect(0, 0, size, size);
  cell.x = x * size;
  cell.y = y * size;
  return {
    cell, number, letter,
  };
};



const createField = () => {
  const container = new createjs.Container();
  const cellContainer = new createjs.Container();
  const letterContainer = new createjs.Container();
  const numberContainer = new createjs.Container();
  const handContainer = new createjs.Container();
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      const c = createCell(i, j);
      cellContainer.addChild(c.cell);
    }
    const letter = new createjs.Text(letters[i], "20pt Times New Roman", "#555");
    const number = new createjs.Text(numbers[i], "20pt Times New Roman", "#555");
    letter.x = size / 4;
    letter.y = size * i + size / 4;
    number.x = size * i + size / 4;
    number.y = size / 4;
    letterContainer.addChild(letter);
    numberContainer.addChild(number);
  }
  cellContainer.x = 64;
  cellContainer.y = 64;
  letterContainer.y = size;
  numberContainer.x = size;
  handContainer.x = w - 200;
  handContainer.y = 100;
  const item = new createjs.Shape();
  item.graphics
    .beginFill('#f00')
    .drawCircle(0, 0, 45);

  handContainer.addChild(item);
  container.addChild(letterContainer);
  container.addChild(numberContainer);
  container.addChild(cellContainer);
  container.addChild(handContainer);
  return container;
};
const field = createField();
stage.addChild(field);
//
// createjs.Tween.get(cell, { loop: true })
//   .to({ x: 400 }, 1000, createjs.Ease.getBackInOut(4))
//   .to({ alpha: 0, y: 175 }, 500, createjs.Ease.getBackInOut(2))
//   .to({ alpha: 0, y: 225 }, 100)
//   .to({ alpha: 1, y: 200 }, 500, createjs.Ease.getElasticInOut(2, 4))
//   .to({ x: 100 }, 800, createjs.Ease.getElasticInOut(2, 4));

createjs.Ticker.framerate = 60;
createjs.Ticker.addEventListener("tick", stage);

