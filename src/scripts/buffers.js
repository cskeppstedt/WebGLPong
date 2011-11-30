/// <reference path="models.js" />
/// <reference path="webgl-utils.js" />

window.Buffers = {
    RightPaddlePos: {},
    RightPaddleColor: {},
    LeftPaddlePos: {},
    LeftPaddleColor: {},
    BallPos: {},
    BallColor: {}
};

Buffers.init = function () {
    var gl = State.GlCtx;

    Buffers.RightPaddlePos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.RightPaddlePos);

    var pw = Settings.PaddleWidth / 2.0;

    vertices = [
         pw, 1.0, 0.0,
        -pw, 1.0, 0.0,
         pw, -1.0, 0.0,
        -pw, -1.0, 0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    Buffers.RightPaddlePos.itemSize = 3;
    Buffers.RightPaddlePos.numItems = 4;

    Buffers.RightPaddleColor = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.RightPaddleColor);
    colors = []
    for (var i = 0; i < 4; i++) {
        colors = colors.concat([0.5, 0.5, 1.0, 1.0]);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    Buffers.RightPaddleColor.itemSize = 4;
    Buffers.RightPaddleColor.numItems = 4;

    // left

    Buffers.LeftPaddlePos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.LeftPaddlePos);
    vertices = [
         pw, 1.0, 0.0,
        -pw, 1.0, 0.0,
         pw, -1.0, 0.0,
        -pw, -1.0, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    Buffers.LeftPaddlePos.itemSize = 3;
    Buffers.LeftPaddlePos.numItems = 4;

    Buffers.LeftPaddleColor = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.LeftPaddleColor);
    colors = []
    for (var i = 0; i < 4; i++) {
        colors = colors.concat([1.0, 0.5, 1.0, 1.0]);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    Buffers.LeftPaddleColor.itemSize = 4;
    Buffers.LeftPaddleColor.numItems = 4;

    var halfBall = Settings.BallSize / 2.0;
    Buffers.BallPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.BallPos);
    vertices = [
             halfBall, 0.1, 0.0,
            -halfBall, 0.1, 0.0,
             halfBall, -0.1, 0.0,
            -halfBall, -0.1, 0.0
            ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    Buffers.BallPos.itemSize = 3;
    Buffers.BallPos.numItems = 4;

    Buffers.BallColor = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Buffers.BallColor);
    colors = []
    for (var i = 0; i < 4; i++) {
        colors = colors.concat([1.0, 1.0, 1.0, 1.0]);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    Buffers.BallColor.itemSize = 4;
    Buffers.BallColor.numItems = 4;
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