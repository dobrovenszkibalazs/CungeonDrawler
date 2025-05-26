//#region Variables
var gameState = "advancable";
var pickUpItem = null;
var btn1_eventId = advance;
var btn2_eventId;
var btn3_eventId;
button1.addEventListener("click", advance);
for (const e of stats_inventory.children) {
    e.addEventListener("click", clickItem);
}
//#endregion
//#region Tools
function nextStage() {
    stage++;
    if (stage > map[floor-1].length) {
        stage = 1;
        floor++;
        updateFloor();
    }
}

function btnText(btn1, btn2, btn3) {
    button1.querySelector('p').innerText = btn1;
    button2.querySelector('p').innerText = btn2;
    button3.querySelector('p').innerText = btn3;
}

function loot(s) {
    var l = [];
    for (const e in JSON_items) {
        if (JSON_items[e].drop == s) {
            l.push(e);
        }
    }
    return l[RNG(0, l.length-1)];
}
//#endregion
//#region Inventory
function invFull() {
    loadText("Your inventory is full... Pick an item to eldobni...!");
    btnText("Nevermind", null, null);
    button1.removeEventListener("click", btn1_eventId);
    button2.removeEventListener("click", btn2_eventId);
    button1.addEventListener("click", event_lootIgnore, {once:true});
    btn1_eventId = event_lootIgnore;
}

function addItem() {
    let i = 0;
    let n = (player.hasBackpack) ? 10 : 8;

    while (i < n && player.inventory[i] != null) {
        i++;
    }

    if (i < n) {
        gameState = "added item";
        player.inventory[i] = pickUpItem;
        loadText("You picked up the following item: " + JSON_items[pickUpItem].name + ".");
        btnText("Advance", null, null);
        button2.removeEventListener("click", btn2_eventId);
        button1.addEventListener("click", advance, {once:true});
        btn1_eventId = advance;
        updateInv();
    } else {
        gameState = "inv full";
        invFull();
    }
}

function clickItem() {
    var curr = Array.prototype.slice.call(stats_inventory.children).indexOf(this);
    if (gameState == "inv full") {
        gameState = "added item";
        player.inventory[curr] = pickUpItem;
        loadText("You picked up the following item: " + JSON_items[pickUpItem].name + ".");
        btnText("Advance", null, null);
        button1.removeEventListener("click", btn1_eventId);
        button1.addEventListener("click", advance, {once:true});
        btn1_eventId = advance;
        updateInv();
    } else {
        if (player.inventory[curr] != null) {
            var item = JSON_items[player.inventory[curr]];
            console.log(item.name);
        }
    }
}
//#endregion
//#region Events/nothing
function event_nothing() {
    btnText("Advance", null, null);
    loadText(JSON_events.events[0].text[RNG(0,JSON_events.events[0].text.length-1)]);
    button1.addEventListener("click", advance, {once:true});
    btn1_eventId = advance;
}

function advance() {
    nextStage();
    loadStage();
}
//#endregion
//#region Events/floorLoot
function event_floorLoot1() {
    gameState = "floorLoot1";
    loadText(JSON_events.events[1].text[RNG(0,JSON_events.events[1].text.length-1)]);
    btnText("Continue", "Ignore", null);
    button1.removeEventListener("click", btn1_eventId);
    button1.addEventListener("click", event_floorLoot2, {once:true});
    button2.addEventListener("click", event_lootIgnore, {once:true});
    btn1_eventId = event_floorLoot2;
    btn2_eventId = event_lootIgnore;
}

function event_lootIgnore() {
    gameState = "advancable";
    loadText("you decided to leave.. was it really worth it, though?");
    btnText("Advance", null, null);
    button1.removeEventListener("click", btn1_eventId);
    button1.addEventListener("click", advance, {once:true});
    btn1_eventId = advance;
}

function event_floorLoot2() {
    gameState = "floorLoot2";
    btnText("Pick up", "Ignore", null);
    pickUpItem = loot("floorLoot1");
    loadText("you have found the following item: " + JSON_items[pickUpItem].name);
    button1.addEventListener("click", addItem, {once:true});
    btn1_eventId = addItem;
}
//#endregion
//#region Events/chest
//#region Events/monster
function event_monster() {
    gameState = "monster";
    btnText("Fight!", "Flee!", null);
    loadText("Monster!!!! How should I feeeel??");
    button1.addEventListener("click", advance, {once:true});
    btn1_eventId = advance;
}
//#endregion
function event_chest1() {
    gameState = "chest1";
    loadText(JSON_events.events[2].text[RNG(0,JSON_events.events[2].text.length-1)]);
    btnText("Continue", "Ignore", null);
    button1.removeEventListener("click", btn1_eventId);
    button1.addEventListener("click", event_chest2, {once:true});
    button2.addEventListener("click", event_lootIgnore, {once:true});
    btn1_eventId = event_floorLoot2;
    btn2_eventId = event_lootIgnore;
}

function event_chest2() {
    gameState = "chest2";
    btnText("Pick up", "Ignore", null);
    pickUpItem = loot("chest1");
    loadText("you have opened the following item: " + JSON_items[pickUpItem].name);
    button1.addEventListener("click", addItem, {once:true});
    btn1_eventId = addItem;
}
//#endregion
function loadStage() {
    var curr = map[floor-1][stage-1];
    if (curr == "nothing") {
        event_nothing();
    } else if (curr == "floorLoot") {
        event_floorLoot1();
    } else if (curr == "chest") {
        event_chest1();
    } else if (curr == "monster") {
        event_monster();
    }
}