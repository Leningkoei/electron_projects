const remote = require("@electron/remote");
const { ipcRenderer } = require("electron");
const marked = require("marked");
const mainProcess = remote.require("./main.js");

const newFileButton = document.querySelector("#new-file");
const openFileButton = document.querySelector("#open-file");
const saveMarkdown = document.querySelector("#save-markdown");
const revert = document.querySelector("#revert");
const saveHTML = document.querySelector("#save-html");
const showFile = document.querySelector("#show-file");
const openInDefault = document.querySelector("#open-in-default");
const markdownView = document.querySelector("#markdown");
const htmlView = document.querySelector("#html");

openFileButton.addEventListener("click", () => {
    mainProcess.getFileFromUser();
});
markdownView.addEventListener("keyup", (event) => {
    const currentContent = event.target.value;
    renderMarkdownToHTML(currentContent);
});

ipcRenderer.on("file-opened", (event, file, content) => {
    markdownView.value = content;
    renderMarkdownToHTML(content);
});

function renderMarkdownToHTML(markdown) {
    htmlView.innerHTML = marked.parse(markdown, {
        sanitize: true
    });
};

