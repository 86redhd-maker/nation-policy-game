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
  console.log('팝업 열기 시도:', popupId);
  const el = document.getElementById(popupId);
  if (!el) {
    console.error('팝업 요소를 찾을 수 없음:', popupId);
    return;
  }
  
  // 다른 활성 팝업들 모두 닫기
  document.querySelectorAll('.popup-overlay.active').forEach(popup => {
    popup.classList.remove('active');
    popup.setAttribute('aria-hidden', 'true');
    popup.style.display = 'none'; // 🔧 강제로 숨김
  });
  
  document.body.classList.add('modal-open');
  el.classList.add('active');
  el.setAttribute('aria-hidden', 'false');
  
  // 🔧 CSS가 안 먹으면 JavaScript로 강제 적용
  el.style.display = 'flex';
  el.style.position = 'fixed';
  el.style.top = '0';
  el.style.left = '0';
  el.style.width = '100%';
  el.style.height = '100%';
  el.style.zIndex = '99999';
  el.style.background = 'rgba(0, 0, 0, 0.5)';
  el.style.justifyContent = 'center';
  el.style.alignItems = 'center';
  el.style.opacity = '1';
  el.style.visibility = 'visible';
  
  console.log('팝업 열기 완료:', popupId);
}

function hidePopup(popupId) {
  console.log('팝업 닫기 시도:', popupId);
  const el = document.getElementById(popupId);
  if (!el) {
    console.error('팝업 요소를 찾을 수 없음:', popupId);
    return;
  }
  
  el.classList.remove('active');
  el.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  
  // 🔧 JavaScript로 강제 숨김
  el.style.display = 'none';
  el.style.opacity = '0';
  el.style.visibility = 'hidden';
  
  console.log('팝업 닫기 완료:', popupId);
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
        bindHelpButtons();
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
                // 🔥 게임 시작할 때도 게임 헤더로 스크롤
setTimeout(() => scrollToGameHeader(), 100);
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
        clearSelection();
        
        // 🔧 미리보기 초기화 추가
        const previewContainer = document.getElementById('currentSelectionPreview');
        if (previewContainer) {
            previewContainer.style.display = 'none';
            previewContainer.classList.remove('active');
        }
        
        console.log('게임 화면 초기화 완료');
    } catch (error) {
        console.error('게임 화면 초기화 실패:', error);
    }
}

// 게임 헤더 업데이트
function updateGameHeader(gameStatus) {
    const currentNationElement = document.getElementById('currentNationName');
    const turnInfoElement = document.getElementById('turnInfo');
    const progressElement = document.getElementById('gameProgress');
    const progressTextElement = document.getElementById('progressText');
    
    if (currentNationElement) {
        currentNationElement.textContent = 
            `${getNationIcon(gameStatus.nation)} ${gameStatus.nation}`;
    }
    if (turnInfoElement) {
        turnInfoElement.textContent = 
            `턴 ${gameStatus.turn}/${gameStatus.maxTurns} - ${gameStatus.category}`;
    }
    
    // 🔧 진행률 업데이트 추가
    if (progressElement && progressTextElement) {
        const progress = ((gameStatus.turn - 1) / gameStatus.maxTurns) * 100;
        const progressBar = progressElement.querySelector('.progress-fill');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        progressTextElement.textContent = `진행률: ${Math.round(progress)}%`;
    }
}

// 시민만족도와 지속가능성 계산 함수 - UI에서 사용
function calculateCitizenSatisfaction(indicators) {
    const satisfaction = (
        (indicators['시민 반응'] || 0) + 
        (indicators['복지'] || 0) + 
        (indicators['안정성'] || 0)
    ) / 3;
    return Math.round(satisfaction * 10) / 10;
}

function calculateSustainability(indicators) {
    const sustainability = (
        (indicators['환경'] || 0) + 
        (indicators['재정'] || 0) + 
        (indicators['안정성'] || 0)
    ) / 3;
    return Math.round(sustainability * 10) / 10;
}

// 지표 표시 업데이트
function updateIndicators(indicators) {
    const grid = document.getElementById('indicatorsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

   const summaryElement = document.getElementById('indicatorsSummary');
    if (!summaryElement) return;
    
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
            const allValues = Object.values(indicators);
const minValue = Math.min(...allValues);
const maxValue = Math.max(...allValues);
const range = Math.max(20, maxValue - minValue); // 최소 범위 20
const center = (maxValue + minValue) / 2;

barWidth = ((value - (center - range/2)) / range) * 100;
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
    // 🔧 통계 지표 업데이트 추가
    if (summaryElement) {
        // 총점 계산
        const totalScore = Object.values(indicators).reduce((sum, val) => sum + val, 0);
        
        // 시민만족도 계산: (시민반응 + 복지 + 안정성) ÷ 3
        const citizenSatisfaction = calculateCitizenSatisfaction(indicators);
        
        // 지속가능성 계산: (환경 + 재정 + 안정성) ÷ 3
        const sustainability = calculateSustainability(indicators);
        
        // 요소별 업데이트
        const totalScoreElement = document.getElementById('totalScore');
        const citizenSatisfactionElement = document.getElementById('citizenSatisfaction');
        const sustainabilityElement = document.getElementById('sustainability');
        
        if (totalScoreElement) {
            totalScoreElement.textContent = totalScore;
            // 총점에 따른 색상 변경
            if (totalScore >= 15) {
                totalScoreElement.style.color = '#00ff88';
            } else if (totalScore >= 0) {
                totalScoreElement.style.color = '#ffaa00';
            } else {
                totalScoreElement.style.color = '#ff6666';
            }
        }
        
        if (citizenSatisfactionElement) {
            citizenSatisfactionElement.textContent = citizenSatisfaction;
            // 시민만족도에 따른 색상 변경
            if (citizenSatisfaction >= 1) {
                citizenSatisfactionElement.style.color = '#00ff88';
            } else if (citizenSatisfaction >= 0) {
                citizenSatisfactionElement.style.color = '#ffaa00';
            } else {
                citizenSatisfactionElement.style.color = '#ff6666';
            }
        }
        
        if (sustainabilityElement) {
            sustainabilityElement.textContent = sustainability;
            // 지속가능성에 따른 색상 변경
            if (sustainability >= 1) {
                sustainabilityElement.style.color = '#00ff88';
            } else if (sustainability >= 0) {
                sustainabilityElement.style.color = '#ffaa00';
            } else {
                sustainabilityElement.style.color = '#ff6666';
            }
        }
        
        console.log('통계 지표 업데이트:', { totalScore, citizenSatisfaction, sustainability });
    }
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
            
            // 🔧 기존 상태 클래스 모두 제거
            tabElement.classList.remove('disabled', 'limited', 'completed');
            
            // 🔧 새로운 상태에 따른 스타일 적용
            if (count >= 4) {
                tabElement.classList.add('completed');
                tabElement.title = `${category}: 완료! (${count}/4)`;
            } else if (count >= 3) {
                tabElement.classList.add('limited');
                tabElement.title = `${category}: 제한 임박 (${count}/4)`;
            } else {
                tabElement.title = `${category}: ${count}/4 선택됨`;
            }
            
            // 🔧 선택 불가능한 카테고리는 비활성화
            if (typeof gameAPI !== 'undefined' && !gameAPI.canSelectFromCategory(category)) {
                if (count >= 4) {
                    // 4/4 완료된 경우는 완료 스타일 유지
                } else {
                    // 다른 이유로 선택 불가능한 경우 비활성화
                    tabElement.classList.add('disabled');
                }
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
    
    if (!previewContainer || !previewPolicies) {
        console.warn('미리보기 컨테이너를 찾을 수 없음');
        return;
    }
    
    console.log('미리보기 업데이트:', gameStatus.currentSelection);
    
    if (!gameStatus.currentSelection || gameStatus.currentSelection.length === 0) {
        previewContainer.style.display = 'none';
        previewContainer.classList.remove('active');
        return;
    }
    
    previewContainer.style.display = 'block';
    previewContainer.classList.add('active');
    previewPolicies.innerHTML = '';
    
    gameStatus.currentSelection.forEach(policyName => {
        const category = gameAPI.findPolicyCategory ? gameAPI.findPolicyCategory(policyName) : '정책';
        const categoryIcon = getCategoryIcon(category);
        
        const policyItem = document.createElement('div');
        policyItem.className = 'preview-policy-item';
        policyItem.innerHTML = `
            <span>${categoryIcon} ${policyName}</span>
            <button class="preview-remove-btn" onclick="deselectPolicy('${policyName.replace(/'/g, "\\'")}')">✕</button>
        `;
        
        // 🔧 X버튼에 직접 이벤트 리스너도 추가 (onclick 백업)
        const removeBtn = policyItem.querySelector('.preview-remove-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('X버튼 클릭됨:', policyName);
                deselectPolicy(policyName);
            });
            
            // 호버 효과 추가
            removeBtn.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#c53030';
                this.style.transform = 'scale(1.1)';
            });
            
            removeBtn.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '#e53e3e';
                this.style.transform = 'scale(1)';
            });
        }
        
        previewPolicies.appendChild(policyItem);
    });
}

// 디버깅을 위한 헬퍼 함수
function debugPreview() {
    console.log('=== 미리보기 디버그 정보 ===');
    
    if (typeof gameAPI !== 'undefined') {
        const gameStatus = gameAPI.getGameStatus();
        console.log('현재 선택:', gameStatus.currentSelection);
    }
    
    const previewContainer = document.getElementById('currentSelectionPreview');
    const previewPolicies = document.getElementById('previewPolicies');
    
    console.log('미리보기 컨테이너:', previewContainer);
    console.log('미리보기 정책들:', previewPolicies);
    
    if (previewPolicies) {
        console.log('X버튼들:', previewPolicies.querySelectorAll('.preview-remove-btn'));
    }
    
    console.log('========================');
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
    const realWorldTip = window.POLICY_REAL_WORLD_TIPS?.[policy.정책명];

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
            <div class="policy-name">
    ${policy.정책명}
    ${realWorldTip ? `<span class="policy-tip-icon" title="${realWorldTip}">💡</span>` : ''}
</div>
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

// 🔧 정책 비용 계산 함수 개선 (국가별 특성 반영)
function calculateAdjustedCost(policy, nationName) {
    let cost = policy.비용;
    
    // 국가별 특성에 따른 비용 조정
    switch (nationName) {
        case '복지 강국':
            // 복지 정책 15% 할인
            if (policy.정책명.includes('복지') || 
                ['기본소득 도입', '의료 인프라 확충', '공공주택 확대', '노인 복지 강화', '청년 지원 확대'].includes(policy.정책명)) {
                cost = Math.floor(cost * 0.85);
            }
            // 경제 정책 10% 증가
            else if (['디지털 세금 도입', '대기업 감세', '중소기업 지원', '금융 규제 강화', '해외 투자 유치'].includes(policy.정책명)) {
                cost = Math.floor(cost * 1.1);
            }
            break;
            
        case '자원 풍부국':
            // 환경 정책 10% 증가
            if (['탄소세 도입', '재생에너지 투자', '석탄 산업 보조금', '원자력 확대', '도시 녹지 확대'].includes(policy.정책명)) {
                cost = Math.floor(cost * 1.1);
            }
            break;
            
        case '기술 선진국':
            // 기술/교육 정책 20% 할인
            if (['공교육 강화', '디지털 교육 확대', '평생학습 확대', '사교육 지원 확대', '전통 교육 강화'].includes(policy.정책명) ||
                ['기술 협력 확대'].includes(policy.정책명)) {
                cost = Math.floor(cost * 0.8);
            }
            // 복지 정책 30% 증가
            else if (['기본소득 도입', '의료 인프라 확충', '공공주택 확대', '노인 복지 강화', '청년 지원 확대'].includes(policy.정책명)) {
                cost = Math.floor(cost * 1.3);
            }
            break;
            
        case '위기국가':
            // 긴급정책은 할인, 일반 정책은 20% 증가
            if (policy.emergency_only) {
                cost = Math.floor(cost * 0.8); // 20% 할인
            } else {
                cost = Math.floor(cost * 1.2); // 20% 증가
            }
            break;
            
        case '신흥 개발국':
        default:
            // 기본값 적용 (변경 없음)
            break;
    }
    
    return Math.max(1, cost); // 최소 1pt
}

// 🔧 요구조건 체크 함수 개선
function checkPolicyRequirementsLocal(policy, indicators) {
    if (!policy.요구조건) return true;
    
    const result = Object.entries(policy.요구조건).every(([indicator, required]) => {
        const current = indicators[indicator] || 0;
        const met = current >= required;
        
        if (!met) {
            console.log(`요구조건 미달: ${indicator} 현재 ${current} < 필요 ${required}`);
        }
        
        return met;
    });
    
    console.log(`요구조건 체크 결과: ${policy.정책명} -> ${result ? '통과' : '실패'}`);
    return result;
}

// 🔧 정책 선택 토글 함수 - 완전히 수정된 버전
function togglePolicySelection(policyName) {
    if (typeof gameAPI === 'undefined') {
        console.log('gameAPI 로드되지 않음 - 정책 선택:', policyName);
        return;
    }
    
    const gameStatus = gameAPI.getGameStatus();
    console.log('정책 선택 시도:', policyName, '현재 선택:', gameStatus.currentSelection);
    
    // 이미 선택된 정책인 경우 선택 해제
    if (gameStatus.currentSelection.includes(policyName)) {
        deselectPolicy(policyName);
        return;
    }
    
    // 🔥 새로 선택하는 경우 - 모든 제한 조건 체크
    
    // 1. 최대 선택 개수 체크 (2개 제한)
    if (gameStatus.currentSelection.length >= GAME_CONFIG.policies_per_turn) {
        if (typeof gameUtils !== 'undefined') {
            gameUtils.showToast(`최대 ${GAME_CONFIG.policies_per_turn}개까지만 선택 가능합니다!`, 'error');
            gameUtils.playSound('error');
        } else {
            alert(`최대 ${GAME_CONFIG.policies_per_turn}개까지만 선택 가능합니다!`);
        }
        return;
    }
    
    // 2. 정책 찾기 및 존재 여부 확인
    const policy = GameData.findPolicy(policyName);
    if (!policy) {
        console.error('정책을 찾을 수 없습니다:', policyName);
        if (typeof gameUtils !== 'undefined') {
            gameUtils.showToast('정책 정보를 찾을 수 없습니다!', 'error');
            gameUtils.playSound('error');
        }
        return;
    }
    
    // 3. 카테고리 제한 체크
    const category = gameAPI.findPolicyCategory(policyName);
    if (!category) {
        console.error('정책 카테고리를 찾을 수 없습니다:', policyName);
        return;
    }
    
    const canSelectFromCategory = gameAPI.canSelectFromCategory(category);
    if (!canSelectFromCategory) {
        if (typeof gameUtils !== 'undefined') {
            gameUtils.showToast(`${category} 카테고리는 더 이상 선택할 수 없습니다! (최대 4개)`, 'error');
            gameUtils.playSound('error');
        } else {
            alert(`${category} 카테고리는 더 이상 선택할 수 없습니다! (최대 4개)`);
        }
        return;
    }
    
    // 4. 예산 제약 체크
    const adjustedCost = calculateAdjustedCost(policy, gameStatus.nation);
    const canAfford = gameStatus.budget - adjustedCost >= gameStatus.debtLimit;
    if (!canAfford) {
        const shortage = adjustedCost - (gameStatus.budget - gameStatus.debtLimit);
        if (typeof gameUtils !== 'undefined') {
            gameUtils.showToast(`예산이 부족합니다! (${shortage}pt 부족)`, 'error');
            gameUtils.playSound('error');
        } else {
            alert(`예산이 부족합니다! (${shortage}pt 부족)`);
        }
        return;
    }
    
    // 5. 요구조건 체크
    const requirementsMet = checkPolicyRequirementsLocal(policy, gameStatus.indicators);
    if (!requirementsMet) {
        let missingRequirements = [];
        if (policy.요구조건) {
            Object.entries(policy.요구조건).forEach(([indicator, required]) => {
                const current = gameStatus.indicators[indicator] || 0;
                if (current < required) {
                    const indicatorName = GameData.getIndicatorInfo ? 
                        GameData.getIndicatorInfo(indicator)?.name || indicator : indicator;
                    missingRequirements.push(`${indicatorName} ${required} 이상 필요 (현재: ${current})`);
                }
            });
        }
        
        const message = `요구조건을 충족하지 않습니다!\n${missingRequirements.join('\n')}`;
        if (typeof gameUtils !== 'undefined') {
            gameUtils.showToast('요구조건을 충족하지 않습니다!', 'error');
            gameUtils.playSound('error');
        } else {
            alert(message);
        }
        return;
    }
    
    // 6. 모든 조건을 통과한 경우에만 실제 선택
    console.log('모든 조건 통과 - 정책 선택 진행:', policyName);
    const result = gameAPI.selectPolicy(policyName);
    
    if (result.success) {
        if (typeof gameUtils !== 'undefined') {
            gameUtils.playSound('select');
            gameUtils.showToast(`${policyName} 선택됨!`, 'success');
        }
        
        // UI 업데이트
        updatePolicyCards();
        updateSelectionSummary();
        updateCurrentSelectionPreview();
        
        console.log('정책 선택 완료:', policyName);
    } else {
        // API 레벨에서도 실패한 경우
        console.error('API 레벨 정책 선택 실패:', result.error);
        if (typeof gameUtils !== 'undefined') {
            gameUtils.showToast(result.error, 'error');
            gameUtils.playSound('error');
        } else {
            alert(result.error);
        }
    }
}

// 🔧 정책 카드 상태 업데이트 - 더 엄격한 체크
function updatePolicyCards() {
    if (typeof gameAPI === 'undefined') return;
    
    const gameStatus = gameAPI.getGameStatus();
    const cards = document.querySelectorAll('.policy-card');
    
    console.log('정책 카드 상태 업데이트:', {
        currentSelection: gameStatus.currentSelection,
        budget: gameStatus.budget,
        categoryStats: gameStatus.categoryStats
    });
    
    cards.forEach(card => {
        const policyNameElement = card.querySelector('.policy-name');
        if (!policyNameElement) return;
        
        const policyName = policyNameElement.textContent.trim();
        const policy = GameData.findPolicy(policyName);
        if (!policy) return;
        
        const isSelected = gameStatus.currentSelection.includes(policyName);
        
        // 선택 상태 업데이트
        card.classList.toggle('selected', isSelected);
        
        // 비활성화 조건 체크 (선택되지 않은 카드만)
        if (!isSelected) {
            let shouldDisable = false;
            let disableReason = '';
            
            // 1. 최대 선택 개수 체크
            if (gameStatus.currentSelection.length >= GAME_CONFIG.policies_per_turn) {
                shouldDisable = true;
                disableReason = '최대 선택 개수 초과';
            }
            
            // 2. 카테고리 제한 체크
            if (!shouldDisable) {
                const category = gameAPI.findPolicyCategory(policyName);
                if (category && !gameAPI.canSelectFromCategory(category)) {
                    shouldDisable = true;
                    disableReason = '카테고리 제한 초과';
                    card.classList.add('category-disabled');
                } else {
                    card.classList.remove('category-disabled');
                }
            }
            
            // 3. 예산 제약 체크
            if (!shouldDisable) {
                const adjustedCost = calculateAdjustedCost(policy, gameStatus.nation);
                const canAfford = gameStatus.budget - adjustedCost >= gameStatus.debtLimit;
                if (!canAfford) {
                    shouldDisable = true;
                    disableReason = '예산 부족';
                    card.classList.add('budget-disabled');
                } else {
                    card.classList.remove('budget-disabled');
                }
            }
            
            // 4. 요구조건 체크
            if (!shouldDisable) {
                const requirementsMet = checkPolicyRequirementsLocal(policy, gameStatus.indicators);
                if (!requirementsMet) {
                    shouldDisable = true;
                    disableReason = '요구조건 미달';
                    card.classList.add('requirement-disabled');
                } else {
                    card.classList.remove('requirement-disabled');
                }
            }
            
            // 비활성화 상태 적용
            card.classList.toggle('disabled', shouldDisable);
            
            // 디버그용 로그
            if (shouldDisable) {
                console.log(`정책 비활성화: ${policyName} - ${disableReason}`);
            }
            
            // 툴팁이나 제목으로 비활성화 이유 표시
            if (shouldDisable) {
                card.title = `선택 불가: ${disableReason}`;
            } else {
                card.title = `${policyName} - 클릭하여 선택`;
            }
        } else {
            // 선택된 카드는 모든 제한 클래스 제거
            card.classList.remove('disabled', 'category-disabled', 'budget-disabled', 'requirement-disabled');
            card.title = `${policyName} - 선택됨 (클릭하여 해제)`;
        }
    });

    // 선택 정보 업데이트
    updateTurnInfo(gameStatus);
    updateCurrentSelectionPreview();
    updateCategoryStats(gameStatus);
    
    console.log('정책 카드 상태 업데이트 완료');
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
        
        // 🔧 미리보기 초기화 추가
        const previewContainer = document.getElementById('currentSelectionPreview');
        if (previewContainer) {
            previewContainer.style.display = 'none';
        }
        
        if (typeof gameUtils !== 'undefined') gameUtils.playSound('select');
    }
}

// ===== 미리보기 X버튼 수정 =====
function deselectPolicy(policyName) {
    console.log('정책 선택 해제 시도:', policyName);
    
    if (typeof gameAPI === 'undefined') {
        console.error('gameAPI가 정의되지 않음');
        return;
    }
    
    const result = gameAPI.deselectPolicy(policyName);
    console.log('선택 해제 결과:', result);
    
    if (result.success) {
        if (typeof gameUtils !== 'undefined') gameUtils.playSound('select');
        updatePolicyCards();
        updateSelectionSummary();
        updateCurrentSelectionPreview(); // 🔧 미리보기도 즉시 업데이트
        
        // 🔧 선택된 정책이 없으면 미리보기 숨김
        const gameStatus = gameAPI.getGameStatus();
        if (!gameStatus.currentSelection || gameStatus.currentSelection.length === 0) {
            const previewContainer = document.getElementById('currentSelectionPreview');
            if (previewContainer) {
                previewContainer.style.display = 'none';
                previewContainer.classList.remove('active');
            }
        }
        
        if (typeof gameUtils !== 'undefined') {
            gameUtils.showToast(`${policyName} 선택 해제됨`, 'info');
        }
    } else {
        console.error('선택 해제 실패:', result.error);
        if (typeof gameUtils !== 'undefined') {
            gameUtils.showToast(result.error, 'error');
            gameUtils.playSound('error');
        } else {
            alert(result.error);
        }
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

// 🔧 정책 확정 시에도 재검증
function confirmPolicies() {
    if (typeof gameAPI === 'undefined') return;
    
    const gameStatus = gameAPI.getGameStatus();
    console.log('확정 시도 - 현재 선택:', gameStatus.currentSelection);
    
    if (!gameStatus.currentSelection || gameStatus.currentSelection.length === 0) {
        if (typeof gameUtils !== 'undefined') {
            gameUtils.showToast('선택된 정책이 없습니다!', 'error');
            gameUtils.playSound('error');
        } else {
            alert('선택된 정책이 없습니다!');
        }
        return;
    }
    
    // 🔥 확정 직전 재검증
    let validationFailed = false;
    let errorMessages = [];
    
    for (const policyName of gameStatus.currentSelection) {
        const policy = GameData.findPolicy(policyName);
        if (!policy) {
            errorMessages.push(`${policyName}: 정책 정보 없음`);
            validationFailed = true;
            continue;
        }
        
        // 카테고리 체크
        const category = gameAPI.findPolicyCategory(policyName);
        if (category && !gameAPI.canSelectFromCategory(category)) {
            errorMessages.push(`${policyName}: ${category} 카테고리 제한 초과`);
            validationFailed = true;
        }
        
        // 예산 체크
        const cost = calculateAdjustedCost(policy, gameStatus.nation);
        if (gameStatus.budget - cost < gameStatus.debtLimit) {
            errorMessages.push(`${policyName}: 예산 부족 (${cost}pt 필요)`);
            validationFailed = true;
        }
        
        // 요구조건 체크
        if (!checkPolicyRequirementsLocal(policy, gameStatus.indicators)) {
            errorMessages.push(`${policyName}: 요구조건 미달`);
            validationFailed = true;
        }
    }
    
    if (validationFailed) {
        console.error('확정 시 검증 실패:', errorMessages);
        if (typeof gameUtils !== 'undefined') {
            gameUtils.showToast('선택된 정책에 문제가 있습니다! 다시 선택해주세요.', 'error');
            gameUtils.playSound('error');
        } else {
            alert('선택된 정책에 문제가 있습니다!\n' + errorMessages.join('\n'));
        }
        
        // 문제있는 정책들 선택 해제
        gameStatus.currentSelection.forEach(policyName => {
            gameAPI.deselectPolicy(policyName);
        });
        updatePolicyCards();
        return;
    }
    
    // 검증 통과 시 실제 확정 진행
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

    // 성공 시 UI 업데이트
    if (typeof gameUtils !== 'undefined') {
        gameUtils.playSound('confirm');
        gameUtils.showToast('정책이 확정되었습니다!', 'success');
    }

    updateIndicators(result.status.indicators);
    updateBudgetDisplay(result.status.budget, result.status.debtLimit);
    
    // 확정 후 즉시 미리보기 초기화
    const previewContainer = document.getElementById('currentSelectionPreview');
    if (previewContainer) {
        previewContainer.style.display = 'none';
        previewContainer.classList.remove('active');
    }
    
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
    
    // 🔧 모바일에서 하단 고정으로 표시
    if (window.innerWidth <= 768) {
        // 모바일: 하단 고정 패널
        panel.style.position = 'fixed';
        panel.style.bottom = '0';
        panel.style.left = '0';
        panel.style.right = '0';
        panel.style.top = 'auto';
        panel.style.transform = 'none';
        panel.style.width = '100%';
        panel.style.maxWidth = 'none';
        panel.style.zIndex = '3000';
        panel.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        panel.style.boxShadow = '0 -10px 30px rgba(0, 0, 0, 0.2)';
        panel.style.borderRadius = '16px 16px 0 0';
        panel.style.maxHeight = '40vh';
        panel.style.overflowY = 'auto';
        panel.style.borderTop = '3px solid var(--primary-color)';
        
        // 패널 헤더 스타일 조정
        const header = panel.querySelector('.panel-header');
        if (header) {
            header.style.background = 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))';
            header.style.color = 'white';
            header.style.margin = '-1.5rem -1.5rem 1rem -1.5rem';
            header.style.padding = '1rem 1.5rem';
            header.style.borderRadius = '16px 16px 0 0';
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
        }
    } else {
        // 데스크톱: 기존 사이드 패널
        panel.style.position = 'fixed';
        panel.style.right = '20px';
        panel.style.top = '50%';
        panel.style.left = 'auto';
        panel.style.bottom = 'auto';
        panel.style.transform = 'translateY(-50%)';
        panel.style.width = '300px';
        panel.style.zIndex = '100';
        panel.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        panel.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
        panel.style.borderRadius = '16px';
        panel.style.maxHeight = 'none';
        panel.style.overflowY = 'visible';
        panel.style.border = 'none';
        
        // 데스크톱에서 헤더 스타일 리셋
        const header = panel.querySelector('.panel-header');
        if (header) {
            header.style.background = 'none';
            header.style.color = 'var(--primary-color)';
            header.style.margin = '0 0 1rem 0';
            header.style.padding = '0';
            header.style.borderRadius = '0';
            header.style.display = 'block';
        }
    }
    
    panel.classList.add('active');
    
    setTimeout(() => {
        panel.classList.remove('active');
    }, 5000);
}

// 🔥 게임 헤더로 부드럽게 스크롤
function scrollToGameHeader() {
    const gameHeader = document.querySelector('.game-header');
    if (gameHeader) {
        gameHeader.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
        });
        console.log('🎯 게임 헤더로 스크롤');
    } else {
        // 헤더가 없으면 맨 위로
        scrollToTop();
    }
}

// 맨 위로 스크롤 (백업용)
function scrollToTop(smooth = true) {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: smooth ? 'smooth' : 'auto'
    });
    console.log('🔝 화면 맨 위로 스크롤');
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
        showResultsScreen(result);
    } else {
        console.log('다음 턴 진행:', result.status);
        // 🔥 게임 헤더로 부드럽게 스크롤
scrollToGameHeader();
        // 새 턴 UI 업데이트
        updateGameHeader(result.status); // 🔧 이미 진행률 업데이트 포함
        updateCategoryStats(result.status);
        updateTurnInfo(result.status);
        loadPoliciesForCategory(currentActiveCategory);
        clearSelection(); // 🔧 이미 미리보기 초기화 포함
        
        // 🔧 미리보기 강제 초기화 추가
        const previewContainer = document.getElementById('currentSelectionPreview');
        if (previewContainer) {
            previewContainer.style.display = 'none';
            previewContainer.classList.remove('active');
        }
        
        // 🔧 미리보기 내용도 비우기
        const previewPolicies = document.getElementById('previewPolicies');
        if (previewPolicies) {
            previewPolicies.innerHTML = '';
        }
        
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

// 🔧 포괄적 업적 HTML 생성 (기존 모든 로직 포함)
function generateComprehensiveAchievementsHTML(gameResult, stats) {
    const achievements = [];
    const grade = gameResult.ending?.grade || 'C급';
    const totalScore = gameResult.totalScore || 0;
    const selectedPolicies = gameResult.selectedPolicies || [];
    const finalIndicators = gameResult.finalIndicators || {};
    const nationName = gameResult.nationName || selectedNationName || '';
    
    // S급 엔딩
    if (grade === 'S급') {
        achievements.push('🏆 완벽한 설계자 - S급 엔딩 달성');
    }
    
    // A급 이상 달성
    if (grade === 'S급' || grade === 'A급') {
        achievements.push('🌟 고득점 달성 - A급 이상 달성');
    }
    
    // 높은 시민만족도
    if (stats.citizenSatisfaction >= 2) {
        achievements.push('😊 시민의 사랑 - 시민 만족도 2.0 이상');
    }
    
    // 높은 지속가능성
    if (stats.sustainability >= 2) {
        achievements.push('🌱 지속가능한 미래 - 지속가능성 2.0 이상');
    }
    
    // 예산 효율성
    if (stats.budgetEfficiency >= 1.5) {
        achievements.push('💰 예산 달인 - 높은 예산 효율성 (1.5 이상)');
    }
    
    // 위기국가 재건 성공
    if (nationName === '위기국가' && totalScore >= 50) {
        achievements.push('🔥 불사조의 부활 - 위기국가 재건 성공');
    }
    
    // 완벽한 균형
    if (Object.keys(finalIndicators).length > 0 && Object.values(finalIndicators).every(val => val >= 0)) {
        achievements.push('⚖️ 완벽한 균형 - 모든 지표 양수 달성');
    }
    
    // 정책 마스터
    if (selectedPolicies.length >= 10) {
        achievements.push('🎯 정책 마스터 - 10개 이상 정책 선택');
    }
    
    // 특별 국가별 업적
    if (nationName === '복지 강국' && stats.citizenSatisfaction >= 3) {
        achievements.push('❤️ 복지 천국 건설자 - 복지강국에서 높은 시민만족도');
    }
    
    if (nationName === '기술 선진국' && totalScore >= 120) {
        achievements.push('🚀 기술혁신 리더 - 기술선진국에서 고득점 달성');
    }
    
    // 기본 업적 (항상 있음)
    achievements.unshift('🎯 게임 완주 - 5턴 완주 달성!');
    
    return achievements.map(achievement => `
        <div class="achievement-item" style="
            background: rgba(246, 173, 85, 0.2);
            border: 1px solid #f6ad55;
            border-radius: 50px;
            padding: 1rem;
            margin-bottom: 1rem;
            font-weight: 600;
            color: #d69e2e;
            transition: all 0.3s ease;
            cursor: pointer;
        " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">${achievement}</div>
    `).join('');
}

// 🔧 교육적 해설 섹션 HTML 생성
function generateEducationalSectionHTML(gameResult, stats, nationName) {
    if (!gameResult.ending || !gameResult.ending.educational_analysis) {
        return ''; // 교육적 해설이 없으면 빈 문자열 반환
    }
    
    const analysis = gameResult.ending.educational_analysis;
    
    let html = `
        <div class="educational-section" style="
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            padding: 2rem;
            margin: 2rem 0;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            border-left: 6px solid #f6ad55;
            animation: fadeInUp 0.6s ease-out;
        ">
            <div class="educational-title" style="
                font-size: 1.5rem;
                font-weight: 700;
                color: #f6ad55;
                margin-bottom: 1.5rem;
                text-align: center;
                background: linear-gradient(135deg, #f6ad55, #ed8936);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            ">
                📚 교육적 해설 및 분석
            </div>
    `;
    
    // 성취 분석
    if (analysis.achievement_summary) {
        html += `
            <div class="analysis-subsection" style="
                margin-bottom: 2rem;
                transition: all 0.3s ease;
            ">
                <h4 class="analysis-header" style="
                    color: #2d3748;
                    margin-bottom: 1rem;
                    font-size: 1.1rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                ">🎯 성취 분석</h4>
                <div class="analysis-content achievement-analysis" style="
                    padding: 1rem;
                    border-radius: 8px;
                    line-height: 1.6;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.1));
                    border-left: 4px solid #3b82f6;
                ">
                    ${analysis.achievement_summary}
                </div>
            </div>
        `;
    }
    
    // 성공 요인
    if (analysis.success_factors && Array.isArray(analysis.success_factors)) {
        html += `
            <div class="analysis-subsection" style="
                margin-bottom: 2rem;
                transition: all 0.3s ease;
            ">
                <h4 class="analysis-header" style="
                    color: #2d3748;
                    margin-bottom: 1rem;
                    font-size: 1.1rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                ">✨ 성공 요인</h4>
                <div class="analysis-content success-factors" style="
                    padding: 1rem;
                    border-radius: 8px;
                    line-height: 1.6;
                    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(134, 239, 172, 0.1));
                    border-left: 4px solid #22c55e;
                ">
                    <ul class="factor-list" style="list-style: none; margin: 0; padding: 0;">
                        ${analysis.success_factors.map(factor => `
                            <li class="factor-item" style="
                                margin-bottom: 0.5rem;
                                padding-left: 1.5rem;
                                position: relative;
                                line-height: 1.4;
                            ">
                                <span class="factor-icon" style="
                                    position: absolute;
                                    left: 0;
                                    color: #22c55e;
                                    font-weight: bold;
                                ">✓</span>
                                ${factor}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
    
    // 실제 사례
    if (analysis.real_world_examples && Array.isArray(analysis.real_world_examples)) {
        html += `
            <div class="analysis-subsection" style="
                margin-bottom: 2rem;
                transition: all 0.3s ease;
            ">
                <h4 class="analysis-header" style="
                    color: #2d3748;
                    margin-bottom: 1rem;
                    font-size: 1.1rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                ">🌍 실제 국가 사례</h4>
                <div class="analysis-content real-world-examples" style="
                    padding: 1rem;
                    border-radius: 8px;
                    line-height: 1.6;
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(196, 181, 253, 0.1));
                    border-left: 4px solid #a855f7;
                ">
                    <ul class="example-list" style="list-style: none; margin: 0; padding: 0;">
                        ${analysis.real_world_examples.map(example => `
                            <li class="example-item" style="
                                margin-bottom: 0.5rem;
                                padding-left: 1.5rem;
                                position: relative;
                                line-height: 1.4;
                            ">
                                <span class="example-icon" style="
                                    position: absolute;
                                    left: 0;
                                    color: #a855f7;
                                    font-weight: bold;
                                ">🏛️</span>
                                ${example}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
    
    // 정책 교훈
    if (analysis.policy_lessons) {
        html += `
            <div class="analysis-subsection" style="
                margin-bottom: 2rem;
                transition: all 0.3s ease;
            ">
                <h4 class="analysis-header" style="
                    color: #2d3748;
                    margin-bottom: 1rem;
                    font-size: 1.1rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                ">💡 정책학적 교훈</h4>
                <div class="analysis-content policy-lessons" style="
                    padding: 1rem;
                    border-radius: 8px;
                    line-height: 1.6;
                    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(134, 239, 172, 0.1));
                    border-left: 4px solid #22c55e;
                ">
                    ${analysis.policy_lessons}
                </div>
            </div>
        `;
    }
    
    html += `</div>`;
    return html;
}

// 🔧 실패 분석 섹션 HTML 생성
function generateFailureAnalysisHTML(gameResult) {
    if (!gameResult || !gameResult.ending) {
        return '';
    }
    
    // S급, A급은 실패 분석 표시하지 않음
    if (gameResult.ending.grade === 'S급' || gameResult.ending.grade === 'A급') {
        return '';
    }
    
    const grade = gameResult.ending.grade;
    let failureTitle = '개선 방향';
    let failureContent = '';
    
    if (grade === 'F급' || grade === 'D급') {
        failureTitle = '심각한 위기 상황';
        failureContent = `
            <p>현재 상황은 국가적 위기에 해당합니다. 이런 상황에서는 다음과 같은 점들을 고려해야 합니다:</p>
            <ul>
                <li><strong>즉각적 안정화:</strong> 안정성과 시민 반응을 우선적으로 개선</li>
                <li><strong>재정 건전성:</strong> 무리한 지출보다는 점진적 개선이 필요</li>
                <li><strong>사회적 합의:</strong> 급진적 변화보다는 단계적 접근</li>
                <li><strong>국제 협력:</strong> 외부 지원과 협력을 통한 회복</li>
            </ul>
        `;
    } else if (grade === 'C급') {
        failureTitle = '성장 정체기';
        failureContent = `
            <p>현재는 성장이 정체된 상태입니다. 다음 단계로 도약하기 위해서는:</p>
            <ul>
                <li><strong>혁신적 정책:</strong> 기존 틀을 벗어난 창의적 접근 필요</li>
                <li><strong>균형 개발:</strong> 특정 분야에만 치중하지 말고 균형 잡힌 발전</li>
                <li><strong>장기 비전:</strong> 단기 성과보다는 지속가능한 발전 전략</li>
                <li><strong>시민 참여:</strong> 정책 결정 과정에서 시민의 목소리 반영</li>
            </ul>
        `;
    }
    
    if (!failureContent) return '';
    
    return `
        <div class="failure-analysis-section" style="
            background: rgba(239, 68, 68, 0.1);
            border: 2px solid #ef4444;
            border-radius: 16px;
            padding: 2rem;
            margin-bottom: 2rem;
            backdrop-filter: blur(10px);
        ">
            <div class="failure-title" style="
                font-size: 1.5rem;
                font-weight: 700;
                color: #dc2626;
                margin-bottom: 1.5rem;
                text-align: center;
            ">
                ⚠️ ${failureTitle}
            </div>
            <div class="failure-content" style="
                line-height: 1.6;
                color: #7f1d1d;
            ">
                ${failureContent}
            </div>
        </div>
    `;
}

// 🔧 상세 통계 HTML 생성 (기존 모든 기능 포함)
function generateDetailedStatsHTML(finalIndicators, stats, nationName) {
    let html = '';
    
    // 📊 종합 지표 섹션
    html += `
        <div class="stat-group" style="
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            padding: 1.5rem;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        ">
            <div class="stat-group-title" style="
                font-size: 1.2rem;
                font-weight: 700;
                color: #f6ad55;
                margin-bottom: 1rem;
                text-align: center;
            ">📊 종합 지표</div>
            ${generateIndicatorHTML(finalIndicators)}
        </div>
    `;
    
    // 💰 예산 운용 분석 섹션 (기존 상세 분석 유지)
    let budgetAnalysisHTML = '';
    if (typeof gameAPI !== 'undefined') {
        try {
            const efficiencyGrade = gameAPI.getEfficiencyGrade(stats.budgetEfficiency);
            const satisfactionGrade = gameAPI.getSatisfactionGrade(stats.citizenSatisfaction);
            const sustainabilityGrade = gameAPI.getSustainabilityGrade(stats.sustainability);
            
            budgetAnalysisHTML = `
                <div class="detailed-stat" style="
                    margin-bottom: 1.5rem;
                    padding: 1.2rem;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                ">
                    <div class="stat-header" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 1rem;
                        flex-wrap: wrap;
                        gap: 0.5rem;
                    ">
                        <div class="stat-main" style="
                            display: flex;
                            align-items: center;
                            gap: 0.75rem;
                        ">
                            <span class="stat-name" style="
                                font-size: 1rem;
                                font-weight: 700;
                                color: #2d3748;
                            ">예산 효율성</span>
                            <span class="stat-value" style="
                                font-size: 1.1rem;
                                font-weight: 800;
                                color: #f6ad55;
                            ">${stats.budgetEfficiency}</span>
                        </div>
                        <span class="stat-grade" style="
                            padding: 0.35rem 0.7rem;
                            border-radius: 50px;
                            font-weight: 700;
                            font-size: 0.8rem;
                            background-color: ${efficiencyGrade.bgColor};
                            color: ${efficiencyGrade.color};
                            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                        ">${efficiencyGrade.grade}급 - ${efficiencyGrade.text}</span>
                    </div>
                </div>
                
                <div class="detailed-stat" style="
                    margin-bottom: 1.5rem;
                    padding: 1.2rem;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                ">
                    <div class="stat-header" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 1rem;
                        flex-wrap: wrap;
                        gap: 0.5rem;
                    ">
                        <div class="stat-main" style="
                            display: flex;
                            align-items: center;
                            gap: 0.75rem;
                        ">
                            <span class="stat-name" style="
                                font-size: 1rem;
                                font-weight: 700;
                                color: #2d3748;
                            ">시민 만족도</span>
                            <span class="stat-value" style="
                                font-size: 1.1rem;
                                font-weight: 800;
                                color: #f6ad55;
                            ">${stats.citizenSatisfaction}</span>
                        </div>
                        <span class="stat-grade" style="
                            padding: 0.35rem 0.7rem;
                            border-radius: 50px;
                            font-weight: 700;
                            font-size: 0.8rem;
                            background-color: ${satisfactionGrade.bgColor};
                            color: ${satisfactionGrade.color};
                            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                        ">${satisfactionGrade.grade}급 - ${satisfactionGrade.text}</span>
                    </div>
                </div>
                
                <div class="detailed-stat" style="
                    margin-bottom: 1.5rem;
                    padding: 1.2rem;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                ">
                    <div class="stat-header" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 1rem;
                        flex-wrap: wrap;
                        gap: 0.5rem;
                    ">
                        <div class="stat-main" style="
                            display: flex;
                            align-items: center;
                            gap: 0.75rem;
                        ">
                            <span class="stat-name" style="
                                font-size: 1rem;
                                font-weight: 700;
                                color: #2d3748;
                            ">지속가능성</span>
                            <span class="stat-value" style="
                                font-size: 1.1rem;
                                font-weight: 800;
                                color: #f6ad55;
                            ">${stats.sustainability}</span>
                        </div>
                        <span class="stat-grade" style="
                            padding: 0.35rem 0.7rem;
                            border-radius: 50px;
                            font-weight: 700;
                            font-size: 0.8rem;
                            background-color: ${sustainabilityGrade.bgColor};
                            color: ${sustainabilityGrade.color};
                            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                        ">${sustainabilityGrade.grade}급 - ${sustainabilityGrade.text}</span>
                    </div>
                </div>
            `;
        } catch (error) {
            console.warn('상세 분석 생성 실패, 기본 버전 사용:', error);
            budgetAnalysisHTML = `
                <div class="stat-row" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                    padding: 0.5rem;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 8px;
                ">
                    <span>예산 효율성</span>
                    <span style="font-weight: 700;">${stats.budgetEfficiency}</span>
                </div>
                <div class="stat-row" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                    padding: 0.5rem;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 8px;
                ">
                    <span>시민 만족도</span>
                    <span style="font-weight: 700;">${stats.citizenSatisfaction}</span>
                </div>
                <div class="stat-row" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                    padding: 0.5rem;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 8px;
                ">
                    <span>지속가능성</span>
                    <span style="font-weight: 700;">${stats.sustainability}</span>
                </div>
            `;
        }
    } else {
        // gameAPI가 없는 경우 기본 표시
        budgetAnalysisHTML = `
            <div class="stat-row" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                padding: 0.5rem;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 8px;
            ">
                <span>예산 효율성</span>
                <span style="font-weight: 700;">${stats.budgetEfficiency}</span>
            </div>
            <div class="stat-row" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                padding: 0.5rem;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 8px;
            ">
                <span>시민 만족도</span>
                <span style="font-weight: 700;">${stats.citizenSatisfaction}</span>
            </div>
            <div class="stat-row" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                padding: 0.5rem;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 8px;
            ">
                <span>지속가능성</span>
                <span style="font-weight: 700;">${stats.sustainability}</span>
            </div>
        `;
    }
    
    html += `
        <div class="stat-group" style="
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            padding: 1.5rem;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        ">
            <div class="stat-group-title" style="
                font-size: 1.2rem;
                font-weight: 700;
                color: #f6ad55;
                margin-bottom: 1rem;
                text-align: center;
            ">💰 예산 운용 분석</div>
            ${budgetAnalysisHTML}
        </div>
    `;
    
    // 🎯 게임 진행 섹션
    html += `
        <div class="stat-group" style="
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            padding: 1.5rem;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        ">
            <div class="stat-group-title" style="
                font-size: 1.2rem;
                font-weight: 700;
                color: #f6ad55;
                margin-bottom: 1rem;
                text-align: center;
            ">🎯 게임 진행</div>
            <div class="stat-row" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                padding: 0.5rem;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 8px;
            ">
                <span>선택한 국가</span>
                <span style="font-weight: 700;">${nationName}</span>
            </div>
            <div class="stat-row" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                padding: 0.5rem;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 8px;
            ">
                <span>선택한 정책</span>
                <span style="font-weight: 700;">${stats.policiesSelected}개</span>
            </div>
            <div class="stat-row" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                padding: 0.5rem;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 8px;
            ">
                <span>사용한 예산</span>
                <span style="font-weight: 700;">${stats.budgetUsed}pt</span>
            </div>
            <div class="stat-row" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                padding: 0.5rem;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 8px;
            ">
                <span>완료한 턴</span>
                <span style="font-weight: 700;">${stats.turnsCompleted}/${typeof GAME_CONFIG !== 'undefined' ? GAME_CONFIG.total_turns : 5}</span>
            </div>
        </div>
    `;
    
    return html;
}

// 🔧 지표 HTML 생성 함수
function generateIndicatorHTML(indicators) {
    if (!indicators || Object.keys(indicators).length === 0) {
        return '<div style="text-align: center; color: #666;">지표 데이터 없음</div>';
    }
    
    let html = '';
    Object.entries(indicators).forEach(([indicator, value]) => {
        let indicatorName = indicator;
        let iconColor = value >= 0 ? '#00ff88' : '#ff6666';
        
        // 지표 이름과 아이콘 가져오기
        if (typeof GameData !== 'undefined') {
            const info = GameData.getIndicatorInfo(indicator);
            if (info) indicatorName = info.name;
        }
        
        html += `
            <div class="stat-row" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                padding: 0.5rem;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 8px;
            ">
                <span style="font-weight: 500;">${indicatorName}</span>
                <span style="
                    font-weight: 700;
                    color: ${iconColor};
                    font-size: 1.1rem;
                ">${value > 0 ? '+' : ''}${value}</span>
            </div>
        `;
    });
    
    return html;
}

// 🔧 완전한 결과 화면 표시 함수 - 모든 기존 기능 유지 + DOM 재생성
function showResultsScreen(gameResult) {
    console.log('🎯 결과 화면 표시 시작 (완전판):', gameResult);
    
    try {
        // 🔥 1단계: 모든 다른 화면 완전 숨기기
        document.querySelectorAll('.screen').forEach(screen => {
            if (screen.id !== 'resultsScreen') {
                screen.classList.remove('active');
                screen.style.display = 'none';
                screen.style.visibility = 'hidden';
            }
        });
        
        // 🔥 2단계: 기존 결과 화면 완전 제거
        const existingResults = document.getElementById('resultsScreen');
        if (existingResults) {
            existingResults.remove();
            console.log('기존 결과 화면 제거됨');
        }
        
        // 🔥 3단계: 결과 데이터 안전 처리
        const safeGameResult = gameResult || {};
        const safeEnding = safeGameResult.ending || {
            grade: 'C급',
            title: '발전 중인 국가',
            description: '아직 갈 길이 멀지만 변화의 기초를 다졌습니다.'
        };
        const totalScore = safeGameResult.totalScore || 0;
        const finalIndicators = safeGameResult.finalIndicators || {};
        const selectedPolicies = safeGameResult.selectedPolicies || [];
        const nationName = safeGameResult.nationName || selectedNationName || '알 수 없음';
        
        // 🔥 4단계: 통계 계산 (기존 로직 유지)
        let stats = {
            totalScore,
            budgetUsed: 0,
            budgetEfficiency: 0,
            citizenSatisfaction: 0,
            sustainability: 0,
            policiesSelected: selectedPolicies.length,
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
        
        // 🔥 5단계: 새로운 결과 화면 생성
        const resultsScreen = document.createElement('div');
        resultsScreen.id = 'resultsScreen';
        resultsScreen.className = 'screen active';
        
        // 🔥 6단계: 강제 스타일 적용
        resultsScreen.style.cssText = `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: relative !important;
            z-index: 5000 !important;
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fad0c4 100%) !important;
            min-height: 100vh !important;
            width: 100% !important;
            overflow-y: auto !important;
        `;
        
         // 🔥 7단계: 완전한 HTML 컨텐츠 생성 (모든 기존 기능 포함)
        resultsScreen.innerHTML = `
            <div class="results-container" style="
                padding: 4rem 2rem 2rem 2rem;
                min-height: 100vh;
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(10px);
                position: relative;
                z-index: 1;
            ">
                <!-- 최종 타이틀 -->
                <div class="final-title" id="finalTitle" style="
                    font-size: 3rem;
                    font-weight: 800;
                    text-align: center;
                    margin: 2rem auto 3rem auto;
                    background: rgba(255, 255, 255, 0.98);
                    border-radius: 20px;
                    padding: 2rem;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    line-height: 1.2;
                    color: #f6ad55;
                    position: relative;
                    z-index: 10;
                    max-width: 800px;
                ">
                    🏆 ${safeEnding.grade}<br>${safeEnding.title}
                </div>
                
                <!-- 엔딩 정보 -->
                <div class="ending-info" id="endingInfo" style="
                    background: rgba(255, 255, 255, 0.98);
                    border-radius: 16px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    text-align: center;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                ">
                    <div class="ending-title" style="
                        font-size: 1.5rem;
                        font-weight: 700;
                        color: #2d3748;
                        margin-bottom: 1rem;
                    ">${safeEnding.title}</div>
                    <div class="ending-description" style="
                        font-size: 1rem;
                        color: #4a5568;
                        margin-bottom: 1rem;
                        line-height: 1.6;
                    ">${safeEnding.description}</div>
                    <div class="final-score" style="
                        font-size: 1.5rem;
                        font-weight: 700;
                        color: #f6ad55;
                        padding: 1rem;
                        background: rgba(246, 173, 85, 0.1);
                        border-radius: 12px;
                        border: 2px solid #f6ad55;
                    ">
                        🎯 최종 점수: ${totalScore}점
                    </div>
                </div>
                
                <!-- 최종 통계 (기존 상세 분석 유지) -->
                <div class="final-stats" id="finalStats" style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                ">
                    ${generateDetailedStatsHTML(finalIndicators, stats, nationName)}
                </div>
                
                <!-- 업적 섹션 -->
                <div class="achievements" id="achievements" style="
                    background: rgba(255, 255, 255, 0.98);
                    border: 2px solid #f6ad55;
                    border-radius: 16px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                    backdrop-filter: blur(10px);
                ">
                    <div class="achievements-title" style="
                        font-size: 1.5rem;
                        font-weight: 700;
                        color: #ed8936;
                        margin-bottom: 1.5rem;
                    ">🏆 달성한 업적</div>
                    ${generateComprehensiveAchievementsHTML(safeGameResult, stats)}
                </div>
                
                <!-- 교육적 해설 섹션 -->
                ${generateEducationalSectionHTML(safeGameResult, stats, nationName)}
                
                <!-- 실패 분석 섹션 (낮은 등급일 때) -->
                ${generateFailureAnalysisHTML(safeGameResult)}
                
                <!-- 재플레이 버튼 -->
                <div class="replay-buttons" style="
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin-bottom: 2rem;
                ">
                    <button class="pixel-btn" onclick="restartGame()" style="
                        background: linear-gradient(135deg, #f6ad55, #ed8936);
                        border: none;
                        color: white;
                        font-size: 1rem;
                        font-weight: 600;
                        padding: 1rem 2rem;
                        border-radius: 50px;
                        cursor: pointer;
                        box-shadow: 0 4px 15px rgba(246, 173, 85, 0.4);
                        transition: all 0.3s ease;
                    ">🔄 다시 플레이</button>
                    <button class="pixel-btn secondary" onclick="shareResults()" style="
                        background: rgba(255, 255, 255, 0.9);
                        color: #f6ad55;
                        border: 2px solid #f6ad55;
                        font-size: 1rem;
                        font-weight: 600;
                        padding: 1rem 2rem;
                        border-radius: 50px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">📤 결과 공유</button>
                </div>
            </div>
        `;
        
        // 🔥 8단계: DOM에 추가
        document.body.appendChild(resultsScreen);
        
        // 🔥 9단계: 추가 안전 조치
        setTimeout(() => {
            const checkScreen = document.getElementById('resultsScreen');
            if (checkScreen) {
                checkScreen.style.display = 'block';
                checkScreen.style.visibility = 'visible';
                checkScreen.style.opacity = '1';
                
                // 스크롤을 맨 위로
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });
                
                console.log('✅ 완전한 결과 화면 최종 확인 완료');
                console.log('화면 스타일:', {
                    display: getComputedStyle(checkScreen).display,
                    visibility: getComputedStyle(checkScreen).visibility,
                    opacity: getComputedStyle(checkScreen).opacity,
                    zIndex: getComputedStyle(checkScreen).zIndex
                });
            } else {
                console.error('❌ 결과 화면이 DOM에서 사라짐!');
            }
        }, 100);
        
        // 🔥 10단계: 효과음 및 상태 업데이트
        if (typeof gameUtils !== 'undefined') {
            gameUtils.playSound('success');
        }
        updateStatusBar('🎊 게임 완료!');
        
        console.log('🎊 완전한 결과 화면 표시 완료!');
        return true;
        
    } catch (error) {
        console.error('💥 결과 화면 표시 실패:', error);
        console.error('Error stack:', error.stack);
        
        // 🔥 최후의 수단: 간단한 알림
        setTimeout(() => {
            const grade = gameResult?.ending?.grade || 'C급';
            const score = gameResult?.totalScore || 0;
            
            if (confirm(`🎮 게임 완료!\n\n등급: ${grade}\n점수: ${score}점\n\n결과 화면 표시에 문제가 있습니다.\n게임을 다시 시작하시겠습니까?`)) {
                restartGame();
            }
        }, 500);
        
        return false;
    }
}

// 🔧 디버깅용 함수
window.forceShowResults = function() {
    console.log('🔧 강제 결과 화면 표시');
    const mockResult = {
        totalScore: 85,
        ending: {
            grade: 'A급',
            title: '번영하는 국가',
            description: '대부분의 분야에서 우수한 성과를 거두었습니다.'
        },
        finalIndicators: {
            '경제': 3,
            '기술': 2,
            '시민 반응': 4,
            '환경': 1,
            '재정': -1,
            '안정성': 2,
            '복지': 3,
            '외교': 2
        },
        selectedPolicies: ['기본소득 도입', '디지털 교육 확대', '재생에너지 투자'],
        nationName: '복지 강국'
    };
    
    showResultsScreen(mockResult);
};

// 콘솔에서 테스트 가능하도록 전역 함수로 등록
window.testResultsScreen = window.forceShowResults;

// 🔧 업적 계산도 기존 기능 유지하면서 수정된 기준 적용
function calculateAchievements(gameResult, stats) {
    const achievements = [];
    
    // S급 엔딩 (data.js에서 S급 요구조건: 150점)
    if (gameResult.ending.grade === 'S급') {
        achievements.push('🏆 완벽한 설계자 - S급 엔딩 달성');
    }
    
    // A급 이상 달성 (data.js에서 A급 요구조건: 100점)
    if (gameResult.ending.grade === 'S급' || gameResult.ending.grade === 'A급') {
        achievements.push('🌟 고득점 달성 - A급 이상 달성');
    }
    
    // 높은 시민만족도
    if (stats.citizenSatisfaction >= 2) {
        achievements.push('😊 시민의 사랑 - 시민 만족도 2.0 이상');
    }
    
    // 높은 지속가능성
    if (stats.sustainability >= 2) {
        achievements.push('🌱 지속가능한 미래 - 지속가능성 2.0 이상');
    }
    
    // 예산 효율성 (1.5 이상으로 조정)
    if (stats.budgetEfficiency >= 1.5) {
        achievements.push('💰 예산 달인 - 높은 예산 효율성 (1.5 이상)');
    }
    
    // 위기국가 재건 성공 (50점 이상)
    if (selectedNationName === '위기국가' && gameResult.totalScore >= 50) {
        achievements.push('🔥 불사조의 부활 - 위기국가 재건 성공');
    }
    
    // 완벽한 균형 (모든 지표 양수)
    if (gameResult.finalIndicators && Object.values(gameResult.finalIndicators).every(val => val >= 0)) {
        achievements.push('⚖️ 완벽한 균형 - 모든 지표 양수 달성');
    }
    
    // 정책 마스터 (10개 이상 정책 선택)
    if (gameResult.selectedPolicies && gameResult.selectedPolicies.length >= 10) {
        achievements.push('🎯 정책 마스터 - 10개 이상 정책 선택');
    }
    
    // 특별 국가별 업적
    if (selectedNationName === '복지 강국' && stats.citizenSatisfaction >= 3) {
        achievements.push('❤️ 복지 천국 건설자 - 복지강국에서 높은 시민만족도');
    }
    
    if (selectedNationName === '기술 선진국' && gameResult.totalScore >= 120) {
        achievements.push('🚀 기술혁신 리더 - 기술선진국에서 고득점 달성');
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
📊 총점: ${stats.totalScore}
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

// 반응형 조정 함수 추가
function adjustMobileLayout() {
    const citizenPanel = document.getElementById('citizenPanel');
    if (!citizenPanel) return;
    
    if (window.innerWidth <= 768) {
        // 모바일 레이아웃
        citizenPanel.style.position = 'fixed';
        citizenPanel.style.right = 'auto';
        citizenPanel.style.top = '50%';
        citizenPanel.style.left = '50%';
        citizenPanel.style.transform = 'translate(-50%, -50%)';
        citizenPanel.style.width = '90vw';
        citizenPanel.style.maxWidth = '400px';
    } else {
        // 데스크톱 레이아웃
        citizenPanel.style.position = 'fixed';
        citizenPanel.style.right = '20px';
        citizenPanel.style.top = '50%';
        citizenPanel.style.left = 'auto';
        citizenPanel.style.transform = 'translateY(-50%)';
        citizenPanel.style.width = '300px';
    }
}

// 도움말 관련 함수들
function showHelp() {
  console.log('도움말 팝업 열기');
  
  // 기존 팝업 완전 삭제
  const existingPopup = document.getElementById('helpPopup');
  if (existingPopup) {
    existingPopup.remove();
  }
  
  // 완전히 새로운 팝업 생성
  const newPopup = document.createElement('div');
  newPopup.id = 'helpPopup';
  newPopup.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    z-index: 999999;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  `;
  
  newPopup.innerHTML = `
    <div style="
      background: white;
      border-radius: 16px;
      padding: 30px;
      width: 800px;
      max-width: 95%;
      max-height: 90%;
      overflow: auto;
      position: relative;
    ">
      <button onclick="document.getElementById('helpPopup').remove();" style="
        position: absolute;
        top: 15px;
        right: 15px;
        background: #e2e8f0;
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
      ">×</button>
      
      <h2 style="margin-bottom: 30px; color: #2d3748; text-align: center;">❓ 게임 설명</h2>
      
      <!-- 탭 네비게이션 -->
      <div style="
        display: flex;
        gap: 8px;
        margin-bottom: 30px;
        flex-wrap: wrap;
        justify-content: center;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 15px;
      ">
        <button style="
          background: linear-gradient(135deg, #ff6b9d, #c44569);
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
        " id="tab-basic">🎯 기본 규칙</button>
        
        <button style="
          background: #f7fafc;
          color: #4a5568;
          border: 2px solid transparent;
          padding: 10px 15px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
        " id="tab-indicators">📊 지표 설명</button>
        
        <button style="
          background: #f7fafc;
          color: #4a5568;
          border: 2px solid transparent;
          padding: 10px 15px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
        " id="tab-nations">🏛️ 국가 특성</button>
        
        <button style="
          background: #f7fafc;
          color: #4a5568;
          border: 2px solid transparent;
          padding: 10px 15px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
        " id="tab-tips">💡 게임 팁</button>
        
        <button style="
          background: #f7fafc;
          color: #4a5568;
          border: 2px solid transparent;
          padding: 10px 15px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
        " id="tab-advanced">🎓 고급 전략</button>
      </div>

      <!-- 탭 내용 -->
      <div id="help-content">
        <!-- 기본 규칙 탭 -->
        <div id="content-basic">
          <div style="
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255, 107, 157, 0.05);
            border-radius: 12px;
            border-left: 4px solid #ff6b9d;
          ">
            <h3 style="color: #ff6b9d; margin-bottom: 15px;">🎯 게임 목표</h3>
            <p style="margin-bottom: 15px;"><strong>5턴에 걸쳐 정책을 선택하여 최고의 국가를 만드세요!</strong></p>
            <ul style="margin-left: 20px; line-height: 1.6;">
              <li>각 지표의 균형을 맞춰 높은 점수 달성</li>
              <li>시민 만족도와 지속가능성 고려</li>
              <li>예산 한도 내에서 효율적 운영</li>
            </ul>
          </div>
          
          <div style="
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255, 107, 157, 0.05);
            border-radius: 12px;
            border-left: 4px solid #ff6b9d;
          ">
            <h3 style="color: #ff6b9d; margin-bottom: 15px;">🎮 게임 방법</h3>
            <ol style="margin-left: 20px; line-height: 1.6;">
              <li><strong>국가 선택:</strong> 5개 국가 모델 중 하나 선택</li>
              <li><strong>정책 선택:</strong> 각 턴마다 최대 2개 정책 선택</li>
              <li><strong>예산 관리:</strong> 한정된 예산 내에서 신중한 선택</li>
              <li><strong>결과 확인:</strong> 정책 효과와 시민 반응 체크</li>
              <li><strong>다음 턴:</strong> 5턴 완주까지 반복</li>
            </ol>
          </div>

          <div style="
            padding: 20px;
            background: rgba(255, 107, 157, 0.05);
            border-radius: 12px;
            border-left: 4px solid #ff6b9d;
          ">
            <h3 style="color: #ff6b9d; margin-bottom: 15px;">⚖️ 핵심 개념</h3>
            <div style="
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin-top: 15px;
            ">
              <div style="background: rgba(255, 255, 255, 0.8); padding: 15px; border-radius: 8px;">
                <strong style="display: block; color: #ff6b9d; margin-bottom: 8px;">💰 예산 제약</strong>
                <p style="font-size: 14px; margin: 0;">모든 정책에는 비용이 있고, 적자 한도를 넘으면 페널티</p>
              </div>
              <div style="background: rgba(255, 255, 255, 0.8); padding: 15px; border-radius: 8px;">
                <strong style="display: block; color: #ff6b9d; margin-bottom: 8px;">⚡ 시너지 & 충돌</strong>
                <p style="font-size: 14px; margin: 0;">정책 조합에 따라 보너스나 페널티 발생</p>
              </div>
              <div style="background: rgba(255, 255, 255, 0.8); padding: 15px; border-radius: 8px;">
                <strong style="display: block; color: #ff6b9d; margin-bottom: 8px;">🎯 트레이드오프</strong>
                <p style="font-size: 14px; margin: 0;">한 지표를 올리면 다른 지표가 내려갈 수 있음</p>
              </div>
              <div style="background: rgba(255, 255, 255, 0.8); padding: 15px; border-radius: 8px;">
                <strong style="display: block; color: #ff6b9d; margin-bottom: 8px;">🏛️ 국가 특성</strong>
                <p style="font-size: 14px; margin: 0;">선택한 국가에 따라 정책 비용과 효과가 달라짐</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 지표 설명 탭 (숨겨짐) -->
        <div id="content-indicators" style="display: none;">
          <div style="
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255, 107, 157, 0.05);
            border-radius: 12px;
            border-left: 4px solid #ff6b9d;
          ">
            <h3 style="color: #ff6b9d; margin-bottom: 15px;">📊 8가지 국가 지표</h3>
            <div style="
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 15px;
              margin-top: 15px;
            ">
              <div style="display: flex; align-items: flex-start; gap: 15px; padding: 15px; background: rgba(255, 255, 255, 0.8); border-radius: 8px;">
                <span style="font-size: 24px;">💰</span>
                <div>
                  <strong style="display: block; color: #ff6b9d; margin-bottom: 4px;">경제</strong>
                  <p style="font-size: 14px; margin: 0; line-height: 1.4;">GDP 성장률, 고용률, 경제 활력도를 나타냄</p>
                </div>
              </div>
              <div style="display: flex; align-items: flex-start; gap: 15px; padding: 15px; background: rgba(255, 255, 255, 0.8); border-radius: 8px;">
                <span style="font-size: 24px;">🚀</span>
                <div>
                  <strong style="display: block; color: #ff6b9d; margin-bottom: 4px;">기술</strong>
                  <p style="font-size: 14px; margin: 0; line-height: 1.4;">R&D 투자, 혁신역량, 디지털화 수준</p>
                </div>
              </div>
              <div style="display: flex; align-items: flex-start; gap: 15px; padding: 15px; background: rgba(255, 255, 255, 0.8); border-radius: 8px;">
                <span style="font-size: 24px;">😊</span>
                <div>
                  <strong style="display: block; color: #ff6b9d; margin-bottom: 4px;">시민반응</strong>
                  <p style="font-size: 14px; margin: 0; line-height: 1.4;">국민 만족도, 여론조사 지지율, 사회적 신뢰</p>
                </div>
              </div>
              <div style="display: flex; align-items: flex-start; gap: 15px; padding: 15px; background: rgba(255, 255, 255, 0.8); border-radius: 8px;">
                <span style="font-size: 24px;">🌱</span>
                <div>
                  <strong style="display: block; color: #ff6b9d; margin-bottom: 4px;">환경</strong>
                  <p style="font-size: 14px; margin: 0; line-height: 1.4;">대기질, 탄소배출, 재생에너지 비율, 지속가능성</p>
                </div>
              </div>
              <div style="display: flex; align-items: flex-start; gap: 15px; padding: 15px; background: rgba(255, 255, 255, 0.8); border-radius: 8px;">
                <span style="font-size: 24px;">💼</span>
                <div>
                  <strong style="display: block; color: #ff6b9d; margin-bottom: 4px;">재정</strong>
                  <p style="font-size: 14px; margin: 0; line-height: 1.4;">정부 부채, 재정수지, 세수 안정성</p>
                </div>
              </div>
              <div style="display: flex; align-items: flex-start; gap: 15px; padding: 15px; background: rgba(255, 255, 255, 0.8); border-radius: 8px;">
                <span style="font-size: 24px;">🛡️</span>
                <div>
                  <strong style="display: block; color: #ff6b9d; margin-bottom: 4px;">안정성</strong>
                  <p style="font-size: 14px; margin: 0; line-height: 1.4;">사회질서, 정치적 안정, 제도의 신뢰성</p>
                </div>
              </div>
              <div style="display: flex; align-items: flex-start; gap: 15px; padding: 15px; background: rgba(255, 255, 255, 0.8); border-radius: 8px;">
                <span style="font-size: 24px;">❤️</span>
                <div>
                  <strong style="display: block; color: #ff6b9d; margin-bottom: 4px;">복지</strong>
                  <p style="font-size: 14px; margin: 0; line-height: 1.4;">사회보장, 의료접근성, 교육기회, 삶의 질</p>
                </div>
              </div>
              <div style="display: flex; align-items: flex-start; gap: 15px; padding: 15px; background: rgba(255, 255, 255, 0.8); border-radius: 8px;">
                <span style="font-size: 24px;">🤝</span>
                <div>
                  <strong style="display: block; color: #ff6b9d; margin-bottom: 4px;">외교</strong>
                  <p style="font-size: 14px; margin: 0; line-height: 1.4;">국제관계, 대외신뢰도, 글로벌 영향력</p>
                </div>
              </div>
            </div>
          </div>

         <div style="
  padding: 20px;
  background: rgba(255, 107, 157, 0.05);
  border-radius: 12px;
  border-left: 4px solid #ff6b9d;
">
  <h3 style="color: #ff6b9d; margin-bottom: 15px;">📈 점수 시스템</h3>
  <ul style="margin-left: 20px; line-height: 1.6;">
    <li><strong>범위:</strong> 각 지표는 제한 없음 (정책 효과에 따라 결정)</li>
    <li><strong>총점:</strong> 8개 지표의 합계</li>
    <li><strong>등급:</strong> S급(150점+) > A급(100점+) > B급(50점+) > C급(0점+) > D급(-50점+) > F급</li>
  </ul>
</div>
        </div>

        <div id="content-nations" style="display: none;">
  <div style="
    margin-bottom: 30px;
    padding: 20px;
    background: rgba(255, 107, 157, 0.05);
    border-radius: 12px;
    border-left: 4px solid #ff6b9d;
  ">
    <h3 style="color: #ff6b9d; margin-bottom: 15px;">🏛️ 5가지 국가 모델</h3>
    <div style="display: flex; flex-direction: column; gap: 20px;">
      
      <!-- 복지 강국 -->
      <div style="
        background: rgba(255, 255, 255, 0.8);
        padding: 20px;
        border-radius: 12px;
        border: 2px solid transparent;
        transition: all 0.3s ease;
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        ">
          <div style="
            font-size: 24px;
            width: 40px;
            height: 40px;
            background: rgba(255, 107, 157, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          ">🏥</div>
          <strong style="font-size: 18px; color: #ff6b9d; flex: 1;">복지 강국</strong>
          <span style="
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
            background: #d1fae5;
            color: #065f46;
          ">★☆☆ 쉬움</span>
        </div>
        <p style="font-size: 14px; margin-bottom: 8px; line-height: 1.4;">
          <strong>특징:</strong> 복지 정책 15% 할인, 적자 허용도 높음
        </p>
        <p style="font-size: 14px; margin-bottom: 8px; line-height: 1.4;">
          <strong>모델:</strong> 덴마크, 스웨덴, 노르웨이
        </p>
        <p style="font-size: 14px; margin: 0; line-height: 1.4;">
          <strong>전략:</strong> 안정적 예산 운용으로 초보자에게 적합
        </p>
      </div>

      <!-- 자원 풍부국 -->
      <div style="
        background: rgba(255, 255, 255, 0.8);
        padding: 20px;
        border-radius: 12px;
        border: 2px solid transparent;
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        ">
          <div style="
            font-size: 24px;
            width: 40px;
            height: 40px;
            background: rgba(255, 107, 157, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          ">⛏️</div>
          <strong style="font-size: 18px; color: #ff6b9d; flex: 1;">자원 풍부국</strong>
          <span style="
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
            background: #fef3c7;
            color: #92400e;
          ">★★☆ 보통</span>
        </div>
        <p style="font-size: 14px; margin-bottom: 8px; line-height: 1.4;">
          <strong>특징:</strong> 경제 정책 효과 20% 증가
        </p>
        <p style="font-size: 14px; margin-bottom: 8px; line-height: 1.4;">
          <strong>모델:</strong> 노르웨이, 사우디, 칠레
        </p>
        <p style="font-size: 14px; margin: 0; line-height: 1.4;">
          <strong>전략:</strong> 경제 중심 정책으로 성장 동력 확보
        </p>
      </div>

      <!-- 기술 선진국 -->
      <div style="
        background: rgba(255, 255, 255, 0.8);
        padding: 20px;
        border-radius: 12px;
        border: 2px solid transparent;
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        ">
          <div style="
            font-size: 24px;
            width: 40px;
            height: 40px;
            background: rgba(255, 107, 157, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          ">🚀</div>
          <strong style="font-size: 18px; color: #ff6b9d; flex: 1;">기술 선진국</strong>
          <span style="
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
            background: #fee2e2;
            color: #991b1b;
          ">★★★ 어려움</span>
        </div>
        <p style="font-size: 14px; margin-bottom: 8px; line-height: 1.4;">
          <strong>특징:</strong> 기술/교육 정책 20% 할인, 시민 신뢰도 낮음
        </p>
        <p style="font-size: 14px; margin-bottom: 8px; line-height: 1.4;">
          <strong>모델:</strong> 실리콘밸리, 이스라엘, 핀란드
        </p>
        <p style="font-size: 14px; margin: 0; line-height: 1.4;">
          <strong>전략:</strong> 시민 반응 관리가 핵심
        </p>
      </div>

      <!-- 신흥 개발국 -->
      <div style="
        background: rgba(255, 255, 255, 0.8);
        padding: 20px;
        border-radius: 12px;
        border: 2px solid transparent;
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        ">
          <div style="
            font-size: 24px;
            width: 40px;
            height: 40px;
            background: rgba(255, 107, 157, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          ">📈</div>
          <strong style="font-size: 18px; color: #ff6b9d; flex: 1;">신흥 개발국</strong>
          <span style="
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
            background: #fef3c7;
            color: #92400e;
          ">★★☆ 보통</span>
        </div>
        <p style="font-size: 14px; margin-bottom: 8px; line-height: 1.4;">
          <strong>특징:</strong> 균형잡힌 성장 기회, 제한적 예산
        </p>
        <p style="font-size: 14px; margin-bottom: 8px; line-height: 1.4;">
          <strong>모델:</strong> 한국, 싱가포르, 대만
        </p>
        <p style="font-size: 14px; margin: 0; line-height: 1.4;">
          <strong>전략:</strong> 전략적 선택과 집중 필요
        </p>
      </div>

      <!-- 위기국가 -->
      <div style="
        background: rgba(255, 255, 255, 0.8);
        padding: 20px;
        border-radius: 12px;
        border: 2px solid transparent;
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        ">
          <div style="
            font-size: 24px;
            width: 40px;
            height: 40px;
            background: rgba(255, 107, 157, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          ">🔥</div>
          <strong style="font-size: 18px; color: #ff6b9d; flex: 1;">위기국가</strong>
          <span style="
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
            background: #fee2e2;
            color: #991b1b;
          ">★★★ 어려움</span>
        </div>
        <p style="font-size: 14px; margin-bottom: 8px; line-height: 1.4;">
          <strong>특징:</strong> 긴급정책 접근 가능, 극한 도전
        </p>
        <p style="font-size: 14px; margin-bottom: 8px; line-height: 1.4;">
          <strong>모델:</strong> 전후 재건 국가들
        </p>
        <p style="font-size: 14px; margin: 0; line-height: 1.4;">
          <strong>전략:</strong> 생존이 우선, 진정한 하드모드
        </p>
      </div>
    </div>
  </div>
</div>

        <!-- 게임 팁 탭 내용 추가 -->
        <div id="content-tips" style="display: none;">
          <div style="
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255, 107, 157, 0.05);
            border-radius: 12px;
            border-left: 4px solid #ff6b9d;
          ">
            <h3 style="color: #ff6b9d; margin-bottom: 15px;">💡 초보자 팁</h3>
            <ul style="margin-left: 20px; line-height: 1.6;">
              <li><strong>예산 먼저:</strong> 항상 다음 턴 예산을 고려해서 선택</li>
              <li><strong>균형이 핵심:</strong> 한 분야만 올리지 말고 고르게 발전</li>
              <li><strong>시민 반응 체크:</strong> 정책 확정 후 밈 반응을 확인</li>
              <li><strong>국가 특성 활용:</strong> 할인 받는 정책을 적극 활용</li>
              <li><strong>충돌 피하기:</strong> 정책 설명에서 충돌 정책 확인</li>
            </ul>
          </div>
          
          <div style="
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255, 107, 157, 0.05);
            border-radius: 12px;
            border-left: 4px solid #ff6b9d;
          ">
            <h3 style="color: #ff6b9d; margin-bottom: 15px;">⚡ 시너지 조합 예시</h3>
            <div style="
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 15px;
              margin-top: 15px;
            ">
              <div style="
                background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(134, 239, 172, 0.1));
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #22c55e;
              ">
                <strong style="display: block; color: #059669; font-size: 16px; margin-bottom: 8px;">🌱 친환경 성장</strong>
                <p style="font-size: 14px; line-height: 1.4; margin: 0; color: #065f46;">탄소세 도입 + 재생에너지 투자 + 중소기업 지원</p>
              </div>
              <div style="
                background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(134, 239, 172, 0.1));
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #22c55e;
              ">
                <strong style="display: block; color: #059669; font-size: 16px; margin-bottom: 8px;">❤️ 복지 혁신</strong>
                <p style="font-size: 14px; line-height: 1.4; margin: 0; color: #065f46;">기본소득 도입 + 의료 인프라 확충 + 디지털 세금 도입</p>
              </div>
              <div style="
                background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(134, 239, 172, 0.1));
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #22c55e;
              ">
                <strong style="display: block; color: #059669; font-size: 16px; margin-bottom: 8px;">🚀 기술 교육</strong>
                <p style="font-size: 14px; line-height: 1.4; margin: 0; color: #065f46;">디지털 교육 확대 + 기술 협력 확대 + 평생학습 확대</p>
              </div>
            </div>
          </div>

          <div style="
            padding: 20px;
            background: rgba(255, 107, 157, 0.05);
            border-radius: 12px;
            border-left: 4px solid #ff6b9d;
          ">
            <h3 style="color: #ff6b9d; margin-bottom: 15px;">⚠️ 흔한 실수들</h3>
            <ul style="margin-left: 20px; line-height: 1.6;">
              <li>예산 무시하고 비싼 정책만 선택</li>
              <li>한 분야에만 집중해서 다른 지표 방치</li>
              <li>정책 간 충돌 관계 무시</li>
              <li>단기 인기에만 매몰된 선택</li>
              <li>국가별 특성을 활용하지 않음</li>
            </ul>
          </div>
        </div>

        <!-- 고급 전략 탭 내용 추가 -->
        <div id="content-advanced" style="display: none;">
          <div style="
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255, 107, 157, 0.05);
            border-radius: 12px;
            border-left: 4px solid #ff6b9d;
          ">
            <h3 style="color: #ff6b9d; margin-bottom: 15px;">🎓 고급 전략</h3>
            <ul style="margin-left: 20px; line-height: 1.6;">
              <li><strong>메타 분석:</strong> 각 턴마다 전체 그림을 그려보기</li>
              <li><strong>기회비용 고려:</strong> 선택하지 않은 정책의 가치도 생각</li>
              <li><strong>장기적 관점:</strong> 5턴 후를 내다보는 전략 수립</li>
              <li><strong>위기 관리:</strong> 마이너스 지표를 어떻게 회복시킬지 계획</li>
              <li><strong>이벤트 대비:</strong> 예상치 못한 이벤트에 대한 대응력</li>
            </ul>
          </div>

          <div style="
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255, 107, 157, 0.05);
            border-radius: 12px;
            border-left: 4px solid #ff6b9d;
          ">
            <h3 style="color: #ff6b9d; margin-bottom: 15px;">🏆 고득점 전략</h3>
            <div style="display: flex; flex-direction: column; gap: 15px;">
              <div style="
                background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(196, 181, 253, 0.1));
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #a855f7;
              ">
                <strong style="display: block; color: #7c3aed; font-size: 16px; margin-bottom: 8px;">S급 달성 (25점+)</strong>
                <p style="font-size: 14px; line-height: 1.4; margin: 0; color: #5b21b6;">모든 지표를 양수로 유지하면서 시너지 조합 활용</p>
              </div>
              <div style="
                background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(196, 181, 253, 0.1));
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #a855f7;
              ">
                <strong style="display: block; color: #7c3aed; font-size: 16px; margin-bottom: 8px;">효율성 극대화</strong>
                <p style="font-size: 14px; line-height: 1.4; margin: 0; color: #5b21b6;">국가별 할인 혜택을 최대한 활용하여 예산 절약</p>
              </div>
              <div style="
                background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(196, 181, 253, 0.1));
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #a855f7;
              ">
                <strong style="display: block; color: #7c3aed; font-size: 16px; margin-bottom: 8px;">밸런스 전략</strong>
                <p style="font-size: 14px; line-height: 1.4; margin: 0; color: #5b21b6;">극단적 선택보다는 안정적 균형 발전 추구</p>
              </div>
            </div>
          </div>

          <div style="
            padding: 20px;
            background: rgba(255, 107, 157, 0.05);
            border-radius: 12px;
            border-left: 4px solid #ff6b9d;
          ">
            <h3 style="color: #ff6b9d; margin-bottom: 15px;">📚 실제 정치학 개념</h3>
            <ul style="margin-left: 20px; line-height: 1.6;">
              <li><strong>트레이드오프:</strong> 모든 선택에는 기회비용이 존재</li>
              <li><strong>파레토 효율:</strong> 누군가의 손해 없이는 개선 불가능한 상태</li>
              <li><strong>외부효과:</strong> 정책이 의도치 않은 다른 영역에 미치는 영향</li>
              <li><strong>공공선택론:</strong> 정치인도 자신의 이익을 추구하는 합리적 행위자</li>
              <li><strong>정부실패:</strong> 시장실패를 해결하려다 더 큰 비효율 발생</li>
            </ul>
          </div>
        </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <button onclick="document.getElementById('helpPopup').remove();" style="
          background: linear-gradient(135deg, #ff6b9d, #c44569);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(255, 107, 157, 0.4);
        ">확인</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(newPopup);
  
  // 🔧 팝업 생성 후 이벤트 바인딩
  const helpTabButtons = newPopup.querySelectorAll('[id^="tab-"]');
  helpTabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabName = this.id.replace('tab-', '');
      showHelpTabContent(tabName, newPopup);
    });
  });
  
  // 🔧 탭 전환 함수 (새 버전)
  function showHelpTabContent(tabName, popup) {
    // 모든 탭 버튼 스타일 리셋
    popup.querySelectorAll('[id^="tab-"]').forEach(btn => {
      btn.style.background = '#f7fafc';
      btn.style.color = '#4a5568';
    });
    
    // 모든 콘텐츠 숨김
    popup.querySelectorAll('[id^="content-"]').forEach(content => {
      content.style.display = 'none';
    });
    
    // 선택된 탭 활성화
    const selectedTab = popup.querySelector('#tab-' + tabName);
    if (selectedTab) {
      selectedTab.style.background = 'linear-gradient(135deg, #ff6b9d, #c44569)';
      selectedTab.style.color = 'white';
    }
    
    // 선택된 콘텐츠 표시
    const selectedContent = popup.querySelector('#content-' + tabName);
    if (selectedContent) {
      selectedContent.style.display = 'block';
    }
  }
  
  console.log('완전판 도움말 팝업 생성 완료');
}

function closeHelp() {
  console.log('도움말 팝업 닫기');
  hidePopup('helpPopup');
}

// 1. showCredits 함수를 이렇게 완전히 교체
function showCredits() {
  console.log('🔥 크레딧 버튼 클릭됨! (새 버전)');
  
  // ⭐ 중요: 기존 showPopup 호출하지 않고 바로 새 팝업 생성
  
  // 기존 팝업들 모두 제거
  document.querySelectorAll('#creditsPopup, .popup-overlay').forEach(popup => {
    if (popup.id === 'creditsPopup' || popup.querySelector('#creditsPopup')) {
      popup.remove();
    }
  });
  
  // 완전히 새로운 팝업 생성
  const newPopup = document.createElement('div');
  newPopup.id = 'creditsPopup';
  newPopup.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0,0,0,0.8) !important;
    z-index: 999999 !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    padding: 20px !important;
    opacity: 1 !important;
    visibility: visible !important;
  `;
  
  newPopup.innerHTML = `
    <div style="
      background: white !important;
      border-radius: 16px !important;
      padding: 30px !important;
      width: 600px !important;
      max-width: 95% !important;
      max-height: 90% !important;
      overflow: auto !important;
      position: relative !important;
      z-index: 999999 !important;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
    ">
      <button onclick="document.getElementById('creditsPopup').remove(); document.body.classList.remove('modal-open');" style="
        position: absolute !important;
        top: 15px !important;
        right: 15px !important;
        background: #e2e8f0 !important;
        border: none !important;
        border-radius: 50% !important;
        width: 32px !important;
        height: 32px !important;
        cursor: pointer !important;
        font-size: 16px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 10 !important;
      ">×</button>
      
      <h2 style="margin-bottom: 30px; color: #2d3748; text-align: center;">👥 크레딧</h2>
      
      <div style="
        margin-bottom: 30px;
        padding: 20px;
        background: rgba(255, 107, 157, 0.05);
        border-radius: 12px;
        border-left: 4px solid #ff6b9d;
      ">
        <h3 style="color: #ff6b9d; margin-bottom: 15px;">🎮 게임 개발</h3>
        <p style="line-height: 1.6; margin-bottom: 10px; color: #333;">픽셀 정치 시뮬레이터 - 국가를 설계하라</p>
        <p style="line-height: 1.6; margin: 0; color: #666;">교육용 정치 시뮬레이션 게임</p>
      </div>
      
      <div style="
        margin-bottom: 30px;
        padding: 20px;
        background: rgba(255, 107, 157, 0.05);
        border-radius: 12px;
        border-left: 4px solid #ff6b9d;
      ">
        <h3 style="color: #ff6b9d; margin-bottom: 15px;">🎨 디자인 컨셉</h3>
        <p style="line-height: 1.6; margin-bottom: 10px; color: #333;">레트로 픽셀아트 스타일</p>
        <p style="line-height: 1.6; margin: 0; color: #666;">8비트 게임 오마주</p>
      </div>
      
      <div style="
        margin-bottom: 30px;
        padding: 20px;
        background: rgba(255, 107, 157, 0.05);
        border-radius: 12px;
        border-left: 4px solid #ff6b9d;
      ">
        <h3 style="color: #ff6b9d; margin-bottom: 15px;">📚 교육적 목표</h3>
        <ul style="margin-left: 20px; line-height: 1.6; color: #333;">
          <li>정치학 및 공공정책 학습</li>
          <li>복잡한 사회 문제 이해</li>
          <li>정책 트레이드오프 체험</li>
          <li>민주주의와 정치 과정 교육</li>
        </ul>
      </div>
      
      <div style="
        margin-bottom: 30px;
        padding: 20px;
        background: rgba(255, 107, 157, 0.05);
        border-radius: 12px;
        border-left: 4px solid #ff6b9d;
      ">
        <h3 style="color: #ff6b9d; margin-bottom: 15px;">🛠️ 기술 스택</h3>
        <p style="line-height: 1.6; margin-bottom: 10px; color: #333;">HTML5, CSS3, JavaScript</p>
        <p style="line-height: 1.6; margin: 0; color: #666;">순수 웹 기술로 구현</p>
      </div>
      
      <div style="
        padding: 20px;
        background: rgba(255, 107, 157, 0.05);
        border-radius: 12px;
        border-left: 4px solid #ff6b9d;
        text-align: center;
      ">
        <h3 style="color: #ff6b9d; margin-bottom: 15px;">💝 감사의 말</h3>
        <p style="line-height: 1.6; margin: 0; color: #666; font-style: italic;">
          게임을 플레이해주셔서 감사합니다! 
          <br>정치와 정책에 대한 이해가 깊어지길 바랍니다. 🎯
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <button onclick="document.getElementById('creditsPopup').remove(); document.body.classList.remove('modal-open');" style="
          background: linear-gradient(135deg, #ff6b9d, #c44569) !important;
          color: white !important;
          border: none !important;
          padding: 12px 24px !important;
          border-radius: 25px !important;
          cursor: pointer !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 15px rgba(255, 107, 157, 0.4) !important;
        ">확인</button>
      </div>
    </div>
  `;
  
  // body에 추가
  document.body.appendChild(newPopup);
  document.body.classList.add('modal-open');
  
  console.log('✅ 새 크레딧 팝업이 body에 추가됨');
  console.log('📍 팝업 요소:', document.getElementById('creditsPopup'));
  
  return false; // ⭐ 중요: 다른 함수 호출 방지
}

// 2. closeCredits 함수도 수정
function closeCredits() {
  console.log('크레딧 팝업 닫기');
  const popup = document.getElementById('creditsPopup');
  if (popup) {
    popup.remove();
  }
  document.body.classList.remove('modal-open');
}

function showPolicyHelp() {
  console.log('정책 도움말 팝업 열기');
  showPopup('policyHelpPopup');
}

function closePolicyHelp() {
  console.log('정책 도움말 팝업 닫기');
  hidePopup('policyHelpPopup');
}

function showHelpTab(tabName, evt) {
  console.log('도움말 탭 전환:', tabName);
  
  // 모든 탭 버튼 비활성화
  document.querySelectorAll('.help-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // 모든 탭 컨텐츠 숨기기
  document.querySelectorAll('.help-tab-content').forEach(content => {
    content.classList.remove('active');
  });

  // 클릭된 버튼 활성화
  if (evt && evt.currentTarget) {
    evt.currentTarget.classList.add('active');
  } else if (evt && evt.target) {
    evt.target.classList.add('active');
  } else {
    // 직접 버튼 찾아서 활성화
    const button = document.querySelector(`[onclick*="${tabName}"]`);
    if (button) button.classList.add('active');
  }

  // 해당 탭 컨텐츠 표시
  const targetId = `helpTab${tabName.charAt(0).toUpperCase()}${tabName.slice(1)}`;
  const targetTab = document.getElementById(targetId);
  if (targetTab) {
    targetTab.classList.add('active');
    console.log('탭 전환 완료:', targetId);
  } else {
    console.error('탭을 찾을 수 없음:', targetId);
  }

  // 효과음
  if (typeof gameUtils !== 'undefined') {
    gameUtils.playSound('select');
  }
}

function showPolicyHelp() {
    showPopup('policyHelpPopup');
}

function closePolicyHelp() {
    hidePopup('policyHelpPopup');
}

// UI.js에서 기존 showCredits 함수를 이것으로 교체하세요:

function showCredits() {
  console.log('🔥 새 크레딧 함수 실행!');
  
  // 기존 팝업들 제거
  document.querySelectorAll('#creditsPopup, .popup-overlay').forEach(popup => {
    if (popup.id === 'creditsPopup' || (popup.querySelector && popup.querySelector('#creditsPopup'))) {
      popup.remove();
    }
  });
  
  const newPopup = document.createElement('div');
  newPopup.id = 'creditsPopup';
  newPopup.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0,0,0,0.8) !important;
    z-index: 999999 !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    padding: 20px !important;
  `;
  
  newPopup.innerHTML = `
    <div style="
      background: white !important;
      border-radius: 16px !important;
      padding: 30px !important;
      width: 600px !important;
      max-width: 95% !important;
      max-height: 90% !important;
      overflow: auto !important;
      position: relative !important;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
    ">
      <button onclick="document.getElementById('creditsPopup').remove(); document.body.classList.remove('modal-open');" style="
        position: absolute !important;
        top: 15px !important;
        right: 15px !important;
        background: #e2e8f0 !important;
        border: none !important;
        border-radius: 50% !important;
        width: 32px !important;
        height: 32px !important;
        cursor: pointer !important;
        font-size: 16px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 10 !important;
      ">×</button>
      
      <h2 style="margin-bottom: 30px; color: #2d3748; text-align: center;">👥 크레딧</h2>
      
      <div style="
        margin-bottom: 30px;
        padding: 20px;
        background: rgba(255, 107, 157, 0.05);
        border-radius: 12px;
        border-left: 4px solid #ff6b9d;
      ">
        <h3 style="color: #ff6b9d; margin-bottom: 15px;">🎮 게임 개발</h3>
        <p style="line-height: 1.6; margin-bottom: 10px; color: #333;">평범한 시민이었던 내가 S급 국가 지도자?!</p>
        <p style="line-height: 1.6; margin: 0; color: #666;">교육용 정치 시뮬레이션 게임</p>
      </div>
      
      <div style="
        margin-bottom: 30px;
        padding: 20px;
        background: rgba(255, 107, 157, 0.05);
        border-radius: 12px;
        border-left: 4px solid #ff6b9d;
      ">
        <h3 style="color: #ff6b9d; margin-bottom: 15px;">🎨 디자인 컨셉</h3>
        <p style="line-height: 1.6; margin-bottom: 10px; color: #333;">게이미피케이션UI</p>
        <p style="line-height: 1.6; margin: 0; color: #666;">깔끔한 카드형 인터페이스</p>
      </div>
      
      <div style="
        margin-bottom: 30px;
        padding: 20px;
        background: rgba(255, 107, 157, 0.05);
        border-radius: 12px;
        border-left: 4px solid #ff6b9d;
      ">
        <h3 style="color: #ff6b9d; margin-bottom: 15px;">📚 교육적 목표</h3>
        <ul style="margin-left: 20px; line-height: 1.6; color: #333;">
          <li>정치학 및 공공정책 학습</li>
          <li>복잡한 사회 문제 이해</li>
          <li>정책 트레이드오프 체험</li>
          <li>민주주의와 정치 과정 교육</li>
        </ul>
      </div>
      
      <div style="
        margin-bottom: 30px;
        padding: 20px;
        background: rgba(255, 107, 157, 0.05);
        border-radius: 12px;
        border-left: 4px solid #ff6b9d;
      ">
        <h3 style="color: #ff6b9d; margin-bottom: 15px;">🛠️ 기술 스택</h3>
        <p style="line-height: 1.6; margin-bottom: 10px; color: #333;">HTML5, CSS3, JavaScript</p>
        <p style="line-height: 1.6; margin: 0; color: #666;">순수 웹 기술로 구현</p>
      </div>
      
      <div style="
        padding: 20px;
        background: rgba(255, 107, 157, 0.05);
        border-radius: 12px;
        border-left: 4px solid #ff6b9d;
        text-align: center;
      ">
        <h3 style="color: #ff6b9d; margin-bottom: 15px;">💝 감사의 말</h3>
        <p style="line-height: 1.6; margin: 0; color: #666; font-style: italic;">
          S급 지도자가 되는 그 날까지! 
          <br>재미있는 사회 시간이 되길 바라요 🎯
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <button onclick="document.getElementById('creditsPopup').remove(); document.body.classList.remove('modal-open');" style="
          background: linear-gradient(135deg, #ff6b9d, #c44569) !important;
          color: white !important;
          border: none !important;
          padding: 12px 24px !important;
          border-radius: 25px !important;
          cursor: pointer !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 15px rgba(255, 107, 157, 0.4) !important;
        ">확인</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(newPopup);
  document.body.classList.add('modal-open');
  
  console.log('✅ 새 크레딧 팝업 생성 완료');
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

// 🔧 교육적 해설 섹션 생성 함수
function createEducationalSection(gameResult, stats, nationName) {
    try {
        if (!gameResult || !gameResult.ending) {
            console.warn('gameResult 또는 ending 정보 없음');
            return null;
        }

        const analysis = gameResult.ending.educational_analysis;
        if (!analysis) {
            console.warn('educational_analysis 정보 없음');
            return null;
        }
        
        let educationalHTML = `
            <div class="educational-section">
                <div class="educational-title">
                    📚 교육적 해설 및 분석
                </div>
        `;
        
        // 성취 분석
        if (analysis.achievement_summary) {
            educationalHTML += `
                <div class="analysis-subsection">
                    <h4 class="analysis-header">🎯 성취 분석</h4>
                    <div class="analysis-content achievement-analysis">
                        ${analysis.achievement_summary}
                    </div>
                </div>
            `;
        }
        
        // 성공 요인
        if (analysis.success_factors && Array.isArray(analysis.success_factors)) {
            educationalHTML += `
                <div class="analysis-subsection">
                    <h4 class="analysis-header">✨ 성공 요인</h4>
                    <div class="analysis-content success-factors">
                        <ul class="factor-list">
                            ${analysis.success_factors.map(factor => 
                                `<li class="factor-item">
                                    <span class="factor-icon">✓</span>
                                    ${factor}
                                </li>`
                            ).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }
        
        // 실제 사례
        if (analysis.real_world_examples && Array.isArray(analysis.real_world_examples)) {
            educationalHTML += `
                <div class="analysis-subsection">
                    <h4 class="analysis-header">🌍 실제 국가 사례</h4>
                    <div class="analysis-content real-world-examples">
                        <ul class="example-list">
                            ${analysis.real_world_examples.map(example => 
                                `<li class="example-item">
                                    <span class="example-icon">🏛️</span>
                                    ${example}
                                </li>`
                            ).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }
        
        // 정책 교훈
        if (analysis.policy_lessons) {
            educationalHTML += `
                <div class="analysis-subsection">
                    <h4 class="analysis-header">💡 정책학적 교훈</h4>
                    <div class="analysis-content policy-lessons">
                        ${analysis.policy_lessons}
                    </div>
                </div>
            `;
        }
        
        // 선택한 국가 모델 해설
        if (nationName && typeof window.NATION_EDUCATIONAL_CONTENT !== 'undefined') {
            const nationContent = window.NATION_EDUCATIONAL_CONTENT[nationName];
            if (nationContent) {
                educationalHTML += `
                    <div class="analysis-subsection">
                        <h4 class="analysis-header">🏛️ ${nationName} 모델 분석</h4>
                        <div class="analysis-content nation-model">
                            <p><strong>실제 모델:</strong> ${nationContent.model_name}</p>
                            <p><strong>대표 국가:</strong> ${nationContent.model_countries.join(', ')}</p>
                            <p><strong>핵심 특징:</strong> ${nationContent.main_challenge}</p>
                            <p><strong>교훈:</strong> ${nationContent.lessons_learned}</p>
                        </div>
                    </div>
                `;
            }
        }
        
        // 정책 조합 분석
        const policyAnalysis = analyzePolicyCombinations(gameResult.selectedPolicies || []);
        if (policyAnalysis) {
            educationalHTML += policyAnalysis;
        }
        
        educationalHTML += `</div>`;
        return educationalHTML;
        
    } catch (error) {
        console.error('교육적 해설 생성 중 오류:', error);
        return null;
    }
}

// 🔧 정책 조합 분석 함수
function analyzePolicyCombinations(selectedPolicies) {
    try {
        if (!selectedPolicies || selectedPolicies.length === 0) {
            return null;
        }
        
        if (typeof window.POLICY_EDUCATIONAL_ANALYSIS === 'undefined') {
            return null;
        }
        
        // 선택된 정책과 매칭되는 교육 분석 찾기
        let matchedAnalysis = null;
        let matchedComboName = null;
        
        for (const [comboName, analysis] of Object.entries(window.POLICY_EDUCATIONAL_ANALYSIS)) {
            const requiredPolicies = analysis.combination;
            const matchCount = requiredPolicies.filter(policy => 
                selectedPolicies.includes(policy)
            ).length;
            
            // 50% 이상 매칭되면 해당 조합으로 분석
            if (matchCount >= Math.ceil(requiredPolicies.length * 0.5)) {
                matchedAnalysis = analysis;
                matchedComboName = comboName;
                break;
            }
        }
        
        if (!matchedAnalysis) {
            return null;
        }
        
        return `
            <div class="analysis-subsection">
                <h4 class="analysis-header">🔍 정책 조합 분석: ${matchedComboName.replace('_', ' ')}</h4>
                <div class="analysis-content policy-combination">
                    <p><strong>📋 정책 조합:</strong> ${matchedAnalysis.combination.join(', ')}</p>
                    <p><strong>📊 분석:</strong> ${matchedAnalysis.analysis}</p>
                    <p><strong>🏛️ 실제 사례:</strong> ${matchedAnalysis.real_world_case}</p>
                    
                    <div class="pros-cons">
                        <div class="pros">
                            <p><strong>✅ 장점:</strong></p>
                            <ul>
                                ${matchedAnalysis.pros.slice(0, 3).map(pro => `<li>${pro}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="cons">
                            <p><strong>⚠️ 단점:</strong></p>
                            <ul>
                                ${matchedAnalysis.cons.slice(0, 3).map(con => `<li>${con}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    
                    <div class="lesson-box">
                        <strong>💡 교훈:</strong> ${matchedAnalysis.lesson}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('정책 조합 분석 중 오류:', error);
        return null;
    }
}

// 🔧 실패 사례 분석 표시 함수
function createFailureAnalysisSection(gameResult) {
    try {
        if (!gameResult || !gameResult.ending) {
            return null;
        }
        
        // S급, A급은 실패 사례 표시하지 않음
        if (gameResult.ending.grade === 'S급' || gameResult.ending.grade === 'A급') {
            return null;
        }
        
        if (typeof window.POLICY_FAILURE_CASES === 'undefined') {
            console.warn('POLICY_FAILURE_CASES가 정의되지 않음');
            return null;
        }
        
        // 등급에 따라 적절한 실패 사례 선택
        let selectedCase = null;
        
        if (gameResult.ending.grade === 'F급' || gameResult.ending.grade === 'D급') {
            selectedCase = window.POLICY_FAILURE_CASES.greece_crisis;
        } else if (gameResult.ending.grade === 'C급') {
            selectedCase = window.POLICY_FAILURE_CASES.japan_lost_decades;
        }
        
        if (!selectedCase) {
            return null;
        }
        
        return `
            <div class="failure-analysis-section">
                <div class="failure-title">
                    ⚠️ 실패 사례 분석: ${selectedCase.title}
                </div>
                
                <div class="failure-content">
                    <p><strong>배경:</strong> ${selectedCase.background ? selectedCase.background.context : '정책 실패 사례입니다.'}</p>
                    
                    <div class="failure-lesson">
                        <strong>게임과의 연관성:</strong> ${selectedCase.game_connection || '이 게임에서의 정책 선택과 유사한 패턴을 보여주는 실제 사례입니다.'}
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('실패 사례 분석 생성 중 오류:', error);
        return null;
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
            // 모바일: 하단 고정 스타일
            citizenPanel.style.position = 'fixed';
            citizenPanel.style.bottom = '0';
            citizenPanel.style.left = '0';
            citizenPanel.style.right = '0';
            citizenPanel.style.top = 'auto';
            citizenPanel.style.transform = 'none';
            citizenPanel.style.width = '100%';
            citizenPanel.style.zIndex = '3000';
        } else {
            // 데스크톱: 사이드 패널 스타일
            citizenPanel.style.position = 'fixed';
            citizenPanel.style.right = '20px';
            citizenPanel.style.top = '50%';
            citizenPanel.style.left = 'auto';
            citizenPanel.style.bottom = 'auto';
            citizenPanel.style.transform = 'translateY(-50%)';
            citizenPanel.style.width = '300px';
            citizenPanel.style.zIndex = '100';
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

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드 완료 - 버튼 바인딩 시작');
    
    // 전역 함수로 등록
    window.showHelp = showHelp;
    window.closeHelp = closeHelp;
    window.showCredits = showCredits;
    window.closeCredits = closeCredits;
    window.showHelpTab = showHelpTab;
    window.bindHelpButtons = bindHelpButtons; // 🔧 추가
    
    // 초기 바인딩
    bindHelpButtons();
    
    // 팝업 외부 클릭으로 닫기
    document.querySelectorAll('.popup-overlay').forEach(popup => {
        popup.addEventListener('click', function(e) {
            if (e.target === this) {
                const popupId = this.id;
                console.log('팝업 외부 클릭으로 닫기:', popupId);
                hidePopup(popupId);
            }
        });
    });
    
    // ESC 키로 팝업 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activePopup = document.querySelector('.popup-overlay.active');
            if (activePopup) {
                console.log('ESC 키로 팝업 닫기:', activePopup.id);
                hidePopup(activePopup.id);
            }
        }
    });
    
    // 🔧 DOM 변화 감지해서 버튼 다시 바인딩
    const observer = new MutationObserver(function(mutations) {
        let shouldRebind = false;
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // 새로운 버튼이 추가되었는지 확인
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === 1) { // Element node
                        if (node.querySelector && (
                            node.querySelector('#btn-howto') || 
                            node.querySelector('#btn-credits') ||
                            node.id === 'btn-howto' ||
                            node.id === 'btn-credits'
                        )) {
                            shouldRebind = true;
                            break;
                        }
                    }
                }
            }
        });
        
        if (shouldRebind) {
            console.log('DOM 변화 감지 - 버튼 재바인딩');
            setTimeout(bindHelpButtons, 100); // 약간의 지연 후 실행
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('버튼 바인딩 완료');
});

// 3. bindHelpButtons 함수 수정 (크레딧 바인딩 강화)
function bindHelpButtons() {
    console.log('🔧 도움말&크레딧 버튼 바인딩 시작');
    
    // 도움말 버튼들
    const helpButtons = document.querySelectorAll('#btn-howto, [data-open-help], .btn-help');
    helpButtons.forEach(btn => {
        if (btn && !btn.__helpBound) {
            btn.__helpBound = true;
            btn.removeAttribute('onclick');
            btn.onclick = null;
            
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('✅ 도움말 버튼 클릭');
                showHelp();
            }, true);
            
            console.log('✅ 도움말 버튼 바인딩:', btn.id);
        }
    });
    
    // 🔥 크레딧 버튼들 (수정된 바인딩)
    const creditButtons = document.querySelectorAll('#btn-credits, [data-open-credits], .btn-credits');
    console.log('🔍 크레딧 버튼 찾기:', creditButtons.length + '개 발견');
    
    creditButtons.forEach((btn, index) => {
        console.log(`🔍 크레딧 버튼 ${index + 1}:`, btn.id, btn.className);
        
        if (btn && !btn.__creditBound) {
            btn.__creditBound = true;
            
            // 기존 이벤트 완전 제거
            btn.removeAttribute('onclick');
            btn.onclick = null;
            
            // 이벤트 리스너 추가
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔥 크레딧 버튼 클릭됨 (이벤트리스너)');
                showCredits();
            }, true);
            
            // onclick도 추가 (백업)
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔥 크레딧 버튼 클릭됨 (onclick)');
                showCredits();
                return false;
            };
            
            console.log('✅ 크레딧 버튼 바인딩 완료:', btn.id);
        }
    });
    
    // 🔥 전역 함수로 등록
    window.showCredits = showCredits;
    window.closeCredits = closeCredits; // closeCreditsNew 대신 closeCredits 사용
    window.showHelp = showHelp;
    window.closeHelp = closeHelp;
    
    console.log('🔧 버튼 바인딩 완료 - 전역함수 등록됨');
}
































