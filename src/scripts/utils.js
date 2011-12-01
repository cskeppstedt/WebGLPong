/// <reference path="models.js" />

// Initializes the GL context on the canvas and stores the context
// in State.GlCtx.
function initGL() {
    try {
        State.GlCtx = State.Canvas.getContext("experimental-webgl");
        State.GlCtx.viewportWidth = State.Canvas.width;
        State.GlCtx.viewportHeight = State.Canvas.height;
        State.GlCtx.enable(State.GlCtx.DEPTH_TEST);
    } catch (e) { }

    if (!State.GlCtx) {
        alert("Could not initialise WebGL, sorry :-(");
        return 0;
    }
}

// Given the value of the id attribute of the shader script, this
// function loads the source, compiles it and returns the
// compiled shader.
function getShader(id) {
    var gl = State.GlCtx;
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

// Initializes the shader program and stores it in State.Prog.
// It loads the shaders and links the program.
function initProgram() {
    var gl = State.GlCtx;

    var fragmentShader = getShader("shader-fs");
    var vertexShader   = getShader("shader-vs");

    State.Prog = gl.createProgram();
    gl.attachShader(State.Prog, vertexShader);
    gl.attachShader(State.Prog, fragmentShader);
    gl.linkProgram(State.Prog);

    if (!gl.getProgramParameter(State.Prog, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(State.Prog);

    State.Prog.vertexPositionAttribute = gl.getAttribLocation(State.Prog, "aVertexPosition");
    gl.enableVertexAttribArray(State.Prog.vertexPositionAttribute);

    State.Prog.vertexColorAttribute = gl.getAttribLocation(State.Prog, "aVertexColor");
    gl.enableVertexAttribArray(State.Prog.vertexColorAttribute);

    State.Prog.pMatrixUniform = gl.getUniformLocation(State.Prog, "uPMatrix");
    State.Prog.mvMatrixUniform = gl.getUniformLocation(State.Prog, "uMVMatrix");
}