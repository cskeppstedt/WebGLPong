/// <reference path="models.js" />
/// <reference path="webgl-utils.js" />

window.Buffers = {
    RightPaddle: {
        Pos: {},
        Color: {}
    },
    LeftPaddle: {
        Pos: {},
        Color: {}
    },
    Ball: {
        Pos: {},
        Color: {}
    }
};

Buffers.init = function () {
    var gl = State.GlCtx;

    Buffers.RightPaddle.Pos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.RightPaddle.Pos);

    var pw = Settings.PaddleWidth / 2.0;
    var ph = Settings.PaddleHeight / 2.0;
    vertices = [
         pw, ph, 0.0,
        -pw, ph, 0.0,
         pw, -ph, 0.0,
        -pw, -ph, 0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    Buffers.RightPaddle.Pos.itemSize = 3;
    Buffers.RightPaddle.Pos.numItems = 4;

    Buffers.RightPaddle.Color = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.RightPaddle.Color);
    colors = []
    for (var i = 0; i < 4; i++) {
        colors = colors.concat([1.0, 1.0, 1.0, 1.0]);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    Buffers.RightPaddle.Color.itemSize = 4;
    Buffers.RightPaddle.Color.numItems = 4;

    // left

    Buffers.LeftPaddle.Pos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.LeftPaddle.Pos);
    vertices = [
         pw, ph, 0.0,
        -pw, ph, 0.0,
         pw, -ph, 0.0,
        -pw, -ph, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    Buffers.LeftPaddle.Pos.itemSize = 3;
    Buffers.LeftPaddle.Pos.numItems = 4;

    Buffers.LeftPaddle.Color = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.LeftPaddle.Color);
    colors = []
    for (var i = 0; i < 4; i++) {
        colors = colors.concat([1.0, 1.0, 1.0, 1.0]);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    Buffers.LeftPaddle.Color.itemSize = 4;
    Buffers.LeftPaddle.Color.numItems = 4;

    var halfBall = Settings.BallSize / 2.0;
    Buffers.Ball.Pos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.Ball.Pos);
    vertices = [
         halfBall,  halfBall, 0.0,
        -halfBall,  halfBall, 0.0,
         halfBall, -halfBall, 0.0,
        -halfBall, -halfBall, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    Buffers.Ball.Pos.itemSize = 3;
    Buffers.Ball.Pos.numItems = 4;

    Buffers.Ball.Color = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.Ball.Color);
    colors = []
    for (var i = 0; i < 4; i++) {
        colors = colors.concat([1.0, 1.0, 1.0, 1.0]);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    Buffers.Ball.Color.itemSize = 4;
    Buffers.Ball.Color.numItems = 4;
    /*
    function getPosBuffer(vertices, itemSize, numItems) {
    }

    function getColorBuffer() {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    colors = []
    for (var i = 0; i < 4; i++)
    colors = colors.concat([1.0, 1.0, 1.0, 1.0]);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    buffer.itemSize = 4;
    buffer.numItems = 4;

    return buffer;
    }*/
};