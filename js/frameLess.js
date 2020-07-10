const remote = require('electron').remote;

let isKiosk = false;
let isTitlebarShowed = false;

// When document has loaded, initialise
document.onreadystatechange = () => {
    if (document.readyState == "complete") {
        document.body.addEventListener('mousemove', mouseEvent => {
            let ypos;
            if (mouseEvent) ypos = mouseEvent.screenY;
            if ((isTitlebarShowed && ypos < 36) || !ypos) {
                document.body.classList.add('showTitlebar');
                document.body.classList.remove('hideTitlebar');
                isTitlebarShowed = true;
            } else {
                document.body.classList.add('hideTitlebar');
                document.body.classList.remove('showTitlebar');
                isTitlebarShowed = false;
            }
        });
        handleWindowControls();
    }
};


function handleWindowControls() {

    let win = remote.getCurrentWindow();

    document.getElementById('fullscreen-button').addEventListener("click", () => {
        isKiosk = true;
        if (win.isMaximized()) {
            win.setKiosk(true);
            toggleFullscreenButtons();
        } else {
            win.maximize();
            setTimeout(() => {
                win.setKiosk(true);
                toggleFullscreenButtons();
            }, 300);
        }
    });
    document.getElementById('unfullscreen-button').addEventListener("click", () => {
        isKiosk = false;
        win.setKiosk(false);
        win.unmaximize();
        toggleFullscreenButtons();
    });

    document.getElementById('min-button').addEventListener("click", () => {
        win.setKiosk(false);
        win.minimize();
        toggleFullscreenButtons();
    });

    document.getElementById('max-button').addEventListener("click", () => {
        win.setKiosk(false);
        win.maximize();
        toggleFullscreenButtons();
    });

    document.getElementById('restore-button').addEventListener("click", () => {
        win.setKiosk(false);
        win.unmaximize();
        toggleFullscreenButtons();
    });

    document.getElementById('close-button').addEventListener("click", () => {
        win.setKiosk(false);
        win.close();
    });

    toggleMaxRestoreButtons();
    toggleFullscreenButtons();
    win.on('maximize', toggleMaxRestoreButtons);
    win.on('unmaximize', toggleMaxRestoreButtons);
    win.on('focus', () => {
        if (isKiosk == true) win.setKiosk(true);
        toggleFullscreenButtons();
    });

    function toggleMaxRestoreButtons() {
        if (win.isMaximized() || win.isKiosk()) {
            document.body.classList.add('maximized');
        } else {
            document.body.classList.remove('maximized');
        }
    }

    function toggleFullscreenButtons() {
        if (win.isKiosk()) {
            document.body.classList.add('fullscreened');
            document.body.classList.remove('unfullscreened');
        } else {
            document.body.classList.add('unfullscreened');
            document.body.classList.remove('fullscreened');
        }
    }
}