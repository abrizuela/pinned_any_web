const commandName = '_execute_browser_action';
/* selectors */
const shortcutElem = document.querySelector('#shortcut');
const resetElem = document.querySelector('#reset')
const updatedMessage = document.querySelector("#updatedMessage");
const errorMessage = document.querySelector("#errorMessage");
const webpageUrl = document.querySelector("#webpage");

async function setUrl(restoredSettings) {
    //console.log(`webpageUrl: ${restoredSettings.webpageUrl}`);
    if(restoredSettings.webpageUrl != undefined){
        webpageUrl.value = restoredSettings.webpageUrl
    } else {
        webpageUrl.value = "www.example.com"
    }
    
}

/**
 * Update the UI
 */
async function updateUI() {
    let commands = await browser.commands.getAll();
    for (command of commands) {
        if (command.name === commandName) {
            shortcutElem.value = command.shortcut;
        }
    }

    var gettingStoredSettings = browser.storage.sync.get();
    gettingStoredSettings.then(setUrl);
}

/**
 * Show (and hide) a message
 */
async function showMessage(elem) {
    elem.classList.replace("hidden", "shown");
    setTimeout(function () { elem.classList.replace("shown", "hidden"); }, 5000);
}

/**
 * Show and hide a message when the changes are saved
 */
async function msgUpdated() {
    showMessage(updatedMessage);
}

/**
 * Show an error message when the shortcut entered is invalid
 */
async function msgError() {
    showMessage(errorMessage);
}

/**
 * Update the shortcut based on the value in the textbox.
 */
async function updateShortcut() {
    if (endCaptureShortcut()) {
        await browser.commands.update({
            name: commandName,
            shortcut: shortcutElem.value
        });
        msgUpdated();
    } else {
        msgError();
    }
    updateUI();
    shortcutElem.blur();
}

/**
 * Reset the shortcut and update the textbox.
 */
async function resetShortcut() {
    await browser.commands.reset(commandName);
    updateUI();
    msgUpdated();
};

/**
 * Update the UI when the page loads.
 */
document.addEventListener('DOMContentLoaded', updateUI);

/**
 * Handle update and reset button clicks
 */
shortcutElem.addEventListener('focus', startCapturing);
shortcutElem.addEventListener('keydown', captureKey);
shortcutElem.addEventListener('keyup', updateShortcut);
resetElem.addEventListener('click', resetShortcut);
webpageUrl.addEventListener('blur', updateWebpageUrl)

function updateWebpageUrl() {
    //console.log(`saving: ${elem.value}`);
    browser.storage.sync.set({ webpageUrl: webpageUrl.value });
    msgUpdated();
};