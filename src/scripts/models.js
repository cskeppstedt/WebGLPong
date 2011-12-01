// Contains various variables that are vital to the
// current state of the application as a whole, not the
// game in particular.
window.State = {
    GlCtx: {},      // The WebGL context within a canvas. Used in all rendering.
    Prog: {},       // The shader program, used in all the rendering.
    Canvas: {},     // Reference to the canvas that is used.
    Audio: null,    // Reference to the Audio class.
    KeyDown: {}     // Contains the currently pressed down key.
};

// Parameters for the game.
window.Settings = {
    Width: 560,         // Width of the canvas
    Height: 420,        // Height of the canvas
    PaddleWidth: 0.3,   // Paddle width in the GL coordinate system scale
    PaddleHeight: 1.5,  // Paddle height in the GL coordinate system scale
    BallSize: 0.2,      // Ball size in the GL coordinate system scale
    Limits: {           // these are coordinates in the GL context that the game uses as limits.
        X: 6.0,
        Y: 4.0
    },
    InitSpeed: 0.07,        // initial X velocity
    SpeedIncrement: 0.01    // The increment in X-velocity on each paddle hit.
};

// Sound effects in a format that Audio.js uses.
// [3.0, 0.4] for instance means "start at 3 seconds, play for 0.4 seconds".
window.SoundFx = {
    WallHit: [1.0, 0.1],        // when the ball hits the roof/floor
    PaddleHit: [2.0, 0.2],      // when the ball hits a paddle
    Score: [3.0, 0.4]           // when someone scores
};