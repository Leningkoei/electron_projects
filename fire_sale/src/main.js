require("@electron/remote/main").initialize();
const enableRemote = require("@electron/remote/main").enable;
const { app, BrowserWindow, dialog } = require("electron");
const fs = require("fs");

// let mainWindow = null;
const windows = new Set();

app.on("ready", () => {
    createWindow();

    // mainWindow = new BrowserWindow({
    //     webPreferences: {
    //         contextIsolation: false,
    //         nodeIntegration: true
    //     }
    // });

    // mainWindow.on("closed", () => {
    //     mainWindow = null;
    // });

   /// / require("@electron/remote/main").enable(mainWindow.webContents);
    // enableRemote(mainWindow.webContents);

    // mainWindow.loadFile("./src/statics/index.html");

    // mainWindow.webContents.openDevTools({
    //     mode: "detach"
    // });
});

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
        properties: [ "openFile" ],
        filters: [
            {
                name: "Text Files",
                extensions: ["txt"]
            },
            {
                name: "Markdown Files",
                extensions: [ "md", "markdown" ]
            }
        ]
    })).filePaths;

    if (files.length) {
        openFile(targetWindow, files[0]);
    };
};
function openFile(targetWindow, file) {
    const content = fs.readFileSync(file).toString();

    targetWindow.webContents.send("file-opened", file, content);
};

exports.createWindow = createWindow;
exports.getFileFromUser = getFileFromUser;

