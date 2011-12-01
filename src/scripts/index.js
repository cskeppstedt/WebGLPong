$(function () {
    var currentView = 'game';

    $('body').keydown(function (e) {
        if (currentView == 'game') {
            if (e.keyCode == 32 && Game.Running === false) {// 32 = space
                $('#welcome').fadeOut('fast');
                Game.Start();
            } else {
                State.KeyDown = e.keyCode;
            }
        }
    }).keyup(function () {
        State.KeyDown = 0;
    });

    $('#pong-button').click(function (e) {
        showGame();
        return false;
    });

    $('#credits-button').click(function (e) {
        showCredits();
        return false;
    });

    State.Audio = new Audio();

    State.Canvas = document.getElementById("screen");
    initGL();
    initProgram();
    Buffers.init();
    Game.Init();
    Game.Tick();

    function showGame() {
        if (currentView == 'game')
            return;

        currentView = 'game';
        $('#welcome').show();
        $('#game-wrapper').show();
        $('#credits-wrapper').hide();
        State.Audio.stopMusic();
    }

    function showCredits() {
        if (currentView == 'credits')
            return;
        $('#game-wrapper').hide();
        $('#credits-wrapper').show();
        currentView = 'credits';
        State.Audio.playMusic([0.0, 247.0], true);
        Game.Reset();
        $('#credits').css('margin-top', '310px');
        creditsAnimation();
    }

    function creditsAnimation() {
        $('#credits').animate({
            'margin-top': '-=780',
            easing: 'linear'
        }, 30000, function () {
            if (currentView == 'credits') {
                $('#credits').css('margin-top', '310px');
                creditsAnimation();
            }
        });
    }
});