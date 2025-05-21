var gameState = "advancable";

button1.addEventListener("click", testButton);
button2.addEventListener("click", testButton);
button3.addEventListener("click", testButton);

function nextStage() {
    var curr = map[floor-1][stage-1];
    stage++;
    if (stage > map[floor-1].length) {
        stage = 1;
        floor++;
    }
}

function loadStage() {
    var curr = map[floor-1][stage-1];

    if (curr == "nothing") {
        textBox.innerText = JSON_events.events[0].text[RNG(0,2)];
    } else if (curr == "floorLoot") {
        textBox.innerText = JSON_events.events[1].text[RNG(0,1)];
    } else if (curr == "chest") {
        textBox.innerText = JSON_events.events[2].text[RNG(0,1)];
    } else if (curr == "monster") {
        textBox.innerText = "Monster!!!!!!";
    }
}

function testButton() {
    console.log("nyomod");
    loadStage();
    nextStage();
}