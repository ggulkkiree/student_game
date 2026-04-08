let currentWeather = { temp: 0, rain: false, dust: false };
let failCount = 0;

function changeDifficulty() {
    const level = parseInt(document.getElementById('difficulty').value);
    const allClothes = document.querySelectorAll('.clothing-item');
    
    allClothes.forEach(item => {
        const itemLevel = parseInt(item.dataset.level);
        if (itemLevel <= level) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
    resetGame();
}

function generateWeather() {
    currentWeather.temp = Math.floor(Math.random() * 41) - 10;
    currentWeather.rain = Math.random() < 0.3;
    currentWeather.dust = Math.random() < 0.3;

    document.querySelector('#weather-temp span').innerText = `${currentWeather.temp}°C`;
    document.querySelector('#weather-rain span').innerText = currentWeather.rain ? "☂️ 80%" : "☀️ 0%";
    document.querySelector('#weather-dust span').innerText = currentWeather.dust ? "🔴😷 나쁨" : "🟢🙂 좋음";
}

function allowDrop(event) { event.preventDefault(); }
function drag(event) { event.dataTransfer.setData("text", event.target.id); }

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
    
    const clone = draggedElement.cloneNode(true);
    clone.className = "equipped-item";
    clone.draggable = false; 
    clone.id = data + "_equipped"; 
    
    clone.onclick = function() { this.remove(); removeBlinkHints(); };

    document.getElementById("character").appendChild(clone);
    removeBlinkHints(); 
}

function removeBlinkHints() {
    const items = document.querySelectorAll('.clothing-item');
    items.forEach(item => item.classList.remove('blink-hint'));
}

function resetGame() {
    document.getElementById("character").innerHTML = ""; 
    document.getElementById("feedback").innerText = "";
    removeBlinkHints();
    failCount = 0;
    generateWeather();
}

function checkOutfit() {
    const equippedItems = document.querySelectorAll('#character .equipped-item');
    const feedbackBox = document.getElementById('feedback');
    removeBlinkHints(); 
    
    let hasUmbrella = false;
    let hasMask = false;
    let warmthLevel = 0;

    equippedItems.forEach(item => {
        if(item.dataset.rain) hasUmbrella = true;
        if(item.dataset.dust) hasMask = true;
        if(item.dataset.warmth === 'high') warmthLevel += 3;
        if(item.dataset.warmth === 'mid') warmthLevel += 2;
        if(item.dataset.warmth === 'low') warmthLevel += 1;
    });

    let errorMessage = "";
    let errorTarget = null; 
    let missingItemId = ""; 

    if (currentWeather.rain && !hasUmbrella) {
        errorMessage = "앗! 비가 오는데 우산이 없어서 젖었어요! ☔";
        errorTarget = "weather-rain";
        missingItemId = "umbrella";
    } else if (currentWeather.dust && !hasMask) {
        errorMessage = "콜록콜록! 미세먼지가 나쁜데 마스크가 없어요! 😷";
        errorTarget = "weather-dust";
        missingItemId = "mask";
    } else if (currentWeather.temp < 10 && warmthLevel < 3) {
        errorMessage = "오들오들... 날씨가 추운데 겉옷이 필요해요! ❄️";
        errorTarget = "weather-temp";
        missingItemId = "padding";
    } else if (currentWeather.temp > 25 && warmthLevel > 2) {
        errorMessage = "뻘뻘... 날씨가 너무 더워요! 💦 가벼운 옷을 입어볼까요?";
        errorTarget = "weather-temp";
        missingItemId = "tshirt";
    }

    if (errorMessage === "") {
        feedbackBox.innerText = "✨ 완벽한 외출 준비 끝! 정말 잘했어요! ✨";
        feedbackBox.style.color = "green";
        setTimeout(() => { resetGame(); }, 3000); 
    } else {
        feedbackBox.innerText = errorMessage;
        feedbackBox.style.color = "red";
        failCount++;

        if (errorTarget) {
            const targetElement = document.getElementById(errorTarget);
            targetElement.classList.add('enlarge');
            setTimeout(() => { targetElement.classList.remove('enlarge'); }, 2000);
        }

        if (failCount >= 2 && missingItemId) {
            const hintItem = document.getElementById(missingItemId);
            if (hintItem.style.display !== 'none') {
                hintItem.classList.add('blink-hint');
            }
        }
    }
}

changeDifficulty();
