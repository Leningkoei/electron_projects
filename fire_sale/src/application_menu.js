const { app, dialog, Menu, shell } = require("electron");
const mainProcess = require("./main.js");

const template = [
    {
        "label": "File",
        "submenu": [
            {
                "label": "New File",
                "accelerator": "CommandOrControl+N",
                "click": function click() {
                    mainProcess.createWindow();
                }
            },
            {
                "label": "Open File",
                "accelerator": "CommandOrControl+O",
                "click": function click(item, focusedWindow) {
                    mainProcess.getFileFromUser(focusedWindow);
                }
            },
            {
                "label": "Save File",
                "accelerator": "CommandOrControl+S",
                "click": function click(item, focusedWindow) {
                    if (!focuseWindow) {
                        return dialog.showErrorBox(
                            "Cannot Save or Export",
                            "There is currently no active document to save " +
                                "or export."
                        );
                    };

                    focusedWindow.webContents.send("save-markdown");
                }
            },
            {
                "label": "Save HTML",
                "accelerator": "CommandOrControl+Shift+S",
                "click": function click(item, focusedWindow) {
                    focusedWindow.webContents.send("save-html");
                }
            }
        ]
    },
    {
        "label": "Edit",
        "submenu": [
            {
                "label": "Undo",
                "accelerator": "CommandOrControl+Z",
                "role": "copy"
            },
            {
                "label": "Redo",
                "accelerator": "CommandOrControl+Y",
                "role": "copy"
            },
            {
                "label": "Cut",
                "accelerator": "CommandOrControl+X",
                "role": "cut"
            },
            {
                "label": "Copy",
                "accelerator": "CommandOrControl+C",
                "role": "copy",
            },
            {
                "label": "Paste",
                "accelerator": "CommandOrControl+V",
                "role": "paste"
            },
            {
                "label": "Select All",
                "accelerator": "CommandOrControl+A",
                "role": "selectall"
            }
        ]
    },
    {
        "label": "Window",
        "submenu": [
            {
                "label": "Minimize",
                "accelerator": "CommandOrControl+M",
                "role": "minimize"
            },
            {
                "label": "Close",
                "accelerator": "CommandOrControl+W",
                "role": "close"
            },
            {
                "label": "Toggle Dev Tools",
                "accelerator": "CommandOrControl+Shift+I",
                "role": "toggleDevTools"
            }
        ]
    }
];

if (process.platform == "darwin") {
    const name = "Fire Sale";

    template.unshift({
        "label": app.name
    });
};

module.exports = Menu.buildFromTemplate(template);

