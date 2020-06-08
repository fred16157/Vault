const pos = new URLSearchParams(window.location.search).get('pos');
var updateFileList = () => {
    var inputlist = document.getElementById('file-input-list');
    inputlist.innerHTML = '';
    var pathinput = document.getElementById('path-input');
    if(pos == null || pos == undefined) {
        pathinput.value = "";
    } 
    else {
        pathinput.value = pos + pathinput.value;    
    }
    pathinput.value += "/";
    document.getElementById('upload-form').appendChild(pathinput);
    for (var i = 0; i < document.getElementById('file-input').files.length; i++) {
        var item = document.createElement('li');
        item.innerText = document.getElementById('file-input').files[i].name;
        inputlist.appendChild(item);
    }
}

document.ondragover = (e) => {
    e.preventDefault();
}

document.ondrop = (e) => {
    e.preventDefault();
    document.getElementById('file-input').files = e.dataTransfer.files;
    
    updateFileList();
}

var makeDir = (e) => {
    if(document.getElementById('dir-name-input').value == undefined) e.preventDefault();
    if(pos == null || pos == undefined) {
        document.getElementById('dir-name-input').value = "/" + document.getElementById('dir-name-input').value;
    } 
    else {
        document.getElementById('dir-name-input').value = pos + "/" + document.getElementById('dir-name-input').value;    
    }  
}

var rename = (e) => {
    if(document.getElementById('rename-input').value == undefined) e.preventDefault();
    if(pos == null || pos == undefined) {
        document.getElementById('rename-input').value = "/" + document.getElementById('rename-input').value;
    } 
    else {
        document.getElementById('rename-input').value = pos + "/" + document.getElementById('rename-input').value;    
    }
}