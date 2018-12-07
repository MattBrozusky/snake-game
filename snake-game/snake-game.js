"use strict";

/**
 * Namespace
 */
const Game      = {};
const Keyboard  = {};
const Component = {};

/**
 * Keyboard Map
 */
Keyboard.Keymap = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
};

/**
 * Keyboard Events
 */
Keyboard.ControllerEvents = function() {

    // Setts
    const self      = this;
    this.pressKey = null;
    this.keymap   = Keyboard.Keymap;

    // Keydown Event
    document.onkeydown = event => {
        self.pressKey = event.which;
    };

    // Get Key
    this.getKey = function() {
        return this.keymap[this.pressKey];
    };
};

/**
 * Game Component Stage
 */
Component.Stage = function(canvas, conf) {

    // Sets
    this.keyEvent  = new Keyboard.ControllerEvents();
    this.width     = canvas.width;
    this.height    = canvas.height;
    this.length    = [];
    this.food      = {};
    this.score     = 0;
    this.direction = 'right';
    this.conf      = {
        cw   : 10,
        size : 5,
        fps  : 1000
    };

    // Merge Conf
    if (typeof conf === 'object') {
        for (const key in conf) {
            if (conf.hasOwnProperty(key)) {
                this.conf[key] = conf[key];
            }
        }
    }

};

/**
 * Game Component Snake
 */
Component.Snake = function(canvas, conf) {

    // Game Stage
    this.stage = new Component.Stage(canvas, conf);

    // Init Snake
    this.initSnake = function() {

        // Itaration in Snake Conf Size
        for (let i = 0; i < this.stage.conf.size; i++) {

            // Add Snake Cells
            this.stage.length.push({x: i, y:0});
        }
    };

    // Call init Snake
    this.initSnake();

    // Init Food
    this.initFood = function() {

        // Add food on stage
        this.stage.food = {
            x: Math.round(Math.random() * (this.stage.width - this.stage.conf.cw) / this.stage.conf.cw),
            y: Math.round(Math.random() * (this.stage.height - this.stage.conf.cw) / this.stage.conf.cw),
        };
    };

    // Init Food
    this.initFood();

    // Restart Stage
    this.restart = function() {
        this.stage.length            = [];
        this.stage.food              = {};
        this.stage.score             = 0;
        this.stage.direction         = 'right';
        this.stage.keyEvent.pressKey = null;
        this.initSnake();
        this.initFood();
    };
};

/**
 * Game Draw
 */
Game.Draw = function(context, snake) {

    // Draw Stage
    this.drawStage = function() {
        // Check Keypress And Set Stage direction
        const keyPress = snake.stage.keyEvent.getKey();
        if (typeof(keyPress) !== 'undefined') {
            snake.stage.direction = keyPress;
        }

        // Draw White Stage
        context.fillStyle = "white";
        context.fillRect(0, 0, snake.stage.width, snake.stage.height);

        // Snake Position
        let nx = snake.stage.length[0].x;
        let ny = snake.stage.length[0].y;

        // Add position by stage direction
        switch (snake.stage.direction) {
            case 'right':
                nx++;
                break;
            case 'left':
                nx--;
                break;
            case 'up':
                ny--;
                break;
            case 'down':
                ny++;
                break;
        }

        // Check Collision
        if (this.collision(nx, ny) === true) {
            snake.restart();
            return;
        }

        // Logic of Snake food
        if (nx === snake.stage.food.x && ny === snake.stage.food.y) {
            var tail = {x: nx, y: ny};
            snake.stage.score++;
            snake.initFood();
        } else {
            var tail = snake.stage.length.pop();
            tail.x   = nx;
            tail.y   = ny;
        }
        snake.stage.length.unshift(tail);

        // Draw Snake
        for (const cell of snake.stage.length) {
            this.drawCell(cell.x, cell.y);
        }

        // Draw Food
        this.drawCell(snake.stage.food.x, snake.stage.food.y);

        // Draw Score
        context.fillText(`Score: ${snake.stage.score}`, 5, (snake.stage.height - 5));
    };

    // Draw Cell
    this.drawCell = (x, y) => {
        context.fillStyle = 'rgb(180, 30, 255)';
        context.beginPath();
        context.arc((x * snake.stage.conf.cw + 6), (y * snake.stage.conf.cw + 6), 4, 0, 2 * Math.PI, false);
        context.fill();
    };

    // Check Collision with snake and walls
    // for (var i = 0; i < snake.stage.length.length; i++) {
    //     var cell = snake.stage.length[i];
    //     if (cell === nx || cell === ny) {
    //         this.collision = true;
    //     }
    // }
    // Check Collision with walls
    this.collision = (nx, ny) => {
        if (nx === -1 || nx === (snake.stage.width / snake.stage.conf.cw) || ny === -1 || ny === (snake.stage.height / snake.stage.conf.cw)) {
            return true;
        }
        return false;
    }
};


/**
 * Game Snake
 */
Game.Snake = (elementId, conf) => {

    // Sets
    const canvas   = document.getElementById(elementId);
    const context  = canvas.getContext("2d");
    const snake    = new Component.Snake(canvas, conf);
    const gameDraw = new Game.Draw(context, snake);

    // Game Interval
    setInterval(() => {gameDraw.drawStage();}, snake.stage.conf.fps);
};


/**
 * Window Load
 */
window.onload = () => {
    const snake = Game.Snake('stage', {fps: 100, size: 4});
};
