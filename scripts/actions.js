var gameState = "advancable";
var pickUpItem = null;
var btn1_eventId = advance;
var btn2_eventId;
var btn3_eventId;

button1.addEventListener("click", advance);

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

function invFull() {
    loadText("Your inventory is full...");
}

function addItem() {
    let i = 0;
    let n = (player.hasBackpack) ? 10 : 8;

    while (i < n && player.inventory[i] != null) {
        i++;
    }

    if (i < n) {
        player.inventory[i] = pickUpItem;
        loadText("You picked up the following item: " + JSON_items[pickUpItem].name + ".");
        btnText("Advance", null, null);
        button1.removeEventListener("click", btn1_eventId);
        button2.removeEventListener("click", btn2_eventId);
        button1.addEventListener("click", advance);
        btn1_eventId = advance;
        updateInv();
    } else {
        invFull();
    }
}

function loot_floorLoot1() {
    var l = [];
    for (const e in JSON_items) {
        if (JSON_items[e].canDrop == true) {
            l.push(e);
        }
    }
    return l[RNG(0, l.length-1)];
}

function event_nothing() {
    btnText("Advance", null, null);
    loadText(JSON_events.events[0].text[RNG(0,JSON_events.events[0].text.length-1)]);
}

function event_floorLoot1() {
    gameState = "floorLoot";
    loadText(JSON_events.events[1].text[RNG(0,JSON_events.events[1].text.length-1)]);
    btnText("Continue", "Ignore", null);
    button1.removeEventListener("click", btn1_eventId);
    button1.addEventListener("click", event_floorLoot2);
    button2.addEventListener("click", event_lootIgnore);
    btn1_eventId = event_floorLoot2;
    btn2_eventId = event_lootIgnore;
}

function event_lootIgnore() {
    gameState = "advancable";
    loadText("you decided to leave.. was it really worth it, though?");
    btnText("Advance", null, null);
    button1.removeEventListener("click", btn1_eventId);
    button2.removeEventListener("click", btn2_eventId);
    button1.addEventListener("click", advance);
    btn1_eventId = advance;

}

function event_floorLoot2() {
    gameState = "floorLoot2";
    btnText("Pick up", "Ignore", null);
    pickUpItem = loot_floorLoot1();
    loadText("you have found the following item: " + JSON_items[pickUpItem].name);
    button1.removeEventListener("click", btn1_eventId);
    button1.addEventListener("click", addItem);
    btn1_eventId = addItem;
}

function loadStage() {
    var curr = map[floor-1][stage-1];
    if (curr == "nothing") {
        event_nothing();
    } else if (curr == "floorLoot") {
        event_floorLoot1();
    } else if (curr == "chest") {
        //
    } else if (curr == "monster") {
        textBox.innerText = "Monster!!!!!!";
    }
}

function advance() {
    console.log("nyomod");
    loadStage();
    nextStage();
}