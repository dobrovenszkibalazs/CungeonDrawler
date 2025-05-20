button1.addEventListener("click", testButton);
button2.addEventListener("click", testButton);
button3.addEventListener("click", testButton);

function testButton() {
    console.log("nyomod");
    button1.removeEventListener("click", testButton);
}