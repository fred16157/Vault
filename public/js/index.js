
var updateFileList = () => {
    var inputlist = document.getElementById('file-input-list');
    inputlist.innerHTML = '';
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