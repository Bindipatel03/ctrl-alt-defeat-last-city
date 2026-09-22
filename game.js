// =============================================
// LAST CITY
// CTRL + ALT + DEFEAT
// IT 485 CAPSTONE
// =============================================


// =============================================
// SAVE KEY
// =============================================

const SAVE_KEY = "lastCitySaveV1";



// =============================================
// DEFAULT GAME
// =============================================

const defaultGame = {

    energy: 0,

    food: 10,

    population: 10,

    populationCapacity: 10,

    research: 0,

    clickPower: 1,

    totalClicks: 0,

    totalEnergyGenerated: 0,

    buildings: {

        solar: 0,

        farm: 0,

        shelter: 0,

        lab: 0

    }

};



// =============================================
// CURRENT GAME STATE
// =============================================

let game = JSON.parse(
    JSON.stringify(defaultGame)
);



// =============================================
// HTML ELEMENTS
// =============================================

const energyDisplay =
    document.getElementById("energy");

const foodDisplay =
    document.getElementById("food");

const populationDisplay =
    document.getElementById("population");

const populationCapacityDisplay =
    document.getElementById("populationCapacity");

const researchDisplay =
    document.getElementById("research");


const energyPerSecondDisplay =
    document.getElementById("energyPerSecond");

const foodPerSecondDisplay =
    document.getElementById("foodPerSecond");

const researchPerSecondDisplay =
    document.getElementById("researchPerSecond");


const energyButton =
    document.getElementById("energyButton");

const clickPowerDisplay =
    document.getElementById("clickPower");

const clickPowerStat =
    document.getElementById("clickPowerStat");

const totalClicksDisplay =
    document.getElementById("totalClicks");


const solarOwnedDisplay =
    document.getElementById("solarOwned");

const farmOwnedDisplay =
    document.getElementById("farmOwned");

const shelterOwnedDisplay =
    document.getElementById("shelterOwned");

const labOwnedDisplay =
    document.getElementById("labOwned");


const solarCostDisplay =
    document.getElementById("solarCost");

const farmCostDisplay =
    document.getElementById("farmCost");

const shelterCostDisplay =
    document.getElementById("shelterCost");

const labCostDisplay =
    document.getElementById("labCost");


const buySolarButton =
    document.getElementById("buySolar");

const buyFarmButton =
    document.getElementById("buyFarm");

const buyShelterButton =
    document.getElementById("buyShelter");

const buyLabButton =
    document.getElementById("buyLab");


const cityStageDisplay =
    document.getElementById("cityStage");

const cityVisual =
    document.getElementById("cityVisual");

const cityDescription =
    document.getElementById("cityDescription");

const cityScoreDisplay =
    document.getElementById("cityScore");

const totalBuildingsDisplay =
    document.getElementById("totalBuildings");


const progressBar =
    document.getElementById("progressBar");

const nextStageText =
    document.getElementById("nextStageText");


const saveButton =
    document.getElementById("saveButton");

const resetButton =
    document.getElementById("resetButton");

const saveStatus =
    document.getElementById("saveStatus");

const notification =
    document.getElementById("notification");



// =============================================
// BUILDING DEFINITIONS
// =============================================

const buildings = {

    solar: {

        baseCost: 25,

        multiplier: 1.15

    },


    farm: {

        baseCost: 50,

        multiplier: 1.16

    },


    shelter: {

        baseCost: 80,

        multiplier: 1.18

    },


    lab: {

        baseCost: 120,

        multiplier: 1.2

    }

};



// =============================================
// BUILDING COST FUNCTION
// =============================================

function getBuildingCost(type) {

    const definition =
        buildings[type];

    const owned =
        game.buildings[type];

    return Math.floor(

        definition.baseCost *

        Math.pow(
            definition.multiplier,
            owned
        )

    );

}



// =============================================
// PRODUCTION
// =============================================

function getEnergyPerSecond() {

    return game.buildings.solar;

}


function getFoodPerSecond() {

    return game.buildings.farm * 2;

}


function getResearchPerSecond() {

    return game.buildings.lab;

}



// =============================================
// TOTAL BUILDINGS
// =============================================

function getTotalBuildings() {

    return (

        game.buildings.solar +

        game.buildings.farm +

        game.buildings.shelter +

        game.buildings.lab

    );

}



// =============================================
// CITY SCORE
// =============================================

function getCityScore() {

    return (

        game.buildings.solar * 15 +

        game.buildings.farm * 20 +

        game.buildings.shelter * 30 +

        game.buildings.lab * 40 +

        Math.floor(game.population * 2) +

        Math.floor(game.research)

    );

}



// =============================================
// GENERATE ENERGY
// =============================================

energyButton.addEventListener(
    "click",
    function () {

        game.energy +=
            game.clickPower;

        game.totalEnergyGenerated +=
            game.clickPower;

        game.totalClicks++;

        animateEnergyButton();

        updateGame();

    }
);



// =============================================
// CLICK ANIMATION
// =============================================

function animateEnergyButton() {

    energyButton.style.transform =
        "scale(0.95)";

    setTimeout(
        function () {

            energyButton.style.transform =
                "";

        },
        80
    );

}



// =============================================
// BUY SOLAR
// =============================================

buySolarButton.addEventListener(
    "click",
    function () {

        buyBuilding("solar");

    }
);



// =============================================
// BUY FARM
// =============================================

buyFarmButton.addEventListener(
    "click",
    function () {

        buyBuilding("farm");

    }
);



// =============================================
// BUY SHELTER
// =============================================

buyShelterButton.addEventListener(
    "click",
    function () {

        buyBuilding("shelter");

    }
);



// =============================================
// BUY LAB
// =============================================

buyLabButton.addEventListener(
    "click",
    function () {

        buyBuilding("lab");

    }
);



// =============================================
// BUY BUILDING FUNCTION
// =============================================

function buyBuilding(type) {

    const cost =
        getBuildingCost(type);


    if (game.energy < cost) {

        return;

    }


    game.energy -=
        cost;


    game.buildings[type]++;


    if (type === "shelter") {

        game.populationCapacity += 5;

    }


    showNotification(
        getBuildingName(type) +
        " constructed!"
    );


    updateGame();

    saveGame(false);

}



// =============================================
// BUILDING DISPLAY NAME
// =============================================

function getBuildingName(type) {

    if (type === "solar") {

        return "Solar Generator";

    }


    if (type === "farm") {

        return "Hydro Farm";

    }


    if (type === "shelter") {

        return "Shelter Block";

    }


    if (type === "lab") {

        return "Research Lab";

    }


    return "Building";

}



// =============================================
// AUTOMATIC PRODUCTION
// =============================================

function gameLoop() {

    const energyProduction =
        getEnergyPerSecond();

    const foodProduction =
        getFoodPerSecond();

    const researchProduction =
        getResearchPerSecond();


    game.energy +=
        energyProduction;

    game.food +=
        foodProduction;

    game.research +=
        researchProduction;


    game.totalEnergyGenerated +=
        energyProduction;


    growPopulation();


    updateGame();

}



// =============================================
// POPULATION GROWTH
// =============================================

function growPopulation() {

    if (
        game.population <
        game.populationCapacity
    ) {

        if (
            game.food >=
            game.population
        ) {

            game.population +=
                0.1;

        }

    }


    if (
        game.population >
        game.populationCapacity
    ) {

        game.population =
            game.populationCapacity;

    }

}



// =============================================
// CITY STAGES
// =============================================

function getCityStage() {

    const score =
        getCityScore();


    if (score < 100) {

        return {

            name:
                "Survival Camp",

            visual:
                "🏕️",

            description:
                "A small group of survivors has established the last remaining camp.",

            progress:
                score,

            next:
                "Settlement"

        };

    }


    if (score < 300) {

        return {

            name:
                "Settlement",

            visual:
                "🏕️ 🏠 ☀️",

            description:
                "Basic housing and infrastructure are beginning to restore civilization.",

            progress:
                ((score - 100) / 200) * 100,

            next:
                "Growing City"

        };

    }


    if (score < 700) {

        return {

            name:
                "Growing City",

            visual:
                "🏠 🏘️ 🌾 ☀️ 🔬",

            description:
                "The settlement is becoming a functioning city with food, power and research.",

            progress:
                ((score - 300) / 400) * 100,

            next:
                "Advanced City"

        };

    }


    if (score < 1400) {

        return {

            name:
                "Advanced City",

            visual:
                "🏙️ ⚡ 🌾 🔬 🏢",

            description:
                "Advanced infrastructure and technology are transforming the city.",

            progress:
                ((score - 700) / 700) * 100,

            next:
                "Future Civilization"

        };

    }


    return {

        name:
            "Future Civilization",

        visual:
            "🌆 🤖 ⚡ 🚀 🔬",

        description:
            "Civilization has returned stronger than before. The city is entering a new technological age.",

        progress:
            100,

        next:
            "Civilization Rebuilt"

    };

}



// =============================================
// UPDATE CITY
// =============================================

function updateCity() {

    const stage =
        getCityStage();


    cityStageDisplay.textContent =
        stage.name;


    cityVisual.textContent =
        stage.visual;


    cityDescription.textContent =
        stage.description;


    cityScoreDisplay.textContent =
        getCityScore();


    progressBar.style.width =
        Math.min(
            stage.progress,
            100
        ) + "%";


    nextStageText.textContent =
        "Next Stage: " +
        stage.next;

}



// =============================================
// UPDATE SCREEN
// =============================================

function updateGame() {

    // Resources

    energyDisplay.textContent =
        Math.floor(game.energy);

    foodDisplay.textContent =
        Math.floor(game.food);

    populationDisplay.textContent =
        Math.floor(game.population);

    populationCapacityDisplay.textContent =
        game.populationCapacity;

    researchDisplay.textContent =
        Math.floor(game.research);


    // Production

    energyPerSecondDisplay.textContent =
        getEnergyPerSecond();

    foodPerSecondDisplay.textContent =
        getFoodPerSecond();

    researchPerSecondDisplay.textContent =
        getResearchPerSecond();


    // Clicking

    totalClicksDisplay.textContent =
        game.totalClicks;

    clickPowerDisplay.textContent =
        game.clickPower;

    clickPowerStat.textContent =
        game.clickPower;


    // Buildings owned

    solarOwnedDisplay.textContent =
        game.buildings.solar;

    farmOwnedDisplay.textContent =
        game.buildings.farm;

    shelterOwnedDisplay.textContent =
        game.buildings.shelter;

    labOwnedDisplay.textContent =
        game.buildings.lab;


    // Building prices

    const solarCost =
        getBuildingCost("solar");

    const farmCost =
        getBuildingCost("farm");

    const shelterCost =
        getBuildingCost("shelter");

    const labCost =
        getBuildingCost("lab");


    solarCostDisplay.textContent =
        solarCost;

    farmCostDisplay.textContent =
        farmCost;

    shelterCostDisplay.textContent =
        shelterCost;

    labCostDisplay.textContent =
        labCost;


    // Disable unaffordable buildings

    buySolarButton.disabled =
        game.energy < solarCost;

    buyFarmButton.disabled =
        game.energy < farmCost;

    buyShelterButton.disabled =
        game.energy < shelterCost;

    buyLabButton.disabled =
        game.energy < labCost;


    // Total buildings

    totalBuildingsDisplay.textContent =
        getTotalBuildings();


    // City

    updateCity();

}



// =============================================
// SAVE GAME
// =============================================

function saveGame(showMessage = true) {

    localStorage.setItem(

        SAVE_KEY,

        JSON.stringify(game)

    );


    const now =
        new Date();


    saveStatus.textContent =
        "Last saved at " +
        now.toLocaleTimeString();


    if (showMessage) {

        showNotification(
            "Game saved!"
        );

    }

}



// =============================================
// LOAD GAME
// =============================================

function loadGame() {

    const savedGame =
        localStorage.getItem(
            SAVE_KEY
        );


    if (!savedGame) {

        updateGame();

        return;

    }


    try {

        const loaded =
            JSON.parse(savedGame);


        game = {

            ...defaultGame,

            ...loaded,

            buildings: {

                ...defaultGame.buildings,

                ...(loaded.buildings || {})

            }

        };


        saveStatus.textContent =
            "Saved progress loaded.";

    }

    catch (error) {

        console.error(
            "Could not load save:",
            error
        );


        game =
            JSON.parse(
                JSON.stringify(
                    defaultGame
                )
            );

    }


    updateGame();

}



// =============================================
// MANUAL SAVE
// =============================================

saveButton.addEventListener(
    "click",
    function () {

        saveGame(true);

    }
);



// =============================================
// RESET GAME
// =============================================

resetButton.addEventListener(
    "click",
    function () {

        const confirmed =
            confirm(
                "Are you sure you want to reset your entire city? This cannot be undone."
            );


        if (!confirmed) {

            return;

        }


        localStorage.removeItem(
            SAVE_KEY
        );


        game =
            JSON.parse(
                JSON.stringify(
                    defaultGame
                )
            );


        updateGame();


        saveStatus.textContent =
            "New game started.";


        showNotification(
            "City reset."
        );

    }
);



// =============================================
// NOTIFICATION
// =============================================

function showNotification(message) {

    notification.textContent =
        message;


    notification.classList.add(
        "show"
    );


    setTimeout(
        function () {

            notification.classList.remove(
                "show"
            );

        },
        1800
    );

}



// =============================================
// START AUTOMATIC PRODUCTION
// =============================================

setInterval(
    gameLoop,
    1000
);



// =============================================
// AUTOSAVE EVERY 5 SECONDS
// =============================================

setInterval(
    function () {

        saveGame(false);

    },
    5000
);



// =============================================
// LOAD GAME WHEN PAGE OPENS
// =============================================

loadGame();
