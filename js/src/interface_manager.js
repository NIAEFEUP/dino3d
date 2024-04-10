/**
 * InterfaceManager class.
 * @type {InterfaceManager}
 */


class InterfaceManager {
    constructor() {
    	this.buttons = {
    		"start": document.getElementById('game-start'),
			"startLower": document.getElementById('game-start-bottom'),
    		"restart": document.getElementById('game-restart')
    	};

    	this.indicators = {
    		"load": document.getElementById('game-load-progress')
    	};

        this.other = {
            "preloader": document.getElementById('preloader'),
            "overlay": document.getElementById('chrome-no-internet')
        }
    }

    init() {
    	// hook buttons
    	this.buttons.start.addEventListener('click', this.btnStartClick);
		this.buttons.startLower.addEventListener('click', this.btnStartClickLower);
    }

	startGame(cameraSection=null) {
		game.interface.buttons.start.display = 'none'; //hide
		game.interface.buttons.startLower.display = 'none';
   		document.body.classList.add('game-started');

		game.startCalibration(cameraSection);
	}

	btnStartClick(e) {
		game.interface.startGame();
	}

	btnStartClickLower(e) {
		game.interface.startGame(CameraSection.BOTTOM);
	}
}
