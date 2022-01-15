require("@electron/remote/main").initialize();
const { enable } = require("@electron/remote/main");
const { app, BrowserWindow, dialog } = require("electron");
const fs = require("fs");

let mainWindow = null;

app.on("ready", () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
        }
    });

    // require("@electron/remote/main").enable(mainWindow.webContents);
    enable(mainWindow.webContents);

    mainWindow.loadFile("./src/statics/index.html");

    mainWindow.webContents.openDevTools({
        mode: "detach"
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
});

async function getFileFromUser() {
    const files = (await dialog.showOpenDialog(mainWindow, {
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
        openFile(files[0]);
    };
};
function openFile(file) {
    const content = fs.readFileSync(file).toString();
    mainWindow.webContents.send("file-opened", file, content);
};

exports.getFileFromUser = getFileFromUser;

