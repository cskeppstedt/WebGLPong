/// <reference path="models.js" />
/// <reference path="webgl-utils.js" />

window.Game = {};

Game.Tick = function () {
    requestAnimFrame(Game.Tick);
    Game.Draw();
    Game.Animate();
};

Game.Draw = function () {
};

Game.Animate = function () {
};