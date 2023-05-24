let currentTabId;
let currentWinId;
let webpageTabId;
let webpageWinId;
let previousTab;
let previousWin;
let webpageUrlStored;

function onError(e) {
    console.log("***Error: " + e);
};

function setButtonIcon(imageURL) {
    try {
        browser.browserAction.setIcon({ path: imageURL });
    } catch (e) {
        onError(e);
    }
};

function createPinnedTab() {
    browser.tabs.create(
        {
            url: webpageUrlStored,
            pinned: true,
            active: true
        }
    )
};

function handleSearch(webpageTabs) {
    //console.log("currentTabId: " + currentTabId);
    //console.log("currentWinId: " + currentWinId);
    if (webpageTabs.length > 0) {
        //console.log("there is a webpage tab");
        webpageTabId = webpageTabs[0].id;
        webpageWinId = webpageTabs[0].windowId;
        if (webpageTabId === currentTabId) {
            //console.log("I'm in the webpage tab");
            browser.windows.update(previousWin, { focused: true })
            browser.tabs.update(previousTab, { active: true, });
        } else {
            //console.log("I'm NOT in the webpage tab");
            previousTab = currentTabId;
            previousWin = currentWinId;
            browser.windows.update(webpageWinId, { focused: true, });
            browser.tabs.update(webpageTabId, { active: true, });
        }
        setButtonIcon(webpageTabs[0].favIconUrl);
    } else {
        //console.log("there is NO webpage tab");
        previousTab = currentTabId;
        createPinnedTab();
    }
};

function onGot(restoredSettings) {
    if (restoredSettings.webpageUrl != undefined) {
        webpageUrlStored = `http://${restoredSettings.webpageUrl}/`;
        let querying = browser.tabs.query({ url: `*://${restoredSettings.webpageUrl}/*` });
        querying.then(handleSearch, onError);
    } else {
        browser.runtime.openOptionsPage();
    };

};

function handleClick(tab) {
    //console.log("*********Button clicked*********");
    currentTabId = tab.id;
    currentWinId = tab.windowId;
    var gettingStoredSettings = browser.storage.sync.get();
    gettingStoredSettings.then(onGot, onError);
};

function update(details) {
    if (details.reason === "install" || details.reason === "update") {
        browser.runtime.openOptionsPage();
    }
};

browser.browserAction.onClicked.addListener(handleClick);
browser.runtime.onInstalled.addListener(update);