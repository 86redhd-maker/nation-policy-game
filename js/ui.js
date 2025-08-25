// UI 상태 관리
let selectedNationName = null;
let currentEvent = null;
let currentActiveCategory = '복지';

// 화면 전환 함수 - 강화된 버전
function showScreen(screenId) {
    console.log('화면 전환 시도:', screenId);
    
    const targetScreen = document.getElementById(screenId);
    if (!targetScreen) {
        console.error(`화면을 찾을 수 없습니다: ${screenId}`);
        return false;
    }
    
    // 모든 화면 강제 비활성화
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none'; // 강제 숨김 추가
        console.log('화면 비활성화:', screen.id);
    });
    
    // 대상 화면 강제 활성화
    targetScreen.classList.add('active');
    targetScreen.style.display = 'block'; // 강제 표시 추가
    console.log('화면 활성화 완료:', screenId);
    
    // 결과 화면의 경우 추가 확인
    if (screenId === 'resultsScreen') {
        // 즉시 다시 한번 확인하고 강제 표시
        setTimeout(() => {
            if (window.getComputedStyle(targetScreen).display === 'none') {
                console.warn('결과화면이 여전히 숨겨져 있음, 다시 표시 시도');
                targetScreen.style.display = 'block !important';
                targetScreen.style.visibility = 'visible';
                targetScreen.style.opacity = '1';
            }
        }, 50);
        
        const elements = {
            finalTitle: document.getElementById('finalTitle'),
            endingInfo: document.getElementById('endingInfo'),
            finalStats: document.getElementById('finalStats'),
            achievements: document.getElementById('achievements')
        };
        
        console.log('결과 화면 요소 확인:', elements);
        
        Object.entries(elements).forEach(([key, element]) => {
            if (!element) {
                console.error(`결과 화면 요소 누락: ${key}`);
            } else {
                console.log(`${key} 요소 발견:`, element.tagName);
            }
        });
    }
    
    return true;
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
    console.log('UI 시스템 초기화 시작');
    
    // 데이터 로딩 대기 함수
    function waitForData(callback, attempts = 0) {
        if (attempts > 50) { // 5초 후 포기
            console.error('게임 데이터 로딩 실패');
            createFallbackCards();
            return;
        }
        
        if (typeof NATIONS_DATA !== 'undefined' && typeof GameData !== 'undefined') {
            console.log('게임 데이터 로드 완료');
            callback();
        } else {
            console.log('게임 데이터 로딩 대기 중...', attempts);
            setTimeout(() => waitForData(callback, attempts + 1), 100);
        }
    }
    
    waitForData(() => {
        initializeStartScreen();
        updateStatusBar('게임 준비 완료');
    });
});

// 시작 화면 초기화
function initializeStartScreen() {
    try {
        const nationsGrid = document.querySelector('.nations-grid');
        if (!nationsGrid) {
            console.error('nations-grid 요소를 찾을 수 없습니다');
            return;
        }
        
        nationsGrid.innerHTML = '';

        // NATIONS_DATA 사용, 없으면 fallback
        const nationsData = window.NATIONS_DATA || createFallbackNationsData();

        Object.entries(nationsData).forEach(([nationName, nationData]) => {
            const card = createNationCard(nationName, nationData);
            nationsGrid.appendChild(card);
        });
        
        console.log('국가 카드 생성 완료:', Object.keys(nationsData).length + '개');
    } catch (error) {
        console.error('시작 화면 초기화 실패:', error);
        createFallbackCards();
    }
}

// 폴백 국가 데이터 생성
function createFallbackNationsData() {
    return {
        "복지 강국": {
            "description": "복지 수준이 높지만 재정 부담과 제도 피로도가 존재함",
            "difficulty": "하",
            "difficulty_stars": 1,
            "initial_budget": 100,
            "debt_limit": -70,
            "flag_colors": ["#ff6b6b", "#4ecdc4"]
        },
        "자원 풍부국": {
            "description": "자원이 풍부하지만 환경 갈등이 잦고 산업 의존도가 높음",
            "difficulty": "중",
            "difficulty_stars": 2,
            "initial_budget": 90,
            "debt_limit": -40,
            "flag_colors": ["#f39c12", "#27ae60"]
        },
        "기술 선진국": {
            "description": "기술력이 뛰어나지만 시민 신뢰도가 낮고 윤리 갈등이 존재함",
            "difficulty": "상",
            "difficulty_stars": 3,
            "initial_budget": 110,
            "debt_limit": -60,
            "flag_colors": ["#9b59b6", "#3498db"]
        },
        "신흥 개발국": {
            "description": "성장 중인 국가로 인프라 부족과 사회 불균형이 문제",
            "difficulty": "중",
            "difficulty_stars": 2,
            "initial_budget": 85,
            "debt_limit": -35,
            "flag_colors": ["#e74c3c", "#f1c40f"]
        },
        "위기국가": {
            "description": "정치사회경제 모두 불안정한 상태에서 재건이 필요한 국가",
            "difficulty": "상",
            "difficulty_stars": 3,
            "initial_budget": 60,
            "debt_limit": -20,
            "flag_colors": ["#2c3e50", "#e74c3c"]
        }
    };
}

// 폴백 카드 생성 함수
function createFallbackCards() {
    const nationsGrid = document.querySelector('.nations-grid');
    if (!nationsGrid) return;
    
    const basicNations = ['복지 강국', '자원 풍부국', '기술 선진국', '신흥 개발국', '위기국가'];
    
    nationsGrid.innerHTML = '';
    basicNations.forEach(name => {
        const card = document.createElement('div');
        card.className = 'nation-card';
        card.onclick = () => selectNation(name);
        card.innerHTML = `
            <div class="nation-flag" style="background: linear-gradient(45deg, #333, #666);"></div>
            <div class="nation-name">${getNationIcon(name)} ${name}</div>
            <div class="difficulty-stars">★★☆</div>
            <div class="nation-description">국가 설명을 로딩 중...</div>
            <div class="nation-stats">
                <div class="stat-item">💰 예산: 100pt</div>
                <div class="stat-item">📉 적자한도: -50pt</div>
            </div>
        `;
        nationsGrid.appendChild(card);
    });
    
    console.log('폴백 카드 생성 완료');
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
        '자원 풍부국': '경제효과증가',
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

// 수정된 국가 선택 함수
function selectNation(nationName) {
    console.log('국가 선택:', nationName);
    
    // 이전 선택 해제
    document.querySelectorAll('.nation-card').forEach(card => {
        card.classList.remove('selected');
    });

    // 현재 카드 찾기 및 선택 활성화
    const cards = document.querySelectorAll('.nation-card');
    cards.forEach(card => {
        const cardNationNameElement = card.querySelector('.nation-name');
        if (cardNationNameElement) {
            const cardNationName = cardNationNameElement.textContent.trim().substring(2); // 이모지 제거
            if (cardNationName === nationName) {
                card.classList.add('selected');
            }
        }
    });
    
    selectedNationName = nationName;
    
    const selectedElement = document.getElementById('selectedNation');
    const startButton = document.getElementById('startBtn');
    
    if (selectedElement) selectedElement.textContent = nationName;
    if (startButton) startButton.disabled = false;
    
    if (typeof gameUtils !== 'undefined') {
        gameUtils.playSound('select');
        gameUtils.showToast(`${nationName} 선택됨!`, 'success');
    }
    
    console.log('국가 선택 완료:', nationName);
}

// 게임 시작
function startGame() {
    if (!selectedNationName) {
        if (typeof gameUtils !== 'undefined') {
            gameUtils.showToast('국가를 먼저 선택해주세요!', 'error');
        } else {
            alert('국가를 먼저 선택해주세요!');
        }
        return;
    }

    console.log('게임 시작 시도:', selectedNationName);
    showLoading(true);
    updateStatusBar('게임 시작 중...');

    setTimeout(() => {
        try {
            if (typeof gameAPI === 'undefined') {
                throw new Error('게임 API가 로드되지 않았습니다');
            }
            
            const result = gameAPI.startGame(selectedNationName);
            console.log('게임 시작 결과:', result);
            
            if (result.success) {
                initializeGameScreen(result.status);
                showScreen('gameScreen');
                if (typeof gameUtils !== 'undefined') {
                    gameUtils.playSound('success');
                }
                updateStatusBar(`${selectedNationName} 게임 진행 중`);
                console.log('게임 화면 전환 완료');
            } else {
                throw new Error(result.error || '알 수 없는 오류');
            }
        } catch (error) {
            console.error('게임 시작 실패:', error);
            if (typeof gameUtils !== 'undefined') {
                gameUtils.showToast(`게임 시작 실패: ${error.message}`, 'error');
            } else {
                alert(`게임 시작 실패: ${error.message}`);
            }
            updateStatusBar('게임 시작 실패');
        } finally {
            showLoading(false);
        }
    }, 1000);
}

// 로딩 표시
function showLoading(show) {
    const loading = document.getElementById('loadingAnimation');
    if (loading) {
        if (show) {
            loading.classList.add('active');
        } else {
            loading.classList.remove('active');
        }
    }
}

// 게임 화면 초기화
function initializeGameScreen(gameStatus) {
    try {
        console.log('게임 화면 초기화 시작:', gameStatus);
        updateGameHeader(gameStatus);
        updateIndicators(gameStatus.indicators);
        initializeCategoryTabs();
        updateCategoryStats(gameStatus);
        loadPoliciesForCategory(currentActiveCategory);
        updateBudgetDisplay(gameStatus.budget, gameStatus.debtLimit);
        updateTurnInfo(gameStatus);
        clearPolicySelection();
        console.log('게임 화면 초기화 완료');
    } catch (error) {
        console.error('게임 화면 초기화 실패:', error);
    }
}

// 게임 헤더 업데이트
function updateGameHeader(gameStatus) {
    const currentNationElement = document.getElementById('currentNationName');
    const turnInfoElement = document.getElementById('turnInfo');
    
    if (currentNationElement) {
        currentNationElement.textContent = 
            `${getNationIcon(gameStatus.nation)} ${gameStatus.nation}`;
    }
    if (turnInfoElement) {
        turnInfoElement.textContent = 
            `턴 ${gameStatus.turn}/${gameStatus.maxTurns} - ${gameStatus.category}`;
    }
}

// 지표 표시 업데이트
function updateIndicators(indicators) {
    const grid = document.getElementById('indicatorsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    Object.entries(indicators).forEach(([indicator, value]) => {
        let info = null;
        if (typeof GameData !== 'undefined' && GameData.getIndicatorInfo) {
            info = GameData.getIndicatorInfo(indicator);
        } else {
            // 폴백 지표 정보
            const fallbackIndicators = {
                "경제": { name: "💰 경제" },
                "기술": { name: "🚀 기술" },
                "시민 반응": { name: "😊 시민반응" },
                "환경": { name: "🌱 환경" },
                "재정": { name: "💼 재정" },
                "안정성": { name: "🛡️ 안정성" },
                "복지": { name: "❤️ 복지" },
                "외교": { name: "🤝 외교" }
            };
            info = fallbackIndicators[indicator];
        }
        
        if (!info) return;

        const item = document.createElement('div');
        item.className = 'indicator-item';
        
        let barWidth = 50;
        let barClass = 'positive';
        let displayValue = value.toString();
        
        if (typeof gameUtils !== 'undefined') {
            barWidth = gameUtils.getIndicatorBarWidth(value);
            barClass = gameUtils.getIndicatorClass(value);
            displayValue = gameUtils.formatIndicatorValue(value);
        } else {
            barWidth = ((value + 5) / 10) * 100;
            barWidth = Math.max(0, Math.min(100, barWidth));
            barClass = value >= 0 ? 'positive' : 'negative';
            displayValue = value > 0 ? `+${value}` : value.toString();
        }

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
    const budgetElement = document.getElementById('budgetAmount');
    const statusElement = document.getElementById('budgetStatus');
    
    if (budgetElement) {
        if (typeof gameUtils !== 'undefined') {
            budgetElement.textContent = gameUtils.formatBudget(budget);
        } else {
            budgetElement.textContent = budget >= 0 ? `💰 ${budget}pt` : `💸 ${budget}pt (적자)`;
        }
    }
    
    if (statusElement) {
        let status = { text: '✅ 안전', class: 'safe' };
        
        if (typeof gameUtils !== 'undefined') {
            status = gameUtils.getBudgetStatus(budget, debtLimit);
        } else {
            if (budget < 0) {
                if (budget >= debtLimit * 0.5) {
                    status = { text: '⚠️ 주의', class: 'warning' };
                } else {
                    status = { text: '🚨 위험', class: 'danger' };
                }
            }
        }
        
        statusElement.textContent = status.text;
        statusElement.className = `budget-status ${status.class}`;
    }
}

// 카테고리 탭 초기화
function initializeCategoryTabs() {
    // 모든 탭에 클릭 이벤트 추가
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        const category = tab.dataset.category;
        tab.onclick = () => switchToCategory(category);
    });
    
    // 첫 번째 탭 활성화
    switchToCategory(currentActiveCategory);
}

// 카테고리 전환 함수
function switchToCategory(category) {
    console.log('카테고리 전환:', category);
    
    // 탭 활성화 상태 변경
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        }
    });
    
    // 현재 카테고리 업데이트
    currentActiveCategory = category;
    
    // 해당 카테고리 정책들 로드
    loadPoliciesForCategory(category);
    
    // 선택 요약 업데이트
    updateSelectionSummary();
    
    if (typeof gameUtils !== 'undefined') {
        gameUtils.playSound('select');
    }
}

// 카테고리별 통계 업데이트
function updateCategoryStats(gameStatus) {
    if (!gameStatus.categoryStats) return;
    
    Object.entries(gameStatus.categoryStats).forEach(([category, count]) => {
        const tabElement = document.querySelector(`[data-category="${category}"]`);
        const countElement = document.getElementById(`tab-${category}`);
        
        if (tabElement && countElement) {
            // 카운트 표시 업데이트
            countElement.textContent = `${count}/4`;
            
            // 제한 상태에 따른 스타일 적용
            tabElement.classList.remove('disabled', 'limited');
            
            if (count >= 4) {
                tabElement.classList.add('disabled');
                tabElement.title = `${category}: 최대 선택 완료 (${count}/4)`;
            } else if (count >= 3) {
                tabElement.classList.add('limited');
                tabElement.title = `${category}: 제한 임박 (${count}/4)`;
            } else {
                tabElement.title = `${category}: ${count}/4 선택됨`;
            }
        }
    });
}

// 턴 정보 업데이트
function updateTurnInfo(gameStatus) {
    const turnDisplay = document.getElementById('turnDisplay');
    const selectionCount = document.getElementById('selectionCount');
    const budgetQuick = document.getElementById('budgetQuick');
    
    if (turnDisplay) {
        turnDisplay.textContent = `턴 ${gameStatus.turn}/${gameStatus.maxTurns}`;
    }
    
    if (selectionCount) {
        const selectedCount = gameStatus.currentSelection ? gameStatus.currentSelection.length : 0;
        selectionCount.textContent = `선택: ${selectedCount}/2`;
        
        // 색상 변경
        if (selectedCount === 0) {
            selectionCount.style.color = '#888888';
        } else if (selectedCount === 2) {
            selectionCount.style.color = '#00ff88';
        } else {
            selectionCount.style.color = '#ffaa00';
        }
    }
    
    if (budgetQuick) {
        let budgetText = `예산: ${gameStatus.budget}pt`;
        if (gameStatus.budget < 0) {
            budgetText = `적자: ${Math.abs(gameStatus.budget)}pt`;
            budgetQuick.style.color = '#ff6666';
        } else {
            budgetQuick.style.color = '#88aaff';
        }
        budgetQuick.textContent = budgetText;
    }
}

// 현재 선택 미리보기 업데이트
function updateCurrentSelectionPreview() {
    if (typeof gameAPI === 'undefined') return;
    
    const gameStatus = gameAPI.getGameStatus();
    const previewContainer = document.getElementById('currentSelectionPreview');
    const previewPolicies = document.getElementById('previewPolicies');
    
    if (!previewContainer || !previewPolicies) return;
    
    if (gameStatus.currentSelection.length === 0) {
        previewContainer.style.display = 'none';
        return;
    }
    
    previewContainer.style.display = 'block';
    previewPolicies.innerHTML = '';
    
    gameStatus.currentSelection.forEach(policyName => {
        const category = gameAPI.findPolicyCategory(policyName);
        const categoryIcon = getCategoryIcon(category);
        
        const policyItem = document.createElement('div');
        policyItem.className = 'preview-policy-item';
        policyItem.innerHTML = `
            <span>${categoryIcon} ${policyName}</span>
            <button class="preview-remove-btn" onclick="deselectPolicy('${policyName}')">✕</button>
        `;
        previewPolicies.appendChild(policyItem);
    });
}

// 카테고리 아이콘 가져오기
function getCategoryIcon(category) {
    const icons = {
        '복지': '❤️',
        '경제': '💰', 
        '환경': '🌱',
        '교육': '📚',
        '외교': '🤝'
    };
    return icons[category] || '📋';
}

// 카테고리별 정책 로드
function loadPoliciesForCategory(category) {
    try {
        let policies = [];
        
        // 기본 정책 로드
        if (typeof GameData !== 'undefined') {
            policies = GameData.getPoliciesByCategory(category);
        } else {
            policies = createFallbackPolicies(category);
        }
        
        // 위기국가인 경우 긴급정책도 추가
        if (typeof gameAPI !== 'undefined') {
            const gameStatus = gameAPI.getGameStatus();
            if (gameStatus.nation === '위기국가' && 
                typeof EMERGENCY_POLICIES !== 'undefined' && 
                EMERGENCY_POLICIES[category]) {
                policies = [...policies, ...EMERGENCY_POLICIES[category]];
            }
        }
        
        const grid = document.getElementById('policiesGrid');
        const title = document.getElementById('categoryTitle');
        
        if (title) {
            // 위기국가인 경우 🆘 표시 추가
            let emergencyIndicator = '';
            if (typeof gameAPI !== 'undefined') {
                const gameStatus = gameAPI.getGameStatus();
                if (gameStatus.nation === '위기국가') {
                    emergencyIndicator = ' 🆘';
                }
            }
            title.textContent = `📋 ${category} 정책${emergencyIndicator}`;
        }
        
        if (grid) {
            grid.innerHTML = '';
            policies.forEach(policy => {
                const card = createPolicyCard(policy);
                // 긴급정책은 특별한 스타일 적용
                if (policy.emergency_only) {
                    card.classList.add('emergency-policy');
                }
                grid.appendChild(card);
            });
        }

        // 교착상태 확인
        checkForDeadlock();
        
        const regularPolicies = policies.filter(p => !p.emergency_only).length;
        const emergencyPolicies = policies.filter(p => p.emergency_only).length;
        console.log(`${category} 정책 로드 완료: 기본 ${regularPolicies}개, 긴급 ${emergencyPolicies}개`);
    } catch (error) {
        console.error('정책 로드 실패:', error);
    }
}

// 폴백 정책 생성
function createFallbackPolicies(category) {
    const fallbackPolicies = {
        '복지': [
            { 정책명: '기본 복지 정책', 비용: 20, 정책_설명: '기본적인 복지 제도', 예상_시민반응: '좋은 정책이네요!', 효과: {'복지': 5}, 충돌정책: [], 시너지정책: [] }
        ],
        '경제': [
            { 정책명: '경제 활성화', 비용: 25, 정책_설명: '경제 성장을 위한 정책', 예상_시민반응: '경제가 좋아질까요?', 효과: {'경제': 5}, 충돌정책: [], 시너지정책: [] }
        ],
        '환경': [
            { 정책명: '환경 보호', 비용: 30, 정책_설명: '환경을 지키는 정책', 예상_시민반응: '지구를 지켜요!', 효과: {'환경': 5}, 충돌정책: [], 시너지정책: [] }
        ],
        '교육': [
            { 정책명: '교육 개선', 비용: 20, 정책_설명: '교육 시스템 개선', 예상_시민반응: '미래를 위한 투자!', 효과: {'기술': 5}, 충돌정책: [], 시너지정책: [] }
        ],
        '외교': [
            { 정책명: '외교 강화', 비용: 15, 정책_설명: '국제 관계 개선', 예상_시민반응: '평화로운 세상!', 효과: {'외교': 5}, 충돌정책: [], 시너지정책: [] }
        ]
    };
    
    return fallbackPolicies[category] || [];
}

// 정책 카드 생성
function createPolicyCard(policy) {
    let gameStatus = { budget: 100, debtLimit: -50, indicators: {}, currentSelection: [], nation: '기본국가' };
    
    if (typeof gameAPI !== 'undefined') {
        gameStatus = gameAPI.getGameStatus();
    }
    
    const cost = calculateAdjustedCost(policy, gameStatus.nation);
    const canAfford = gameStatus.budget - cost >= gameStatus.debtLimit;
    const requirementsMet = checkPolicyRequirementsLocal(policy, gameStatus.indicators);
    const isSelected = gameStatus.currentSelection.includes(policy.정책명);

    const card = document.createElement('div');
    card.className = `policy-card ${isSelected ? 'selected' : ''} ${!canAfford || !requirementsMet ? 'disabled' : ''}`;
    card.onclick = () => togglePolicySelection(policy.정책명);

    let effectItems = '';
    if (policy.효과) {
        effectItems = Object.entries(policy.효과).map(([indicator, value]) => {
            let indicatorName = indicator;
            if (typeof GameData !== 'undefined') {
                const info = GameData.getIndicatorInfo(indicator);
                if (info) indicatorName = info.name;
            }
            const sign = value > 0 ? '+' : '';
            const effectClass = value > 0 ? 'positive' : 'negative';
            return `<div class="effect-item ${effectClass}">${indicatorName} ${sign}${value}</div>`;
        }).join('');
    }

    const conflictText = (policy.충돌정책 && policy.충돌정책.length > 0) ? 
        `⚠️ 충돌: ${policy.충돌정책.join(', ')}` : '';
    const synergyText = (policy.시너지정책 && policy.시너지정책.length > 0) ? 
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

// 정책 비용 계산 (로컬 버전)
function calculateAdjustedCost(policy, nationName) {
    let cost = policy.비용;
    
    if (nationName === '복지 강국' && policy.정책명.includes('복지')) {
        cost = Math.floor(cost * 0.85);
    } else if (nationName === '위기국가') {
        cost = Math.floor(cost * 1.2);
    }
    
    return cost;
}

// 정책 요구조건 확인 (로컬 버전)
function checkPolicyRequirementsLocal(policy, indicators) {
    if (!policy.요구조건) return true;
    
    return Object.entries(policy.요구조건).every(([indicator, required]) => {
        const current = indicators[indicator] || 0;
        return current >= required;
    });
}

// 정책 선택 토글
function togglePolicySelection(policyName) {
    if (typeof gameAPI === 'undefined') {
        console.log('gameAPI 로드되지 않음 - 정책 선택:', policyName);
        return;
    }
    
    const gameStatus = gameAPI.getGameStatus();
    
    if (gameStatus.currentSelection.includes(policyName)) {
        // 선택 해제
        const result = gameAPI.deselectPolicy(policyName);
        if (result.success) {
            if (typeof gameUtils !== 'undefined') gameUtils.playSound('select');
            updatePolicyCards();
            updateSelectionSummary();
        }
    } else {
        // 선택
        const result = gameAPI.selectPolicy(policyName);
        if (result.success) {
            if (typeof gameUtils !== 'undefined') gameUtils.playSound('select');
            updatePolicyCards();
            updateSelectionSummary();
        } else {
            if (typeof gameUtils !== 'undefined') {
                gameUtils.showToast(result.error, 'error');
                gameUtils.playSound('error');
            } else {
                alert(result.error);
            }
        }
    }
}

// 정책 카드 상태 업데이트
function updatePolicyCards() {
    if (typeof gameAPI === 'undefined') return;
    
    const gameStatus = gameAPI.getGameStatus();
    const cards = document.querySelectorAll('.policy-card');
    
    cards.forEach(card => {
        const policyName = card.querySelector('.policy-name').textContent;
        const isSelected = gameStatus.currentSelection.includes(policyName);
        
        // 선택 상태 업데이트
        card.classList.toggle('selected', isSelected);
        
        // 카테고리 제한 체크
        const category = gameAPI.findPolicyCategory(policyName);
        const canSelect = gameAPI.canSelectFromCategory(category);
        
        if (!canSelect && !isSelected) {
            card.classList.add('category-disabled');
        } else {
            card.classList.remove('category-disabled');
        }
    });

    // 선택 정보 업데이트
    updateTurnInfo(gameStatus);
    updateCurrentSelectionPreview();
    updateCategoryStats(gameStatus);
}

// 선택 요약 업데이트
function updateSelectionSummary() {
    if (typeof gameAPI === 'undefined') return;
    
    const gameStatus = gameAPI.getGameStatus();
    const summary = document.getElementById('selectionSummary');
    const confirmBtn = document.getElementById('confirmBtn');
    
    if (!summary || !confirmBtn) return;
    
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

    let effectText = '효과 없음';
    if (typeof gameUtils !== 'undefined') {
        effectText = gameUtils.generateEffectText(calculation.totalEffects);
    }

    summary.innerHTML = `
        <div class="summary-title">📋 선택 요약</div>
        <div class="summary-content">
            <div class="summary-policies">
                <strong>선택된 정책:</strong><br>
                ${calculation.policies.map(policy => {
                    const category = gameAPI.findPolicyCategory(policy);
                    const icon = getCategoryIcon(category);
                    return `${icon} ${policy}`;
                }).join('<br>')}
                <br><br>
                <strong>총 비용:</strong> ${calculation.totalCost}pt<br>
                <strong>예산 충족:</strong> ${calculation.canAfford ? '✅ 가능' : '❌ 불가능'}
            </div>
            <div class="summary-effects">
                <strong>예상 효과:</strong><br>
                ${effectText}
                <br><br>
                <strong>정책 상호작용:</strong><br>
                ${interactionMessage}
            </div>
        </div>
    `;
}

// 정책 선택 초기화
function clearSelection() {
    if (typeof gameAPI === 'undefined') return;
    
    const result = gameAPI.clearPolicySelection();
    if (result.success) {
        updatePolicyCards();
        updateSelectionSummary();
        if (typeof gameUtils !== 'undefined') gameUtils.playSound('select');
    }
}

// 전체 정책 개요
function showAllPoliciesOverview() {
    // 전체 정책 개요 팝업 (추후 구현)
    if (typeof gameUtils !== 'undefined') {
        gameUtils.showToast('전체 정책 개요 기능은 추후 구현 예정입니다', 'info');
    } else {
        alert('전체 정책 개요 기능은 추후 구현 예정입니다');
    }
}

// 정책 확정
function confirmPolicies() {
    if (typeof gameAPI === 'undefined') return;
    
    const result = gameAPI.confirmPolicies();
    
    if (!result.success) {
        if (typeof gameUtils !== 'undefined') {
            gameUtils.showToast(result.error, 'error');
            gameUtils.playSound('error');
        } else {
            alert(result.error);
        }
        return;
    }

    if (typeof gameUtils !== 'undefined') {
        gameUtils.playSound('confirm');
        gameUtils.showToast('정책이 확정되었습니다!', 'success');
    }

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
    
    if (!panel || !display) return;
    
    display.innerHTML = '';
    
    policies.forEach(policyName => {
        let reaction = '시민들이 이 정책에 대해 이야기하고 있습니다 💬';
        
        if (typeof GameData !== 'undefined') {
            reaction = GameData.getMemeReaction(policyName);
        }
        
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

// 다음 턴 진행 - 수정된 버전
function proceedToNextTurn() {
    if (typeof gameAPI === 'undefined') {
        console.error('gameAPI가 정의되지 않음');
        return;
    }
    
    console.log('다음 턴 진행 시작');
    const result = gameAPI.advanceToNextTurn();
    console.log('턴 진행 결과:', result);
    
    if (!result.success) {
        console.error('턴 진행 실패:', result.error);
        if (typeof gameUtils !== 'undefined') {
            gameUtils.showToast(result.error, 'error');
        } else {
            alert(result.error);
        }
        return;
    }

    if (result.finished) {
        console.log('게임 완료! 결과 화면 표시');
        console.log('게임 결과 데이터:', result);
        
        // 잠시 대기 후 결과 화면 표시 (UI 업데이트 완료를 위해)
        setTimeout(() => {
            const success = showResultsScreen(result);
            if (!success) {
                console.error('결과 화면 표시 실패, 대안 방법 시도');
                // 대안: 간단한 알림으로라도 게임 완료를 알림
                if (typeof gameUtils !== 'undefined') {
                    gameUtils.showToast('게임이 완료되었습니다! 결과를 확인하세요.', 'success');
                } else {
                    alert('게임이 완료되었습니다!');
                }
            }
        }, 100);
        
    } else {
        console.log('다음 턴 진행:', result.status);
        // 새 턴 UI 업데이트
        updateGameHeader(result.status);
        updateCategoryStats(result.status);
        updateTurnInfo(result.status);
        loadPoliciesForCategory(currentActiveCategory);
        clearPolicySelection();
        
        if (typeof gameUtils !== 'undefined') {
            gameUtils.showToast(`턴 ${result.status.turn} 시작!`, 'info');
        }
    }
}

// 이벤트 팝업 표시
function showEventPopup(event) {
    currentEvent = event;
    
    const titleElement = document.getElementById('eventTitle');
    const descElement = document.getElementById('eventDescription');
    
    if (titleElement) titleElement.textContent = event.title;
    if (descElement) descElement.textContent = event.description;
    
    // 기본 효과 표시
    const effectsDiv = document.getElementById('eventEffects');
    if (effectsDiv) {
        let effectText = '효과 없음';
        if (typeof gameUtils !== 'undefined') {
            effectText = gameUtils.generateEffectText(event.effects);
        } else {
            effectText = Object.entries(event.effects).map(([k, v]) => `${k}: ${v > 0 ? '+' : ''}${v}`).join(', ');
        }
        
        effectsDiv.innerHTML = `
            <strong>즉시 효과:</strong><br>
            ${effectText}
        `;
    }
    
    // 선택지 표시
    const choicesDiv = document.getElementById('eventChoices');
    if (choicesDiv) {
        choicesDiv.innerHTML = '';
        
        if (event.choices) {
            Object.entries(event.choices).forEach(([choiceKey, choiceEffects]) => {
                const button = document.createElement('button');
                button.className = 'event-choice-btn';
                button.onclick = () => selectEventChoice(choiceKey);
                
                let choiceEffectText = '효과 없음';
                if (typeof gameUtils !== 'undefined') {
                    choiceEffectText = gameUtils.generateEffectText(choiceEffects);
                } else {
                    choiceEffectText = Object.entries(choiceEffects).map(([k, v]) => `${k}: ${v > 0 ? '+' : ''}${v}`).join(', ');
                }
                
                button.innerHTML = `
                    <strong>${choiceKey}</strong><br>
                    효과: ${choiceEffectText}
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
    }
    
    showPopup('eventPopup');
}

// 이벤트 선택지 선택
function selectEventChoice(choiceKey) {
    if (typeof gameAPI === 'undefined') return;
    
    const result = gameAPI.applyEventChoice(currentEvent, choiceKey);
    
    if (result.success) {
        hidePopup('eventPopup');
        updateIndicators(result.status.indicators);
        
        const message = choiceKey ? `"${choiceKey}" 선택됨` : '이벤트 처리 완료';
        if (typeof gameUtils !== 'undefined') {
            gameUtils.showToast(message, 'success');
        }
        
        setTimeout(() => {
            proceedToNextTurn();
        }, 1000);
    } else {
        if (typeof gameUtils !== 'undefined') {
            gameUtils.showToast(result.error, 'error');
        } else {
            alert(result.error);
        }
    }
}

// 결과 화면 표시 - 수정된 버전
function showResultsScreen(gameResult) {
    try {
        console.log('결과 화면 표시 시작:', gameResult);
        
        // ⭐ 강제 테스트 코드 추가 ⭐
        setTimeout(() => {
            document.getElementById('finalTitle').innerHTML = '🏆 강제 테스트!<br>게임 완료!';
            document.getElementById('endingInfo').innerHTML = `
                <div class="ending-title">테스트 성공!</div>
                <div class="ending-description">JS 파일 수정으로 결과화면 표시</div>
                <div class="final-score"><strong>최종 점수: 테스트/40점</strong></div>
            `;
            document.getElementById('finalStats').innerHTML = `
                <div class="stat-group">
                    <div class="stat-group-title">📊 강제 테스트 통계</div>
                    <div class="stat-row"><span>테스트 결과</span><span>성공</span></div>
                </div>
            `;
            document.getElementById('achievements').innerHTML = `
                <div class="achievements-title">🏆 달성한 업적</div>
                <div class="achievement-item">🎖️ JS 파일 수정 성공!</div>
            `;
        }, 100);
        
        // 게임 결과가 없으면 기본값 생성
        if (!gameResult) {
            console.log('gameResult가 없음, 기본값 생성');
            gameResult = {
                totalScore: 0,
                ending: { grade: 'C급', title: '발전 중인 국가', description: '아직 갈 길이 멀지만 변화의 기초를 다졌습니다.' },
                finalIndicators: {},
                selectedPolicies: []
            };
        }

        // 엔딩이 없으면 기본값 생성
        if (!gameResult.ending) {
            gameResult.ending = {
                grade: 'C급',
                title: '발전 중인 국가',
                description: '아직 갈 길이 멀지만 변화의 기초를 다졌습니다.'
            };
        }

        // 통계 계산
        let stats = {
            totalScore: gameResult.totalScore || 0,
            budgetUsed: 0,
            budgetEfficiency: 0,
            citizenSatisfaction: 0,
            sustainability: 0,
            policiesSelected: (gameResult.selectedPolicies || []).length,
            turnsCompleted: 5
        };

        if (typeof gameAPI !== 'undefined') {
            try {
                const calculatedStats = gameAPI.calculateGameStats();
                if (calculatedStats) {
                    stats = { ...stats, ...calculatedStats };
                }
            } catch (error) {
                console.warn('통계 계산 실패, 기본값 사용:', error);
            }
        }
        
        // 최종 타이틀 업데이트
        const finalTitle = document.getElementById('finalTitle');
        if (finalTitle) {
            finalTitle.innerHTML = `${gameResult.ending.grade}<br>${gameResult.ending.title}`;
            console.log('최종 타이틀 설정 완료');
        } else {
            console.warn('finalTitle 요소를 찾을 수 없음');
        }
        
        // 엔딩 정보 업데이트
        const endingInfo = document.getElementById('endingInfo');
        if (endingInfo) {
            endingInfo.innerHTML = `
                <div class="ending-title">${gameResult.ending.title}</div>
                <div class="ending-description">${gameResult.ending.description}</div>
                <div class="final-score">
                    <strong>최종 점수: ${gameResult.totalScore}/40점</strong>
                </div>
            `;
            console.log('엔딩 정보 설정 완료');
        } else {
            console.warn('endingInfo 요소를 찾을 수 없음');
        }
        
        // 최종 통계 업데이트
        const finalStats = document.getElementById('finalStats');
        if (finalStats) {
            let indicatorRows = '';
            
            if (gameResult.finalIndicators && Object.keys(gameResult.finalIndicators).length > 0) {
                Object.entries(gameResult.finalIndicators).forEach(([indicator, value]) => {
                    let indicatorName = indicator;
                    let change = 0;
                    let changeText = '+0';
                    let changeClass = 'positive';
                    
                    // 지표 이름 가져오기
                    if (typeof GameData !== 'undefined') {
                        const info = GameData.getIndicatorInfo(indicator);
                        if (info) indicatorName = info.name;
                    }
                    
                    // 변화량 계산
                    try {
                        if (typeof gameState !== 'undefined' && gameState && gameState.initialIndicators) {
                            change = value - (gameState.initialIndicators[indicator] || 0);
                            changeText = change >= 0 ? `+${change}` : change.toString();
                            changeClass = change >= 0 ? 'positive' : 'negative';
                        }
                    } catch (error) {
                        console.warn('변화량 계산 오류:', error);
                    }
                    
                    indicatorRows += `
                        <div class="stat-row">
                            <span>${indicatorName}</span>
                            <span class="${changeClass}">${value} (${changeText})</span>
                        </div>
                    `;
                });
            } else {
                indicatorRows = '<div class="stat-row"><span>지표 데이터 없음</span></div>';
            }
            
            finalStats.innerHTML = `
                <div class="stat-group">
                    <div class="stat-group-title">📊 종합 지표</div>
                    ${indicatorRows}
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
                        <span>${stats.turnsCompleted}/${typeof GAME_CONFIG !== 'undefined' ? GAME_CONFIG.total_turns : 5}</span>
                    </div>
                </div>
            `;
            console.log('최종 통계 설정 완료');
        } else {
            console.warn('finalStats 요소를 찾을 수 없음');
        }
        
        // 업적 표시
        try {
            const achievements = calculateAchievements(gameResult, stats);
            const achievementsElement = document.getElementById('achievements');
            if (achievementsElement) {
                achievementsElement.innerHTML = `
                    <div class="achievements-title">🏆 달성한 업적</div>
                    ${achievements.length > 0 ? 
                        achievements.map(achievement => 
                            `<div class="achievement-item">${achievement}</div>`
                        ).join('') : 
                        '<div class="achievement-item">🎖️ 게임 완주 - 5턴 완주 달성!</div>'
                    }
                `;
                console.log('업적 설정 완료:', achievements.length);
            } else {
                console.warn('achievements 요소를 찾을 수 없음');
            }
        } catch (error) {
            console.warn('업적 계산 실패:', error);
        }
        
        // 화면 전환
        console.log('결과 화면으로 전환 시작');
        showScreen('resultsScreen');
        
        // 효과음 및 상태 업데이트
        if (typeof gameUtils !== 'undefined') gameUtils.playSound('success');
        updateStatusBar('게임 완료!');
        
        console.log('결과 화면 표시 완료!');
        return true;
        
    } catch (error) {
        console.error('결과 화면 표시 실패:', error);
        console.error('Error Stack:', error.stack);
        
        // 폴백 처리 - 기본 결과 화면 표시
        try {
            const finalTitle = document.getElementById('finalTitle');
            if (finalTitle) {
                finalTitle.innerHTML = '🎮 게임 완료!';
            }
            
            const endingInfo = document.getElementById('endingInfo');
            if (endingInfo) {
                endingInfo.innerHTML = `
                    <div class="ending-title">게임을 완주하셨습니다!</div>
                    <div class="ending-description">모든 정책 선택을 마치고 5턴을 완주했습니다.</div>
                    <div class="final-score">최종 점수: 계산 중...</div>
                `;
            }
            
            showScreen('resultsScreen');
            updateStatusBar('게임 완료 (오류 발생)');
            
            if (typeof gameUtils !== 'undefined') {
                gameUtils.showToast('결과 화면 로딩 중 일부 오류가 발생했습니다', 'warning');
            }
            
        } catch (fallbackError) {
            console.error('폴백 결과 화면도 실패:', fallbackError);
            alert('결과 화면 표시에 오류가 발생했습니다. 콘솔을 확인해주세요.');
        }
        
        return false;
    }
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
    if (typeof gameAPI !== 'undefined') {
        gameAPI.restartGame();
    }
    
    selectedNationName = null;
    currentEvent = null;
    
    const selectedNationElement = document.getElementById('selectedNation');
    const startButton = document.getElementById('startBtn');
    
    if (selectedNationElement) {
        selectedNationElement.textContent = '국가를 선택해주세요';
    }
    if (startButton) {
        startButton.disabled = true;
    }
    
    document.querySelectorAll('.nation-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    showScreen('startScreen');
    updateStatusBar('게임 준비 완료');
    
    if (typeof gameUtils !== 'undefined') {
        gameUtils.showToast('게임이 초기화되었습니다', 'info');
    }
}

// 결과 공유
function shareResults() {
    let shareText = '픽셀 정치 시뮬레이터 결과를 공유합니다!';
    
    if (typeof gameAPI !== 'undefined') {
        try {
            const gameStatus = gameAPI.getGameStatus();
            const stats = gameAPI.calculateGameStats();
            const finalTitle = document.getElementById('finalTitle');
            
            shareText = `
🎮 픽셀 정치 시뮬레이터 결과 🎮

🏛️ 국가: ${gameStatus.nation || selectedNationName}
🏆 최종 등급: ${finalTitle ? finalTitle.textContent : '알 수 없음'}
📊 총점: ${stats.totalScore}/40
😊 시민 만족도: ${stats.citizenSatisfaction}
🌱 지속가능성: ${stats.sustainability}

나도 국가를 설계해보자! 
#픽셀정치시뮬레이터 #국가설계게임
            `.trim();
        } catch (error) {
            console.error('공유 텍스트 생성 실패:', error);
        }
    }
    
    if (navigator.share) {
        navigator.share({
            title: '픽셀 정치 시뮬레이터 결과',
            text: shareText
        });
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
            if (typeof gameUtils !== 'undefined') {
                gameUtils.showToast('결과가 클립보드에 복사되었습니다!', 'success');
            } else {
                alert('결과가 클립보드에 복사되었습니다!');
            }
        }).catch(() => {
            alert('클립보드 복사에 실패했습니다.');
        });
    } else {
        alert('공유 기능을 사용할 수 없습니다.');
    }
}

// 결과 저장
function saveResults() {
    if (typeof gameUtils !== 'undefined') {
        gameUtils.showToast('결과 저장 기능은 추후 구현 예정입니다', 'info');
    } else {
        alert('결과 저장 기능은 추후 구현 예정입니다');
    }
}

// 도움말 관련 함수들
function showHelp() {
    showPopup('helpPopup');
}

function closeHelp() {
    hidePopup('helpPopup');
}

function showHelpTab(tabName) {
    // 모든 탭 숨기기
    document.querySelectorAll('.help-tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 선택된 탭 표시
    const selectedTab = document.getElementById(`helpTab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }
    
    // 선택된 버튼 활성화
    event.target.classList.add('active');
}

function showPolicyHelp() {
    showPopup('policyHelpPopup');
}

function closePolicyHelp() {
    hidePopup('policyHelpPopup');
}

function showCredits() {
    showPopup('creditsPopup');
}

function closeCredits() {
    hidePopup('creditsPopup');
}

// 시민 패널 숨김
function hideCitizenPanel() {
    const panel = document.getElementById('citizenPanel');
    if (panel) {
        panel.classList.remove('active');
    }
}

// 상태 바 업데이트
function updateStatusBar(message) {
    const statusElement = document.getElementById('gameStatus');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

// 교착상태 관련 함수들
function checkForDeadlock() {
    if (typeof gameAPI === 'undefined') return;
    
    const progressCheck = gameAPI.checkTurnProgress();
    
    if (progressCheck.success && !progressCheck.hasSelectablePolicies) {
        showDeadlockWarning();
    } else {
        hideDeadlockWarning();
    }
}

function showDeadlockWarning() {
    // 기존 경고가 있으면 제거
    const existingWarning = document.getElementById('deadlockWarning');
    if (existingWarning) {
        existingWarning.remove();
    }
    
    const warning = document.createElement('div');
    warning.id = 'deadlockWarning';
    warning.className = 'deadlock-warning';
    warning.innerHTML = `
        <div class="warning-content">
            <h3>⚠️ 선택 가능한 정책이 없습니다!</h3>
            <p>현재 예산이나 요구조건으로는 어떤 정책도 선택할 수 없습니다.</p>
            <p>이런 경우 턴을 스킵할 수 있지만, 시민 반응과 안정성이 감소합니다.</p>
            <div class="warning-buttons">
                <button class="pixel-btn danger" onclick="skipTurn()">
                    ⏭️ 턴 스킵 (페널티 적용)
                </button>
                <button class="pixel-btn secondary" onclick="showEmergencyOptions()">
                    🆘 비상 옵션
                </button>
            </div>
        </div>
    `;
    
    const policySection = document.querySelector('.policy-section');
    if (policySection) {
        policySection.appendChild(warning);
    }
}

function hideDeadlockWarning() {
    const warning = document.getElementById('deadlockWarning');
    if (warning) {
        warning.remove();
    }
}

function skipTurn() {
    if (typeof gameAPI === 'undefined') return;
    
    const result = gameAPI.skipCurrentTurn();
    
    if (result.success) {
        if (typeof gameUtils !== 'undefined') {
            gameUtils.playSound('error');
            gameUtils.showToast('턴이 스킵되었습니다. 페널티가 적용됩니다.', 'warning');
        } else {
            alert('턴이 스킵되었습니다. 페널티가 적용됩니다.');
        }
        
        // UI 업데이트
        const gameStatus = gameAPI.getGameStatus();
        updateIndicators(gameStatus.indicators);
        
        // 시민 반응 표시
        showCitizenReactions(['턴 스킵']);
        
        setTimeout(() => {
            proceedToNextTurn();
        }, 2000);
    } else {
        if (typeof gameUtils !== 'undefined') {
            gameUtils.showToast(result.error, 'error');
        } else {
            alert(result.error);
        }
    }
}

function showEmergencyOptions() {
    const popup = document.createElement('div');
    popup.className = 'popup-overlay active';
    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-header">
                <h3>🆘 비상 상황 대처법</h3>
                <button class="close-btn" onclick="closeEmergencyOptions()">✖</button>
            </div>
            <div class="popup-body">
                <h4>💡 상황 해결 방법</h4>
                <ul>
                    <li><strong>턴 스킵:</strong> 이번 턴을 건너뛰고 다음 턴으로 진행 (페널티 적용)</li>
                    <li><strong>예산 부족:</strong> 이전 턴에서 비용이 낮은 정책을 선택했어야 합니다</li>
                    <li><strong>요구조건 미달:</strong> 지표를 개선하는 정책을 먼저 선택했어야 합니다</li>
                </ul>
                
                <h4>🎯 게임 팁</h4>
                <ul>
                    <li>항상 다음 턴을 고려해서 예산을 관리하세요</li>
                    <li>지표 균형을 맞춰서 요구조건을 충족하세요</li>
                    <li>국가별 특성을 활용해서 비용을 절약하세요</li>
                </ul>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button class="pixel-btn danger" onclick="skipTurn(); closeEmergencyOptions();">
                        ⏭️ 턴 스킵하기
                    </button>
                    <button class="pixel-btn secondary" onclick="restartGame();">
                        🔄 게임 재시작
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
}

function closeEmergencyOptions() {
    const popup = document.querySelector('.popup-overlay');
    if (popup && popup.parentNode) {
        popup.parentNode.removeChild(popup);
    }
}

// 이벤트 리스너들
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        // ESC 키로 팝업 닫기
        document.querySelectorAll('.popup-overlay.active').forEach(popup => {
            popup.classList.remove('active');
        });
    } else if (event.key === 'Enter') {
        // Enter 키로 확인 버튼 클릭
        const confirmBtn = document.getElementById('confirmBtn');
        if (confirmBtn && !confirmBtn.disabled && confirmBtn.style.display !== 'none') {
            confirmPolicies();
        }
    } else if (event.key >= '1' && event.key <= '5') {
        // 숫자 키로 정책 선택 (게임 화면에서만)
        const gameScreen = document.getElementById('gameScreen');
        if (gameScreen && gameScreen.classList.contains('active')) {
            const policyCards = document.querySelectorAll('.policy-card:not(.disabled)');
            const index = parseInt(event.key) - 1;
            if (index < policyCards.length) {
                policyCards[index].click();
            }
        }
    }
});

// 화면 크기 변경 감지
window.addEventListener('resize', function() {
    const citizenPanel = document.getElementById('citizenPanel');
    if (citizenPanel) {
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
    }
});

// 페이지 종료 전 경고
window.addEventListener('beforeunload', function(event) {
    if (typeof gameAPI !== 'undefined') {
        const gameStatus = gameAPI.getGameStatus();
        if (gameStatus.active && gameStatus.turn > 1) {
            event.preventDefault();
            event.returnValue = '게임이 진행 중입니다. 정말 나가시겠습니까?';
            return event.returnValue;
        }
    }
});

// 자동 저장
setInterval(() => {
    if (typeof gameAPI !== 'undefined') {
        const gameStatus = gameAPI.getGameStatus();
        if (gameStatus.active) {
            gameAPI.saveGameToStorage();
        }
    }
}, 5000);

// 저장된 게임 확인
window.addEventListener('load', function() {
    if (typeof gameAPI !== 'undefined') {
        const savedGame = gameAPI.loadGameFromStorage();
        if (savedGame && savedGame.gameState && savedGame.gameState.gameActive) {
            if (confirm('저장된 게임을 발견했습니다. 이어서 하시겠습니까?')) {
                if (typeof gameUtils !== 'undefined') {
                    gameUtils.showToast('저장된 게임 로드 기능은 추후 구현 예정입니다', 'info');
                }
            }
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
        const systemStatus = document.getElementById('systemStatus');
        if (systemStatus) {
            systemStatus.textContent = `FPS: ${fps}`;
        }
        frameCount = 0;
        lastTime = currentTime;
    }
    
    requestAnimationFrame(updatePerformance);
}

requestAnimationFrame(updatePerformance);

// 터치 이벤트
let touchStartY = 0;
document.addEventListener('touchstart', function(event) {
    touchStartY = event.touches[0].clientY;
});

document.addEventListener('touchend', function(event) {
    const touchEndY = event.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > 50) {
        const citizenPanel = document.getElementById('citizenPanel');
        if (citizenPanel) {
            if (diff > 0) {
                citizenPanel.classList.remove('active');
            } else {
                if (typeof gameAPI !== 'undefined') {
                    const gameStatus = gameAPI.getGameStatus();
                    if (gameStatus.active) {
                        citizenPanel.classList.add('active');
                    }
                }
            }
        }
    }
});

// 디버그 모드
window.debugMode = false;
window.toggleDebug = function() {
    window.debugMode = !window.debugMode;
    if (window.debugMode) {
        console.log('디버그 모드 활성화');
        if (typeof gameAPI !== 'undefined') {
            console.log('게임 상태:', gameAPI.getDebugInfo());
        }
        
        let debugPanel = document.getElementById('debugPanel');
        if (!debugPanel) {
            debugPanel = document.createElement('div');
            debugPanel.id = 'debugPanel';
            debugPanel.style.cssText = `
                position: fixed; top: 10px; left: 10px; 
                background: rgba(0,0,0,0.8); color: #00ff88; 
                padding: 10px; font-size: 8px; z-index: 9999;
                border: 1px solid #00ff88; max-width: 200px;
            `;
            document.body.appendChild(debugPanel);
        }
        
        const updateDebug = () => {
            if (window.debugMode && debugPanel && typeof gameAPI !== 'undefined') {
                const info = gameAPI.getDebugInfo();
                debugPanel.innerHTML = `
                    <strong>DEBUG MODE</strong><br>
                    Active: ${info.gameActive || false}<br>
                    Turn: ${info.currentTurn || 0}/${typeof GAME_CONFIG !== 'undefined' ? GAME_CONFIG.total_turns : 5}<br>
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

// 개발자 도구 안내
console.log(`
🎮 픽셀 정치 시뮬레이터 개발자 도구
- window.toggleDebug() : 디버그 모드 토글
- gameAPI : 게임 API 접근
- gameUtils : 유틸리티 함수들
- GameData : 게임 데이터 접근
`);

console.log('🎨 UI 시스템 로딩 완료!');




