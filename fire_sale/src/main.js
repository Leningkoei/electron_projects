require("@electron/remote/main").initialize();
const enableRemote = require("@electron/remote/main").enable;
const { app, BrowserWindow, dialog, Menu } = require("electron");
const fs = require("fs");
const applicationMenu = require("./application_menu.js");

const windows = new Set();
const openFiles = new Map();

app.on("ready", () => {
    Menu.setApplicationMenu(applicationMenu);

    createWindow();
});

function openFile(targetWindow, filePath) {
    const content = fs.readFileSync(filePath).toString();

    app.addRecentDocument(filePath);
    targetWindow.setRepresentedFilename(filePath);                              // add file to recently open file;

    targetWindow.webContents.send("file-opened", filePath, content);            // send a message to renderer process;

    startWatchingFile(targetWindow, filePath);
};
function startWatchingFile(targetWindow, filePath) {
    stopWatchingFile(targetWindow);

    const watcher = fs.watch(filePath, (event) => {
        if (event == "change") {
            // open this file again;

            const content = fs.readFileSync(filePath);

            targetWindow.webContents.send("file-changed", filePath, content);
        };
    });

    openFiles.set(targetWindow, watcher);
};
function stopWatchingFile(targetWindow) {
    if (openFiles.has(targetWindow)) {
        openFiles.get(targetWindow).close();

        openFiles.delete(openFiles);
    };
};

function createWindow() {
    let x = undefined;
    let y = undefined;
    const currentWindow = BrowserWindow.getFocusedWindow();

    if (currentWindow) {
        const [ currentWindowX, currentWindowY ] = currentWindow.getPosition();

        x = currentWindowX + 10;
        y = currentWindowY + 10;
    };

    let newWindow = new BrowserWindow({
        x: x,
        y: y,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
        }
    });

    newWindow.on("close", () => {
        if (newWindow.isDocumentEdited()) {
            event.preventDefault();

            const result = dialog.showMessageBox(newWindow, {
                "type": "warning",
                "title": "Quit with Unsaved Changes?",
                "message": "Your changes while be lost if you do not save.",
                "buttons": [
                    "Quit Anyway",
                    "Cancel"
                ],
                "defaultId": 1,
                "cancelId": 1
            });

            if (result === 0) {
                newWindow.destroy();
            };
        };
    });
    newWindow.on("closed", () => {
        windows.delete(newWindow);
        stopWatchingFile(newWindow);
        newWindow = null;
    });

    enableRemote(newWindow.webContents);

    newWindow.loadFile("./src/index.html");

    windows.add(newWindow);

    return newWindow;
};
async function getFileFromUser(targetWindow) {
    const files = (await dialog.showOpenDialog(targetWindow, {
        "properties": [ "openFile" ],
        "defaultPath": app.getPath("documents"),
        "filters": [
            {
                "name": "Markdown Files",
                "extensions": [ "md", "markdown" ]
            },
            {
                "name": "Text Files",
                "extensions": [ "txt" ]
           }
        ]
    })).filePaths;

    if (files.length) {
        openFile(targetWindow, files[0]);
    };
};
async function saveMarkdown(targetWindow, filePath, content) {
    if (!filePath) {
        filePath = (await dialog.showSaveDialog(targetWindow, {
            "title": "Save Markdown",
            "defaultPath": app.getPath("documents"),
            "filters": [
                {
                    "name": "Markdown Files",
                    "extensions": [ "md", "markdown" ]
                }
            ]
        })).filePath;
    };

    if (filePath) {
        fs.writeFileSync(filePath, content);
        openFile(targetWindow, filePath);
    };
};
async function saveHTML(targetWindow, content) {
    const filePath = (await dialog.showSaveDialog(targetWindow, {
        "title": "Save HTML",
        "defaultPath": app.getPath("documents"),
        "filters": [
            {
                "name": "HTML Files",
                "extensions": [ "html", "htm" ]
            }
        ]
    })).filePath;

    if (filePath) {
        fs.writeFileSync(filePath, content);
    };
};

exports.createWindow = createWindow;
exports.getFileFromUser = getFileFromUser;
exports.saveMarkdown = saveMarkdown;
exports.saveHTML = saveHTML;

