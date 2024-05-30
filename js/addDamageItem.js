function addDamageItem(){
    let attackItems = document.getElementById("damage-items");
    let template = document.getElementById("damage-item-tmp");
    let clone = template.content.cloneNode(true);
    attackItems.appendChild(clone);
    let target = attackItems.lastElementChild;
    target.querySelector(".btn").addEventListener("click",
        (evt) => {removeDamageItem(evt);});
    target.querySelector(".damage-resistance").addEventListener("change",
(evt) => {updateDamageResistance(evt);});
    target.querySelector(".damage-type-selector").addEventListener("change",
(evt) => {updateDamageType(evt);})
}

function removeDamageItem(event){
    let target = event.target;
    let attackItems = document.getElementById("damage-items");
    while (target.parentNode!==attackItems)
    {
        target = target.parentNode;
    }
    attackItems.removeChild(target);
}

function updateDamageResistance(event){
    let value = event.target.value;
    let target = event.target;
    while (target.classList.contains("damage-item")===false)
    {
        target = target.parentNode;
    }
    let damageType = target.querySelector('.damage-type-selector').value;
    let damageItems = document.getElementById("damage-items").querySelectorAll(".damage-item");
    for (let i of damageItems){
        if (i.querySelector(".damage-type-selector").value === damageType){
            i.querySelector(".damage-resistance").value = value;
        }
    }
}

function updateDamageType(event){
    let damageType = event.target.value;
    let target = event.target; let constTarget = target;
    while (target.classList.contains("damage-item")===false)
    {
        target = target.parentNode;
    }
    let damageResistanceItem = target.querySelector('.damage-resistance');
    let damageItems = document.getElementById("damage-items").querySelectorAll(".damage-item");
    for (let i of damageItems){
        let damageTypeItem = i.querySelector(".damage-type-selector");
        if (constTarget !== damageTypeItem && damageTypeItem.value === damageType){
            damageResistanceItem.value = i.querySelector(".damage-resistance").value;
            return;
        }
    }
    damageResistanceItem.value = "1";
}

function saveDamageItems(){
}

async function loadDamageItems(){
    // 打开文件选择器并从结果中解构出第一个句柄
    const [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    return file;
}