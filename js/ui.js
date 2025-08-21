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
    console.log('UI 초기화 시작');
    
    // 잠시 후 초기화 (다른 스크립트 로딩 대기)
    setTimeout(() => {
        try {
            initializeStartScreen();
            updateStatusBar('게임 준비 완료');
        } catch (error) {
            console.error('초기화 오류:', error);
            fallbackInitialization();
        }
    }, 200);
});

// 백업 초기화 함수
function fallbackInitialization() {
    console.log('백업 초기화 실행');
    const nationsGrid = document.querySelector('.nations-grid');
    if (nationsGrid) {
        // 간단한 국가 데이터
        const simpleNations = {
            '복지 강국': { desc: '복지 수준이 높은 국가', difficulty: '⭐☆☆' },
            '자원 풍부국': { desc: '자원이 풍부한 국가', difficulty: '⭐⭐☆' },
            '기술 선진국': { desc: '기술력이 뛰어난 국가', difficulty: '⭐⭐⭐' },
            '신흥 개발국': { desc: '성장 중인 국가', difficulty: '⭐⭐☆' },
            '위기국가': { desc: '재건이 필요한 국가', difficulty: '⭐⭐⭐' }
        };

        nationsGrid.innerHTML = '';
        Object.entries(simpleNations).forEach(([name, data]) => {
            const card = document.createElement('div');
            card.className = 'nation-card';
            card.onclick = () => selectNation(name);
            card.innerHTML = `
                <div class="nation-name">${name}</div>
                <div class="difficulty-stars">${data.difficulty}</div>
                <div class="nation-description">${data.desc}</div>
            `;
            nationsGrid.appendChild(card);
        });
    }
}

// 시작 화면 초기화
function initializeStartScreen() {
    const nationsGrid = document.querySelector('.nations-grid');
    if (!nationsGrid) return;
    
    nationsGrid.innerHTML = '';

    // NATIONS_DATA가 있는지 확인
    if (typeof NATIONS_DATA === 'undefined') {
        console.log('NATIONS_DATA 없음 - 백업 데이터 사용');
        fallbackInitialization();
        return;
    }

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

    const difficultyStars = '★'.repeat(nationData.difficulty_stars || 1) + 
                           '☆'.repeat(3 - (nationData.difficulty_stars || 1));

    const flagGradient = nationData.flag_colors ? 
        `linear-gradient(45deg, ${nationData.flag_colors[0]}, ${nationData.flag_colors[1]})` :
        'linear-gradient(45deg, #333, #666)';

    card.innerHTML = `
        <div class="nation-flag" style="background: ${flagGradient};"></div>
        <div class="nation-name">${getNationIcon(nationName)} ${nationName}</div>
        <div class="difficulty-stars">${difficultyStars}</div>
        <div class="nation-description">${nationData.description || '설명 없음'}</div>
        <div class="nation-stats">
            <div class="stat-item">💰 예산: ${nationData.initial_budget || 100}pt</div>
            <div class="stat-item">📉 적자한도: ${nationData.debt_limit || -50}pt</div>
            <div class="stat-item">✨ 특성: ${getSpecialFeature(nationName)}</div>
            <div class="stat-item">🎯 난이도: ${getDifficultyText(nationData.difficulty || '중')}</div>
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
    console.log('국가 선택:', nationName);
    
    // 이전 선택 해제
    document.querySelectorAll('.nation-card').forEach(card => {
        card.classList.remove('selected');
    });

    // 새 선택 활성화
    if (event && event.target) {
        event.target.closest('.nation-card').classList.add('selected');
    }
    
    selectedNationName = nationName;
    
    const selectedElement = document.getElementById('selectedNation');
    if (selectedElement) {
        selectedElement.textContent = nationName;
    }
    
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.disabled = false;
    }
    
    // 안전한 사운드 재생
    try {
        if (typeof gameUtils !== 'undefined' && gameUtils.playSound) {
            gameUtils.playSound('select');
        }
    } catch (error) {
        console.log('사운드 재생 실패:', error);
    }

    // 안전한 토스트 표시
    try {
        if (typeof gameUtils !== 'undefined' && gameUtils.showToast) {
            gameUtils.showToast(`${nationName} 선택됨!`, 'success');
        }
    } catch (error) {
        console.log('토스트 표시 실패:', error);
    }
}

// 게임 시작
function startGame() {
    console.log('게임 시작 함수 호출');
    
    if (!selectedNationName) {
        alert('국가를 먼저 선택해주세요!');
        return;
    }

    showLoading(true);
    updateStatusBar('게임 시작 중...');

    setTimeout(() => {
        try {
            // gameAPI가 있는지 확인
            if (typeof gameAPI === 'undefined') {
                console.error('gameAPI가 정의되지 않음');
                alert('게임 시스템을 로딩 중입니다. 잠시 후 다시 시도해주세요.');
                showLoading(false);
                return;
            }

            const result = gameAPI.startGame(selectedNationName);
            
            if (result && result.success) {
                initializeGameScreen(result.status);
                showScreen('gameScreen');
                
                // 안전한 사운드 재생
                try {
                    if (typeof gameUtils !== 'undefined' && gameUtils.playSound) {
                        gameUtils.playSound('success');
                    }
                } catch (error) {
                    console.log('사운드 재생 실패:', error);
                }
                
                updateStatusBar(`${selectedNationName} 게임 진행 중`);
            } else {
                const errorMsg = result ? result.error : '알 수 없는 오류';
                alert(`게임 시작 실패: ${errorMsg}`);
                updateStatusBar('게임 시작 실패');
            }
        } catch (error) {
            console.error('게임 시작 오류:', error);
            alert('게임 시작 중 오류가 발생했습니다: ' + error.message);
        }
        
        showLoading(false);
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
    if (!gameStatus) return;
    
    try {
        updateGameHeader(gameStatus);
        updateIndicators(gameStatus.indicators);
        loadPoliciesForCategory(gameStatus.category);
        updateBudgetDisplay(gameStatus.budget, gameStatus.debtLimit);
        clearPolicySelection();
    } catch (error) {
        console.error('게임 화면 초기화 오류:', error);
    }
}

// 게임 헤더 업데이트
function updateGameHeader(gameStatus) {
    const nameElement = document.getElementById('currentNationName');
    if (nameElement) {
        nameElement.textContent = `${getNationIcon(gameStatus.nation)} ${gameStatus.nation}`;
    }
    
    const turnElement = document.getElementById('turnInfo');
    if (turnElement) {
        turnElement.textContent = `턴 ${gameStatus.turn}/${gameStatus.maxTurns} - ${gameStatus.category}`;
    }
}

// 지표 표시 업데이트
function updateIndicators(indicators) {
    const grid = document.getElementById('indicatorsGrid');
    if (!grid || !indicators) return;
    
    grid.innerHTML = '';

    Object.entries(indicators).forEach(([indicator, value]) => {
        let info;
        try {
            info = typeof GameData !== 'undefined' ? GameData.getIndicatorInfo(indicator) : null;
        } catch (error) {
            info = null;
        }
        
        if (!info) {
            // 백업 정보
            info = {
                name: indicator,
                description: indicator,
                color: '#ffffff'
            };
        }

        const item = document.createElement('div');
        item.className = 'indicator-item';
        
        const barWidth = Math.max(0, Math.min(100, ((value + 5) / 10) * 100));
        const barClass = value >= 0 ? 'positive' : 'negative';
        const displayValue = value > 0 ? `+${value}` : value.toString();

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
    const amountElement = document.getElementById('budgetAmount');
    if (amountElement) {
        amountElement.textContent = budget >= 0 ? `💰 ${budget}pt` : `💸 ${budget}pt (적자)`;
    }
    
    const statusElement = document.getElementById('budgetStatus');
    if (statusElement) {
        let status, text, className;
        
        if (budget >= 0) {
            status = 'safe';
            text = '✅ 안전';
            className = 'safe';
        } else if (budget >= debtLimit * 0.5) {
            status = 'warning';
            text = '⚠️ 주의';
            className = 'warning';
        } else {
            status = 'danger';
            text = '🚨 위험';
            className = 'danger';
        }
        
        statusElement.textContent = text;
        statusElement.className = `budget-status ${className}`;
    }
}

// 카테고리별 정책 로드
function loadPoliciesForCategory(category) {
    const title = document.getElementById('categoryTitle');
    if (title) {
        title.textContent = `📋 ${category} 정책`;
    }
    
    const grid = document.getElementById('policiesGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    // 간단한 더미 정책들 (GameData가 없을 때 백업)
    const dummyPolicies = [
        {
            정책명: `${category} 정책 A`,
            비용: 20,
            효과: { [Object.keys(INDICATORS_INFO || {})[0] || '경제']: 5 },
            정책_설명: `${category} 분야의 기본 정책입니다.`,
            예상_시민반응: "좋은 정책이네요! 👍"
        },
        {
            정책명: `${category} 정책 B`,
            비용: 25,
            효과: { [Object.keys(INDICATORS_INFO || {})[1] || '복지']: 8 },
            정책_설명: `${category} 분야의 고급 정책입니다.`,
            예상_시민반응: "이건 어떨지 모르겠어요 🤔"
        }
    ];

    let policies;
    try {
        policies = typeof GameData !== 'undefined' ? GameData.getPoliciesByCategory(category) : dummyPolicies;
    } catch (error) {
        policies = dummyPolicies;
    }

    if (!policies || policies.length === 0) {
        policies = dummyPolicies;
    }

    policies.forEach(policy => {
        const card = createPolicyCard(policy);
        grid.appendChild(card);
    });
}

// 정책 카드 생성 (간소화)
function createPolicyCard(policy) {
    const card = document.createElement('div');
    card.className = 'policy-card';
    card.onclick = () => togglePolicySelection(policy.정책명);

    const cost = policy.비용 || 20;
    const effects = policy.효과 || {};
    
    const effectItems = Object.entries(effects).map(([indicator, value]) => {
        const sign = value > 0 ? '+' : '';
        const effectClass = value > 0 ? 'positive' : 'negative';
        return `<div class="effect-item ${effectClass}">${indicator} ${sign}${value}</div>`;
    }).join('');

    card.innerHTML = `
        <div class="policy-header">
            <div class="policy-name">${policy.정책명}</div>
            <div class="policy-cost">${cost}pt</div>
        </div>
        <div class="policy-description">${policy.정책_설명 || '정책 설명'}</div>
        <div class="policy-effects">${effectItems}</div>
        <div class="citizen-preview">${policy.예상_시민반응 || '시민 반응'}</div>
    `;

    return card;
}

// 정책 선택 토글
function togglePolicySelection(policyName) {
    console.log('정책 선택 토글:', policyName);
    
    // 간단한 선택 로직 (gameAPI 없을 때 백업)
    const card = Array.from(document.querySelectorAll('.policy-card')).find(c => 
        c.querySelector('.policy-name').textContent === policyName
    );
    
    if (card) {
        if (card.classList.contains('selected')) {
            card.classList.remove('selected');
        } else {
            // 최대 2개까지만 선택 가능
            const selectedCards = document.querySelectorAll('.policy-card.selected');
            if (selectedCards.length < 2) {
                card.classList.add('selected');
            } else {
                alert('최대 2개 정책까지만 선택 가능합니다!');
            }
        }
        
        updateSelectionInfo();
    }
}

// 선택 정보 업데이트
function updateSelectionInfo() {
    const selectedCards = document.querySelectorAll('.policy-card.selected');
    const infoElement = document.getElementById('selectionInfo');
    if (infoElement) {
        infoElement.textContent = `${selectedCards.length}/2 선택됨`;
    }
    
    const confirmBtn = document.getElementById('confirmBtn');
    if (confirmBtn) {
        confirmBtn.disabled = selectedCards.length === 0;
    }
}

// 선택 초기화
function clearSelection() {
    document.querySelectorAll('.policy-card.selected').forEach(card => {
        card.classList.remove('selected');
    });
    updateSelectionInfo();
}

// 정책 확정
function confirmPolicies() {
    const selectedCards = document.querySelectorAll('.policy-card.selected');
    if (selectedCards.length === 0) {
        alert('선택된 정책이 없습니다!');
        return;
    }
    
    alert('정책이 확정되었습니다! (데모 버전)');
    
    // 간단한 다음 턴 진행
    setTimeout(() => {
        alert('게임이 완료되었습니다! (데모 버전)');
        showScreen('startScreen');
    }, 2000);
}

// 상태 바 업데이트
function updateStatusBar(message) {
    const statusElement = document.getElementById('gameStatus');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

// 도움말 표시
function showHelp() {
    showPopup('helpPopup');
}

function closeHelp() {
    hidePopup('helpPopup');
}

// 게임 재시작
function restartGame() {
    selectedNationName = null;
    
    const selectedElement = document.getElementById('selectedNation');
    if (selectedElement) {
        selectedElement.textContent = '국가를 선택해주세요';
    }
    
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.disabled = true;
    }
    
    document.querySelectorAll('.nation-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    showScreen('startScreen');
    updateStatusBar('게임 준비 완료');
}

// 안전한 초기화
console.log('🎨 UI 시스템 로딩 완료!');
