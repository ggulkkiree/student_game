let currentWeather = { temp: 0, weatherType: 'clear', rainProb: 0, dust: false };
let failCount = 0;

function changeDifficulty() {
    const level = parseInt(document.getElementById('difficulty').value);
    const allClothes = document.querySelectorAll('.clothing-item');
    
    allClothes.forEach(item => {
        const itemLevel = parseInt(item.dataset.level);
        item.style.display = (itemLevel <= level) ? 'flex' : 'none';
    });
    resetGame();
}

function generateWeather() {
    currentWeather.temp = Math.floor(Math.random() * 41) - 10;
    currentWeather.dust = Math.random() < 0.4; 

    const weatherTypes = ['clear', 'cloudy', 'rain', 'snow'];
    currentWeather.weatherType = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];

    let weatherIcon = "";
    let weatherText = "";

    if (currentWeather.weatherType === 'clear') {
        currentWeather.rainProb = 0;
        weatherIcon = "☀️"; weatherText = "맑음";
    } else if (currentWeather.weatherType === 'cloudy') {
        currentWeather.rainProb = Math.floor(Math.random() * 10) * 10; 
        weatherIcon = "☁️"; weatherText = `구름 (강수확률 ${currentWeather.rainProb}%)`;
    } else if (currentWeather.weatherType === 'rain') {
        currentWeather.rainProb = 100;
        weatherIcon = "🌧️"; weatherText = "비";
    } else if (currentWeather.weatherType === 'snow') {
        currentWeather.rainProb = 100;
        weatherIcon = "❄️"; weatherText = "눈";
    }

    document.querySelector('#weather-temp span').innerText = `${currentWeather.temp}°C`;
    document.querySelector('#weather-rain span').innerText = `${weatherIcon} ${weatherText}`;
    document.querySelector('#weather-dust span').innerText = currentWeather.dust ? "🔴😷 나쁨" : "🟢🙂 좋음";
}

function allowDrop(event) { event.preventDefault(); }
function drag(event) { event.dataTransfer.setData("text", event.target.id); }

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
    if (!draggedElement) return;

    const characterZone = document.getElementById("character");
    const itemType = draggedElement.dataset.type;

    // ⭐️ 분신술 방지! 같은 부위의 옷을 이미 입고 있다면 기존 옷 벗기기
    const existingItems = document.querySelectorAll(`#character .equipped-item`);
    existingItems.forEach(item => {
        if (item.dataset.type === itemType || item.id.includes(data)) {
            item.remove();
        }
    });

    const clone = draggedElement.cloneNode(true);
    clone.className = "equipped-item";
    clone.draggable = false; 
    clone.id = data + "_equipped_" + Date.now(); 
    
    // ⭐️ 마스크 하얀색 네모로 변신!
    if (data === 'mask') {
        clone.innerText = ''; 
        clone.style.width = '40px';
        clone.style.height = '25px';
        clone.style.backgroundColor = 'white';
        clone.style.borderRadius = '5px';
        clone.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
        clone.style.left = '80px'; // 네모로 변한 후 코 위치쯤으로 미세 조정
    }

    // 입힌 옷을 클릭하면 벗겨짐
    clone.onclick = function() { this.remove(); removeBlinkHints(); };

    characterZone.appendChild(clone);
    removeBlinkHints(); 
}

function removeBlinkHints() {
    const items = document.querySelectorAll('.clothing-item');
    items.forEach(item => item.classList.remove('blink-hint'));
}

function resetGame() {
    const clothes = document.querySelectorAll('#character .equipped-item');
    clothes.forEach(c => c.remove());
    
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
    let hasTop = false;
    let hasBottom = false;
    let warmthLevel = 0;

    equippedItems.forEach(item => {
        if(item.dataset.rain === "true") hasUmbrella = true;
        if(item.dataset.dust === "true") hasMask = true;
        
        if(item.dataset.type === "top" || item.dataset.type === "outer") hasTop = true;
        if(item.dataset.type === "bottom") hasBottom = true;

        if(item.dataset.warmth === 'high') warmthLevel += 3;
        if(item.dataset.warmth === 'mid') warmthLevel += 2;
        if(item.dataset.warmth === 'low') warmthLevel += 1;
    });

    let errorMessage = "";
    let errorTarget = null; 
    let missingItemId = ""; 

    if (!hasBottom) {
        errorMessage = "앗! 바지를 안 입었어요! 부끄러워요 🫣";
    } else if (!hasTop) {
        errorMessage = "앗! 윗옷을 안 입었어요! 감기 걸려요 🥶";
    } 
    else if (currentWeather.rainProb >= 50 && !hasUmbrella) {
        errorMessage = "비나 눈이 올 확률이 높아요! 우산을 챙겨주세요 ☔";
        errorTarget = "weather-rain";
        missingItemId = "umbrella";
    } 
    else if (currentWeather.dust && !hasMask) {
        errorMessage = "콜록콜록! 미세먼지가 나쁜데 마스크가 없어요! 😷";
        errorTarget = "weather-dust";
        missingItemId = "mask";
    } 
    else if (currentWeather.temp < 10 && warmthLevel < 3) {
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
            if (hintItem && hintItem.style.display !== 'none') {
                hintItem.classList.add('blink-hint');
            }
        }
    }
}

changeDifficulty();
