// #region Variables
const menu = document.getElementById("mainMenu");
const main = document.getElementById("mainGame");
const nameBox = document.getElementById("nameBox");
const display_floor = document.getElementById("floorNumber");
const display_effects = document.getElementById("effectsBox");
const display_enemy1_hp = document.getElementById("enemyHealth1");
const display_enemy2_hp = document.getElementById("enemyHealth2");
const display_enemy3_hp = document.getElementById("enemyHealth3");
const display_enemy1_sprite = document.getElementById("enemyDisplay1");
const display_enemy2_sprite = document.getElementById("enemyDisplay2");
const display_enemy3_sprite = document.getElementById("enemyDisplay3");
const textBox = document.getElementById("textDialogue");
const button1 = document.getElementById("button1");
const button2 = document.getElementById("button2");
const button3 = document.getElementById("button3");
const stats_name = document.getElementById("plrName");
const stats_health = document.getElementById("plrHealth");
const stats_money = document.getElementById("plrMoney");
const stats_weapon = document.getElementById("plrWeapon");
const stats_armor = document.getElementById("plrArmor");
const stats_resistance = document.getElementById("plrResistance");
const stats_speed = document.getElementById("plrSpeed");
const stats_inventorySpace = document.getElementById("plrInventorySpace");
const stats_inventory = document.getElementById("plrInventory");
const player = {
    name:null,
    maxHealth:100,
    health:100,
    weapon:null,
    armor:null,
    resistance:1.0,
    speed:1.0,
    effects:[],
    money:0,
    inventory:[],
    hasBackpack:false
};
const JSON_events = fetchJSON("events");
var floor = 1;
var stage = 1;
var map = [];
// #endregion

main.style.display = "none";
menu.style.display = "block";

// #region Tools
function RNG(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

function sum(events) {
    var s = 0;
    events.forEach(e => {
        s += e.weight * 100;
    });
    return s;
}

function fetchJSON(fn) {
    fetch('http://127.0.0.1:5500/JSON/' + fn + '.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();  
        })
        .then(data => console.log(data))  
        .catch(error => console.error('Failed to fetch data:', error)); 
}
// #endregion

//#region Updates
function updateStats() {
    stats_name.innerText = player.name;
    stats_health.innerText = "Health: " + player.maxHealth + "/" + player.health;
    stats_money.innerText = "Money: " + player.money + "$";
    stats_weapon.innerText = "Weapon: " + player.weapon;
    stats_armor.innerText = "Armor: " + player.armor;
    stats_resistance.innerText = "Resistance: " + parseInt(player.resistance * 10);
    stats_speed.innerText = "Speed: " + parseInt(player.speed * 10);
    if (player.hasBackpack) {
        stats_inventorySpace.innerText = "Inventory slots: " + player.inventory.length + "/" + 10;
    } else {
        stats_inventorySpace.innerText = "Inventory slots: " + player.inventory.length + "/" + 8;
    }
    display_floor.innerText = "Floor " + floor;
    // Effects...
}

function loadText(text) {
    textBox.innerText = "→ " + text;
}
// #endregion

// #region Generation
function randomEvent() {
    // Testing only
    var events = JSON_events;
    var n = RNG(1, sum(events));
    var i = -1;

    do {
        i++;
        n -= events[i].weight * 100;
    } while (n > 0);
    return events[i].name;
}

function canGenerate(n) {
    return n % 10 != 0; // Need to adjust later...
}

function generateMonsters(m) {
    var map = m;
    var i = 1;
    while (i < 99) {
        if (canGenerate(i+1)) {
            if (RNG(1,2) == 1) {
                map[i][RNG(1,map[i].length-1)] = "monster... how should I feel?";
                i += 2;
            } else {
                i += 1;
                map[i][RNG(1,map[i].length-1)] = "monster... how should I feel?";
                i += 1;
            }
        } else {
            i++;
        }
    }
    return map;
}

function generateLevel() {
    var map = [];

    for (let i = 0; i < 100; i++) {
        var currFloor = [];
        if (canGenerate(i+1)) {
            for (let j = 0; j < RNG(4,6); j++) {
                currFloor[j] = randomEvent();
            }
        } else {
            currFloor[0] = "Shop";
        }
        map[i] = currFloor;
    }
    map = generateMonsters(map);

    return map;
}
// #endregion

// #region Start/Reset
function playerReset() {
    player.weapon = "Stick";
    player.armor = "-";
    player.hasBackpack = false;
    player.resistance = 1.0;
    player.speed = 1.0;
    player.maxHealth = 100;
    player.health = 100;
    player.money = 0;
    player.inventory = [];
    player.effects = [];
    for (let i = 0; i < 8; i++) {
        player.inventory[i] = null;
    }
    updateStats();
}

function start() {
    if (nameBox.value == "" || nameBox.value.length > 20 || nameBox.value.length < 4) return -1;
    menu.style.display = "none";
    main.style.display = "grid";
    player.name = nameBox.value;
    playerReset();
    var map = generateLevel();
    loadText("Teszt Teszt Teszt!")
    console.log(map);
}
// #endregion