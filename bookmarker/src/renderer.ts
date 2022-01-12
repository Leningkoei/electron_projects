import Bookmarker from "./models/Bookmarker.js"

//#region get dom elements
const errorMessage: HTMLSelectElement =
    document.querySelector('.error-message')
const newBookmarkerForm: HTMLSelectElement =
    document.querySelector('.new-bookmarkers-form')
const newBookmarkerUrl: HTMLSelectElement =
    document.querySelector('.new-bookmarker-url')
const newBookmarkerSubmit: HTMLSelectElement =
    document.querySelector('.new-bookmarker-submit')
const bookmarkersSelection: HTMLSelectElement =
    document.querySelector('.bookmarkers')
const clearStorageButton: HTMLSelectElement =
    document.querySelector('.clear-storage')
//#endregion

rendBookmarkers()

// enable or disable submit button by url's validity
newBookmarkerUrl.addEventListener('keyup', () => {
    newBookmarkerSubmit.disabled = !newBookmarkerUrl.validity.valid
})
//
newBookmarkerSubmit.addEventListener('click', (event: MouseEvent) => {
    event.preventDefault()  // disable submit default event

    const url: string = newBookmarkerUrl.value
    fetch(url)
        .then((res: Response) => res.text())
        .then(parseDom)
        .then(getTitle)
        .then((title: string) => storeLink(title, url))
        .then(clearForm)
        .then(rendBookmarkers)
})
//
clearStorageButton.addEventListener('click', () => {
    localStorage.clear()
    bookmarkersSelection.innerHTML = ''
})

// parse string to dom
const parser = new DOMParser()
function parseDom(text: string): Document {
    return parser.parseFromString(text, 'text/html')
}
// get title from a dom
function getTitle(dom: Document) {
    return dom.querySelector('title').innerText
}
// store title and link to browser local storage
function storeLink(title: string, url: string) {
    localStorage.setItem(url, JSON.stringify(new Bookmarker(url, title)))
}
// clear new link url input
function clearForm() {
    newBookmarkerUrl.value = ''
}
// get bookmarkers to a list from browser local storage
function getBookmarkers(): Bookmarker[] {
    return Object.keys(localStorage).map((url: string) => {
        return JSON.parse(localStorage.getItem(url))
    })
}
//
function convertBookmarkToElement(bookmarker: Bookmarker): string {
    return `
        <div class="link">
            <h3><a href="${bookmarker.url}">${bookmarker.title}</a></h3>
        </div>
    `
}
//
function rendBookmarkers() {
    const bookmarkerElements: string =
        getBookmarkers().map(convertBookmarkToElement).join('')
    bookmarkersSelection.innerHTML = bookmarkerElements
}
