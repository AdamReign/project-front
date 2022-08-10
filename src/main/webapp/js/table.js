const IMG_DELETE = "/img/delete.png";
const IMG_EDIT = "/img/edit.png";
const IMG_SAVE = "/img/save.png";
const URL = "/rest/players";
const POST = "POST";
const DELETE = "DELETE";
const KEYS = {
    id: "id",
    name: "name",
    title: "title",
    race: "race",
    profession: "profession",
    level: "level",
    birthday: "birthday",
    banned: "banned"
};
const RACES = [
    "HUMAN",
    "DWARF",
    "ELF",
    "GIANT",
    "ORC",
    "TROLL",
    "HOBBIT"
];
const PROFESSIONS = [
    "WARRIOR",
    "ROGUE",
    "SORCERER",
    "CLERIC",
    "PALADIN",
    "NAZGUL",
    "WARLOCK",
    "DRUID"
];
const BAN_STATUSES = [
    "false",
    "true"
];
let currentPageNumber;





function createElement(tagName) {
    return document.createElement(tagName);
}

function getElementById(elementId) {
    return document.getElementById(elementId);
}

function createTableBody(pageNumber = 0) {
    currentPageNumber = pageNumber;

    let table = getElementById("table");
    let tableBody = createElement("tbody");
    tableBody.id = "table_body";
    let pageSize = getElementById("select").value;

    $.getJSON(`${URL}?pageNumber=${pageNumber}&pageSize=${pageSize}`, (json) => {
        for (let rowNumber = 1; rowNumber <= json.length; ++rowNumber) {
            let account = json[rowNumber-1];
            let row = createElement("tr");

            for (let key in KEYS) {
                let value = account[key];
                let cell = createElement("td");
                cell.id = `${key}_${rowNumber}`;
                cell.innerText = (key === KEYS.birthday) ? new Date(value).toLocaleDateString("en-US") : value;
                row.appendChild(cell);
            }

            let cellEdit = createElement("td");
            cellEdit.id = `edit_${rowNumber}`;
            let buttonEdit = createButton(cellEdit.id, IMG_EDIT);
            buttonEdit.onclick = () => editAccount(rowNumber);
            cellEdit.appendChild(buttonEdit);
            row.appendChild(cellEdit);

            let cellDelete = createElement("td");
            cellDelete.id = `delete_${rowNumber}`;
            let buttonDelete = createButton(cellDelete.id, IMG_DELETE);
            buttonDelete.onclick = () => deleteAccount(account[KEYS.id], json.length);
            cellDelete.appendChild(buttonDelete);
            row.appendChild(cellDelete);

            tableBody.appendChild(row);
        }
    });

    table.appendChild(tableBody);
    createPageButtons(pageSize);
}

function createButton(id, image) {
    let button = createElement("button");
    button.id = `button_${id}`;
    button.className = "table_button";
    let icon = createElement("img");
    icon.id = `icon_button_${id}`;
    icon.src = image;
    button.appendChild(icon);
    return button;
}

function createPageButtons(pageSize) {
    $.getJSON(`${URL}/count`, (json) => {
        let pages = getElementById("pages");
        let pagesBody = createElement("tbody");
        pagesBody.id = "pages_body";
        pagesBody.append("Pages:");

        let pagesCount = Math.ceil(json / pageSize);
        for (let i = 0; i < pagesCount; ++i) {
            let button = createElement("button");
            button.innerText = i+1;
            if (currentPageNumber === i) {
                button.id = "current_page";
            } else {
                button.onclick = () => updateTable(i);
            }
            pagesBody.appendChild(button);
        }
        pages.appendChild(pagesBody);
    });
}

function updateTable(pageNumber) {
    getElementById("table_body").remove();
    getElementById("pages_body").remove();
    createTableBody(pageNumber);
}

function deleteAccount(id, jsonLength) {
    $.ajax({
        method: `${DELETE}`,
        url: `${URL}/${id}`
    }).done((msg) => {
        if (jsonLength === 1 && currentPageNumber > 0) {
            updateTable(currentPageNumber-1);
        } else {
            updateTable(currentPageNumber);
        }
    });
}

function editAccount(rowNumber) {
    let buttonEdit = getElementById(`button_edit_${rowNumber}`);
    buttonEdit.onclick = () => saveAccount(rowNumber);
    let iconEdit = getElementById(`icon_button_edit_${rowNumber}`);
    iconEdit.src = IMG_SAVE;

    let buttonDelete = getElementById(`button_delete_${rowNumber}`);
    buttonDelete.style.visibility = "hidden";

    createInput(`name_${rowNumber}`, "Name", "12");
    createInput(`title_${rowNumber}`, "Title", "30");
    createSelectForCell(`race_${rowNumber}`, RACES);
    createSelectForCell(`profession_${rowNumber}`, PROFESSIONS);
    createSelectForCell(`banned_${rowNumber}`, BAN_STATUSES);
}

function createInput(id, placeholder, maxLength) {
    let cellTitle = getElementById(id);
    let inputTitle = createElement("input");
    inputTitle.id = `input_${id}`;
    inputTitle.type = "text";
    inputTitle.name = id;
    inputTitle.placeholder = placeholder;
    inputTitle.maxLength = maxLength;
    inputTitle.value = cellTitle.innerText;
    cellTitle.innerText = '';
    cellTitle.appendChild(inputTitle);
}

function createSelectForCell(id, values) {
    let cell = getElementById(id);
    let select = createSelect(id, values);
    select.value = cell.innerText;
    cell.innerText = '';
    cell.appendChild(select);
}

function createSelect(id, values) {
    let select = createElement("select");
    select.id = `select_${id}`;
    for (let value of values) {
        let option = createElement("option");
        option.innerText = value;
        select.appendChild(option);
    }
    select.value = select.options[0].text;
    return select;
}

function saveAccount(rowNumber) {
    let buttonEdit = getElementById(`button_edit_${rowNumber}`);
    buttonEdit.onclick = () => editAccount(rowNumber);
    let iconEdit = getElementById(`icon_button_edit_${rowNumber}`);
    iconEdit.src = IMG_EDIT;

    let buttonDelete = getElementById(`button_delete_${rowNumber}`);
    buttonDelete.style.visibility = "visible";

    let id = getElementById(`id_${rowNumber}`).innerText;
    let name = getElementById(`input_name_${rowNumber}`);
    let title = getElementById(`input_title_${rowNumber}`);
    let race = getElementById(`select_race_${rowNumber}`);
    let profession = getElementById(`select_profession_${rowNumber}`);
    let banned = getElementById(`select_banned_${rowNumber}`);

    $.ajax({
        method: `${POST}`,
        url: `${URL}/${id}`,
        contentType: "application/json",
        data: JSON.stringify({
            name: name.value,
            title: title.value,
            race: race.value,
            profession: profession.value,
            banned: banned.value
        })
    }).done((msg) => {
        updateTable(currentPageNumber);
    });
}

function createAccount() {
    let name = getElementById(`input_name`);
    let title = getElementById(`input_title`);
    let race = getElementById(`select_race`);
    let profession = getElementById(`select_profession`);
    let level = getElementById(`input_level`);
    let birthday = getElementById(`input_birthday`);
    let banned = getElementById(`select_banned`);

    $.ajax({
        method: `${POST}`,
        url: `${URL}`,
        contentType: "application/json",
        data: JSON.stringify({
            name: `${name.value}`,
            title: `${title.value}`,
            race: `${race.value}`,
            profession: `${profession.value}`,
            level: `${level.value}`,
            birthday: `${new Date(birthday.value).getTime()}`,
            banned: `${banned.value}`
        })
    }).done((msg) => {
        name.value = ``;
        title.value = ``;
        race.value = ``;
        profession.value = ``;
        level.value = ``;
        birthday.value = ``;
        banned.value = ``;
        updateTable(currentPageNumber);
    });
}