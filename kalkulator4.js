// kalkulator4.js
const tilePicker = document.getElementById("tilePicker"); 
let activeSlot = null;

// Przykładowy zestaw kostek (można później rozszerzyć o wszystkie typy) 
const tileSymbols = [ 
    "1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m", 
    "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", 
    "1s", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", 
    "E", "S", "W", "N", 
    "P", "F", "C" ];

// Tworzy elementy wyboru płytek w pickerze 
tileSymbols.forEach(symbol => { 
    const tile = document.createElement("div"); 
    tile.className = "tile"; tile.textContent = symbol; 
    tile.onclick = () => selectTile(symbol); 
    tilePicker.appendChild(tile); 
});

function openTilePicker(slot) { 
    activeSlot = slot; const rect = slot.getBoundingClientRect(); 
    tilePicker.style.top = '${rect.bottom + window.scrollY}px'; 
    tilePicker.style.left = '${rect.left + window.scrollX}px'; 
    tilePicker.style.display = "grid"; 
}

function selectTile(symbol) { 
    if (!activeSlot) return; 
    activeSlot.textContent = symbol; 
    activeSlot.setAttribute("data-tile", symbol); 
    tilePicker.style.display = "none"; activeSlot = null; 
}

// Obsługa formularza 
const form = document.getElementById("scoreForm"); 
form.addEventListener("submit", function (e) { e.preventDefault(); calculateScore(); });

function calculateScore() { 
    const meldTiles = Array.from(document.querySelectorAll(".tile-slot")) .map(slot => slot.getAttribute("data-tile") || null);

    const meldClosed = Array.from(document.querySelectorAll(".closed-toggle")) .map(cb => cb.checked);

    const seatWind = document.getElementById("seatWind").value; const roundWind = document.getElementById("roundWind").value; const isDealer = seatWind === roundWind;

    const dora = Array.from(document.querySelectorAll("#doraIndicators .tile-slot")) .map(slot => slot.getAttribute("data-tile")).filter(Boolean);

    const uradora = Array.from(document.querySelectorAll("#uradoraIndicators .tile-slot")) .map(slot => slot.getAttribute("data-tile")).filter(Boolean);

    const options = { tsumo: document.getElementById("tsumo").checked, ron: document.getElementById("ron").checked, riichi: document.getElementById("riichi").checked, doubleRiichi: document.getElementById("doubleRiichi").checked, ippatsu: document.getElementById("ippatsu").checked, isDealer, seatWind, roundWind, dora, uradora, meldTiles, meldClosed, };

    // Tymczasowy wynik (do zastąpienia algorytmem punktowym) 
    const resultText = 'Dealer: ${isDealer ? "Yes" : "No"}, Riichi: ${options.riichi}, Meld 1: ${meldTiles.slice(0,3).join(", ")}'; 
    document.getElementById("result").textContent = resultText; 
}

// Dodawanie Dora/Uradora slotów 
document.addEventListener("DOMContentLoaded", () => { addIndicator("dora"); addIndicator("uradora"); });

function addIndicator(type) { 
    const container = document.getElementById(type + "Indicators"); 
    const slot = document.createElement("div"); slot.className = "tile-slot"; 
    slot.onclick = () => openTilePicker(slot); 
    container.appendChild(slot); 
}
