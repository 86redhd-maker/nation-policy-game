// UI 상태 관리
let selectedNationName = null;
let currentEvent = null;

// 화면 전환 함수
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// 팝업 표시/숨김
function showPopup(popupId) {
    document.getElementById(popupId).classList.add('active');
}

function hidePopup(popupId) {
    document.getElementById(popupId).classList.remove('active');
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeStartScreen();
    updateStatusBar('게임 준비 완료');
});

// 시작 화면 초기화
function initializeStartScreen() {
    const nationsGrid = document.querySelector('.nations-grid');
    nationsGrid.innerHTML = '';

    Object.entries(NATIONS_DATA).forEach(([nationName, nationData]) => {
        const card = createNationCard(nationName, nationData);
        nationsGrid.appendChild(card);
    });
}

// 국가 카드 생성
function createNationCard(nationName, nationData) {
    const card = document.createElement('div');
    card.className = 'nation-card';
    card.onclick = () => selectNation(nationName);

    const difficultyStars = '★'.repeat(nationData.difficulty_stars) + 
                           '☆'.repeat(3 - nationData.difficulty_stars);

    const flagGradient = `linear-gradient(45deg, ${nationData.flag_colors[0]}, ${nationData.flag_colors[1]})`;

    card.innerHTML = `
        <div class="nation-flag" style="background: ${flagGradient};"></div>
        <div class="nation-name">${getNationIcon(nationName)} ${nationName}</div>
        <div class="difficulty-stars">${difficultyStars}</div>
        <div class="nation-description">${nationData.description}</div>
        <div class="nation-stats">
            <div class="stat-item">💰 예산: ${nationData.initial_budget}pt</div>
            <div class="stat-item">📉 적자한도: ${nationData.debt_limit}pt</div>
            <div class="stat-item">✨ 특성: ${getSpecialFeature(nationName)}</div>
            <div class="stat-item">🎯 난이도: ${getDifficultyText(nationData.difficulty)}</div>
        </div>
    `;

    return card;
}

// 국가 아이콘 가져오기
function getNationIcon(nationName) {
    const icons = {
        '복지 강국': '🏥',
        '자원 풍부국': '⛏️',
        '기술 선진국': '🚀',
        '신흥 개발국': '📈',
        '위기국가': '🔥'
    };
    return icons[nationName] || '🏛️';
}

// 특별 특성 요약
function getSpecialFeature(nationName) {
    const features = {
        '복지 강국': '복지할인',
        '자원 풍부국': '경제효과↑',
        '기술 선진국': '기술할인',
        '신흥 개발국': '균형보너스',
        '위기국가': '재건보너스'
    };
    return features[nationName] || '기본';
}

// 난이도 텍스트
function getDifficultyText(difficulty) {
    const texts = {
        '하': '쉬움',
        '중': '보통', 
        '상': '어려움'
    };
    return texts[difficulty] || difficulty;
}

// 국가 선택
function selectNation(nationName) {
    // 이전 선택 해제
    document.querySelectorAll('.nation-card').forEach(card => {
        card.classList.remove('selected');
    });

    // 새 선택 활성화
    event.target.closest('.nation-card').classList.add('selected');
    selectedNationName = nationName;
    
    document.getElementById('selectedNation').textContent = nationName;
    document.getElementById('startBtn').disabled = false;
    
    gameUtils.playSound('select');
    gameUtils.showToast(`${nationName} 선택됨!`, 'success');
}

// 게임 시작
function startGame() {
    if (!selectedNationName) {
        gameUtils.showToast('국가를 먼저 선택해주세요!', 'error');
        return;
    }

    showLoading(true);
    updateStatusBar('게임 시작 중...');

    setTimeout(() => {
        const result = gameAPI.startGame(selectedNationName);
        
        if (result.success) {
            initializeGameScreen(result.status);
            showScreen('gameScreen');
            gameUtils.playSound('success');
            updateStatusBar(`${selectedNationName} 게임 진행 중`);
        } else {
            gameUtils.showToast(`게임 시작 실패: ${result.error}`, 'error');
            updateStatusBar('게임 시작 실패');
        }
        
        showLoading(false);
    }, 1000);
}

// 로딩 표시
function showLoading(show) {
    const loading = document.getElementById('loadingAnimation');
    if (show) {
        loading.classList.add('active');
    } else {
        loading.classList.remove('active');
    }
}

// 게임 화면 초기화
function initializeGameScreen(gameStatus) {
    updateGameHeader(gameStatus);
    updateIndicators(gameStatus.indicators);
    loadPoliciesForCategory(gameStatus.category);
    updateBudgetDisplay(gameStatus.budget, gameStatus.debtLimit);
    clearPolicySelection();
}

// 게임 헤더 업데이트
function updateGameHeader(gameStatus) {
    document.getElementById('currentNationName').textContent = 
        `${getNationIcon(gameStatus.nation)} ${gameStatus.nation}`;
    document.getElementById('turnInfo').textContent = 
        `턴 ${gameStatus.turn}/${gameStatus.maxTurns} - ${gameStatus.category}`;
}

// 지표 표시 업데이트
function updateIndicators(indicators) {
    const grid = document.getElementById('indicatorsGrid');
    grid.innerHTML = '';

    Object.entries(indicators).forEach(([indicator, value]) => {
        const info = GameData.getIndicatorInfo(indicator);
        if (!info) return;

        const item = document.createElement('div');
        item.className = 'indicator-item';
        
        const barWidth = gameUtils.getIndicatorBarWidth(value);
        const barClass = gameUtils.getIndicatorClass(value);
        const displayValue = gameUtils.formatIndicatorValue(value);

        item.innerHTML = `
            <div class="indicator-name">${info.name}</div>
            <div class="indicator-bar">
                <div class="indicator-fill ${barClass}" style="width: ${barWidth}%"></div>
            </div>
            <div class="indicator-value">${displayValue}</div>
        `;

        grid.appendChild(item);
    });
}

// 예산 표시 업데이트
function updateBudgetDisplay(budget, debtLimit) {
    document.getElementById('budgetAmount').textContent = gameUtils.formatBudget(budget);
    
    const status = gameUtils.getBudgetStatus(budget, debtLimit);
    const statusElement = document.getElementById('budgetStatus');
    statusElement.textContent = status.text;
    statusElement.className = `budget-status ${status.class}`;
}

// 카테고리별 정책 로드
function loadPoliciesForCategory(category) {
    const policies = GameData.getPoliciesByCategory(category);
    const grid = document.getElementById('policiesGrid');
    const title = document.getElementById('categoryTitle');
    
    title.textContent = `📋 ${category} 정책`;
    grid.innerHTML = '';

    policies.forEach(policy => {
        const card = createPolicyCard(policy);
        grid.appendChild(card);
    });
}

// 정책 카드 생성
function createPolicyCard(policy) {
    const gameStatus = gameAPI.getGameStatus();
    const cost = calculateAdjustedCost(policy, gameStatus.nation);
    const canAfford = gameStatus.budget - cost >= gameStatus.debtLimit;
    const requirementsMet = gameUtils.checkPolicyRequirements(policy, gameStatus.indicators);
    const isSelected = gameStatus.currentSelection.includes(policy.정책명);

    const card = document.createElement('div');
    card.className = `policy-card ${isSelected ? 'selected' : ''} ${!canAfford || !requirementsMet ? 'disabled' : ''}`;
    card.onclick = () => togglePolicySelection(policy.정책명);

    const effectItems = Object.entries(policy.효과).map(([indicator, value]) => {
        const info = GameData.getIndicatorInfo(indicator);
        const sign = value > 0 ? '+' : '';
        const effectClass = value > 0 ? 'positive' : 'negative';
        return `<div class="effect-item ${effectClass}">${info.name} ${sign}${value}</div>`;
    }).join('');

    const conflictText = policy.충돌정책.length > 0 ? 
        `⚠️ 충돌: ${policy.충돌정책.join(', ')}` : '';
    const synergyText = policy.시너지정책.length > 0 ? 
        `✨ 시너지: ${policy.시너지정책.join(', ')}` : '';

    card.innerHTML = `
        <div class="policy-header">
            <div class="policy-name">${policy.정책명}</div>
            <div class="policy-cost">${cost}pt</div>
        </div>
        <div class="policy-description">${policy.정책_설명}</div>
        <div class="policy-effects">${effectItems}</div>
        <div class="policy-interactions">
            ${conflictText ? `<div class="interaction-conflict">${conflictText}</div>` : ''}
            ${synergyText ? `<div class="interaction-synergy">${synergyText}</div>` : ''}
        </div>
        <div class="citizen-preview">${policy.예상_시민반응}</div>
    `;

    return card;
}

// 정책 비용 계산 (간소화)
function calculateAdjustedCost(policy, nationName) {
    let cost = policy.비용;
    
    // 간단한 국가별 조정
    if (nationName === '복지 강국' && policy.정책명.includes('복지')) {
        cost = Math.floor(cost * 0.85);
    } else if (nationName === '위기국가') {
        cost = Math.floor(cost * 1.2);
    }
    
    return cost;
}

// 정책 선택 토글
function togglePolicySelection(policyName) {
    const gameStatus = gameAPI.getGameStatus();
    
    if (gameStatus.currentSelection.includes(policyName)) {
        // 선택 해제
        const result = gameAPI.deselectPolicy(policyName);
        if (result.success) {
            gameUtils.playSound('select');
            updatePolicyCards();
            updateSelectionSummary();
        }
    } else {
        // 선택
        const result = gameAPI.selectPolicy(policyName);
        if (result.success) {
            gameUtils.playSound('select');
            updatePolicyCards();
            updateSelectionSummary();
        } else {
            gameUtils.showToast(result.error, 'error');
            gameUtils.playSound('error');
        }
    }
}

// 정책 카드 상태 업데이트
function updatePolicyCards() {
    const gameStatus = gameAPI.getGameStatus();
    const cards = document.querySelectorAll('.policy-card');
    
    cards.forEach(card => {
        const policyName = card.querySelector('.policy-name').textContent;
        const isSelected = gameStatus.currentSelection.includes(policyName);
        
        card.classList.toggle('selected', isSelected);
    });

    // 선택 정보 업데이트
    document.getElementById('selectionInfo').textContent = 
        `${gameStatus.currentSelection.length}/${GAME_CONFIG.policies_per_turn} 선택됨`;
}

// 선택 요약 업데이트
function updateSelectionSummary() {
    const gameStatus = gameAPI.getGameStatus();
    const summary = document.getElementById('selectionSummary');
    const confirmBtn = document.getElementById('confirmBtn');
    
    if (gameStatus.currentSelection.length === 0) {
        summary.classList.remove('active');
        confirmBtn.disabled = true;
        return;
    }

    const calculation = gameAPI.calculateCurrentSelection();
    if (!calculation.success) {
        summary.classList.remove('active');
        confirmBtn.disabled = true;
        return;
    }

    summary.classList.add('active');
    confirmBtn.disabled = !calculation.canAfford;

    const interactionMessage = calculation.interactions.length > 0 ? 
        calculation.interactions[0].message : '정책 간 상호작용 없음';

    summary.innerHTML = `
        <div class="summary-title">📋 선택 요약</div>
        <div class="summary-content">
            <div class="summary-policies">
                <strong>선택된 정책:</strong><br>
                ${calculation.policies.join('<br>')}
                <br><br>
                <strong>총 비용:</strong> ${calculation.totalCost}pt<br>
                <strong>예산 충족:</strong> ${calculation.canAfford ? '✅ 가능' : '❌ 불가능'}
            </div>
            <div class="summary-effects">
                <strong>예상 효과:</strong><br>
                ${gameUtils.generateEffectText(calculation.totalEffects)}
                <br><br>
                <strong>정책 상호작용:</strong><br>
                ${interactionMessage}
            </div>
        </div>
    `;
}

// 정책 선택 초기화
function clearSelection() {
    const result = gameAPI.clearPolicySelection();
    if (result.success) {
        updatePolicyCards();
        updateSelectionSummary();
        gameUtils.playSound('select');
    }
}

// 정책 확정
function confirmPolicies() {
    const result = gameAPI.confirmPolicies();
    
    if (!result.success) {
        gameUtils.showToast(result.error, 'error');
        gameUtils.playSound('error');
        return;
    }

    gameUtils.playSound('confirm');
    gameUtils.showToast('정책이 확정되었습니다!', 'success');

    // UI 업데이트
    updateIndicators(result.status.indicators);
    updateBudgetDisplay(result.status.budget, result.status.debtLimit);
    
    // 시민 반응 표시
    showCitizenReactions(result.policies);
    
    // 이벤트 확인
    setTimeout(() => {
        const event = gameAPI.triggerRandomEvent();
        if (event) {
            showEventPopup(event);
        } else {
            proceedToNextTurn();
        }
    }, 2000);
}

// 시민 반응 표시
function showCitizenReactions(policies) {
    const panel = document.getElementById('citizenPanel');
    const display = document.getElementById('memeDisplay');
    
    display.innerHTML = '';
    
    policies.forEach(policyName => {
        const reaction = GameData.getMemeReaction(policyName);
        const memeItem = document.createElement('div');
        memeItem.className = 'meme-item fade-in';
        memeItem.innerHTML = `<strong>${policyName}:</strong><br>${reaction}`;
        display.appendChild(memeItem);
    });
    
    panel.classList.add('active');
    
    setTimeout(() => {
        panel.classList.remove('active');
    }, 5000);
}

// 다음 턴 진행
function proceedToNextTurn() {
    const result = gameAPI.advanceToNextTurn();
    
    if (!result.success) {
        gameUtils.showToast(result.error, 'error');
        return;
    }

    if (result.finished) {
        showResultsScreen(result);
    } else {
        // 새 턴 UI 업데이트
        updateGameHeader(result.status);
        loadPoliciesForCategory(result.status.category);
        clearPolicySelection();
        gameUtils.showToast(`턴 ${result.status.turn} 시작!`, 'info');
    }
}

// 이벤트 팝업 표시
function showEventPopup(event) {
    currentEvent = event;
    
    document.getElementById('eventTitle').textContent = event.title;
    document.getElementById('eventDescription').textContent = event.description;
    
    // 기본 효과 표시
    const effectsDiv = document.getElementById('eventEffects');
    effectsDiv.innerHTML = `
        <strong>즉시 효과:</strong><br>
        ${gameUtils.generateEffectText(event.effects)}
    `;
    
    // 선택지 표시
    const choicesDiv = document.getElementById('eventChoices');
    choicesDiv.innerHTML = '';
    
    if (event.choices) {
        Object.entries(event.choices).forEach(([choiceKey, choiceEffects]) => {
            const button = document.createElement('button');
            button.className = 'event-choice-btn';
            button.onclick = () => selectEventChoice(choiceKey);
            button.innerHTML = `
                <strong>${choiceKey}</strong><br>
                효과: ${gameUtils.generateEffectText(choiceEffects)}
            `;
            choicesDiv.appendChild(button);
        });
    } else {
        const button = document.createElement('button');
        button.className = 'pixel-btn';
        button.onclick = () => selectEventChoice(null);
        button.textContent = '확인';
        choicesDiv.appendChild(button);
    }
    
    showPopup('eventPopup');
}

// 이벤트 선택지 선택
function selectEventChoice(choiceKey) {
    const result = gameAPI.applyEventChoice(currentEvent, choiceKey);
    
    if (result.success) {
        hidePopup('eventPopup');
        updateIndicators(result.status.indicators);
        
        const message = choiceKey ? `"${choiceKey}" 선택됨` : '이벤트 처리 완료';
        gameUtils.showToast(message, 'success');
        
        setTimeout(() => {
            proceedToNextTurn();
        }, 1000);
    } else {
        gameUtils.showToast(result.error, 'error');
    }
}

// 결과 화면 표시
// 결과 화면 표시
function showResultsScreen(gameResult) {
    const stats = gameAPI.calculateGameStats();
    
    document.getElementById('finalTitle').innerHTML = 
        `${gameResult.ending.grade} ${gameResult.ending.title}`;
    
    // 엔딩 정보
    document.getElementById('endingInfo').innerHTML = `
        <div class="ending-title">${gameResult.ending.title}</div>
        <div class="ending-description">${gameResult.ending.description}</div>
        <div class="final-score">최종 점수: ${gameResult.totalScore}/40</div>
    `;
    
    // 최종 통계
    document.getElementById('finalStats').innerHTML = `
        <div class="stat-group">
            <div class="stat-group-title">📊 종합 지표</div>
            ${Object.entries(gameResult.finalIndicators).map(([indicator, value]) => {
                const info = GameData.getIndicatorInfo(indicator);
                const change = value - (gameState?.initialIndicators[indicator] || 0);
                const changeText = change >= 0 ? `+${change}` : change;
                const changeClass = change >= 0 ? 'positive' : 'negative';
                return `
                    <div class="stat-row">
                        <span>${info.name}</span>
                        <span class="${changeClass}">${value} (${changeText})</span>
                    </div>
                `;
            }).join('')}
        </div>
        
        <div class="stat-group">
            <div class="stat-group-title">💰 예산 운용</div>
            <div class="stat-row">
                <span>사용한 예산</span>
                <span>${stats.budgetUsed}pt</span>
            </div>
            <div class="stat-row">
                <span>예산 효율성</span>
                <span>${stats.budgetEfficiency}</span>
            </div>
            <div class="stat-row">
                <span>시민 만족도</span>
                <span>${stats.citizenSatisfaction}</span>
            </div>
            <div class="stat-row">
                <span>지속 가능성</span>
                <span>${stats.sustainability}</span>
            </div>
        </div>
        
        <div class="stat-group">
            <div class="stat-group-title">🎯 게임 진행</div>
            <div class="stat-row">
                <span>선택한 정책</span>
                <span>${stats.policiesSelected}개</span>
            </div>
            <div class="stat-row">
                <span>완료한 턴</span>
                <span>${stats.turnsCompleted}/${GAME_CONFIG.total_turns}</span>
            </div>
        </div>
    `;
    
    // 업적 표시
    const achievements = calculateAchievements(gameResult, stats);
    document.getElementById('achievements').innerHTML = `
        <div class="achievements-title">🏆 달성한 업적</div>
        ${achievements.length > 0 ? 
            achievements.map(achievement => 
                `<div class="achievement-item">${achievement}</div>`
            ).join('') : 
            '<div class="achievement-item">달성한 업적이 없습니다</div>'
        }
    `;
    
    showScreen('resultsScreen');
    gameUtils.playSound('success');
    updateStatusBar('게임 완료!');
}

// 업적 계산
function calculateAchievements(gameResult, stats) {
    const achievements = [];
    
    if (gameResult.ending.grade === 'S급') {
        achievements.push('🏆 완벽한 설계자 - S급 엔딩 달성');
    }
    
    if (stats.citizenSatisfaction >= 2) {
        achievements.push('😊 시민의 사랑 - 시민 만족도 2.0 이상');
    }
    
    if (stats.sustainability >= 2) {
        achievements.push('🌱 지속가능한 미래 - 지속가능성 2.0 이상');
    }
    
    if (stats.budgetEfficiency >= 1) {
        achievements.push('💰 예산 전문가 - 높은 예산 효율성');
    }
    
    if (gameResult.totalScore >= 20) {
        achievements.push('🌟 고득점 달성 - 총점 20점 이상');
    }
    
    if (selectedNationName === '위기국가' && gameResult.totalScore >= 0) {
        achievements.push('🔥 불사조의 부활 - 위기국가 재건 성공');
    }
    
    return achievements;
}

// 게임 재시작
function restartGame() {
    gameAPI.restartGame();
    selectedNationName = null;
    currentEvent = null;
    
    // UI 초기화
    document.getElementById('selectedNation').textContent = '국가를 선택해주세요';
    document.getElementById('startBtn').disabled = true;
    document.querySelectorAll('.nation-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    showScreen('startScreen');
    updateStatusBar('게임 준비 완료');
    gameUtils.showToast('게임이 초기화되었습니다', 'info');
}

// 결과 공유
function shareResults() {
    const gameStatus = gameAPI.getGameStatus();
    const stats = gameAPI.calculateGameStats();
    
    const shareText = `
🎮 픽셀 정치 시뮬레이터 결과 🎮

🏛️ 국가: ${gameStatus.nation}
🏆 최종 등급: ${document.getElementById('finalTitle').textContent}
📊 총점: ${stats.totalScore}/40
😊 시민 만족도: ${stats.citizenSatisfaction}
🌱 지속가능성: ${stats.sustainability}

나도 국가를 설계해보자! 
#픽셀정치시뮬레이터 #국가설계게임
    `.trim();
    
    if (navigator.share) {
        navigator.share({
            title: '픽셀 정치 시뮬레이터 결과',
            text: shareText
        });
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            gameUtils.showToast('결과가 클립보드에 복사되었습니다!', 'success');
        });
    }
}

// 도움말 표시
function showHelp() {
    showPopup('helpPopup');
}

function closeHelp() {
    hidePopup('helpPopup');
}

// 상태 바 업데이트
function updateStatusBar(message) {
    document.getElementById('gameStatus').textContent = message;
}

// 키보드 단축키
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        // ESC 키로 팝업 닫기
        document.querySelectorAll('.popup-overlay.active').forEach(popup => {
            popup.classList.remove('active');
        });
    } else if (event.key === 'Enter') {
        // Enter 키로 확인 버튼 클릭
        const confirmBtn = document.getElementById('confirmBtn');
        if (confirmBtn && !confirmBtn.disabled) {
            confirmPolicies();
        }
    } else if (event.key >= '1' && event.key <= '5') {
        // 숫자 키로 정책 선택 (게임 화면에서만)
        const gameScreen = document.getElementById('gameScreen');
        if (gameScreen.classList.contains('active')) {
            const policyCards = document.querySelectorAll('.policy-card');
            const index = parseInt(event.key) - 1;
            if (index < policyCards.length) {
                policyCards[index].click();
            }
        }
    }
});

// 화면 크기 변경 감지
window.addEventListener('resize', function() {
    // 모바일에서 시민 패널 위치 조정
    const citizenPanel = document.getElementById('citizenPanel');
    if (window.innerWidth <= 768) {
        citizenPanel.style.position = 'relative';
        citizenPanel.style.right = 'auto';
        citizenPanel.style.top = 'auto';
        citizenPanel.style.transform = 'none';
    } else {
        citizenPanel.style.position = 'fixed';
        citizenPanel.style.right = '20px';
        citizenPanel.style.top = '50%';
        citizenPanel.style.transform = 'translateY(-50%)';
    }
});

// 페이지 종료 전 경고
window.addEventListener('beforeunload', function(event) {
    const gameStatus = gameAPI.getGameStatus();
    if (gameStatus.active && gameStatus.turn > 1) {
        event.preventDefault();
        event.returnValue = '게임이 진행 중입니다. 정말 나가시겠습니까?';
        return event.returnValue;
    }
});

// 자동 저장 (5초마다)
setInterval(() => {
    const gameStatus = gameAPI.getGameStatus();
    if (gameStatus.active) {
        gameAPI.saveGameToStorage();
    }
}, 5000);

// 페이지 로드 시 저장된 게임 확인
window.addEventListener('load', function() {
    const savedGame = gameAPI.loadGameFromStorage();
    if (savedGame && savedGame.gameState && savedGame.gameState.gameActive) {
        if (confirm('저장된 게임을 발견했습니다. 이어서 하시겠습니까?')) {
            // 저장된 게임 로드 로직 (간단화)
            gameUtils.showToast('저장된 게임 로드 기능은 추후 구현 예정입니다', 'info');
        }
    }
});

// 성능 모니터링
let frameCount = 0;
let lastTime = performance.now();

function updatePerformance() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        document.getElementById('systemStatus').textContent = `FPS: ${fps}`;
        frameCount = 0;
        lastTime = currentTime;
    }
    
    requestAnimationFrame(updatePerformance);
}

// 성능 모니터링 시작
requestAnimationFrame(updatePerformance);

// 접근성 개선
document.addEventListener('keydown', function(event) {
    // Tab 키 네비게이션 개선
    if (event.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
            'button:not([disabled]), .nation-card, .policy-card:not(.disabled)'
        );
        
        // 현재 포커스된 요소가 보이도록 스크롤
        setTimeout(() => {
            if (document.activeElement) {
                document.activeElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }
        }, 100);
    }
});

// 터치 이벤트 지원 (모바일)
let touchStartY = 0;
document.addEventListener('touchstart', function(event) {
    touchStartY = event.touches[0].clientY;
});

document.addEventListener('touchend', function(event) {
    const touchEndY = event.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    
    // 스와이프 제스처로 시민 패널 토글
    if (Math.abs(diff) > 50) {
        const citizenPanel = document.getElementById('citizenPanel');
        if (diff > 0) {
            // 위로 스와이프 - 패널 숨김
            citizenPanel.classList.remove('active');
        } else {
            // 아래로 스와이프 - 패널 표시 (게임 중일 때만)
            const gameStatus = gameAPI.getGameStatus();
            if (gameStatus.active) {
                citizenPanel.classList.add('active');
            }
        }
    }
});

// 디버그 모드 (개발용)
window.debugMode = false;
window.toggleDebug = function() {
    window.debugMode = !window.debugMode;
    if (window.debugMode) {
        console.log('디버그 모드 활성화');
        console.log('게임 상태:', gameAPI.getDebugInfo());
        
        // 디버그 패널 생성
        const debugPanel = document.createElement('div');
        debugPanel.id = 'debugPanel';
        debugPanel.style.cssText = `
            position: fixed; top: 10px; left: 10px; 
            background: rgba(0,0,0,0.8); color: #00ff88; 
            padding: 10px; font-size: 8px; z-index: 9999;
            border: 1px solid #00ff88; max-width: 200px;
        `;
        document.body.appendChild(debugPanel);
        
        // 디버그 정보 업데이트
        const updateDebug = () => {
            if (window.debugMode && debugPanel) {
                const info = gameAPI.getDebugInfo();
                debugPanel.innerHTML = `
                    <strong>DEBUG MODE</strong><br>
                    Active: ${info.gameActive || false}<br>
                    Turn: ${info.currentTurn || 0}/${GAME_CONFIG.total_turns}<br>
                    Nation: ${info.currentNation || 'None'}<br>
                    Budget: ${info.budget || 0}<br>
                    Selection: ${info.currentSelection?.length || 0}
                `;
            }
        };
        
        setInterval(updateDebug, 1000);
    } else {
        console.log('디버그 모드 비활성화');
        const debugPanel = document.getElementById('debugPanel');
        if (debugPanel) {
            debugPanel.remove();
        }
    }
};

// 콘솔에서 디버그 모드 안내
console.log(`
🎮 픽셀 정치 시뮬레이터 개발자 도구
- window.toggleDebug() : 디버그 모드 토글
- gameAPI : 게임 API 접근
- gameUtils : 유틸리티 함수들
- GameData : 게임 데이터 접근
`);

console.log('🎨 UI 시스템 로딩 완료!');
