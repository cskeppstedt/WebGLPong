/// <reference path="buffers.js" />
/// <reference path="models.js" />
/// <reference path="webgl-utils.js" />

window.Game = {
    RightPaddle: {
        Y: 0,
        Speed: 0.05
    },
    LeftPaddle: {
        Y: 0,
        Speed: 0.05
    },
    Ball: {
        X: 0,
        Y: 0,
        Speed: {
            X: 0.05,
            Y: 0.05
        }
    },
    Stack: [],
    ModelView: {},
    Perspective: {}
};

Game.ModelView = mat4.create();
Game.Perspective = mat4.create();

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

Game.Tick = function () {
    requestAnimFrame(Game.Tick);
    Game.Draw();
    Game.Animate();
};

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

    mat4.translate(Game.ModelView, [Settings.Limits.X, Game.LeftPaddle.Y, 0.0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.RightPaddle.Pos);
    gl.vertexAttribPointer(prog.vertexPositionAttribute, Buffers.RightPaddle.Pos.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.RightPaddle.Color);
    gl.vertexAttribPointer(prog.vertexColorAttribute, Buffers.RightPaddle.Color.itemSize, gl.FLOAT, false, 0, 0);

    Game.SetMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, Buffers.RightPaddle.Pos.numItems);

    Game.PopMatrix();

    // Left paddle

    Game.PushMatrix();

    mat4.translate(Game.ModelView, [-Settings.Limits.X, Game.RightPaddle.Y, 0.0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.LeftPaddle.Pos);
    gl.vertexAttribPointer(prog.vertexPositionAttribute, Buffers.LeftPaddle.Pos.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.LeftPaddle.Color);
    gl.vertexAttribPointer(prog.vertexColorAttribute, Buffers.LeftPaddle.Color.itemSize, gl.FLOAT, false, 0, 0);

    Game.SetMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, Buffers.LeftPaddle.Pos.numItems);

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
var keyDown = 0;
Game.Animate = function () {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;

        Game.LeftPaddle.Y += Game.LeftPaddle.Speed;

        if (Game.LeftPaddle.Y <= -Settings.Limits.Y || Game.LeftPaddle.Y >= Settings.Limits.Y)
            Game.LeftPaddle.Speed = -Game.LeftPaddle.Speed;

        var sign2 = 0;
        if (keyDown == 38)      // Arrow up
            sign2 = 0.2;
        else if (keyDown == 40) // Arrow down
            sign2 = -0.2;

        if (sign2 != 0) {
            var newTop2 = top2 + sign2;
            if (newTop2 <= -limitY)
                newTop2 = -limitY;
            else if (newTop2 >= limitY)
                newTop2 = limitY;

            top2 = newTop2;
        }

        Game.Ball.X += Game.Ball.Speed.X;
        Game.Ball.Y += Game.Ball.Speed.Y;


        var limitLeft = -Settings.Limits.X + (Settings.PaddleWidth + Settings.BallSize) / 2.0;
        var limitRight = -limitLeft;
        if (Game.Ball.X < limitLeft || Game.Ball.X > limitRight)
            Game.Ball.Speed.X = -Game.Ball.Speed.X;

        if (Game.Ball.Y < -Settings.Limits.Y || Game.Ball.Y > Settings.Limits.Y)
            Game.Ball.Speed.Y = -Game.Ball.Speed.Y;
    }

    lastTime = timeNow;
};