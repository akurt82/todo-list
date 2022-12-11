// image Source
const acceptImage = "./images/accept.png";
const editImage = "./images/edit.png";
const deleteImage = "./images/delete.png";

// button constructor name = [edit,del,accept]
//const generateButton = (rowId,name,imgSrc) => `<input type="image" class="${name}Button" onclick="${name}(${rowId})" src="${imgSrc}" alt="${name}"></td>`;
const generateEditButton = (rowId) => `<input type="image" class="editButton" onclick="editToDo(${rowId})" src="${editImage}" alt="Edit">`
const generateDeleteButton = (rowId) => `<input type="image" class="delButton" onclick="del(${rowId})" src="${deleteImage}" alt="Delete">`
const generateAcceptButton = (rowId) => `<input type="image" class="acceptButton" onclick="acceptEdit(${rowId})" src="${acceptImage}" alt="Accept">`

// generate text-input
const generateTextInput = (rowId,todoValue) => `<input  id = "input${rowId}" type="text" class="editInput" value="${todoValue}" placeholder="ToDo eintragen">`

// its used in add-ToDo
let idCounter = 1;

// localStorage
const storedToDos = () => localStorage.getItem('ToDos');
const safeTodo = (id,text) => localStorage.setItem('ToDosList', { 'ToDoElements' : {id,text}});
const delTodo = (id,text) => localStorage.removeItem('ToDos' , {id,text});


// global selectors
const tableRow = (rowId) => document.querySelector(`#tr_id_${rowId}`);
const text = document.getElementById("text");
let list = document.getElementById("list");

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Der Manager verwaltet alle Todolisten, die auf dem WebInterface
 * angelegt werden. Jede Todoliste kann erstellt, bearbeitet und
 * wieder gelöscht werden.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

class Manager {
    // Konstruktor
    constructor(){
        // ID der aktuellen Todoliste
        this.todoId = null;
        // Label der aktuellen Todoliste
        this.todoName = null;
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Erstellt im localStorage eine neue Todolisten-Header der aus dem
     * KEY "id" und dem NAME "label" besteht. Der Label erscheint im
     * Tab-Menü unterhalb der Menüleiste.
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    newList( id, name, counter )
    {
        // Anzahl der Todolisten aktualisieren
        localStorage.setItem("todoCount", counter);
        // Neue Todolisten-Header speichern
        localStorage.setItem(id, name);
        // Aktuelle Todoliste als die aktive Liste markieren
        localStorage.setItem("todoActive", id);
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Löscht den Inhalt der aktuellen Todoliste
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    clear()
    {
        // Die aktuelle Todolisten-Id
        const currentTodo = localStorage.getItem("todoActive");
        // Die Menge der Einträge in der Liste
        const rows = localStorage.getItem(currentTodo + ".total");
        // Alle Einträge werden nach der Reihe gelöscht
        for ( let row = 0; row < rows; row++ )
        {
            localStorage.removeItem(currentTodo + ".item.hook." + row);
            localStorage.removeItem(currentTodo + ".item.text." + row);
        }
        // Die Gesamtmenge wird gelöscht
        localStorage.removeItem(currentTodo + ".total");
        // Die Menge der erledigten Elemente wird gelöscht
        localStorage.removeItem(currentTodo + ".checked");
        // Die Menge der offenen Elemente wird gelöscht
        localStorage.removeItem(currentTodo + ".default");
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Speicher die Änderungen an der aktuellen Todoliste, in dem es
     * die Todoliste in den localStorage hochladet.
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    upload()
    {
        // Der alte Content wird gelöscht
        this.clear();
        // Das Tabellenobjekt wird verbunden
        const tableObject = document.getElementById("list");
        // Die aktuelle Todolisten-Id wird ermittelt
        const currentTodo = localStorage.getItem("todoActive");
        // Organisatorische Variablen
        let elem, cell, hooks = 0, nones = 0, next = 0;
        // Alle Einträge werden einzeln durchgearbeitet
        for ( let row = 0; row < tableObject.rows.length; row++ )
        {
            // Die nächste Zeile wird verbunden
            elem = tableObject.rows.item(row);
            // Die Gültigkeit der Verbindung wird sichergestellt
            if ( elem )
            {
                // Die Zellenstruktur auf der Reihe wird verbunden
                cell = elem.getElementsByTagName("td");
                // Ist der Haken gesetzt?
                if ( cell[0].getElementsByTagName("input")[0].checked == true )
                {
                    // Dann wird die Hakenmenge um 1 erhöht
                    hooks++;
                    // Der Hakenwert wird als 1 in den localStorage geschrieben
                    localStorage.setItem(currentTodo + ".item.hook." + next, "1");
                    // Und der dazugehörige Text wird in den localStorage geschrieben
                    localStorage.setItem(currentTodo + ".item.text." + next, cell[1].innerText);
                }
                // Der Haken ist nicht gesetzt?
                else
                {
                    // Dann wird die Menge der nicht erledigten Aufgaben um 1 erhöht
                    nones++;
                    // Der Hakenfeld wird mit dem Wert 0 in den localStorage geschrieben
                    localStorage.setItem(currentTodo + ".item.hook." + next, "0");
                    // Und der dazugehörige Text wird in den localStorage geschrieben
                    localStorage.setItem(currentTodo + ".item.text." + next, cell[1].innerText);
                }
                // Der Reihenzähler wird um 1 erhöht
                next++;
            }
        }
        // Die Gesamtmenge der Einträge wird in den localStorage geschrieben
        localStorage.setItem(currentTodo + ".total", next);
        // Die Menge der erledigten Einträge wird in den localStorage geschrieben
        localStorage.setItem(currentTodo + ".checked", hooks);
        // Die Menge der offenen Einträge wird in dne localStorage geschrieben
        localStorage.setItem(currentTodo + ".default", nones);
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Die aktuelle Todoliste wird aus dem localStorage heruntergeladen
     * und in den WebInterface übernommen
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    download()
    {
        // Der Tabellen-Parent-Objekt wird verbunden
        const tablePanel = document.querySelector(".table");
        // Die aktuelle Todoliste wird ermittelt
        const currentTodo = localStorage.getItem("todoActive");
        // Die Anzahl der Einträge wird ermitellt
        const rows = localStorage.getItem(currentTodo + ".total");
        // Der idCounter wird gesetzt
        idCounter = rows + 1;
        // Die Tabelle wird neu generiert. Begonnen wird mit dem Haupt-Tag.
        let snippet = '<table id="list">';
        // Alle Einträge im localStorage werden durchlaufen
        for ( let row = 0; row < rows; row++ )
        {
            // Der Hakenzustand des nächsten Eintrags wird gelesen
            let hook = localStorage.getItem(currentTodo + ".item.hook." + row);
            // Der Text des nächsten Eintrags wird gelesen
            let text = localStorage.getItem(currentTodo + ".item.text." + row);
            // Beide Werte werden auf Verfügbarkeit geprüft
            if ( hook && text )
            {
                // Ist der Hakenwert 1, dann wird sie in " checked" abgeändert, 
                // andernfalls wird sie geleert.
                if ( hook === "1" ) hook = " checked"; else hook = "";
                // // Die Zeile wird in den temporären String "snippet" hinzugefügt
                snippet += `<tr id="tr_id_${row}">`;
                snippet += `<td onclick = "checked()"><input type="checkbox" class="form-check-input" value="checkedValue" ${hook}></td>`;
                snippet += `<td class="text">${text}</td>`;
                snippet += `<td><input type="image" class="editButton" onclick="editToDo(${row})" src="./images/edit.png" alt="Edit"></td>`;
                snippet += `<td><input type="image" class="delButton" onclick="del(${row})" src="./images/delete.png" alt="Delete"></td>`;
                snippet += `</tr>`;
            }
        }
        // Der temporäre String wird abgeschlossen
        snippet += '</table>';
        // Der Tabellen-Parent-Objekt wird neugeschrieben
        tablePanel.innerHTML = snippet;
        // Das Tabellenobjekt "list" wird neu verbunden
        list = document.getElementById("list");
        // Der Main-Tag wird sichtbar gemacht
        const main = document.getElementsByTagName("main")[0];
        main.style.display = "block";
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Ladet die Labels aller verfügbaren Todolisten aus der 
     * localStorage und erzeugt die Tabs unterhalb der Menüleiste
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    loadtabs ()
    {
        // Der Anzahl der Todolisten wird ermittelt
        const tabs = localStorage.getItem("todoCount");
        // Die aktuelle Todoliste wird ermittelt
        const currentTodo = localStorage.getItem("todoActive");
        // Wenn es Todolisten gibt...
        if ( tabs )
        {
            // ... dann werden sie einzeln durchlaufen
            for ( let tab = 0; tab < tabs; tab++ )
            {
                // Die Verfügbarkeit der nächsten Todoliste wird geprüft
                if ( localStorage.getItem("todo." + (tab + 1)) )
                {
                    // Es wird ein neues Li-Element angelegt...
                    let node = document.createElement('li');
                    // ... welcher den ID der Todoliste erhält
                    node.id = "todo." + (tab + 1);
                    // und zur Funktion "catchme" mit der 
                    // Klick-Ereignis verbunden, damit beim Klick
                    // auf dem Tab, die betroffene Todoliste
                    // geladen werden kann.
                    node.addEventListener("click",(e)=> catchme(e.target) );
                    // Wenn der gerade eingelesene Todolisten-Header
                    // die aktuelle Todoliste ist, dann wird sie 
                    // mit einem weißen Hintergrund und einem sanften
                    // Schattenwurf vormarkiert, damit sofort klar ist,
                    // in welcher Todoliste man gerade ist.
                    if ( node.id === currentTodo )
                    {
                        node.style.backgroundColor = "#fff";
                        node.style.boxShadow = "inset 6px 6px 6px rgb(0,0,0,0.08)";
                    }
                    // Der Label der Todoliste wird gelesen...
                    let todoName = localStorage.getItem(node.id);
                    // ... und in das neu angelegte Li-Element geschrieben
                    node.appendChild(document.createTextNode(todoName));
                    // Das Element wird anschließend in die Tab-Leiste hinzugefügt.
                    document.querySelector(".todolist").appendChild(node);
                }
            }
        }
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Löscht die aktuelle Todoliste aus dem localStorage
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    removeList()
    {
        // Die Id der aktuellen Todoliste
        const currentTodo = localStorage.getItem("todoActive");
        // Bestätigungsabfrage
        if ( confirm( `Soll die Todoliste '${ localStorage.getItem(currentTodo) }' wirklich gelöscht werden?` ) )
        {
            // Löschen des Inhalts
            this.clear();
            // Entfernen des Headers
            localStorage.removeItem(currentTodo);
            // Da die aktuelle Todoliste gelöscht ist,
            // wird auch die Markierung dazu geleert
            localStorage.setItem("todoActive", "");
            // Die Webseite wird neugeladen
            window.location.reload();
        }
    }

}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Die zentrale Instanz aus der Klasse Manager wird erzeugt
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

const todoManager = new Manager();

// ---- Ende ---- //

function add() {
  
    let zeile = list.insertRow(0);
    // *** //
    zeile.id = `tr_id_${idCounter}`;
    zeile.innerHTML = `<td onclick = "checked()"><input type="checkbox" class="form-check-input" value="checkedValue" ></td> `;
    zeile.innerHTML +=`<td class="text">${generateTextInput(idCounter,"")}</td>`;
    zeile.innerHTML +=`<td>${generateAcceptButton(idCounter)}</td>`;
    zeile.innerHTML +=`<td>${generateDeleteButton(idCounter)}</td>`;
    // *** //
    document.getElementById("input"+idCounter).addEventListener("keydown",(e)=>{
        applyEdit("input"+idCounter,e);
    });
    // *** //
    const main = document.getElementsByTagName("main")[0];
    main.style.display = "block";
    // *** //
    idCounter++;
    // *** //
    document.querySelector(".table").style.height = (window.innerHeight - 240) + "px";
    // *** //
    return true;
}

function del(index) {
    const rowDelete = document.querySelector(`#tr_id_${index}`);
    // delete variable erstellen.  
    const isExecuted = confirm("Are you sure to delete this row?");
    if(isExecuted === true){
        rowDelete.remove();
    }

}

function editToDo(id) {
    // get table row
    const row = tableRow(id);
    console.log(row);
    // get td with todo-text
    const todoTd = row.querySelector(".text");
    // get value of the td
    const todoValue = todoTd.innerHTML;
    // get edit-button
    const editButton = row.querySelector(`.editButton`);
    // clear todo-text
    todoTd.innerText="";
    // clear edit button and edit image
    editButton.remove();
    // set input-field with todo-text
    todoTd.innerHTML = generateTextInput(id,todoValue);
    // generate accept edit button as image
    const acceptEditButton = generateAcceptButton(id,acceptImage);
    // set accept button in third td
    row.querySelector("td:nth-child(3)").innerHTML = acceptEditButton;
    //document.querySelector("editInput").addEventListener("keypress", (event) => {if(event.key==="Enter"){acceptEdit(id)};});
    // *** //
    document.getElementById("input"+id).addEventListener("keydown",(e)=>{
        applyEdit("input"+id,e);
    });
}

function acceptEdit(id) {
    // get table row
    const row = tableRow(id);
    // get td with todo-text
    const todoTd = row.querySelector(".text");
    // get text-input element / accept button
    const editInput = todoTd.querySelector(".editInput");
    const acceptButton = row.querySelector(".acceptButton");
    // get value of the text-input element
    const todoValue = editInput.value;
    // generate edit-button (image as button)
    const editButton = generateEditButton(id,editImage);
    // remove input text-field / accept Button / image
    editInput.remove();
    acceptButton.remove();
    // set todo-text / edit button
    todoTd.innerHTML = todoValue;
    row.querySelector("td:nth-child(3)").innerHTML = editButton;
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Reagiert auf die Enter-Tastendruck im Eingabefeld um den Inhalt
 * zu übernehmen, ohne auf den applyButton klicken zu müssen
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function applyEdit( id, event )
{
    if (event.keyCode === 13)
    {
        const target = event.target;
        // *** //
        acceptEdit( parseInt(target.id.replace("input","")) );
    }
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Markiert die Tab, auf die gewechselt wird und ladet die Seite neu
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function catchme(newObject)
{
    // Die aktuelle Tab-Markierung im localStorage wird neugesetzt
    localStorage.setItem("todoActive", newObject.id);
    // Die Seite wird aktualisiert
    window.location.reload();
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Erstellt einen neuen Todolisten-Header und fügt es auch gleich als
 * Tab in die Tab-Leiste hinzu
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function addTodo()
{
    // Die Tableiste wird verbunden
    const nav = document.querySelector("nav .todolist");
    // Die Menge der Tabs wird ermittelt
    let next = localStorage.getItem("todoCount");
    // Label-Variable
    let todoName = "";
    // Solange kein gültiger Label angegeben wird oder
    // gezielt abgebrochen wird, fragt die Schleife nach,
    // wie die neue Todoliste heißen soll
    while (1)
    {
        // Abfrage
        todoName = prompt("Gib der Liste einen Namen");
        // Wenn abgerochen wurde, wird die Funktion verlassen
        if ( todoName === null ) return;
        // Wenn ein Label angegeben wurde, wird die Schleife verlassen
        else if ( todoName !== "" ) break;
    }
    // Wenn das erste Mal eine Todoliste eingefügt wird,
    // dann wird die Menge als 1 vormarkiert.
    if ( next === null )
    {
        localStorage.setItem("todoCount", "1");
        next = 1;
    }
    // Andernfalls inkrementiert
    else
    {
        next++;
        localStorage.setItem("todoCount", next);
    }
    // Ein neues Li-Element wird erzeugt
    let node = document.createElement('li');
    // Sie erhält die Id des Tabs
    node.id = "todo." + next;
    // und wird zum Klick-Ereignis mit der Funktion "catchme"
    // verbunden, damit beim Klicken, auf die Todoliste
    // gewechselt werden kann
    node.addEventListener("click",(e)=> catchme(e.target) );
    // *** //
    // Der Label wird zum Li-Element hinzugefügt
    node.appendChild(document.createTextNode(todoName));
    // Das Li-Element wird in die Tab-Leiste hinzugefügt
    nav.appendChild(node);
    // Die ID der neuen Todoliste wird im Manager notiert
    todoManager.todoId = node.id;
    // ebenso das Label wird notiert
    todoManager.todoName = todoName;
    // Der neue Todolisten-Header wird erzeugt
    todoManager.newList( node.id, todoName, next );
    // und in die Todoliste gewechselt
    catchme(node);
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Wenn in der Menüleiste auf "Speichern" geklickt wird, so werden die
 * Änderungen an der Todoliste in die localStorage geschrieben.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function saveTodo()
{
    todoManager.upload();
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Wenn in der Menüleiste auf "Entfernen" geklickt und bestätigt wird,
 * so wird die aktuelle Todoliste aus der localStorage gelöscht und vom
 * WebInterface entfernt.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function remTodo()
{
    todoManager.removeList();
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Wird auf einen Eintrags-Hakenfeld geklickt, so werden alle Elemente
 * neugeordnet. Alle offenen Einträge kommen nach oben, alle erledigten
 * Einträge rutschen nach unten.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function checked ()
{
    // Das Tabellenobjekt
    const tableObject = document.getElementById("list");
    // Variablen
    let elem, cell, next = 0;
    // Arrays
    let hook = [];
    let norm = [];
    // Die gesamte Tabellen-Zeilen werden einzeln durchlaufen
    for ( let row = 0; row < tableObject.rows.length; row++ )
    {
        // Das nächste Elemente wird verbunden
        elem = tableObject.rows.item(row);
        // und auf Verfügbarkeit geprüft
        if ( elem )
        {
            // Die Zellenstruktur wird verbunden
            cell = elem.getElementsByTagName("td");
            // Wenn der Haken gesetzt ist, wird der Eintrag in 
            // das Array hook[] hinzugefügt.
            if ( cell[0].getElementsByTagName("input")[0].checked == true )
                hook.push(cell[1].innerText);
            // Andernfalls in das Array norm[] hinzugefügt.
            else
                norm.push(cell[1].innerText);
        }
    }
    // Nun werden alle offenen Einträge
    // nach oben verschoben
    for ( let row of norm )
    {
        // Das nächste Zeile wird verbunden
        //elem = document.getElementById("tr_id_" + next);
        elem = tableObject.rows.item(next);
        // Dessen Zellenstruktur wird verbunden
        cell = elem.getElementsByTagName("td");
        // Der Haken wird auf FALSE (0) gesetzt
        cell[0].getElementsByTagName("input")[0].checked = false;
        // Der Text geändert
        cell[1].innerText = row;
        // Der Zähler um 1 erhöht
        next++;
    }
    // Nun werden alle erledigten Einträge
    // nach unten verschoben
    for ( let row of hook )
    {
        // Das nächse Element wird verbunden
        //elem = document.getElementById("tr_id_" + next);
        elem = tableObject.rows.item(next);
        // Dessen Zellenstruktur wird verbunden
        cell = elem.getElementsByTagName("td");
        // Der Haken wird gesetzt
        cell[0].getElementsByTagName("input")[0].checked = true;
        // Der Text geändert
        cell[1].innerText = row;
        // Der Zähler um 1 erhöht
        next++;
    }
}
