//#region Variables
var gameState = "advancable";
var pickUpItem = null;
var sellable = null;
var monster = null;
var btn1_eventId = advance;
var btn2_eventId;
var btn3_eventId;
btnText("START", null, null);
btnEvents(advance, null, null);
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

function btnEvents(btn1, btn2, btn3) {
    button1.removeEventListener("click", btn1_eventId);
    button2.removeEventListener("click", btn2_eventId);
    button3.removeEventListener("click", btn3_eventId);
    if (btn1 != null) {
        button1.addEventListener("click", btn1);
        btn1_eventId = btn1;
    }
    if (btn2 != null) {
        button2.addEventListener("click", btn2);
        btn2_eventId = btn2;
    }
    if (btn3 != null) {
        button3.addEventListener("click", btn3);
        btn3_eventId = btn3;
    }
}
//#endregion
//#region Combat
function damage(amount, target, trueDamage=false) {
    var dmg = amount;
    if (target == "player") {
        if (trueDamage == false) {
            dmg = Math.round(amount / player.resistance);
        }
        player.health -= dmg;
    } else {
        dmg = Math.round(amount / monster.resistance);
        monster.health -= dmg;
    }
    return dmg;
}

function dodge(spd1, spd2) {
    let s = (spd1<=spd2+0.2) ? 0.2 : 0;
    return RNG(1,100) <= (spd1-spd2+s)*100;
}

function RNG_damage(low, high, canCrit=false) {
    var dmg = RNG(low, high);
    if (canCrit) {
        if (RNG(1, 100) <= JSON_items[player.weapon].criticalChance) {
            dmg *= JSON_items[player.weapon].criticalDmg;
        }
    }
    return dmg;
}

function heal(n) {
    player.health += n;
    if (player.health > player.maxHealth) player.health = player.maxHealth;
}

function playerTurn() {
    let dmg = RNG_damage(JSON_items[player.weapon].lowDmg, JSON_items[player.weapon].highDmg, true);
    if (dodge(monster.speed, player.speed) == false) {
        dmg = damage(dmg, "enemy");
        updateMonsterHP();
        loadText("You successfully hit the "+ monster.name + " and did " + dmg + " damage!");
    } else {
        loadText("You missed!");
    }
    if (monsterDeathCheck() == false) {
        btnText("Continue", null, null);
        btnEvents(monsterTurn, null, null);
    } else {
        if (floor == 20) {
            win();
            return null;
        } 
        let m = RNG(18,22);
        loadText("You eliminated " + monster.name + " and got " + m + "$.");
        player.money += m;
        updateStats();
        monster = null;
        loadMonster();
        btnText("Advance", null, null);
        btnEvents(advance, null, null);
    }
}

function monsterTurn() {
    let dmg = RNG_damage(monster.lowDmg, monster.highDmg);
    if (dodge(player.speed, monster.speed) == false) {
        dmg = damage(dmg, "player");
        updateStats();
        if (playerDeathCheck()) {
            lose();
            return null;
        }
        loadText(monster.name + " hits you and does " + dmg + " damage!");
    } else {
        loadText(monster.name + " missed!");
    }
    btnText("Attack", null, null);
    btnEvents(playerTurn, null, null);
}

function playerDeathCheck() {
    return player.health <= 0;
}

function monsterDeathCheck() {
    return monster.health <= 0;
}
//#endregion
//#region Inventory
function invFull() {
    loadText("Your inventory is full... Pick an item to throw away...!");
    btnText("Nevermind", null, null);
    if (gameState != "buying") {
        btnEvents(event_lootIgnore, null, null);
        gameState = "inv full";
    } else {
        btnEvents(shopBrowse, null, null);
    }
}

function addItem() {
    let i = 0;
    let n = (player.hasBackpack) ? 10 : 8;

    while (i < n && player.inventory[i] != null) {
        i++;
    }

    if (i < n) {
        if (gameState != "buying") {
            loadText("You picked up the following item: " + JSON_items[pickUpItem].name);
            btnText("Advance", null, null);
            btnEvents(advance, null, null);
        } else {
            loadText("You bought the following item: " + JSON_items[pickUpItem].name);
            btnText("Continue", null, null);
            btnEvents(shopBrowse, null, null);
        }
        gameState = "added item";
        player.inventory[i] = pickUpItem;
        updateInv();
    } else {
        invFull();
    }
}

function clickItem() {
    var curr = Array.prototype.slice.call(stats_inventory.children).indexOf(this);
    if (gameState == "inv full" || gameState == "buying") {
        player.inventory[curr] = pickUpItem;
        if (gameState != "buying") {
            loadText("You picked up the following item: " + JSON_items[pickUpItem].name + ".");
            btnText("Advance", null, null);
            btnEvents(advance, null, null);
        } else {
            loadText("You bought the following item: " + JSON_items[pickUpItem].name + ".");
            btnText("Continue", null, null);
            btnEvents(shopBrowse, null, null);
        }
        gameState = "added item";
        updateInv();
    } else if (gameState == "sell" && player.inventory[curr] != null) {
        sellable = curr;
        loadText("Would you like to sell this item for " + JSON_items[player.inventory[curr]].sellPrice + "$?");
        btnText("Sell", "Nevermind", null);
        btnEvents(sellConfirm, shopBrowse, null);
    } else {
        if (player.inventory[curr] != null) {
            var item = JSON_items[player.inventory[curr]];
            if (item.type == "heal") {
                if (item.name == "Mysterious Potion") {
                    if (RNG(1,2) == 1) {heal(item.heal);} else {damage(item.heal/2, "player", true);}
                    if (player.health <= 0) player.health = 1;
                } else {
                    heal(item.heal);
                }
                player.inventory[curr] = null;
            } else if (item.type == "weapon") {
                let v = player.weapon;
                player.weapon = player.inventory[curr];
                player.inventory[curr] = v;
            } else if (item.type == "armor") {
                let v = player.armor;
                player.armor = player.inventory[curr];
                player.inventory[curr] = v;
                calcStats();
            }
        }
        updateStats();
    }
}
//#endregion
//#region Events/nothing
function event_nothing() {
    btnText("Advance", null, null);
    btnEvents(advance, null, null);
    loadText(JSON_events.events[0].text[RNG(0,JSON_events.events[0].text.length-1)]);
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
    btnEvents(event_floorLoot2, event_lootIgnore, null);
}

function event_lootIgnore() {
    gameState = "advancable";
    loadText("You decided to leave.. was it really worth it, though?");
    btnText("Advance", null, null);
    btnEvents(advance, null, null);
}

function event_floorLoot2() {
    gameState = "floorLoot2";
    btnText("Pick up", "Ignore", null);
    btnEvents(addItem, event_lootIgnore, null);
    pickUpItem = loot("floorLoot1");
    loadText("You have found the following item: " + JSON_items[pickUpItem].name);
}
//#endregion
//#region Events/money
function event_money() {
    gameState = "money";
    let m = RNG(20,28);
    player.money += m;
    loadText(JSON_events.events[3].text[RNG(0,1)] + " (" + m + "$)");
    btnText("Advance", null, null);
    btnEvents(advance, null, null);
    updateStats();
}
//#endregion
//#region Events/monster
function pickMonster() {
    let l = [];
    for (const m in JSON_enemies) {
        if (floor >= JSON_enemies[m].spawn) {
            l.push(JSON_enemies[m]);
        }
    }
    return l[RNG(0, l.length-1)];
}

function updateMonsterHP() {
    if (monster.health < 0) monster.health = 0;
    display_enemy1_hp.innerText = monster.health + "/" + monster.maxHealth;
}

function loadMonster() {
    if (monster != null) {
        updateMonsterHP();
        display_enemy1_sprite.querySelector("img").src = monster.sprite;
        display_enemy1_sprite.querySelector("img").alt = monster.name;
    } else {
        display_enemy1_hp.innerText = "";
        display_enemy1_sprite.querySelector("img").src = "";
        display_enemy1_sprite.querySelector("img").alt = "";
    }
}

function flee() {
    var spd = player.speed - monster.speed + 0.2;
    if (RNG(1,100) <= spd*100) {
        btnText("Continue", null, null);
        btnEvents(advance, null, null);
        loadText("So you fled...");
        monster = null;
        loadMonster();
    } else {
        gameState = "fight"
        btnText("Continue", null, null);
        btnEvents(monsterTurn, null, null);
        loadText("You couldn't run away...!");
    }
}

function event_monster() {
    gameState = "monster encounter";
    monster = pickMonster();
    monster.health = monster.maxHealth;
    loadMonster();
    btnText("Fight", "Flee", null);
    btnEvents(playerTurn, flee, null);
    loadText("Oh no! You have encountered a " + monster.name + "!");
}
//#endregion
//#region Events/boss
function event_boss() {
    gameState = "boss";
    monster = JSON_enemies["boss"];
    loadMonster();
    btnText("Fight", null, null);
    btnEvents(playerTurn, null, null);
    loadText("The boss is here!! Fleeing is not an option anymore..");
}
//#endregion
//#region Events/chest
function event_chest1() {
    gameState = "chest1";
    loadText(JSON_events.events[2].text[RNG(0,JSON_events.events[2].text.length-1)]);
    btnText("Continue", "Ignore", null);
    btnEvents(event_chest2, event_lootIgnore, null);
}

function event_chest2() {
    gameState = "chest2";
    btnText("Pick up", "Ignore", null);
    btnEvents(addItem, event_lootIgnore, null);
    pickUpItem = loot("chest1");
    loadText("You have opened the following item: " + JSON_items[pickUpItem].name);
}
//#endregion
//#region Events/shop
var shop1_real = [
    "bandage", "smallPotion", "smallPotion", "bandage",
    "smallPotion", "bigPotion", "bigPotion", "backpack",
    "mysteriousPotion", "mageRobe", "splittingAxe", "mysteriousPotion"
];
var shop1 = [];

function loadShop() {
    display_enemy1_hp.style.display = "none";
    display_enemy2_hp.style.display = "none";
    display_enemy3_hp.style.display = "none";
    display_enemy1_sprite.style.display = "none";
    display_enemy2_sprite.style.display = "none";
    display_enemy3_sprite.style.display = "none";
    for (let i = 0; i < 12; i++) {
        shop1[i] = shop1_real[i];
        shopItems[i].querySelector("p").innerText = JSON_items[shop1[i]].name;
    }
    shop.style.display = "grid";
    shopTitle.style.display = "";
    shopBrowse();
}

function exitShop() {
    display_enemy1_hp.style.display = "";
    display_enemy2_hp.style.display = "";
    display_enemy3_hp.style.display = "";
    display_enemy1_sprite.style.display = "";
    display_enemy2_sprite.style.display = "";
    display_enemy3_sprite.style.display = "";
    shop.style.display = "none";
    shopTitle.style.display = "none";
    pickItem = null;
    advance();
}

function shopBrowse() {
    gameState = "shop browse";
    sellable = null;
    loadText("Welcome to the Shop... Buy.");
    btnText(null, "Leave", "Sell");
    btnEvents(null, exitShop, sell);
    for (const e of shopItems) {
        e.addEventListener("click", pickItem);
    }
}
var itemIndex;

function pickItem() {
    if (gameState == "shop browse") {
        itemIndex = Array.prototype.slice.call(shopItems).indexOf(this);
        let item = shop1[itemIndex];
        if (item != null) {
            pickUpItem = item;
            gameState = "buying";
            loadText("Would you like to buy the next item?: " + JSON_items[item].name + " (" + JSON_items[item].buyPrice + "$)");
            btnText("Buy", "Nevermind", null);
            btnEvents(buy, shopBrowse, null);
        }
    }
}

function buy() {
    if (player.money >= JSON_items[pickUpItem].buyPrice) {
        player.money -= JSON_items[pickUpItem].buyPrice;
        shop1[itemIndex] = null;
        shop.children[itemIndex].querySelector("p").innerText = "";
        updateStats();
        if (JSON_items[pickUpItem].name != "Backpack") {
            addItem();
        } else {
            player.hasBackpack = true;
            document.getElementById("slot9").classList = [];
            document.getElementById("slot10").classList = [];
            updateStats();
            loadText("From now on, you'll have 2 more spaces... yay");
            btnText("Continue", null, null);
            btnEvents(shopBrowse, null, null);
        }
    } else {
        gameState = "broke";
        loadText("You don't have enough money...");
        btnText("Continue", null, null);
        btnEvents(shopBrowse, null, null);
    }
}

function sell() {
    if ((emptySpaces() != 8 && player.hasBackpack == false) || (emptySpaces() != 10 && player.hasBackpack)) {
        gameState = "sell";
        loadText("Pick an item to sell.");
        btnText("Nevermind", null, null);
        btnEvents(shopBrowse, null, null);
    }
}

function sellConfirm() {
    if (sellable != null) {
        gameState = "sold";
        player.money += JSON_items[player.inventory[sellable]].sellPrice;
        player.inventory[sellable] = null;
        updateStats();
        loadText("Muchas gracias!");
        btnText("Continue", null, null);
        btnEvents(shopBrowse, null, null);
    }
}
//#endregion
//#region Win/Lose
function win() {
    btnText("START", null, null);
    btnEvents(advance, null, null);
    monster = null;
    loadMonster();
    main.style.display = "none";
    winScreen.style.display = "block";
}

function lose() {
    btnText("START", null, null);
    btnEvents(advance, null, null);
    monster = null;
    loadMonster();
    main.style.display = "none";
    loseScreen.style.display = "block";
}
//#endregion
//#region Stage Handler
function loadStage() {
    var curr = map[floor-1][stage-1];
    if (curr == "nothing") {
        event_nothing();
    } else if (curr == "floorLoot") {
        event_floorLoot1();
    } else if (curr == "money") {
        event_money();
    } else if (curr == "chest") {
        event_chest1();
    } else if (curr == "monster") {
        event_monster();
    } else if (curr == "shop") {
        loadShop();
    } else if (curr == "boss") {
        event_boss();
    }
}
//#endregion