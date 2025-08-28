// 게임 상태 관리
class GameState {
    constructor() {
        this.currentNation = null;
        this.currentTurn = 1;
        this.maxTurns = GAME_CONFIG.total_turns;
        this.budget = 0;
        this.initialBudget = 0;
        this.debtLimit = 0;
        this.indicators = {};
        this.initialIndicators = {};
        this.selectedPolicies = [];
        this.turnHistory = [];
        this.currentSelection = [];
        this.gameActive = false;
        this.categoryStats = {
        '복지': 0,
        '경제': 0, 
        '환경': 0,
        '교육': 0,
        '외교': 0
    };
    }

    // 새 게임 시작
    startNewGame(nationName) {
        const nationData = GameData.getNation(nationName);
        if (!nationData) {
            throw new Error(`국가를 찾을 수 없습니다: ${nationName}`);
        }

        this.currentNation = nationName;
        this.currentTurn = 1;
        this.budget = nationData.initial_budget;
        this.initialBudget = nationData.initial_budget;
        this.debtLimit = nationData.debt_limit;
        this.indicators = { ...nationData.initialIndicators };
        this.initialIndicators = { ...nationData.initialIndicators };
        this.selectedPolicies = [];
        this.turnHistory = [];
        this.currentSelection = [];
        this.gameActive = true;
         this.categoryStats = {
        '복지': 0,
        '경제': 0,
        '환경': 0, 
        '교육': 0,
        '외교': 0
     };

       console.log(`새 게임 시작: ${nationName}`);
       console.log(`초기 예산: ${this.budget}pt`);
       console.log(`초기 지표:`, this.indicators);
    }

    // 현재 카테고리 가져오기
    getCurrentAvailableCategories() {
    return ['복지', '경제', '환경', '교육', '외교'];
    }

    // 카테고리에서 선택 가능한지 확인
    canSelectFromCategory(category) {
    // 규칙: 한 카테고리에서 게임 전체에 최대 4개까지
    return this.categoryStats[category] < 4;
    }

    // 정책이 속한 카테고리 찾기
findPolicyCategory(policyName) {
    // 기본 정책에서 찾기
    for (const [category, policies] of Object.entries(POLICIES_DATA)) {
        if (policies.some(p => p.정책명 === policyName)) {
            return category;
        }
    }
    
    // 긴급정책에서 찾기
    if (typeof EMERGENCY_POLICIES !== 'undefined') {
        for (const [category, policies] of Object.entries(EMERGENCY_POLICIES)) {
            if (policies.some(p => p.정책명 === policyName)) {
                return category;
            }
        }
    }
    
    return null;
}

    // 정책 선택
    selectPolicy(policyName) {
    if (this.currentSelection.length >= GAME_CONFIG.policies_per_turn) {
        throw new Error(`최대 ${GAME_CONFIG.policies_per_turn}개까지만 선택 가능합니다`);
    }

    if (this.currentSelection.includes(policyName)) {
        throw new Error('이미 선택된 정책입니다');
    }

    // 정책이 속한 카테고리 찾기
    const category = this.findPolicyCategory(policyName);
    if (!category) {
        throw new Error('정책을 찾을 수 없습니다');
    }

    // 카테고리 선택 제한 확인
    if (!this.canSelectFromCategory(category)) {
        throw new Error(`${category} 카테고리는 더 이상 선택할 수 없습니다 (최대 4개)`);
    }

    this.currentSelection.push(policyName);
    console.log(`정책 선택: ${policyName} (${category})`);
}

    // 정책 선택 취소
    deselectPolicy(policyName) {
        const index = this.currentSelection.indexOf(policyName);
        if (index > -1) {
            this.currentSelection.splice(index, 1);
            console.log(`정책 선택 취소: ${policyName}`);
        }
    }

    // 선택 초기화 - 추가된 메서드
    clearSelection() {
        this.currentSelection = [];
        console.log('정책 선택 초기화');
    }

    // 선택 가능한 정책이 있는지 확인
    hasSelectablePolicies() {
        // '자유선택' 모드이므로 모든 카테고리를 확인합니다.
        const allPolicies = Object.values(POLICIES_DATA).flat();
        
        return allPolicies.some(policy => {
            // 예산 확인
            const cost = this.calculatePolicyCost(policy);
            const canAfford = this.budget - cost >= this.debtLimit;
            
            // 요구조건 확인
            const requirementsMet = this.checkPolicyRequirements(policy);
            
            // 카테고리 선택 제한 확인
            const category = this.findPolicyCategory(policy.정책명);
            const canSelectCategory = this.canSelectFromCategory(category);
            
            return canAfford && requirementsMet && canSelectCategory;
        });
    }
    
    // 정책 요구조건 확인 (내부 메서드)
    checkPolicyRequirements(policy) {
        if (!policy.요구조건) return true;
        
        return Object.entries(policy.요구조건).every(([indicator, required]) => {
            const current = this.indicators[indicator] || 0;
            return current >= required;
        });
    }
    
    // 턴 스킵 (선택 가능한 정책이 없을 때)
    skipTurn() {
        console.log(`턴 ${this.currentTurn} 스킵 - 선택 가능한 정책 없음`);
        
        // 턴 스킵 페널티 적용
        const skipPenalty = {
            '시민 반응': -1,
            '안정성': -1
        };
        
        this.applyEffects(skipPenalty);
        
        // 턴 기록
        this.turnHistory.push({
            turn: this.currentTurn,
            category: '자유선택',
            policies: ['턴 스킵'],
            cost: 0,
            effects: skipPenalty,
            budgetAfter: this.budget,
            skipped: true
        });
        
        console.log('턴 스킵 페널티 적용:', skipPenalty);
        return { skipped: true, penalty: skipPenalty };
    }

    // 정책 확정
    confirmPolicies() {
    if (this.currentSelection.length === 0) {
        throw new Error('선택된 정책이 없습니다');
    }

    try {
        const result = this.calculatePolicyEffects(this.currentSelection);
        
        // 예산 차감
        this.budget -= result.totalCost;
        
        // 지표 적용
        this.applyEffects(result.totalEffects);
        
        // 예산 페널티 별도 확인
        this.checkAndApplyBudgetPenalty();
        
        // 카테고리별 통계 업데이트 (새로 추가)
        this.currentSelection.forEach(policyName => {
            const category = this.findPolicyCategory(policyName);
            if (category) {
                this.categoryStats[category]++;
            }
        });
        
        // 기록
        this.turnHistory.push({
            turn: this.currentTurn,
            category: '자유선택',
            policies: [...this.currentSelection],
            cost: result.totalCost,
            effects: result.totalEffects,
            budgetAfter: this.budget
        });

        this.selectedPolicies.push(...this.currentSelection);
        this.currentSelection = [];

        console.log(`턴 ${this.currentTurn} 정책 확정:`, result);
        console.log('카테고리별 선택 현황:', this.categoryStats);
        
        return result;
    } catch (error) {
        console.error('정책 확정 중 오류:', error);
        throw error;
    }
}

    // 정책 효과 계산
    calculatePolicyEffects(policyNames) {
        let totalCost = 0;
        let totalEffects = {};
        let interactions = [];

        // 개별 정책 효과 계산
        for (const policyName of policyNames) {
            const policy = GameData.findPolicy(policyName);
            if (!policy) {
                console.warn(`정책을 찾을 수 없습니다: ${policyName}`);
                continue;
            }

            // 비용 계산 (국가별 조정 적용)
            let cost = this.calculatePolicyCost(policy);
            totalCost += cost;

            // 효과 합산
            for (const [indicator, value] of Object.entries(policy.효과)) {
                totalEffects[indicator] = (totalEffects[indicator] || 0) + value;
            }
        }

        // 정책 간 상호작용 계산 (2개일 때만)
        if (policyNames.length === 2) {
            try {
                const interaction = this.calculatePolicyInteraction(policyNames[0], policyNames[1]);
                if (interaction.type !== 'none') {
                    interactions.push(interaction);
                    
                    // 상호작용에 따른 효과 조정
                    if (interaction.type === 'conflict') {
                        // 충돌: 효과 감소
                        for (const indicator in totalEffects) {
                            totalEffects[indicator] = Math.floor(totalEffects[indicator] * 0.8);
                        }
                        totalCost += 10; // 추가 비용
                    } else if (interaction.type === 'synergy') {
                        // 시너지: 효과 증가
                        for (const indicator in totalEffects) {
                            totalEffects[indicator] = Math.floor(totalEffects[indicator] * 1.2);
                        }
                        totalCost = Math.max(0, totalCost - 5); // 비용 절약
                    }
                }
            } catch (error) {
                console.warn('정책 상호작용 계산 중 오류:', error);
            }
        }

        return {
            policies: policyNames,
            totalCost,
            totalEffects,
            interactions,
            canAfford: this.budget - totalCost >= this.debtLimit
        };
    }

    // 국가별 정책 비용 계산
    calculatePolicyCost(policy) {
        let cost = policy.비용;

        // '자유선택' 모드이므로 카테고리별 비용 조정 로직 제거
        if (this.currentNation === '위기국가') {
            cost = Math.floor(cost * 1.2); // 20% 증가
        }

        return cost;
    }

    // 정책 상호작용 계산
    calculatePolicyInteraction(policy1Name, policy2Name) {
        try {
            if (policy1Name === policy2Name) {
                return { type: 'none', message: '' };
            }

            const policy1 = GameData.findPolicy(policy1Name);
            const policy2 = GameData.findPolicy(policy2Name);

            if (!policy1 || !policy2) {
                return { type: 'none', message: '' };
            }

            // 안전한 배열 접근
            const conflicts1 = policy1.충돌정책 || [];
            const conflicts2 = policy2.충돌정책 || [];
            const synergies1 = policy1.시너지정책 || [];
            const synergies2 = policy2.시너지정책 || [];

            // 충돌 확인
            if (conflicts1.includes(policy2Name) || conflicts2.includes(policy1Name)) {
                return {
                    type: 'conflict',
                    message: '⚠️ 정책 간 충돌이 발생했습니다. 효과가 감소하고 비용이 증가합니다.',
                    modifier: -0.2
                };
            }

            // 시너지 확인
            if (synergies1.includes(policy2Name) || synergies2.includes(policy1Name)) {
                return {
                    type: 'synergy',
                    message: '✨ 정책 간 시너지가 발생했습니다! 효과가 증가하고 비용이 절약됩니다.',
                    modifier: 0.2
                };
            }

            return { type: 'none', message: '' };
        } catch (error) {
            console.warn('정책 상호작용 계산 오류:', error);
            return { type: 'none', message: '' };
        }
    }

   // 효과 적용 (범위 제한 추가)
    applyEffects(effects) {
        for (const [indicator, value] of Object.entries(effects)) {
            if (this.indicators.hasOwnProperty(indicator)) {
                this.indicators[indicator] += value;
                // 🔧 지표 범위 제한: -5 ~ +5
                this.indicators[indicator] = Math.max(-5, Math.min(5, this.indicators[indicator]));
            }
        }
    }

    // 예산 페널티 별도 처리
    checkAndApplyBudgetPenalty() {
        if (this.budget < 0) {
            const penalty = GameData.getBudgetPenalty(this.budget);
            if (penalty && penalty.effects) {
                for (const [indicator, value] of Object.entries(penalty.effects)) {
                    if (this.indicators.hasOwnProperty(indicator)) {
                        this.indicators[indicator] += value;
                    }
                }
                console.log(`예산 페널티 적용: ${penalty.message}`);
            }
        }
    }

    // 다음 턴으로 진행
    nextTurn() {
        if (this.currentTurn >= this.maxTurns) {
            this.gameActive = false;
            return this.finishGame();
        }

        this.currentTurn++;
        this.currentSelection = [];
        console.log(`턴 ${this.currentTurn} 시작`);
        
        return {
            turn: this.currentTurn,
            category: '자유선택',
            budget: this.budget
        };
    }

     // 게임 종료 - 수정된 버전
    finishGame() {
        console.log('게임 종료 처리 시작');
        this.gameActive = false;
        
        const totalScore = Object.values(this.indicators).reduce((sum, val) => sum + val, 0);
        console.log('최종 점수 계산:', totalScore);
        
        let ending = null;
        try {
            ending = GameData.getEnding(totalScore, this.indicators);
            console.log('엔딩 결정:', ending);
        } catch (error) {
            console.warn('엔딩 결정 실패, 기본 엔딩 사용:', error);
            ending = {
                grade: 'C급',
                title: '발전 중인 국가',
                description: '아직 갈 길이 멀지만 변화의 기초를 다졌습니다.',
                citizen_reaction: '🤔 완전히 좋아진 건 아니지만... 변화는 느껴져요'
            };
        }
        
        console.log('게임 종료!');
        console.log(`최종 점수: ${totalScore}`);
        console.log(`엔딩: ${ending.grade} - ${ending.title}`);
        
        const result = {
            finished: true,
            totalScore,
            ending,
            finalIndicators: { ...this.indicators },
            selectedPolicies: [...this.selectedPolicies],
            turnHistory: [...this.turnHistory],
            nationName: this.currentNation,
            initialIndicators: { ...this.initialIndicators }
        };
        
        console.log('게임 종료 결과:', result);
        return result;
    }

    // 이벤트 발생 확인
    checkForEvents() {
        const events = GameData.getEventsForNation(this.currentNation);
        if (events.length === 0) return null;

        // 간단한 확률 계산 (20% 확률)
        if (Math.random() < 0.2) {
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            console.log(`이벤트 발생: ${randomEvent.title}`);
            return randomEvent;
        }

        return null;
    }

    // 이벤트 효과 적용
    applyEventEffect(event, choiceKey = null) {
        // 기본 효과 적용
        this.applyEffects(event.effects);

        // 선택지 효과 적용
        if (choiceKey && event.choices && event.choices[choiceKey]) {
            this.applyEffects(event.choices[choiceKey]);
            console.log(`이벤트 선택: ${choiceKey}`, event.choices[choiceKey]);
        }
        
        // 예산 페널티 별도 확인
        this.checkAndApplyBudgetPenalty();
    }

    // 게임 상태 요약
    getStatus() {
        return {
            nation: this.currentNation,
            turn: this.currentTurn,
            maxTurns: this.maxTurns,
            category: '자유선택',
            budget: this.budget,
            debtLimit: this.debtLimit,
            indicators: { ...this.indicators },
            currentSelection: [...this.currentSelection],
            categoryStats: { ...this.categoryStats },
            gameActive: this.gameActive,
            totalScore: Object.values(this.indicators).reduce((sum, val) => sum + val, 0)
        };
    }
}

// 전역 게임 상태 인스턴스
let gameState = null;
let isProcessingAction = false;

// 게임 API 함수들
function initializeGame() {
    gameState = new GameState();
    console.log('게임 시스템 초기화 완료');
}

// 수정된 startGame 함수 - 올바른 리턴값과 에러 처리
function startGame(nationName) {
    if (!gameState) initializeGame();
    
    try {
        gameState.startNewGame(nationName);
        const status = gameState.getStatus();
        console.log('게임 시작 성공:', status);
        return { success: true, status };
    } catch (error) {
        console.error('게임 시작 실패:', error);
        return { success: false, error: error.message };
    }
}

function selectPolicy(policyName) {
    if (!gameState || !gameState.gameActive) {
        return { success: false, error: '게임이 활성화되지 않았습니다' };
    }

    try {
        gameState.selectPolicy(policyName);
        return { success: true, selection: gameState.currentSelection };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deselectPolicy(policyName) {
    if (!gameState || !gameState.gameActive) {
        return { success: false, error: '게임이 활성화되지 않았습니다' };
    }

    gameState.deselectPolicy(policyName);
    return { success: true, selection: gameState.currentSelection };
}

// 수정된 clearPolicySelection 함수
function clearPolicySelection() {
    if (!gameState || !gameState.gameActive) {
        return { success: false, error: '게임이 활성화되지 않았습니다' };
    }

    gameState.clearSelection();
    return { success: true, selection: [] };
}

function calculateCurrentSelection() {
    if (!gameState || !gameState.gameActive) {
        return { success: false, error: '게임이 활성화되지 않았습니다' };
    }

    if (gameState.currentSelection.length === 0) {
        return { success: false, error: '선택된 정책이 없습니다' };
    }

    try {
        const result = gameState.calculatePolicyEffects(gameState.currentSelection);
        return { success: true, ...result };
    } catch (error) {
        console.error('정책 효과 계산 오류:', error);
        return { success: false, error: '정책 효과 계산 중 오류가 발생했습니다' };
    }
}

function checkTurnProgress() {
    if (!gameState || !gameState.gameActive) {
        return { success: false, error: '게임이 활성화되지 않았습니다' };
    }
    
    const hasSelectable = gameState.hasSelectablePolicies();
    
    return {
        success: true,
        hasSelectablePolicies: hasSelectable,
        canProgress: hasSelectable || gameState.currentSelection.length > 0
    };
}

function skipCurrentTurn() {
    if (!gameState || !gameState.gameActive) {
        return { success: false, error: '게임이 활성화되지 않았습니다' };
    }
    
    try {
        const result = gameState.skipTurn();
        return { success: true, ...result, status: gameState.getStatus() };
    } catch (error) {
        console.error('턴 스킵 오류:', error);
        return { success: false, error: error.message };
    }
}

function confirmPolicies() {
    if (!gameState || !gameState.gameActive) {
        return { success: false, error: '게임이 활성화되지 않았습니다' };
    }

    if (isProcessingAction) {
        return { success: false, error: '이미 처리 중입니다' };
    }

    try {
        isProcessingAction = true;
        const result = gameState.confirmPolicies();
        return { success: true, ...result, status: gameState.getStatus() };
    } catch (error) {
        console.error('정책 확정 오류:', error);
        return { success: false, error: error.message };
    } finally {
        isProcessingAction = false;
    }
}

function advanceToNextTurn() {
    if (!gameState || !gameState.gameActive) {
        return { success: false, error: '게임이 활성화되지 않았습니다' };
    }

    try {
        const result = gameState.nextTurn();
        return { success: true, ...result, status: gameState.getStatus() };
    } catch (error) {
        console.error('턴 진행 오류:', error);
        return { success: false, error: error.message };
    }
}

function triggerRandomEvent() {
    if (!gameState || !gameState.gameActive) {
        return null;
    }

    try {
        return gameState.checkForEvents();
    } catch (error) {
        console.error('이벤트 처리 오류:', error);
        return null;
    }
}

function applyEventChoice(event, choiceKey) {
    if (!gameState || !gameState.gameActive) {
        return { success: false, error: '게임이 활성화되지 않았습니다' };
    }

    try {
        gameState.applyEventEffect(event, choiceKey);
        return { success: true, status: gameState.getStatus() };
    } catch (error) {
        console.error('이벤트 적용 오류:', error);
        return { success: false, error: error.message };
    }
}

function getGameStatus() {
    if (!gameState) {
        return { active: false };
    }
    return { active: true, ...gameState.getStatus() };
}

function restartGame() {
    gameState = null;
    isProcessingAction = false;
    return { success: true };
}

// 유틸리티 함수들
function formatBudget(budget) {
    if (budget >= 0) {
        return `💰 ${budget}pt`;
    } else {
        return `💸 ${budget}pt (적자)`;
    }
}

function getBudgetStatus(budget, debtLimit) {
    if (budget >= 0) {
        return { status: 'safe', text: '✅ 안전', class: 'safe' };
    } else if (budget >= debtLimit * 0.5) {
        return { status: 'warning', text: '⚠️ 주의', class: 'warning' };
    } else {
        return { status: 'danger', text: '🚨 위험', class: 'danger' };
    }
}

function getIndicatorBarWidth(value) {
    const normalized = ((value + 5) / 10) * 100;
    return Math.max(0, Math.min(100, normalized));
}

function getIndicatorClass(value) {
    return value >= 0 ? 'positive' : 'negative';
}

function formatIndicatorValue(value) {
    if (value > 0) return `+${value}`;
    return value.toString();
}

function calculateCitizenSatisfaction(indicators) {
    const satisfaction = (
        indicators['시민 반응'] + 
        indicators['복지'] + 
        indicators['안정성']
    ) / 3;
    return Math.round(satisfaction * 10) / 10;
}

function calculateSustainability(indicators) {
    const sustainability = (
        indicators['환경'] + 
        indicators['재정'] + 
        indicators['안정성']
    ) / 3;
    return Math.round(sustainability * 10) / 10;
}

function generateEffectText(effects) {
    const effectTexts = [];
    
    Object.entries(effects).forEach(([indicator, value]) => {
        const info = GameData.getIndicatorInfo(indicator);
        if (info && value !== 0) {
            const sign = value > 0 ? '+' : '';
            effectTexts.push(`${info.name} ${sign}${value}`);
        }
    });
    
    return effectTexts.join(', ');
}

function checkPolicyRequirements(policy, indicators) {
    if (!policy.요구조건) return true;
    
    return Object.entries(policy.요구조건).every(([indicator, required]) => {
        const current = indicators[indicator] || 0;
        return current >= required;
    });
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toast-out 0.3s ease-in forwards';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function addAnimation(element, animationClass) {
    element.classList.add(animationClass);
    setTimeout(() => {
        element.classList.remove(animationClass);
    }, 500);
}

function playSound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'select':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                break;
            case 'confirm':
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                break;
            case 'error':
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                break;
            case 'success':
                oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(700, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(900, audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                break;
        }
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('Sound playback failed:', error);
    }
}

function saveGameToStorage() {
    if (!gameState) return;
    
    const saveData = {
        timestamp: Date.now(),
        gameState: gameState.getStatus(),
        turnHistory: gameState.turnHistory
    };
    
    try {
        localStorage.setItem('pixelPoliticsGame', JSON.stringify(saveData));
    } catch (error) {
        console.error('게임 저장 실패:', error);
    }
}

function loadGameFromStorage() {
    try {
        const saveData = localStorage.getItem('pixelPoliticsGame');
        if (saveData) {
            return JSON.parse(saveData);
        }
    } catch (error) {
        console.error('저장된 게임 로드 실패:', error);
    }
    return null;
}

function clearGameStorage() {
    try {
        localStorage.removeItem('pixelPoliticsGame');
    } catch (error) {
        console.error('저장된 게임 삭제 실패:', error);
    }
}

function calculateGameStats() {
    if (!gameState) return null;
    
    const status = gameState.getStatus();
    const totalChange = Object.entries(status.indicators).reduce((acc, [indicator, current]) => {
        const initial = gameState.initialIndicators[indicator] || 0;
        acc[indicator] = current - initial;
        return acc;
    }, {});
    
    const budgetUsed = gameState.initialBudget - status.budget;
    const budgetEfficiency = budgetUsed > 0 ? status.totalScore / budgetUsed : 0;
    
    return {
        totalScore: status.totalScore,
        budgetUsed,
        budgetEfficiency: Math.round(budgetEfficiency * 100) / 100,
        totalChange,
        citizenSatisfaction: calculateCitizenSatisfaction(status.indicators),
        sustainability: calculateSustainability(status.indicators),
        policiesSelected: gameState.selectedPolicies.length,
        turnsCompleted: gameState.currentTurn - 1
    };
}

function getDebugInfo() {
    if (!gameState) return 'No active game';
    
    return {
        gameActive: gameState.gameActive,
        currentTurn: gameState.currentTurn,
        currentNation: gameState.currentNation,
        budget: gameState.budget,
        indicators: gameState.indicators,
        selectedPolicies: gameState.selectedPolicies,
        currentSelection: gameState.currentSelection
    };
}

// 게임 초기화 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 픽셀 정치 시뮬레이터 로딩 완료!');
    console.log('게임 데이터:', {
        nations: Object.keys(NATIONS_DATA).length,
        policies: Object.values(POLICIES_DATA).reduce((sum, cat) => sum + cat.length, 0),
        indicators: Object.keys(INDICATORS_INFO).length
    });
});
// 통계 등급 계산 함수들 추가
function getEfficiencyGrade(value) {
    if (value >= 2.0) return { grade: 'S', text: '매우 효율적', color: '#333', bgColor: '#00ff88' };
    if (value >= 1.5) return { grade: 'A', text: '효율적', color: '#333', bgColor: '#88ff88' };
    if (value >= 1.0) return { grade: 'B', text: '보통', color: 'white', bgColor: '#ffaa00' };
    if (value >= 0.5) return { grade: 'C', text: '비효율적', color: 'white', bgColor: '#ff8888' };
    return { grade: 'D', text: '매우 비효율적', color: 'white', bgColor: '#ff4444' };
}

function getSatisfactionGrade(value) {
    if (value >= 2.0) return { grade: 'S', text: '매우 만족', color: '#333', bgColor: '#00ff88' };
    if (value >= 1.0) return { grade: 'A', text: '만족', color: '#333', bgColor: '#88ff88' };
    if (value >= 0.0) return { grade: 'B', text: '보통', color: 'white', bgColor: '#ffaa00' };
    if (value >= -1.0) return { grade: 'C', text: '불만', color: 'white', bgColor: '#ff8888' };
    return { grade: 'D', text: '매우 불만', color: 'white', bgColor: '#ff4444' };
}

function getSustainabilityGrade(value) {
    if (value >= 1.5) return { grade: 'S', text: '매우 지속가능', color: '#333', bgColor: '#00ff88' };
    if (value >= 0.5) return { grade: 'A', text: '지속가능', color: '#333', bgColor: '#88ff88' };
    if (value >= -0.5) return { grade: 'B', text: '보통', color: 'white', bgColor: '#ffaa00' };
    if (value >= -1.5) return { grade: 'C', text: '위험', color: 'white', bgColor: '#ff8888' };
    return { grade: 'D', text: '매우 위험', color: 'white', bgColor: '#ff4444' };
}

// 통계 설명 데이터
const STAT_EXPLANATIONS = {
    budgetEfficiency: {
        description: "투입한 예산 대비 얻은 성과를 나타냅니다",
        calculation: "총점 ÷ 사용한 예산",
        interpretations: {
            high: "적은 예산으로 큰 효과를 얻었습니다. 정책 선택이 매우 효율적이었습니다.",
            medium: "적정 수준의 예산 효율성을 보였습니다.",
            low: "예산 대비 성과가 부족합니다. 더 효율적인 정책 조합이 필요했습니다."
        },
        tips: [
            "시너지 효과가 있는 정책 조합을 선택하세요",
            "국가 특성에 맞는 할인 정책을 활용하세요", 
            "비용 대비 효과가 높은 정책을 우선 선택하세요"
        ]
    },
    citizenSatisfaction: {
        description: "국민들의 전반적인 만족도입니다",
        calculation: "(시민반응 + 복지 + 안정성) ÷ 3",
        interpretations: {
            high: "국민들이 정부 정책에 매우 만족하고 있습니다. 훌륭한 국정 운영입니다.",
            medium: "국민들이 정부에 대해 보통 수준의 만족도를 보이고 있습니다.",
            low: "국민들의 불만이 높습니다. 복지, 안정성 개선이 필요합니다."
        },
        realWorldContext: "실제 정치에서는 여론조사 지지율, 시민 만족도 조사 등으로 측정됩니다.",
        tips: [
            "복지 정책으로 직접적인 만족도를 향상시키세요",
            "사회 안정성 확보로 불안감을 해소하세요",
            "시민 반응을 고려한 정책을 선택하세요"
        ]
    },
    sustainability: {
        description: "현재 정책이 장기적으로 지속될 수 있는지를 나타냅니다",
        calculation: "(환경 + 재정 + 안정성) ÷ 3",
        interpretations: {
            high: "장기적으로 지속가능한 국가 운영 체계를 구축했습니다.",
            medium: "대체로 안정적이지만 일부 영역에서 개선이 필요합니다.",
            low: "현재 정책은 장기적으로 지속하기 어려울 수 있습니다."
        },
        realWorldContext: "UN의 지속가능발전목표(SDGs)와 유사한 개념입니다.",
        tips: [
            "환경 보호로 미래 세대를 고려하세요",
            "재정 건전성으로 경제적 지속성을 확보하세요",
            "사회 안정성으로 정치적 지속성을 보장하세요"
        ]
    }
};

// 해석 레벨 결정 함수
function getInterpretationLevel(value, type) {
    if (type === 'budgetEfficiency') {
        if (value >= 1.5) return 'high';
        if (value >= 0.8) return 'medium';
        return 'low';
    } else if (type === 'citizenSatisfaction') {
        if (value >= 1.0) return 'high';
        if (value >= -0.5) return 'medium';
        return 'low';
    } else if (type === 'sustainability') {
        if (value >= 0.5) return 'high';
        if (value >= -0.5) return 'medium';
        return 'low';
    }
    return 'medium';
}
// 전역 함수로 내보내기
window.gameAPI = {
    startGame,
    selectPolicy,
    deselectPolicy,
    clearPolicySelection,
    calculateCurrentSelection,
    confirmPolicies,
    advanceToNextTurn,
    checkTurnProgress,
    skipCurrentTurn,
    triggerRandomEvent,
    applyEventChoice,
    getGameStatus,
    restartGame,
    saveGameToStorage,
    loadGameFromStorage,
    clearGameStorage,
    calculateGameStats,
    getDebugInfo,
    canSelectFromCategory: (category) => {
        if (!gameState || !gameState.gameActive) return false;
        return gameState.canSelectFromCategory(category);
    },
    
    getCategoryStats: () => {
        if (!gameState) return {};
        return { ...gameState.categoryStats };
    },
    
    getAvailableCategories: () => {
        if (!gameState || !gameState.gameActive) return [];
        return gameState.getCurrentAvailableCategories();
    },
    
    findPolicyCategory: (policyName) => {
        if (!gameState) return null;
        return gameState.findPolicyCategory(policyName);
    },
    
    // 🔧 통계 등급 함수들 추가
    getEfficiencyGrade,
    getSatisfactionGrade, 
    getSustainabilityGrade,
    getStatExplanation: (statType) => STAT_EXPLANATIONS[statType],
    getInterpretationLevel
};

window.gameUtils = {
    formatBudget,
    getBudgetStatus,
    getIndicatorClass,
    formatIndicatorValue,
    generateEffectText,
    checkPolicyRequirements,
    showToast,
    addAnimation,
    playSound,
    getIndicatorBarWidth: (value, allValues = []) => {
        if (allValues.length > 0) {
            const min = Math.min(...allValues);
            const max = Math.max(...allValues);
            const range = Math.max(20, max - min);
            const center = (max + min) / 2;
            const normalized = ((value - (center - range/2)) / range) * 100;
            return Math.max(0, Math.min(100, normalized));
        } else {
            // 기본 범위 -15~+15
            const normalized = ((value + 15) / 30) * 100;
            return Math.max(0, Math.min(100, normalized));
        }
    }
};





