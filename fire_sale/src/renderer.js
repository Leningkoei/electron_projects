const remote = require("@electron/remote");
const { ipcRenderer } = require("electron");
const marked = require("marked");
const path = require("path");
const mainProcess = remote.require("./main.js");

const currentWindow = remote.getCurrentWindow();
let filePath = null;
let originalContent = "";

const newFileButton = document.querySelector("#new-file");
const openFileButton = document.querySelector("#open-file");
const saveMarkdownButton = document.querySelector("#save-markdown");
const revertButton = document.querySelector("#revert");
const saveHTMLButton = document.querySelector("#save-html");
const showFileButton = document.querySelector("#show-file");
const openInDefaultButton = document.querySelector("#open-in-default");

const markdownView = document.querySelector("#markdown");
const htmlView = document.querySelector("#html");

ipcRenderer.on("file-opened", async (
    event,
    currentFilePath,
    currentContent
) => {
    if (currentWindow.isDocumentEdited()) {
        const result = await remote.dialog.showMessagebox(currentWindow, {
            "type": "warning",
            "title": "Overwrite Current Unsaved Changes?",
            "message": "Opening a new file in the window will overwrite your " +
                "unsaved changes. Open this file anyway?",
            "buttons": [
                "Yes",
                "Cancel"
            ],
            "defaultId": 1,
            "cancelId": 1
        });

        if (result === 0) {
            renderFile(currentFilePath, currentContent);
        };
    } else {
        renderFile(currentFilePath, currentContent);
    };
});
ipcRenderer.on("file-changed", async (
    event,
    currentFilePath,
    currentContent
) => {
    const result = await remote.dialog.showMessagebox(currentWindow, {
        "type": "warning",
        "title": "Overwrite Current Unsaved Changes?",
        "message": "Another application has changed this file. Load changes?",
        "button": [
            "Yes",
            "Cancel"
        ],
        "defaultId": 1,
        "cancelId": 1
    });

    if (result === 0) {
        renderFile(currentFilePath, currentContent);
    };
});
ipcRenderer.on("save-markdown", () => {
    mainProcess.saveMarkdown(currentWindow, filePath, markdownView.value);
});
ipcRenderer.on("save-html", () => {
    mainProcess.saveHTML(currentWindow, filePath, htmlView.innerHTML);
});

document.addEventListener("dragstart", event => event.preventDefault());
document.addEventListener("dragover", event => event.preventDefault());
document.addEventListener("dragleave", event => event.preventDefault());
document.addEventListener("drop", event => event.preventDefault());

newFileButton.addEventListener("click", () => {
    mainProcess.createWindow();
});
openFileButton.addEventListener("click", () => {
    mainProcess.getFileFromUser(currentWindow);
});
saveMarkdownButton.addEventListener("click", () => {
    mainProcess.saveMarkdown(currentWindow, filePath, markdownView.value);
});
revertButton.addEventListener("click", () => {
    markdownView.value = originalContent;
    renderMarkdownToHTML(originalContent);
});
saveHTMLButton.addEventListener("click", () => {
    mainProcess.saveHTML(currentWindow, htmlView.innerHTML);
});
markdownView.addEventListener("keyup", (event) => {
    const currentContent = event.target.value;

    renderMarkdownToHTML(currentContent);

    updateUserInterface(currentContent !== originalContent);
});
markdownView.addEventListener("dragover", (event) => {
    const file = getDraggedFile(event);

    if (fileTypeIsSupported(file)) {
        markdownView.classList.add("drag-over");
    } else {
        markdownView.classList.add("drag-error");
    };
});
markdownView.addEventListener("drop", (event) => {
    const filePath = getDroppedFile(event);

    if (fileTypeIsSupported(filePath)) {
        mainProcess.openFile(currentWindow, file.path);
    } else {
        alert("That file type is not supported!");
    };

    markdownView.classList.remove("drag-over");
    markdownView.classList.remove("drag-error");
});
markdownView.addEventListener("dragleave", (event) => {
    markdownView.classList.remove("drag-over");
    markdownView.classList.remove("drag-error");
});

function fileTypeIsSupported(file) {
    return [ "text/plain", "text/markdown" ].includes(file.type);
};
function getDraggedFile(event) {
    return event.dataTransfer.items[0];
};
function getDroppedFile(event) {
    return event.dataTransfer.files[0];
};
function renderFile(currentFilePath, currentContent) {
    filePath = currentFilePath;
    originalContent = currentContent;

    markdownView.value = currentContent;
    renderMarkdownToHTML(currentContent);

    updateUserInterface(false);
};
function renderMarkdownToHTML(markdown) {
    htmlView.innerHTML = marked.parse(markdown);
};
function updateUserInterface(isEdited) {
    let title = "Fire Sale";

    if (filePath) {
        title = path.basename(filePath) + " - " + title;                        // path.basename(filePath): get file name;
    };

    if (isEdited) {
        title += " (Edited) ";
    };

    saveMarkdownButton.disabled = !isEdited;
    revertButton.disabled = !isEdited;

    currentWindow.setTitle(title);
};

