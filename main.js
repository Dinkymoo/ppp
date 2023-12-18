window.addEventListener("load", function () {
  const cvas = this.document.getElementById("canvas1");
  const ctx = cvas.getContext("2d");
  cvas.width = 1280;
  cvas.height = 720;
  //frequent changes to canvas state can cause performance issues
  //that is why we do then here
  ctx.fillStyle = "white";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "white";
  ctx.font = "40px Helvetica";
  ctx.textAlign = "center";

  class Player {
    constructor(game) {
      this.game = game;
      this.collisionX = this.game.width * 0.5;
      this.collisionY = this.game.height * 0.5; //center of player collision
      this.collisionRadius = 30; //smaller than obstacle to squeeze past
      this.speedX = 0;
      this.speedY = 0;
      this.dx = 0;
      this.dy = 0;
      this.speedModifier = 5;
      this.spriteWidth = 256;
      this.spriteHeight = 256;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.spriteX;
      this.spriteY; //top left corner of sprite sheet
      this.frameX = 0;
      this.frameY = 5;
      this.image = document.getElementById("bull");
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.spriteX,
        this.spriteY,
        this.width,
        this.height
      );
      if (this.game.debug) {
        context.beginPath();
        context.arc(
          this.collisionX,
          this.collisionY,
          this.collisionRadius,
          0,
          Math.PI * 2 //full circle
        );
        context.save();
        context.globalAlpha = 0.5;
        context.fill();
        context.restore();
        context.stroke();
        context.beginPath();
        context.moveTo(this.collisionX, this.collisionY);
        context.lineTo(this.game.mouse.x, this.game.mouse.y);
        context.stroke();
      }
    }
    update() {
      this.dx = this.game.mouse.x - this.collisionX; //mouse first
      this.dy = this.game.mouse.y - this.collisionY;
      //sprite animation
      const angle = Math.atan2(this.dy, this.dx); //angle between mouse(0,0) and player(x,y)
      // radian range to make player always face the mouse
      if (angle < -2.74 || angle > 2.74)
        this.frameY = 6; //circle ends and starts
      else if (angle < -1.96) this.frameY = 7;
      else if (angle < -1.17) this.frameY = 0;
      else if (angle < -0.39) this.frameY = 1;
      else if (angle < 0.39) this.frameY = 2;
      else if (angle < 1.17) this.frameY = 3;
      else if (angle < 1.96) this.frameY = 4;
      else if (angle < 2.74) this.frameY = 5;

      const distance = Math.hypot(this.dy, this.dx);
      if (distance > this.speedModifier) {
        this.speedX = this.dx / distance || 0;
        this.speedY = this.dy / distance || 0;
      } else {
        this.speedX = 0;
        this.speedY = 0;
      }
      this.collisionX += this.speedX * this.speedModifier;
      this.collisionY += this.speedY * this.speedModifier;
      //update every time
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5 - 100; //use shadow as collision area move player up
      //collisions with obstacles
      //horizontal boundaries
      if (this.collisionX < this.collisionRadius)
        this.collisionX = this.collisionRadius; //don't go further left
      else if (this.collisionX > this.game.width - this.collisionRadius)
        this.collisionX = this.game.width - this.collisionRadius;
      //don't go further right
      //vertical boundaries
      if (this.collisionY < this.game.topMargin + this.collisionRadius)
        this.collisionY = this.game.topMargin + this.collisionRadius; //top
      else if (this.collisionY < this.game.topMargin + this.collisionRadius)
        this.collisionY = this.game.width - this.collisionRadius; //bottom
      this.game.obstacles.forEach((obstacle) => {
        let [collision, distance, sumOfRadii, dx, dy] =
          this.game.checkCollision(this, obstacle);

        if (collision) {
          const unit_x = dx / distance;
          const unit_y = dy / distance;
          this.collisionX = obstacle.collisionX + (sumOfRadii + 1) * unit_x;
          this.collisionY = obstacle.collisionY + (sumOfRadii + 1) * unit_y;
        }
      });
    }
  }
  class Obstacle {
    constructor(game) {
      this.game = game;
      this.collisionX = Math.random() * this.game.width;
      this.collisionY = Math.random() * this.game.height;
      this.collisionRadius = 40;
      this.image = document.getElementById("obstacles");
      this.spriteWidth = 250;
      this.spriteHeight = 250;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5 - 70; //move to base of sprite
      this.frameX = Math.floor(Math.random() * 4); //columns on spritesheet
      this.frameY = Math.floor(Math.random() * 3); //rows on spritesheet
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.spriteX,
        this.spriteY,
        this.width,
        this.height
      );
      if (this.game.debug) {
        context.beginPath();
        context.arc(
          this.collisionX,
          this.collisionY,
          this.collisionRadius,
          0,
          Math.PI * 2 //full circle
        );
        context.save();
        context.globalAlpha = 0.5;
        context.fill();
        context.restore();
        context.stroke();
      }
    }
    update() {
      //can possibly add interactive features here
    }
  }
  class Eggs {
    constructor(game) {
      this.game = game;
      this.collisionRadius = 40;
      this.margin = this.collisionRadius * 2;
      this.collisionX =
        this.margin + Math.random() * (this.game.width - this.margin * 2); //left and right space
      this.collisionY =
        this.game.topMargin +
        Math.random() * (this.game.height - this.margin * 4); //top and bottom space

      this.image = document.getElementById("egg");
      this.spriteWidth = 110;
      this.spriteHeight = 135;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.spriteX;
      this.spriteY;
      this.hatchTimer = 0;
      this.hatchInterval = 3000;
      this.markedForDeletion = false;
    }
    draw(context) {
      context.drawImage(this.image, this.spriteX, this.spriteY);
      if (this.game.debug) {
        context.beginPath();
        context.arc(
          this.collisionX,
          this.collisionY,
          this.collisionRadius,
          0,
          Math.PI * 2 //full circle
        );
        context.save();
        context.globalAlpha = 0.5;
        context.fill();
        context.restore();
        context.stroke();
        const displayTimer = (this.hatchTimer * 0.001).toFixed(0); //rounded string to zero decimals
        context.fillText(
          displayTimer,
          this.collisionX,
          this.collisionY - this.collisionRadius * 2.5
        );
      }
    }
    update(deltaTime) {
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5 - 30;
      let collisionObject = [this.game.player, ...this.game.obstacles];
      //collisions
      collisionObject.forEach((object) => {
        let [collision, distance, sumOfRadii, dx, dy] =
          this.game.checkCollision(this, object);
        if (collision) {
          //between -1 and +1
          const unit_x = dx / distance;
          const unit_y = dy / distance;
          this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
          this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
          //moving the egg based on the position of the obstacle
        }
      });
      //hatching
      if (this.hatchTimer > this.hatchInterval) {
        this.markedForDeletion = true;
        this.game.removeGameObjects();
        this.hatchTimer = 0;
      } else {
        this.hatchTimer += deltaTime; //adds 8
        console.log(this.hatchTimer);
      }
    }
  }
  class Enemy {
    constructor(game) {
      this.game = game;
      this.collisionRadius = 30;
      this.speedX = Math.random() * 3 + 0.5;
      this.image = document.getElementById("toad");
      this.spriteWidth = 140;
      this.spriteHeight = 260;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.collisionX = this.game.width + Math.random() * this.game.width * 0.5; //give each one a random delay
      this.collisionY =
        this.game.topMargin +
        Math.random() * (this.game.height - this.game.topMargin);
      this.spriteX;
      this.spriteY;
    }
    draw(context) {
      context.drawImage(this.image, this.spriteX, this.spriteY);
      if (this.game.debug) {
        context.beginPath();
        context.arc(
          this.collisionX,
          this.collisionY,
          this.collisionRadius,
          0,
          Math.PI * 2 //full circle
        );
        context.save();
        context.globalAlpha = 0.5;
        context.fill();
        context.restore();
        context.stroke();
      }
    }
    update() {
      //enemies walk from right to left
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height + 40;
      this.collisionX -= this.speedX; //move to the left
      if (this.spriteX + this.width < 0) {
        // right edge is hidden behind canvas
        this.collisionX =
          this.game.width + Math.random() * this.game.width * 0.5; //give each one a random delay
        this.collisionY =
          this.game.topMargin +
          Math.random() * (this.game.height - this.game.topMargin);
      }
      let collisionObject = [
        this.game.player,
        ...this.game.obstacles,
        ...this.game.eggs,
      ]; //enemy will push eggs

      collisionObject.forEach((object) => {
        let [collision, distance, sumOfRadii, dx, dy] =
          this.game.checkCollision(this, object);
        if (collision) {
          //between -1 and +1
          const unit_x = dx / distance;
          const unit_y = dy / distance;
          this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
          this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
          // enemy is based on the position of the obstacle
        }
      });
    }
  }
  class Larva {
    constructor(game, x, y) {
      this.game = game;
      this.collisionRadius = 30;
      this.collisionX = x;
      this.collisionY = y;
      this.image = document.getElementById("larva");
      this.spriteWidth = 150;
      this.spriteHeight = 150;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.spriteX;
      this.spriteY;
      this.speedY = 1 + Math.random();
    }
    draw(context) {
      context.drawImage(this.image, this.spriteX, this.spriteY);
    }
    update() {
      this.collisionY -= this.speedY;
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5;
    }
  }
  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.width = canvas.width;
      this.height = canvas.height;
      this.player = new Player(this);
      this.fps = 70;
      this.topMargin = 260;
      this.mouse = {
        x: this.width * 0.5,
        y: this.height * 0.5,
        pressed: false,
      };
      this.gameObjects = [];

      //obstacles
      this.timer = 0;
      this.interval = 1000 / this.fps;
      this.numberOfObstacles = 5;
      this.obstacles = [];
      //egg
      this.eggTimer = 0;
      this.eggInterval = 1000;
      this.maxEggs = 10;
      this.eggs = [];

      //enemies
      this.enemies = [];

      this.debug = true;

      this.canvas.addEventListener("mousedown", (e) => {
        //inherit ref to this keyword from parent scope
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
        this.mouse.pressed = true;
      });
      this.canvas.addEventListener("mouseup", (e) => {
        //inherit ref to this keyword from parent scope
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
        this.mouse.pressed = false;
      });
      this.canvas.addEventListener("mousemove", (e) => {
        if (this.mouse.pressed) {
          this.mouse.x = e.offsetX;
          this.mouse.y = e.offsetY;
        }
      });
      window.addEventListener("keydown", (e) => {
        if (e.key === "d") {
          this.debug = !this.debug;
          console.log(this.debug);
        }
      });
    }
    render(context, deltaTime) {
      if (this.timer > this.interval) {
        ctx.clearRect(0, 0, this.width, this.height);
        this.gameObjects = [
          this.player,
          ...this.eggs,
          ...this.obstacles,
          ...this.enemies,
        ];
        //sprites higher up will be behind sprites lower down
        this.gameObjects.sort((a, b) => {
          return a.collisionY - b.collisionY;
        });
        this.gameObjects.forEach((object) => {
          object.draw(context);
          object.update(deltaTime);
        });

        this.timer = 0;
      }
      this.timer += deltaTime;

      //add eggs periodically
      if (this.eggTimer > this.eggInterval && this.eggs.length < this.maxEggs) {
        this.addEgg();
        this.eggTimer = 0;
      }
      this.eggTimer += deltaTime;
    }
    checkCollision(a, b) {
      const dx = a.collisionX - b.collisionX;
      const dy = a.collisionY - b.collisionY;
      const distance = Math.hypot(dy, dx);
      const sumOfRadii = a.collisionRadius + b.collisionRadius;
      return [distance < sumOfRadii, distance, sumOfRadii, dx, dy];
    }
    addEgg() {
      this.eggs.push(new Eggs(this));
    }
    addEnemy() {
      this.enemies.push(new Enemy(this));
    }
    removeGameObjects() {
      console.log("b", this.eggs);
      this.eggs = this.eggs.filter((e) => !e.markedForDeletion);
      console.log("a", this.eggs);
    }
    init() {
      //add enemies
      for (let i = 0; i < 5; i++) {
        this.addEnemy();
      }
      //add obstacles
      let attempts = 0;
      while (this.obstacles.length < this.numberOfObstacles && attempts < 500) {
        let testObstacle = new Obstacle(this);
        let overlap = false;
        this.obstacles.forEach((obstacle) => {
          const dx = testObstacle.collisionX - obstacle.collisionX;
          const dy = testObstacle.collisionY - obstacle.collisionY;
          const distance = Math.hypot(dy, dx);
          const distanceBuffer = 150;
          const sumOfRadii =
            testObstacle.collisionRadius +
            obstacle.collisionRadius +
            distanceBuffer;
          if (distance < sumOfRadii) {
            overlap = true;
          }
        });
        const margin = testObstacle.collisionRadius * 3; //squeeze space
        if (
          !overlap &&
          testObstacle.spriteX > 0 &&
          testObstacle.spriteX < this.width - testObstacle.width &&
          testObstacle.collisionY > this.topMargin + margin && //top squeeze space
          testObstacle.collisionY < this.height + margin //buttom squeeze space
        ) {
          // make sure left and right edges are not hidden
          this.obstacles.push(testObstacle);
        }
        attempts++;
      }
    }
  }
  const game = new Game(cvas);
  console.log(game);
  game.init();
  let lastTime = 0;
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime; //refresh rate at 60Hz = 8
    game.render(ctx, deltaTime);
    requestAnimationFrame(animate);
    lastTime = timeStamp;
  }
  animate(0);
});
