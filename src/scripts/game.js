/******************************************************************************

    game.js
    
    Contains all game logic and drawing. Also keeps some state information
    such as paddle/ball positions, speedes and scores.

******************************************************************************/
/// <reference path="buffers.js" />
/// <reference path="models.js" />
/// <reference path="webgl-utils.js" />

// State storing
window.Game = {
    RightPaddle: {      // Position, speed and score for the "Human" paddle.
        Y: 0,
        Speed: 0.05,
        Score: 0
    },
    LeftPaddle: {       // Position, speed and score for the "AI" paddle.
        Y: 0,
        Speed: 0.05,
        Score: 0
    },
    Ball: {             // Position and speed of the ball.
        X: 0,
        Y: 0,
        Speed: {
            X: 0.05,
            Y: 0.05
        }
    },
    Stack: [],          // A matrix stack to be able to manipulate the ModelView.
    ModelView: {},      // A matrix that models the position/rotation of the model.
    Perspective: {},    // A perspective matrix (not used in the game).
    Running: false      // Indicator that tells if the game is active or not.
};

// Currently only calls the Reset() function, but
// could include more steps in the future.
Game.Init = function () {
    Game.Reset();
};

// Resets the game to a pristine state where the ball and the paddles 
// are in the middle, and the score is reset.
Game.Reset = function () {
    Game.ModelView = mat4.create();
    Game.Perspective = mat4.create();
    Game.ResetBall();
    Game.LeftPaddle.Y = 0;
    Game.RightPaddle.Y = 0;
    Game.LeftPaddle.Score = 0;
    Game.RightPaddle.Score = 0;
    Game.DisplayScores();
    Game.Running = false;
};

// Starts the game by giving the ball an initial speed.
Game.Start = function () {
    Game.Running = true;
    Game.StartBall();
};

// This function is called every "tick" of the animation.
// Draws the scene, then calculates the animations for next scene.
Game.Tick = function () {
    requestAnimFrame(Game.Tick);
    Game.Draw();
    Game.Animate();
};

// Pushes the ModelView matrix on to the stack.
Game.PushMatrix = function () {
    var copy = mat4.create();
    mat4.set(Game.ModelView, copy);
    Game.Stack.push(copy);
};

// Pops the value on the stack back to the ModelView matrix.
Game.PopMatrix = function () {
    if (Game.Stack.length == 0)
        throw "Stack is empty!";

    Game.ModelView = Game.Stack.pop();
};

// GL magic that needs to be done before gl.drawArrays()
Game.SetMatrixUniforms = function () {
    State.GlCtx.uniformMatrix4fv(State.Prog.pMatrixUniform, false, Game.Perspective);
    State.GlCtx.uniformMatrix4fv(State.Prog.mvMatrixUniform, false, Game.ModelView);
}

// Draws the scene (ball and paddles) from the values of the current state.
// Much of this is GL magic, but it basically renders the balls and paddles
// in their respective buffers given their current position.
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

// Function that calls the three, separate animation functions.
Game.Animate = function () {
    Game.AnimateBall();
    Game.AnimateLeftPaddle();
    Game.AnimateRightPaddle();
};

// Animates the left "AI" paddle. It is somewhat smart and tries to
// get close to the balls position. It can be tricked by "curving" the
// ball at high speeds though.
Game.AnimateLeftPaddle = function () {
    var halfPaddle = Settings.PaddleHeight / 2.0;
    if (Game.Ball.Speed.X > 0) {
        // ball is moving away from the AI paddle, go towards center
        if (Game.LeftPaddle.Y > halfPaddle)
            Game.LeftPaddle.Y -= Game.LeftPaddle.Speed;
        else if (Game.LeftPaddle.Y < -halfPaddle)
            Game.LeftPaddle.Y += Game.LeftPaddle.Speed;
    } else {
        // Ball is coming towards the paddle. Try closing in on the
        // Y position of the ball, but not too perfect - it must be
        // beatable.
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

    // Check that we are in between the limits.
    if (Game.LeftPaddle.Y <= -Settings.Limits.Y)
        Game.LeftPaddle.Y = -Settings.Limits.Y;
    else if (Game.LeftPaddle.Y >= Settings.Limits.Y)
        Game.LeftPaddle.Y = Settings.Limits.Y;
};

// Animates the right "Human" paddle. This is just depending
// on the key that is currently being pressed down.
Game.AnimateRightPaddle = function () {
    switch (State.KeyDown) {
        case 38: // Arrow up
            Game.RightPaddle.Speed = 0.2;
            break;
        case 40: // Arrow down
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

// Animates the ball. This function checks if the ball should bounce
// against the roof/floor or/and if it should bounce against a paddle.
// When it bounces against a paddle, AdjustBallSpeed() gives a somewhat
// unpredictable outgoing speed/direction.
Game.AnimateBall = function () {
    Game.Ball.X += Game.Ball.Speed.X;
    Game.Ball.Y += Game.Ball.Speed.Y;

    var limitLeft = -Settings.Limits.X + (Settings.PaddleWidth + Settings.BallSize) / 2.0;
    var limitRight = -limitLeft;

    var halfPad = Settings.PaddleHeight / 2.0;

    if (Game.Ball.X <= limitLeft) {
        // bounce against AI paddle?
        var limitY1 = Game.LeftPaddle.Y - halfPad;
        var limitY2 = Game.LeftPaddle.Y + halfPad;

        if (Game.Ball.Y >= limitY1 && Game.Ball.Y <= limitY2) {
            Game.Ball.Speed.X = -Game.Ball.Speed.X;
            Game.AdjustBallSpeed(Game.LeftPaddle);
        } else {
            // AI missed it, score to the Human paddle
            Game.RightPaddle.Score++;
            Game.Scored();
        }
    } else if (Game.Ball.X >= limitRight) {
        // bounce against Human paddle?
        var limitY1 = Game.RightPaddle.Y - halfPad;
        var limitY2 = Game.RightPaddle.Y + halfPad;

        if (Game.Ball.Y >= limitY1 && Game.Ball.Y <= limitY2) {
            Game.Ball.Speed.X = -Game.Ball.Speed.X;
            Game.AdjustBallSpeed(Game.RightPaddle);
        } else {
            // Human missed it, score to the AI paddle.
            Game.LeftPaddle.Score++;
            Game.Scored();
        }
    }

    // Check if we bounce against the roof/floor.
    if (Game.Ball.Y <= -(Settings.Limits.Y + halfPad) || Game.Ball.Y >= (Settings.Limits.Y + halfPad)) {
        State.Audio.playFX(SoundFx.WallHit);
        Game.Ball.Speed.Y = -Game.Ball.Speed.Y;
    }
};

// This function does two things. First, it increases the X velocity. This
// is always done on paddle hits, to increase the tempo of the game.
// Secondly, it can give the ball additional vertical speed if it hits on
// the lower or upper third of the paddle when the paddle is moving.
// This allows the player to do "curve balls" to trick the AI player.
Game.AdjustBallSpeed = function (paddle) {
    State.Audio.playFX(SoundFx.PaddleHit);
    
    // always increase the X speed
    if (Game.Ball.Speed.X < 0)
        Game.Ball.Speed.X -= Settings.SpeedIncrement;
    else
        Game.Ball.Speed.X += Settings.SpeedIncrement;

    // Split the paddle into three intervals:
    // upper third, middle third, and lower third.
    var base = paddle.Y - Settings.PaddleHeight / 2.0;
    var intervals = [
        base + Settings.PaddleHeight / 3.0,
        base + 2 * Settings.PaddleHeight / 3.0,
        base + Settings.PaddleHeight
    ];

    // if the ball hit any of the extreme intervals,
    // give it a boost.
    var ballY = Game.Ball.Y;
    if (ballY >= base && ballY < intervals[0])
        Game.Ball.Speed.Y += paddle.Speed / 2.0;
    else if (ballY >= intervals[1] && ballY < intervals[2])
        Game.Ball.Speed.Y -= paddle.Speed / 2.0;
}

// Called when a player scores. Updates the score display
// and plays a sound fx, and then resets the ball. After a
// short delay, the ball is activated.
Game.Scored = function () {
    State.Audio.playFX(SoundFx.Score);
    Game.DisplayScores();
    Game.ResetBall();
    setTimeout("Game.StartBall()", 500);
}

// Updates the score displays.
Game.DisplayScores = function () {
    $('#left-score').text(Game.LeftPaddle.Score);
    $('#right-score').text(Game.RightPaddle.Score);
};

// Gives the ball an initial starting velocity. The X velocity
// is always fixed in either direction, but the Y velocity is random
// in the interval [-InitSpeed, Initspeed].
Game.StartBall = function () {
    if (!Game.Running)
        return;

    if (Math.random() > 0.5)
        Game.Ball.Speed.X = Settings.InitSpeed;
    else
        Game.Ball.Speed.X = -Settings.InitSpeed;

    var ySpeed = Math.random() * Settings.InitSpeed * 2;
    Game.Ball.Speed.Y = ySpeed - Settings.InitSpeed;
};

// Resets the position and speed of the ball to
// stand still in the center.
Game.ResetBall = function () {
    Game.Ball.X = 0;
    Game.Ball.Y = 0;
    Game.Ball.Speed.X = 0;
    Game.Ball.Speed.Y = 0;
}