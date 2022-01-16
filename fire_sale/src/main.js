require("@electron/remote/main").initialize();
const enableRemote = require("@electron/remote/main").enable;
const { app, BrowserWindow, dialog } = require("electron");
const fs = require("fs");

const windows = new Set();

app.on("ready", () => {
    createWindow();
});

function openFile(targetWindow, filePath) {
    const content = fs.readFileSync(filePath).toString();

    app.addRecentDocument(filePath);
    targetWindow.setRepresentedFilename(filePath);                              // add file to recently open file;

    targetWindow.webContents.send("file-opened", filePath, content);            // send a message to renderer process;
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

    newWindow.on("closed", () => {
        windows.delete(newWindow);
        newWindow = null;
    });

    enableRemote(newWindow.webContents);

    newWindow.loadFile("./src/statics/index.html");

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

