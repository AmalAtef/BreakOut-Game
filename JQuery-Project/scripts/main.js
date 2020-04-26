var DataController = (function () {
    var data = {
        ball: {
            radius: 10,
            position: {
                x: 0,
                y: 0
            },
            change: {
                dx: 1,
                dy: -1
            }
        },
        paddle: {
            paddleHeight: 15,
            paddleWidth: 100,
            paddleX: 0,
            paddleY: 0,
        },
        bricksOptions: {
            nRows: 5,
            nCols: 8,
            brickHeight: 20,
        },
        bricks: [],
        powers: [],
        opacities: [0, 0.333, 0.666, 1],
        powerups: ["./imgs/heart.png", "./imgs/b-plus1.png", "./imgs/minus1.png", "./imgs/speed.png"],
        life: 3,
        interval: null,
        speed: 5,
        initialSpeed: 5,
        score: 0,
        timer: "00:00:00",
        settime: null,
        right: false,
        left: false,
        ballOnPaddle: true,
    }
    return {
        init: function (canvas, ctx) {
            data.canvas = canvas[0];
            data.ctx = ctx;
            data.speed = data.initialSpeed = 5;
            data.ball.position.x = data.canvas.width / 2;
            data.paddle.paddleX = data.canvas.width / 2 - data.paddle.paddleWidth / 2;
            data.ball.position.y = data.canvas.height - data.paddle.paddleHeight - data.ball.radius;
            data.bricksOptions.brickWidth = (data.canvas.width - 100) / data.bricksOptions.nCols;
            this.initBricks();
        },
        setLevel: function (level) {
            data.speed = data.initialSpeed = 5 / level;
            data.settime = setInterval(this.start_timer, 1000);
        },
        getCanvas: function () {
            return data.canvas;
        },
        getCtx: function () {
            return data.ctx;
        },
        getBall: function () {
            return data.ball;
        },
        getBricks: function () {
            return data.bricks;
        },
        getpowers: function () {
            return data.powers;
        },
        getpowerUps: function () {
            return data.powerups;
        },
        getLife: function () {
            return data.life;
        },
        getSpeed: function () {
            return data.speed;
        },
        getInterval: function () {
            return data.interval;
        },
        getScore: function () {
            return data.score;
        },
        getBricksOptions: function () {
            return data.bricksOptions;
        },
        getPaddle: function () {
            return data.paddle;
        },
        getTime: function () {
            return data.timer;
        },
        getLeft: function () {
            return data.left
        },
        getRight: function () {
            return data.right
        },
        OnPaddle: function () {
            return data.ballOnPaddle
        },
        initBricks: function () {
            for (var i = 0; i < data.bricksOptions.nRows; i++) {
                var arr = [];
                for (var j = 0; j < data.bricksOptions.nCols; j++) {
                    var powerup;
                    if (Math.random() > 0.7) {
                        powerup = Math.floor(Math.random() * data.powerups.length)
                    } else {
                        powerup = undefined;
                    }
                    arr.push({
                        position: {
                            x: j * data.bricksOptions.brickWidth + 50,
                            y: i * data.bricksOptions.brickHeight + 50
                        },
                        opacity: data.opacities[Math.floor(Math.random() * data.opacities.length)],
                        powerup: powerup

                    })
                }
                data.bricks.push(arr);
            }
        },
        reflectBall: function (canvas, ball) {
            if (ball.position.x + ball.change.dx > canvas.width - ball.radius
                ||
                ball.position.x + ball.change.dx < ball.radius) {
                ball.change.dx = -ball.change.dx;
            }
            if (ball.position.y + ball.change.dy > canvas.height - ball.radius
                ||
                ball.position.y + ball.change.dy < ball.radius) {
                ball.change.dy = -ball.change.dy;
            }

            ball.position.x += ball.change.dx;
            ball.position.y += ball.change.dy;

        },
        resetBall: function (canvas, ball, paddle) {
            var inRange = ball.position.x + ball.radius < paddle.paddleX || ball.position.x - ball.radius > paddle.paddleX + paddle.paddleWidth;
            if (ball.position.y > canvas.height - paddle.paddleHeight - ball.radius && inRange) {
                data.speed = data.initialSpeed;
                data.paddle.paddleWidth = 100
                data.life--;
                $("#loseLife")[0].play();
                data.powers = [];
                data.ballOnPaddle = true;
                this.returnBall();
                return true;
            } else if (ball.position.y > canvas.height - paddle.paddleHeight - ball.radius && !inRange) {
                ball.change.dy = -ball.change.dy;
            }
            return false;
        },
        returnBall: function () {
            data.ball.position.x = data.paddle.paddleX + data.paddle.paddleWidth / 2;
            data.ball.position.y = data.canvas.height - data.ball.radius - data.paddle.paddleHeight;
        },
        checkCollision: function () {
            for (var r = 0; r < data.bricksOptions.nRows; r++) {
                for (var c = 0; c < data.bricksOptions.nCols; c++) {
                    var b = data.bricks[r][c];
                    var ball = data.ball;
                    if (b.opacity != 0) {
                        if (ball.position.x + ball.radius >= b.position.x &&
                            ball.position.x - ball.radius < b.position.x + data.bricksOptions.brickWidth &&
                            ball.position.y + ball.radius > b.position.y &&
                            ball.position.y - ball.radius < b.position.y + data.bricksOptions.brickHeight) {
                            ball.change.dy = -ball.change.dy;
                            var index = data.opacities.indexOf(b.opacity);
                            b.opacity = data.opacities[index - 1];
                            $("#hitBrick")[0].play();
                            if (b.opacity == 0) {
                                data.powers.push({
                                    position: b.position,
                                    powerUP: data.powerups[b.powerup]
                                })
                            }
                            data.score += 5;
                            return;
                        }
                    }
                }
            }
        },
        paddleMovement: function (e) {
            switch (e.keyCode) {
                // case "ArrowLeft":
                case 37:
                case 65:
                    e.type == "keydown" ? data.left = true : data.left = false;
                    data.right = false;
                    break;
                    // case "ArrowRight":
                case 39:
                case 68:
                    e.type == "keydown" ? data.right = true: data.right = false;
                    data.left = false;
                    break;
            };
        },
        startInterval: function (drawFun) {
            data.interval = setInterval(drawFun, data.speed);
        },
        clearInterval: function () {
            clearInterval(data.interval);
            data.interval = null;
        },
        powerUpEffect: function (canvas, powerups, powers, paddle, drawFun) {
            for (var i = 0; i < powers.length; i++) {
                var index = powerups.indexOf(powers[i].powerUP);
                var RangeX = powers[i].position.x + 25 < paddle.paddleX || powers[i].position.x - 25 > paddle.paddleX + paddle.paddleWidth;
                if (powers[i].position.y >= canvas.height - 25 - paddle.paddleHeight && RangeX) {
                    data.powers.splice(i, 1);
                }
                else if (powers[i].position.y > canvas.height - paddle.paddleHeight) {
                    switch (index) {
                        case 0:
                            //life Inc
                            data.life++;
                            $("#lifeInc")[0].play();
                            break;
                        case 1:
                            //paddle Inc
                            data.paddle.paddleWidth += 10;
                            $("#paddleInc")[0].play();
                            break;
                        case 2:
                            //paddle Dec
                            data.paddle.paddleWidth -= 10;
                            $("#paddleInc")[0].play();
                            break;
                        case 3:
                            //speed Inc
                            $("#speedInc")[0].play();
                            data.speed -= 4;
                            this.clearInterval();
                            this.startInterval(drawFun);
                            break;
                        default:
                            break;
                    }
                    data.powers.splice(i, 1);
                }
            }
        },
        start_timer: function () {
            var arr = data.timer.split(":");
            var hour = arr[0];
            var min = arr[1];
            var sec = arr[2];

            if (sec == 59) {
                if (min == 59) {
                    hour++;
                    min = 0;
                    if (hour < 10) {
                        hour = "0" + hour;
                    }
                } else {
                    min++;
                }
                if (min < 10) {
                    min = "0" + min;
                    sec = 0;
                }
            } else {
                sec++;
                if (sec < 10) sec = "0" + sec;
            }
            document.getElementById("timer").innerHTML = data.timer = hour + ":" + min + ":" + sec;
        },
        clearTime: function () {
            clearInterval(data.interval);
            clearInterval(data.settime);
        },
        checkWin: function () {
            for (var i = 0; i < data.bricksOptions.nRows; i++) {
                for (var j = 0; j < data.bricksOptions.nCols; j++) {
                    if (data.bricks[i][j].opacity > 0) {
                        return false;
                    }
                }
            }
            return true;
        },
        throwBall: function () {
            data.ballOnPaddle = false;
        },
        movePaddle: function () {
            if (data.left) {
                data.paddle.paddleX -= 3;
                if (data.paddle.paddleX < 0) {
                    data.paddle.paddleX = 0;
                }
            }
            if (data.right) {
                data.paddle.paddleX += 3;
                if (data.paddle.paddleX + data.paddle.paddleWidth > data.canvas.width) {
                    data.paddle.paddleX = data.canvas.width - data.paddle.paddleWidth;
                }
            }
        }
    }
})();

var UIController = (function () {
    return {
        drawBall: function (ctx, ball) {
            ctx.beginPath();
            ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = "#0095DD";
            ctx.globalAlpha = 1;
            ctx.fill();
            ctx.closePath();
        },
        drawBricks: function (canvas, ctx, bricks, options) {
            ctx.lineWidth = 1;
            for (var i = 0; i < options.nRows; i++) {
                for (var j = 0; j < options.nCols; j++) {
                    ctx.fillStyle = "#0095DD";
                    ctx.globalAlpha = bricks[i][j].opacity;
                    ctx.fillRect(bricks[i][j].position.x, bricks[i][j].position.y,
                         options.brickWidth, options.brickHeight);
                    ctx.strokeRect(bricks[i][j].position.x, bricks[i][j].position.y,
                        options.brickWidth, options.brickHeight);
                }
            }
            ctx.globalAlpha = 1;
        },
        clearBall: function (canvas, ctx, ball) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        },
        displayCurrentState: function (ctx, textVal, lx, ly, imgSrc, imgx, imgy) {
            ctx.fillStyle = "#000";
            ctx.font = "20px Georgia";
            ctx.clearRect(imgx, imgy, 50, 20);
            ctx.fillText(textVal, lx, ly);
            ctx.drawImage(imgSrc, imgx, imgy, 25, 25);
        },
        drawPaddle: function (ctx, paddle, canvas) {
            ctx.beginPath();
            ctx.rect(paddle.paddleX, canvas.height - paddle.paddleHeight, paddle.paddleWidth, paddle.paddleHeight);
            ctx.fillStyle = "#000";
            ctx.fill();
            ctx.closePath();
            //ctx.beginPath();
            //ctx.lineCap = "round";
            //ctx.lineWidth = paddle.paddleHeight;
            //ctx.strokeStyle = "#000";
            //ctx.moveTo(paddle.paddleX, canvas.height - (paddle.paddleHeight / 2));
            //ctx.lineTo(paddle.paddleX + paddle.paddleWidth, canvas.height - (paddle.paddleHeight / 2));
            //ctx.stroke();
            //ctx.closePath();
        },
        drawPowerUP: function (ctx, powerups) {
            for (var i = 0; i < powerups.length; i++) {
                if (powerups[i].powerUP != undefined) {
                    var imgLife = new Image();
                    imgLife.src = powerups[i].powerUP;
                    ctx.drawImage(imgLife, powerups[i].position.x, powerups[i].position.y += 0.5, 25, 25);
                }
            }
        },
        endGame: function (score, time, win) {
            $("#bg")[0].pause();
            $('body').append(`
                <div class="overlay-box">
                    <h2>${win ? "Congratulations" : "Game Over"}</h2>
                    <div>
                        <div id="showScore">Score: ${score}</div>
                        <div id="showTime">Time: ${time}</div>
                        <a href="">Play Again</a>
                    </div>
                </div>`)
        },
        start: function () {
            $("#bg")[0].play();
            $(".overlay-box").remove();
        }
    }
})();

var AppController = (function (UICtrl, DCtrl) {

    var imgLife = new Image();
    var imgStar = new Image();
    var interval = null;

    function init() {
        var canvas = $("#myCanvas");
        canvas.attr("width", Math.min(window.innerWidth - 20, 800));
        canvas.attr("height", window.innerHeight - 20);
        var ctx = canvas[0].getContext("2d");
        DataController.init(canvas, ctx, 1);
        imgLife.src = "./imgs/heart.png";
        imgStar.src = "./imgs/star.png";
        imgLife.onload = function () {
            draw();
        }
    }

    function draw() {

        UICtrl.clearBall(DCtrl.getCanvas(), DCtrl.getCtx(), DCtrl.getBall());
        UICtrl.drawBall(DCtrl.getCtx(), DCtrl.getBall());
        UICtrl.drawPaddle(DCtrl.getCtx(), DCtrl.getPaddle(), DCtrl.getCanvas());
        DCtrl.movePaddle();
        if (DCtrl.OnPaddle()) {
            DCtrl.returnBall();
        }
        UICtrl.drawBricks(DCtrl.getCanvas(), DCtrl.getCtx(), DCtrl.getBricks(), DCtrl.getBricksOptions());
        UICtrl.displayCurrentState(DCtrl.getCtx(), DCtrl.getLife(), DCtrl.getCanvas().width - 20, 20, imgLife, DCtrl.getCanvas().width - 60, 5);
        UICtrl.displayCurrentState(DCtrl.getCtx(), DCtrl.getScore(), 60, 20, imgStar, 20, 5);
        if (!DCtrl.OnPaddle()) {
            DCtrl.reflectBall(DCtrl.getCanvas(), DCtrl.getBall());
            if (DCtrl.resetBall(DCtrl.getCanvas(), DCtrl.getBall(), DCtrl.getPaddle())) {
                if (DCtrl.getLife() == 0) {
                    DCtrl.clearTime();
                    UICtrl.endGame(DCtrl.getScore(), DCtrl.getTime(), false);
                    removeHandlers();
                }
                draw();
            }
            DCtrl.checkCollision();
            if (DCtrl.checkWin()) {
                DCtrl.clearTime();
                UICtrl.endGame(DCtrl.getScore(), DCtrl.getTime(), true);
                removeHandlers();
                draw();
            }
            UICtrl.drawPowerUP(DCtrl.getCtx(), DCtrl.getpowers());
            DCtrl.powerUpEffect(DCtrl.getCanvas(), DCtrl.getpowerUps(), DCtrl.getpowers(), DCtrl.getPaddle(), draw);
        }
    }

    $(".level").click(function (ev) {
        ev.preventDefault();
        DCtrl.setLevel(this.textContent.split(" ")[1]);
        UICtrl.start();
        DCtrl.startInterval(draw);
        document.addEventListener("keydown", function (e) {
            if (e.keyCode == 32) {
                if (DCtrl.OnPaddle()) {
                    DCtrl.throwBall();
                }
            } else {
                DCtrl.paddleMovement(e);
            }
        });
        document.addEventListener("keyup", function (e) {
                DCtrl.paddleMovement(e);
        });
    })
    function removeHandlers() {
        document.removeEventListener("keydown", function (e) {
            if (e.keyCode == 32) {
                if (DCtrl.OnPaddle()) {
                    DCtrl.throwBall();
                }
            } else {
                DCtrl.paddleMovement(e);
            }
        });
        document.removeEventListener("keyup", function (e) {
            DCtrl.paddleMovement(e);
        });
    }
    init();

})(UIController, DataController);
