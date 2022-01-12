const { app, BrowserWindow } = require("electron");

let mainWindow = null;

app.on("ready", () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
        }
    });

    mainWindow.loadFile("./src/statics/index.html");

    mainWindow.webContents.openDevTools({
        mode: "detach"
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
})

