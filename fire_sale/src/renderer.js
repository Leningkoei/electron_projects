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
    const filePath = getDraggedFile(event);
    // TODO

ipcRenderer.on("file-opened", (event, file, content) => {
    filePath = file;
    originalContent = content;

    markdownView.value = content;
    renderMarkdownToHTML(content);

    updateUserInterface(false);                                                 // update title of window;
});

function fileTypeIsSupported(file) {
    return [ "text/plain", "text/markdown" ].includes(file.type);
};
function getDraggedFile(event) {
    event.dataTransfer.items[0];
};
function getDroppedFile(event) {
    event.dataTransfer.files[0];
};
function renderMarkdownToHTML(markdown) {
    // htmlView.innerHTML = marked.parse(markdown, {
    //     sanitize: true
    // });

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

