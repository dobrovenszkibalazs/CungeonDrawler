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
var floor = 1;
var stage = 1;
var map = [];

main.style.display = "none";
menu.style.display = "block";

function RNG(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

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
}

function generateLevel() {
    map = [];
    for (let i = 0; i < 100; i++) {
        var currFloor = [];
        if ((i+1) % 20 != 0) {
            for (let j = 0; j < RNG(4,6); j++) {
                currFloor[j] = (RNG(1,2) == 1) ? "Halal" : "Elet";
            }
        } else {
            currFloor[0] = "Boss";
        }
        map[i] = currFloor;
    }
}

function start() {
    if (nameBox.value == "" || nameBox.value.length > 20 || nameBox.value.length < 4) return -1;
    menu.style.display = "none";
    main.style.display = "grid";
    player.name = nameBox.value;
    player.weapon = "Stick";
    player.armor = "-";
    updateStats();
    generateLevel();
    console.log(map);
}