let loading = false;

const resultField = document.querySelector('#result');
const resultDialog = document.querySelector('#dialog');
const resultDialogCloseBtn = document.querySelector('#dialog-close');
const resultDialogCopyBtn = document.querySelector('#result-copy');
const resultDialogDLBtn = document.querySelector('#result-to-txt');

function displayResult(text){
    resultDialog.showModal();
    resultField.textContent = text;
}

const errorDialog = document.querySelector('#error');
const errorField = document.querySelector('#error > p');
const errorDialogCloseBtn = document.querySelector('#error-close');

errorDialogCloseBtn.addEventListener('click', () => {
    errorDialog.close();
})

function handleError(error) {
    if (String(error).indexOf('NetworkError') != -1) {
        errorField.textContent = "check your internet connection or check status";
        errorDialog.showModal();
    }
    console.error(error);
    loading = false;
    fileZone.classList.remove('loading');
}

function customError(string) {
    errorField.textContent = string;
    errorDialog.showModal();
    loading = false;
    fileZone.classList.remove('loading');
}

resultDialogCopyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(resultField.textContent);
    resultDialogCopyBtn.textContent = 'copied!';
    setTimeout(() => resultDialogCopyBtn.textContent = 'copy', 1000)
})


resultDialogDLBtn.addEventListener('click', () => {
    // eww
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(resultField.textContent));
    element.setAttribute('download', `${(resultField.textContent).split(' ')[0]}.txt`);
    element.style.display = 'none';
    document.body.append(element);
    element.click();
    element.remove();
})

resultDialogCloseBtn.addEventListener('click', () => {
    resultDialog.close();
})


const fileZone = document.querySelector('#file-zone');
const fileInput = document.querySelector('#file-input');
const langaugeDropdown = document.querySelector('#lang-select');

function uploadFiles(file) {
    if (loading) {
        return;
    }
    if ((file.size) > 20000000) {
        customError("your file is too big")
        return;
    }
    if ((file.type).indexOf('image') == -1 ) {
        customError("file is not an image")
        return;
    }
    loading = true;
    fileZone.classList.add('loading');
    fetch(`http://${location.hostname}:3000/recognize?` + new URLSearchParams({lang: langaugeDropdown.value}), {
        method: 'POST',
        body: file
    })
        .then(res => {
            if (res.status == 400) {
                customError('your file was declined by server');
                return;
            }
            loading = false;
            fileZone.classList.remove('loading');
            return res.json();
        })
        .then(body => displayResult(body.result))
        .catch(error => handleError(error));
}

function clickHandler() {
    if(fileInput) {
        fileInput.click();
    }
}

function handleInputChange() {
    uploadFiles(fileInput.files[0]);
}

function handleDrop(ev) {
    ev.preventDefault();
    fileZone.classList.remove('file-hovered');
    uploadFiles(ev.dataTransfer.files[0]);
}

function handleDragOver(ev) {
    ev.preventDefault();
}

function handleDrag(ev) {
    ev.preventDefault();
    if (ev.type === "dragenter") {
        fileZone.classList.add('file-hovered');
    }
    if (ev.type === "dragleave") {
        fileZone.classList.remove('file-hovered');
    }
  }
  

fileZone.addEventListener('click', clickHandler);
fileZone.addEventListener('drop', handleDrop);
fileZone.addEventListener('dragover', handleDragOver);
fileZone.addEventListener('dragenter', handleDrag);
fileZone.addEventListener('dragleave', handleDrag);

fileInput.addEventListener('change', handleInputChange);

const aboutDialog = document.querySelector('#about');

document.querySelector('#aboutBtn').addEventListener('click', () => {
    aboutDialog.showModal();
})

document.querySelector('#about-close').addEventListener('click', () => {
    aboutDialog.close();
})

document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('click', e => {
        if (!e.target.closest('div')) {
            e.target.close();
        }
    })
})
// https://stackoverflow.com/a/54267686 awesome solution!!
