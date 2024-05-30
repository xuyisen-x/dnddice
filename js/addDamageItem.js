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
    const damageItems = document.getElementById("damage-items");
    const jsonData = {};
    let count = 0;
    for (let i of damageItems.querySelectorAll(".damage-item")){
        let checked = i.querySelector(".dice-enable").checked;
        let damageType = i.querySelector(".damage-type-selector").value;
        let damageResistance = i.querySelector(".damage-resistance").value;
        let damageDice = i.querySelector(".dice-str").value;
        let damageNote = i.querySelector(".dice-note").value;
        count += 1;
        let keyStr = "damage" + count.toString();
        jsonData[keyStr] = {
            "type": damageType,
            "resistance": damageResistance,
            "dice": damageDice,
            "note": damageNote,
            "checked": checked
        };
    }

    const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    const downloadElem = document.createElement("a");
    const url = URL.createObjectURL(jsonBlob);
    document.body.appendChild(downloadElem);
    downloadElem.href = url;
    downloadElem.download = "data.json";
    downloadElem.click();
    downloadElem.remove();
    window.URL.revokeObjectURL(url);
}

function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

async function loadDamageItems() {
    const fileInput = document.getElementById("fileInput");
    fileInput.value = "";
    fileInput.click();
}