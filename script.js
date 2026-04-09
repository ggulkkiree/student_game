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
    // 1. 온도와 미세먼지 세팅
    currentWeather.temp = Math.floor(Math.random() * 41) - 10;
    currentWeather.dust = Math.random() < 0.4; // 40% 확률로 미세먼지 나쁨

    // 2. 4가지 날씨 상태 세팅 (맑음, 구름, 비, 눈)
    const weatherTypes = ['clear', 'cloudy', 'rain', 'snow'];
    currentWeather.weatherType = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];

    let weatherIcon = "";
    let weatherText = "";

    if (currentWeather.weatherType === 'clear') {
        currentWeather.rainProb = 0;
        weatherIcon = "☀️"; weatherText = "맑음";
    } else if (currentWeather.weatherType === 'cloudy') {
        currentWeather.rainProb = Math.floor(Math.random() * 10) * 10; // 0~90% 랜덤
        weatherIcon = "☁️"; weatherText = `구름 (강수확률 ${currentWeather.rainProb}%)`;
    } else if (currentWeather.weatherType === 'rain') {
        currentWeather.rainProb = 100;
        weatherIcon = "🌧️"; weatherText = "비";
    } else if (currentWeather.weatherType === 'snow') {
        currentWeather.rainProb = 100;
        weatherIcon = "❄️"; weatherText = "눈";
    }

    // 화면에 표시
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

    // 캐릭터 영역의 기준 좌표 구하기 (자유로운 배치를 위해)
    const characterZone = document.getElementById("character");
    const rect = characterZone.getBoundingClientRect();
    
    // 마우스가 떨어진 정확한 X, Y 위치 계산
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clone = draggedElement.cloneNode(true);
    clone.className = "equipped-item";
    clone.draggable = false; 
    clone.id = data + "_equipped_" + Date.now(); // 중복 입히기 방지용 고유 ID
    
    // ⭐️ 마우스 위치로 아이템 이동 (종이인형 놀이처럼!)
    clone.style.left = (x - 30) + 'px'; 
    clone.style.top = (y - 30) + 'px';

    // ⭐️ 마스크 겹침 문제 해결: 마스크를 입히면 😷 이모지 대신 '하얀 사각형(마스크 모양)'으로 변신!
    if (data === 'mask') {
        clone.innerText = ''; // 얼굴 이모지 지우기
        clone.style.width = '40px';
        clone.style.height = '25px';
        clone.style.backgroundColor = 'white';
        clone.style.borderRadius = '5px';
        clone.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
    }

    clone.onclick = function() { this.remove(); removeBlinkHints(); };

    characterZone.appendChild(clone);
    removeBlinkHints(); 
}

function removeBlinkHints() {
    const items = document.querySelectorAll('.clothing-item');
    items.forEach(item => item.classList.remove('blink-hint'));
}

function resetGame() {
    // 입은 옷 다 지우기 (::before로 만든 사람 모양은 남아있음)
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
        
        // 상하의 체크
        if(item.dataset.type === "top" || item.dataset.type === "outer") hasTop = true;
        if(item.dataset.type === "bottom") hasBottom = true;

        if(item.dataset.warmth === 'high') warmthLevel += 3;
        if(item.dataset.warmth === 'mid') warmthLevel += 2;
        if(item.dataset.warmth === 'low') warmthLevel += 1;
    });

    let errorMessage = "";
    let errorTarget = null; 
    let missingItemId = ""; 

    // ⭐️ 1. 필수 의상(바지, 상의) 검사
    if (!hasBottom) {
        errorMessage = "앗! 바지를 안 입었어요! 부끄러워요 🫣";
    } else if (!hasTop) {
        errorMessage = "앗! 윗옷을 안 입었어요! 감기 걸려요 🥶";
    } 
    // ⭐️ 2. 강수확률 50% 이상일 때 우산 검사
    else if (currentWeather.rainProb >= 50 && !hasUmbrella) {
        errorMessage = "비나 눈이 올 확률이 높아요! 우산을 챙겨주세요 ☔";
        errorTarget = "weather-rain";
        missingItemId = "umbrella";
    } 
    // ⭐️ 3. 미세먼지 검사
    else if (currentWeather.dust && !hasMask) {
        errorMessage = "콜록콜록! 미세먼지가 나쁜데 마스크가 없어요! 😷";
        errorTarget = "weather-dust";
        missingItemId = "mask";
    } 
    // 4. 온도 검사
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
