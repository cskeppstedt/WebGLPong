window.State = {
    GlCtx: {},
    Prog: {},
    Canvas: {},
    KeyDown: {}
};

window.Settings = {
    Width: 560,
    Height: 420,
    PaddleWidth: 0.3,
    PaddleHeight: 1.5,
    BallSize: 0.2,
    Limits: {
        X: 6.0,
        Y: 4.0
    },
    InitSpeed: 0.07,
    SpeedIncrement: 0.01
};

window.SoundFx = {
    WallHit: [1.0, 0.1],
    PaddleHit: [2.0, 0.2],
    Score: [3.0, 0.4]
};