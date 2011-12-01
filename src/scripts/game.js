/// <reference path="Audio.js" />
/// <reference path="buffers.js" />
/// <reference path="models.js" />
/// <reference path="webgl-utils.js" />

window.Game = {
    RightPaddle: {
        Y: 0,
        Speed: 0.05,
        Score: 0
    },
    LeftPaddle: {
        Y: 0,
        Speed: 0.05,
        Score: 0
    },
    Ball: {
        X: 0,
        Y: 0,
        Speed: {
            X: 0.05,
            Y: 0.05
        },
        LastX: 0
    },
    Stack: [],
    ModelView: {},
    Perspective: {},
    Audio: null,
    Running: false
};

Game.Init = function () {
    Game.Audio = new Audio();
    Game.ModelView = mat4.create();
    Game.Perspective = mat4.create();
    Game.ResetBall();
};

Game.Start = function () {
    Game.Running = true;
    Game.StartBall();
};

Game.Tick = function () {
    requestAnimFrame(Game.Tick);
    Game.Draw();
    Game.Animate();
};

Game.PushMatrix = function () {
    var copy = mat4.create();
    mat4.set(Game.ModelView, copy);
    Game.Stack.push(copy);
};

Game.PopMatrix = function () {
    if (Game.Stack.length == 0)
        throw "Stack is empty!";

    Game.ModelView = Game.Stack.pop();
};

Game.SetMatrixUniforms = function () {
    State.GlCtx.uniformMatrix4fv(State.Prog.pMatrixUniform, false, Game.Perspective);
    State.GlCtx.uniformMatrix4fv(State.Prog.mvMatrixUniform, false, Game.ModelView);
}

Game.Draw = function () {
    var gl = State.GlCtx;
    var prog = State.Prog;

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, Game.Perspective);
    mat4.identity(Game.ModelView);
    mat4.translate(Game.ModelView, [0, 0.0, -12.0]);

    // Right paddle

    Game.PushMatrix();

    mat4.translate(Game.ModelView, [-Settings.Limits.X, Game.LeftPaddle.Y, 0.0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.LeftPaddle.Pos);
    gl.vertexAttribPointer(prog.vertexPositionAttribute, Buffers.LeftPaddle.Pos.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.LeftPaddle.Color);
    gl.vertexAttribPointer(prog.vertexColorAttribute, Buffers.LeftPaddle.Color.itemSize, gl.FLOAT, false, 0, 0);

    Game.SetMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, Buffers.LeftPaddle.Pos.numItems);

    Game.PopMatrix();

    // Left paddle

    Game.PushMatrix();

    mat4.translate(Game.ModelView, [Settings.Limits.X, Game.RightPaddle.Y, 0.0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.RightPaddle.Pos);
    gl.vertexAttribPointer(prog.vertexPositionAttribute, Buffers.RightPaddle.Pos.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.RightPaddle.Color);
    gl.vertexAttribPointer(prog.vertexColorAttribute, Buffers.RightPaddle.Color.itemSize, gl.FLOAT, false, 0, 0);

    Game.SetMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, Buffers.RightPaddle.Pos.numItems);

    Game.PopMatrix();

    // Ball

    Game.PushMatrix();

    mat4.translate(Game.ModelView, [Game.Ball.X, Game.Ball.Y, 0.0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.Ball.Pos);
    gl.vertexAttribPointer(prog.vertexPositionAttribute, Buffers.Ball.Pos.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.Ball.Color);
    gl.vertexAttribPointer(prog.vertexColorAttribute, Buffers.Ball.Color.itemSize, gl.FLOAT, false, 0, 0);

    Game.SetMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, Buffers.Ball.Pos.numItems);

    Game.PopMatrix();
};

var lastTime = 0;
Game.Animate = function () {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        Game.AnimateBall();
        Game.AnimateLeftPaddle();
        Game.AnimateRightPaddle();
    }

    lastTime = timeNow;
};

Game.AnimateLeftPaddle = function () {
    var halfPaddle = Settings.PaddleHeight / 2.0;
    if (Game.Ball.Speed.X > 0) {
        // ball is moving away from the AI paddle, go towards center
        if (Game.LeftPaddle.Y > halfPaddle)
            Game.LeftPaddle.Y -= Game.LeftPaddle.Speed;
        else if (Game.LeftPaddle.Y < -halfPaddle)
            Game.LeftPaddle.Y += Game.LeftPaddle.Speed;
    } else {
        var distance = Math.abs(Game.LeftPaddle.Y - Game.Ball.Y);
        if (distance > halfPaddle / 2.0) {
            var speed = (distance*2 + Game.Ball.Speed.Y*0.4) / 10
            if (Game.LeftPaddle.Y > Game.Ball.Y)
                Game.LeftPaddle.Speed = -speed;
            else
                Game.LeftPaddle.Speed = speed;

            Game.LeftPaddle.Y += Game.LeftPaddle.Speed;
        }
    }

    if (Game.LeftPaddle.Y <= -Settings.Limits.Y)
        Game.LeftPaddle.Y = -Settings.Limits.Y;
    else if (Game.LeftPaddle.Y >= Settings.Limits.Y)
        Game.LeftPaddle.Y = Settings.Limits.Y;
};

Game.AnimateRightPaddle = function () {
    switch (State.KeyDown) {
        case 38: // Arrow up
            Game.RightPaddle.Speed = 0.2;
            break;
        case 40: // Arrow up
            Game.RightPaddle.Speed = -0.2;
            break;
        default:
            Game.RightPaddle.Speed = 0.0;
    }

    if (Game.RightPaddle.Speed != 0) {
        var newTop2 = Game.RightPaddle.Y + Game.RightPaddle.Speed;
        if (newTop2 <= -Settings.Limits.Y)
            newTop2 = -Settings.Limits.Y;
        else if (newTop2 >= Settings.Limits.Y)
            newTop2 = Settings.Limits.Y;

        Game.RightPaddle.Y = newTop2;
    }
};

Game.AnimateBall = function () {
    Game.Ball.LastX = Game.Ball.X;
    Game.Ball.X += Game.Ball.Speed.X;
    Game.Ball.Y += Game.Ball.Speed.Y;

    var limitLeft = -Settings.Limits.X + (Settings.PaddleWidth + Settings.BallSize) / 2.0;
    var limitRight = -limitLeft;

    var halfPad = Settings.PaddleHeight / 2.0;

    if (Game.Ball.X <= limitLeft) {
        var limitY1 = Game.LeftPaddle.Y - halfPad;
        var limitY2 = Game.LeftPaddle.Y + halfPad;

        if (Game.Ball.Y >= limitY1 && Game.Ball.Y <= limitY2) {
            Game.Ball.Speed.X = -Game.Ball.Speed.X;
            Game.AdjustBallSpeed(Game.LeftPaddle);
        } else {
            Game.RightPaddle.Score++;
            Game.Scored();
        }
    } else if (Game.Ball.X >= limitRight) {
        var limitY1 = Game.RightPaddle.Y - halfPad;
        var limitY2 = Game.RightPaddle.Y + halfPad;

        if (Game.Ball.Y >= limitY1 && Game.Ball.Y <= limitY2) {
            Game.Ball.Speed.X = -Game.Ball.Speed.X;
            Game.AdjustBallSpeed(Game.RightPaddle);
        } else {
            Game.LeftPaddle.Score++;
            Game.Scored();
        }
    }

    if (Game.Ball.Y <= -(Settings.Limits.Y + halfPad) || Game.Ball.Y >= (Settings.Limits.Y + halfPad)) {
        Game.Audio.playFX(SoundFx.WallHit);
        Game.Ball.Speed.Y = -Game.Ball.Speed.Y;
    }
};

Game.AdjustBallSpeed = function (paddle) {
    Game.Audio.playFX(SoundFx.PaddleHit);
    
    // always increase the X speed
    if (Game.Ball.Speed.X < 0)
        Game.Ball.Speed.X -= Settings.SpeedIncrement;
    else
        Game.Ball.Speed.X += Settings.SpeedIncrement;


    var base = paddle.Y - Settings.PaddleHeight / 2.0;
    var intervals = [
        base + Settings.PaddleHeight / 3.0,
        base + 2 * Settings.PaddleHeight / 3.0,
        base + Settings.PaddleHeight
    ];

    var ballY = Game.Ball.Y;
    if (ballY >= base && ballY < intervals[0])
        Game.Ball.Speed.Y += paddle.Speed / 2.0;
    else if (ballY >= intervals[1] && ballY < intervals[2])
        Game.Ball.Speed.Y -= paddle.Speed / 2.0;

}

Game.Scored = function () {
    Game.Audio.playFX(SoundFx.Score);
    $('#left-score').text(Game.LeftPaddle.Score);
    $('#right-score').text(Game.RightPaddle.Score);
    Game.ResetBall();
    setTimeout("Game.StartBall()", 500);
}

Game.StartBall = function () {
    if (Math.random() > 0.5)
        Game.Ball.Speed.X = Settings.InitSpeed;
    else
        Game.Ball.Speed.X = -Settings.InitSpeed;

    var ySpeed = Math.random() * Settings.InitSpeed * 2;
    Game.Ball.Speed.Y = ySpeed - Settings.InitSpeed;
};

Game.ResetBall = function () {
    Game.Ball.X = 0;
    Game.Ball.Y = 0;
    Game.Ball.Speed.X = 0;
    Game.Ball.Speed.Y = 0;
}