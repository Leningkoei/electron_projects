import { app, BrowserWindow } from 'electron'
import path from 'path'

function createWindow() {
    const mainWindow: BrowserWindow = new BrowserWindow({
        height: 600,
        width: 800,
        webPreferences: {
            preload: path.join(__dirname, './preload.js'),
            contextIsolation: false,
            nodeIntegration: true
        }
    })
    mainWindow.loadFile('./public/index.html')
    // mainWindow.loadURL('https://leningkoei.github.io/')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
}

app.whenReady().then(() => {
    createWindow()
})
