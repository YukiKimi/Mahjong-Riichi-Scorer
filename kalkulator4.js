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
        const selectors = ['#melds .tile-slot', '#doraIndicators .tile-slot', '#uradoraIndicators .tile-slot'];
        let count = 0;
      
        selectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(slot => {
            if (slot.dataset.tile === tileCode) count++;
          });
        });
      
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
        const tiles = Array.from(document.querySelectorAll("#melds .tile-slot")).map(slot =>
          slot.dataset.tile || null
        );
        console.log("Aktualna ręka:", tiles);
      }
      
  
    function selectWind(imgEl, type) {
      const groupId = type === 'seat' ? 'seatWindGroup' : 'roundWindGroup';
      const inputId = type === 'seat' ? 'seatWind' : 'roundWind';
  
      document.querySelectorAll(`#${groupId} img`).forEach(img => {
        img.classList.remove("selected");
      });
  
      imgEl.classList.add("selected");
      document.getElementById(inputId).value = imgEl.dataset.value;
    }
  
    document.querySelectorAll(".tile-slot").forEach(slot => {
      slot.setAttribute("tabindex", "0");
      slot.addEventListener("click", () => (selectedSlot = slot));
      slot.addEventListener("focus", () => (selectedSlot = slot));
    });
  
    document.addEventListener("keydown", function (e) {
      const el = document.activeElement;
  
      if (el.classList.contains("tile-slot")) {
        selectedSlot = el;
      }
  
      if ((e.key === "Backspace" || e.key === "Delete") && selectedSlot) {
        e.preventDefault();
        selectedSlot.innerHTML = '';
        selectedSlot.dataset.tile = '';
        return;
      }
  
      if (
        (e.code === "Enter" || e.code === "Space") &&
        el.tagName === "IMG" &&
        (el.closest("#seatWindGroup") || el.closest("#roundWindGroup"))
      ) {
        e.preventDefault();
        const type = el.closest("#seatWindGroup") ? "seat" : "round";
        selectWind(el, type);
        return;
      }
  
      if (el.classList.contains("tile-slot") && (e.code === "Enter" || e.code === "Space")) {
        e.preventDefault();
        selectedSlot = el;
        return;
      }
  
      if (!selectedSlot) return;
      const key = e.key.toLowerCase();
  
      if (['s', 't', 'p', 'q'].includes(key) && inputBuffer === '') {
        inputBuffer = key;
        clearTimeout(inputTimeout);
        inputTimeout = setTimeout(() => (inputBuffer = ''), 1000);
        return;
      }
  
      if (inputBuffer.length === 1 && /[1-9h]/.test(key)) {
        inputBuffer += key;
        return;
      }
  
      if (inputBuffer.length === 2 && ['m', 'p', 's', 'e', 'n', 'w', 'r', 'g'].includes(key)) {
        const mode = inputBuffer[0]; // s, t, p, q
        const code = inputBuffer[1] + key;
  
        if (!tileMap[code]) {
          inputBuffer = '';
          return;
        }
  
        const allSlots = Array.from(document.querySelectorAll("#melds .tile-slot"));
        const startIndex = allSlots.indexOf(selectedSlot);
        if (startIndex === -1) {
          inputBuffer = '';
          return;
        }
  
        if (mode === 's') {
          const num = parseInt(inputBuffer[1]);
          const suit = key;
          if (!['m', 'p', 's'].includes(suit) || isNaN(num) || num < 1 || num > 7) {
            inputBuffer = '';
            return;
          }
  
          const codes = [`${num}${suit}`, `${num + 1}${suit}`, `${num + 2}${suit}`];
          for (let i = 0; i < 3; i++) {
            const slot = allSlots[startIndex + i];
            if (!slot) continue;
            slot.innerHTML = `<img src="img/${tileMap[codes[i]]}" alt="${codes[i]}">`;
            slot.dataset.tile = codes[i];
          }
        }
  
        if (mode === 't') {
          for (let i = 0; i < 3; i++) {
            const slot = allSlots[startIndex + i];
            if (!slot) continue;
            if (countTileUsage(code) < 4) {
                slot.innerHTML = `<img src="img/${tileMap[code]}" alt="${code}">`;
                slot.dataset.tile = code;
              } else {
                console.warn(`${code} już użyto 4 razy – pominięto`);
              }
          }
        }
  
        if (mode === 'p') {
          for (let i = 0; i < 2; i++) {
            const slot = allSlots[startIndex + i];
            if (!slot) continue;
            if (countTileUsage(code) < 4) {
                slot.innerHTML = `<img src="img/${tileMap[code]}" alt="${code}">`;
                slot.dataset.tile = code;
              } else {
                console.warn(`${code} już użyto 4 razy – pominięto`);
              }
          }
        }
  
        if (mode === 'q') {
            for (let i = 0; i < 3; i++) {
              const slot = allSlots[startIndex + i];
              if (!slot) continue;
              if (countTileUsage(code) < 4) {
                slot.innerHTML = `<img src="img/${tileMap[code]}" alt="${code}">`;
                slot.dataset.tile = code;
              } else {
                console.warn(`${code} już użyto 4 razy – pominięto`);
              }
            }
          
            // Zawsze dodaj nowy slot jako 4. element quada
            const newSlot = document.createElement("div");
            newSlot.className = "tile-slot";
            newSlot.setAttribute("tabindex", "0");
            newSlot.addEventListener("click", () => (selectedSlot = newSlot));
            newSlot.addEventListener("focus", () => (selectedSlot = newSlot));
            newSlot.innerHTML = `<img src="img/${tileMap[code]}" alt="${code}">`;
            newSlot.dataset.tile = code;
          
            const third = allSlots[startIndex + 2];
            if (third && third.parentElement) {
              third.parentElement.insertBefore(newSlot, third.nextSibling);
            } else {
              document.getElementById("melds").appendChild(newSlot);
            }
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
  
    window.selectWind = selectWind;
  });
  