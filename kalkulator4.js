document.addEventListener("DOMContentLoaded", function () {
    const tilePicker = document.getElementById("tilePicker");
  
    const tileMap = {
      "1m": "Man1.svg", "2m": "Man2.svg", "3m": "Man3.svg", "4m": "Man4.svg",
      "5m": "Man5.svg", "6m": "Man6.svg", "7m": "Man7.svg", "8m": "Man8.svg", "9m": "Man9.svg",
      "1p": "Pin1.svg", "2p": "Pin2.svg", "3p": "Pin3.svg", "4p": "Pin4.svg",
      "5p": "Pin5.svg", "6p": "Pin6.svg", "7p": "Pin7.svg", "8p": "Pin8.svg", "9p": "Pin9.svg",
      "1s": "Sou1.svg", "2s": "Sou2.svg", "3s": "Sou3.svg", "4s": "Sou4.svg",
      "5s": "Sou5.svg", "6s": "Sou6.svg", "7s": "Sou7.svg", "8s": "Sou8.svg", "9s": "Sou9.svg",
      "he": "Ton.svg", "hs": "Nan.svg", "hw": "Shaa.svg", "hn": "Pei.svg",
      "hr": "Chun.svg", "hg": "Hatsu.svg", "hh": "Haku.svg"
    };
  
    let selectedSlot = null;
    let inputBuffer = '';
    let inputTimeout;
  
    Object.entries(tileMap).forEach(([code, file]) => {
      const tileDiv = document.createElement("div");
      tileDiv.className = "tile";
      tileDiv.onclick = () => selectTile(code);
  
      const img = document.createElement("img");
      img.src = `img/${file}`;
      img.alt = code;
  
      tileDiv.appendChild(img);
      tilePicker.appendChild(tileDiv);
    });
  
    function countTileUsage(tileCode) {
      const selectors = ['#closedMelds .tile-slot', '#openMelds .tile-slot', '#doraIndicators .tile-slot', '#uradoraIndicators .tile-slot'];
      let count = 0;
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(slot => {
          if (slot.dataset.tile === tileCode) count++;
        });
      });
      console.log(`LICZĘ "${tileCode}":`, count);
      return count;
    }
  
    function selectTile(tileCode) {
      if (selectedSlot) {
        const currentCount = countTileUsage(tileCode);
        if (currentCount >= 4) {
          console.warn(`Nie można użyć ${tileCode} więcej niż 4 razy`);
          return;
        }
        const file = tileMap[tileCode];
        selectedSlot.innerHTML = `<img src="img/${file}" alt="${tileCode}">`;
        selectedSlot.dataset.tile = tileCode;
        logHandState();
      }
    }
  
    function logHandState() {
      const tiles = Array.from(document.querySelectorAll("#closedMelds .tile-slot, #openMelds .tile-slot"))
        .map(slot => slot.dataset.tile || null);
      console.log("Aktualna ręka:", tiles);
    }
  
    function selectWind(imgEl, type) {
      const groupId = type === 'seat' ? 'seatWindGroup' : 'roundWindGroup';
      const inputId = type === 'seat' ? 'seatWind' : 'roundWind';
      document.querySelectorAll(`#${groupId} img`).forEach(img => img.classList.remove("selected"));
      imgEl.classList.add("selected");
      document.getElementById(inputId).value = imgEl.dataset.value;
    }
  
    function createInitialHandSlots(count = 14) {
      const closed = document.getElementById("closedMelds");
      for (let i = 0; i < count; i++) {
        const slot = document.createElement("div");
        slot.className = "tile-slot";
        slot.setAttribute("tabindex", "0");
        slot.addEventListener("click", () => (selectedSlot = slot));
        slot.addEventListener("focus", () => (selectedSlot = slot));
        closed.appendChild(slot);
      }
    }
  
    function wrapSlotsInGroup(slots) {
      const group = document.createElement("div");
      group.className = "meld-group";
      const parent = slots[0].parentElement;
      parent.insertBefore(group, slots[0]);
      slots.forEach(slot => group.appendChild(slot));
    }
  
    document.addEventListener("click", function (e) {
      if (e.target.classList.contains("tile-slot") || e.target.closest(".tile-slot")) {
        selectedSlot = e.target.closest(".tile-slot");
      }
    });
  
    document.addEventListener("focusin", function (e) {
      if (e.target.classList.contains("tile-slot")) {
        selectedSlot = e.target;
      }
    });
  
    document.addEventListener("keydown", function (e) {
      const el = document.activeElement;
  
      if ((e.key === "Backspace" || e.key === "Delete") && selectedSlot) {
        e.preventDefault();
        const group = selectedSlot.closest('.meld-group');
        if (group && group.children.length === 4) {
          group.removeChild(selectedSlot);
          if (group.children.length === 0) group.remove();
        } else {
          selectedSlot.innerHTML = '';
          selectedSlot.dataset.tile = '';
        }
        logHandState();
        return;
      }
  
      if ((e.code === "Enter" || e.code === "Space") && el.tagName === "IMG" && (el.closest("#seatWindGroup") || el.closest("#roundWindGroup"))) {
        e.preventDefault();
        const type = el.closest("#seatWindGroup") ? "seat" : "round";
        selectWind(el, type);
        return;
      }
  
      if (e.code === "Space" && selectedSlot && selectedSlot.closest('.meld-group')) {
        e.preventDefault();
        const group = selectedSlot.closest('.meld-group');
        const inClosed = group.parentElement.id === "closedMelds";
        const target = document.getElementById(inClosed ? "openMelds" : "closedMelds");
        target.appendChild(group);
        return;
      }
  
      if (!selectedSlot) return;
      const key = e.key.toLowerCase();
  
      if (["s", "t", "p", "q"].includes(key) && inputBuffer === '') {
        inputBuffer = key;
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => (inputBuffer = ''), 1000);
        return;
      }
  
      if (inputBuffer.length === 1 && /[1-9h]/.test(key)) {
        inputBuffer += key;
        return;
      }
  
      if (inputBuffer.length === 2 && ["m", "p", "s", "e", "n", "w", "r", "g"].includes(key)) {
        const mode = inputBuffer[0];
        const code = inputBuffer[1] + key;
        if (!tileMap[code]) {
          inputBuffer = '';
          return;
        }
  
        let tileCodes = [];
        if (mode === 's') {
          const num = parseInt(inputBuffer[1]);
          const suit = key;
          if (!['m', 'p', 's'].includes(suit) || isNaN(num) || num < 1 || num > 7) {
            inputBuffer = '';
            return;
          }
          tileCodes = [`${num}${suit}`, `${num + 1}${suit}`, `${num + 2}${suit}`];
        } else if (mode === 'q') {
          tileCodes = [code, code, code]; // tylko 3 do slotów
        } else {
          const count = mode === 't' ? 3 : mode === 'p' ? 2 : 4;
          tileCodes = Array(count).fill(code);
        }
  
        console.log("tileCodes do sprawdzenia:", tileCodes);
  
        const usageCheck = {};
        let blocked = false;
        for (const tile of tileCodes) {
          const current = countTileUsage(tile);
          usageCheck[tile] = current;
          if (current >= 4) blocked = true;
        }
        console.log("Użycie tile'i:", usageCheck);
  
        if (blocked) {
          console.warn("Zablokowano meld z powodu przekroczenia limitu.");
          inputBuffer = '';
          return;
        }
  
        const allSlots = Array.from(document.querySelectorAll(".tile-slot"));
        const startIndex = allSlots.indexOf(selectedSlot);
        if (startIndex === -1) {
          inputBuffer = '';
          return;
        }
  
        const usedSlots = [];
        for (let i = 0; i < tileCodes.length; i++) {
          const slot = allSlots[startIndex + i];
          if (!slot) continue;
          slot.innerHTML = `<img src="img/${tileMap[tileCodes[i]]}" alt="${tileCodes[i]}">`;
          slot.dataset.tile = tileCodes[i];
          usedSlots.push(slot);
        }
  
        if (mode === 'q') {
          const newSlot = document.createElement("div");
          newSlot.className = "tile-slot";
          newSlot.setAttribute("tabindex", "0");
          newSlot.innerHTML = `<img src="img/${tileMap[code]}" alt="${code}">`;
          newSlot.dataset.tile = code;
          newSlot.addEventListener("click", () => (selectedSlot = newSlot));
          newSlot.addEventListener("focus", () => (selectedSlot = newSlot));
          usedSlots.push(newSlot);
        }
  
        if (mode !== 'p') {
          wrapSlotsInGroup(usedSlots);
        }
        logHandState();
        inputBuffer = '';
        return;
      }
  
      const allowed = '123456789mpshrgwe';
      if (!allowed.includes(key)) return;
  
      inputBuffer += key;
      clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        inputBuffer = '';
      }, 1000);
  
      if (tileMap[inputBuffer]) {
        selectTile(inputBuffer);
        inputBuffer = '';
      }
    });
  
    createInitialHandSlots();
    window.selectWind = selectWind;
  });
  