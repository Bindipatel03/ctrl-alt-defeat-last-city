let energy = 0;

const energyDisplay = document.getElementById("energy");
const energyButton = document.getElementById("energyButton");


energyButton.addEventListener("click", function () {

    energy = energy + 1;

    energyDisplay.textContent = energy;

});
