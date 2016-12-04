const canvas = document.getElementById('view');
const lib = createjs;
const w = window.innerWidth;
const h = window.innerHeight;
canvas.width = w;
canvas.height = h;

const stage = new lib.Stage("view");
stage.enableDOMEvents(true);


class Game {
  constructor() {
    this.onTick = this.onTick.bind(this);
  }
  onFinish() {}

  onTick() {
    const resultForce = new lib.Point(0, 0);
    this.attractors.forEach(attractor => {
      const distance = getDistance(this.player, attractor);
      const force = 100 * attractor.mass / Math.pow(distance, 2);
      const forceX = force * (attractor.x - this.player.x) / distance
      const forceY = force * (attractor.y - this.player.y) / distance
      attractor.setForce(forceX, forceY)
      resultForce.x += forceX;
      resultForce.y += forceY;
    });
    this.player.speed.x += resultForce.x;
    this.player.speed.y += resultForce.y;
    this.player.move();

    const distanceToEndpoint = getDistance(this.player, this.endpoint);
    this.player.score = Math.min(distanceToEndpoint, this.player.score);
    if (distanceToEndpoint < 30) {
      this.destroy();
      this.onFinish(this.player.score, true);
    }
    if (distanceToEndpoint > 2000) {
      this.destroy();
      this.onFinish(this.player.score, false);
    }
  }

  runExperiment(attractors) {
    stage.removeAllChildren();
    this.endpoint = new EndPoint(w - 100, h / 2);
    this.startpoint = new StartPoint(100, h / 2);
    this.player = new Particle(this.startpoint.x, this.startpoint.y);
    this.attractors = attractors.map(genomToAttractor);
    stage.addChild(this.player);
    stage.addChild(this.startpoint);
    stage.addChild(this.endpoint);

    this.attractors.forEach((attr) => {
      stage.addChild(attr);
    });
    stage.addEventListener('tickstart', this.onTick);
  }

  destroy() {
    stage.removeEventListener('tickstart', this.onTick);
    stage.removeAllChildren();
  }
}

const IMovable = {
  moveAbsolute: function (x, y) {
    this.x = x;
    this.y = y;
    this.points = [new lib.Point(x, y), ...this.points.slice(0, this.points.length - 1)];
    let g = this.graphics.clear()
      .beginFill('#a0c')
      .drawCircle(0, 0, 10)
      .endFill()
    g
      .beginStroke("#00ff00")
      .setStrokeStyle(2)
      .moveTo(0, 0)
    this.points.forEach(point => {
      g = g
        .lineTo(point.x - x, point.y - y)
    });
    g.endStroke();
  },
  move: function () {
    this.moveAbsolute(this.x + this.speed.x, this.y + this.speed.y);
  }
};

class StartPoint extends lib.Shape {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.graphics
      .beginFill('green')
      .drawCircle(0, 0, 30)
  }
}
class EndPoint extends lib.Shape {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.graphics
      .beginFill('blue')
      .drawCircle(0, 0, 30)
  }
}

class Particle extends lib.Shape {
  constructor(x, y, initialSpeed = new lib.Point(0, 0)) {
    super();
    Object.assign(this, IMovable);
    this.PATH_LENGTH = 400;
    this.points = [];
    for (let i = 0; i < this.PATH_LENGTH; i++) {
      this.points.push(new lib.Point(x, y));
    }
    this.score = Infinity;
    this.x = x;
    this.y = y;
    this.speed = initialSpeed;
    this.graphics
      .beginFill('#a0c')
      .drawCircle(0, 0, 10)
  }
}

class Attractor extends lib.Shape {
  constructor(x, y, mass) {
    super();
    this.x = x;
    this.y = y;
    this.mass = mass;
    this.forceX = 100;
    this.forceY = 50;
    this.graphics
      .beginFill('rgba(200, 0, 0, 0.5)')
      .drawCircle(0, 0, this.mass / 10)
      .endFill()
  }

  setForce(forceX, forceY) {
    this.forceX = forceX;
    this.forceY = forceY;
    this.graphics
      .clear()
      .beginFill('rgba(200, 0, 0, 0.5)')
      .drawCircle(0, 0, this.mass / 10)
      .endFill()
      .beginStroke("#f00")
      .setStrokeStyle(2)
      .moveTo(0, 0)
      .lineTo(this.forceX * 50, this.forceY * 50)
      .endStroke()
  }
}

function getDistance(obj1, obj2) {
  return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2));
}

function generateAttractors(attractorCount) {
  const attractors = [];
  for (let i = 0; i < attractorCount; i++) {
    const attractor = {
      x: Math.random() * w,
      y: Math.random() * h,
      mass: Math.random() * 200,
    };
    attractors.push(attractor)
  }
  return attractors;
}


function generateSession(numOfExperiments, attractorCount) {
  const experiment = [];
  for (let i = 0; i < numOfExperiments; i++) {
    const attractors = generateAttractors(attractorCount);
    experiment.push({
      score: Infinity,
      attractors,
    });
  }
  return experiment;
}

function mergeExperiments(ex1, ex2) {
  const a1 = ex1.attractors;
  const a2 = ex2.attractors;
  const r = []
  for (let i = 0; i < 10; i++) {
    const r1 = {
      score: Infinity,
      attractors: a1.map((_, j) => {
        const rand1 = Math.random();
        const rand2 = Math.random();
        const rand3 = Math.random();
        return {
          x: rand1 * a1[j].x + (1 - rand1) * a2[j].x,
          y: rand2 * a1[j].y + (1 - rand2) * a2[j].y,
          mass: rand3 * a1[j].mass + (1 - rand3) * a2[j].mass,
        };
      }),
    };
    r.push(r1);
  }
  return r;
}

function genomToAttractor(genom) {
  const {x,y,mass} = genom;
  return new Attractor(x, y, mass);
}


function experimentComparator(ex1, ex2) {
  return ex1.score - ex2.score;
}
class GameRunner {
  constructor() {
    this.game = new Game();
  }

  runSession(bestPair = null) {
    let i = 0;
    this.experiments = bestPair === null
      ? generateSession(10, 5)
      : mergeExperiments(bestPair[0], bestPair[1]);
    this.game.runExperiment(this.experiments[i].attractors);
    this.game.onFinish = (score) => {
      console.log(score);
      this.experiments[i].score = score;
      i++;
      if (i < this.experiments.length) {
        this.game.runExperiment(this.experiments[i].attractors);
      }
      else {
        this.finishSession()
      }
    }
  }
  finishSession() {
    const bestPair = this.experiments.sort(experimentComparator).slice(0, 2);
    console.log(bestPair);
    this.runSession(bestPair);
  }
}


const gameRunner = new GameRunner();
gameRunner.runSession();

lib.Ticker.framerate = 6000;
lib.Ticker.addEventListener('tick', stage);