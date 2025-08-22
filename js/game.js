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

        console.log(`새 게임 시작: ${nationName}`);
        console.log(`초기 예산: ${this.budget}pt`);
        console.log(`초기 지표:`, this.indicators);
    }

    // 현재 카테고리 가져오기
    getCurrentCategory() {
        if (this.currentTurn <= GAME_CONFIG.category_order.length) {
            return GAME_CONFIG.category_order[this.currentTurn - 1];
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

        this.currentSelection.push(policyName);
        console.log(`정책 선택: ${policyName}`);
    }

    // 정책 선택 취소
    deselectPolicy(policyName) {
        const index = this.currentSelection.indexOf(policyName);
        if (index > -1) {
            this.currentSelection.splice(index, 1);
            console.log(`정책 선택 취소: ${policyName}`);
        }
    }

    // 선택 초기화
    clearSelection() {
        this.currentSelection = [];
        console.log('정책 선택 초기화');
    }

    // 정책 확정
    confirmPolicies() {
        if (this.currentSelection.length === 0) {
            throw new Error('선택된 정책이 없습니다');
        }

        const result = this.calculatePolicyEffects(this.currentSelection);
        
        // 예산 차감
        this.budget -= result.totalCost;
        
        // 지표 적용
        this.applyEffects(result.totalEffects);
        
        // 기록
        this.turnHistory.push({
            turn: this.currentTurn,
            category: this.getCurrentCategory(),
            policies: [...this.currentSelection],
            cost: result.totalCost,
            effects: result.totalEffects,
            budgetAfter: this.budget
        });

        this.selectedPolicies.push(...this.currentSelection);
        this.currentSelection = [];

        console.log(`턴 ${this.currentTurn} 정책 확정:`, result);
        
        return result;
    }

    // 정책 효과 계산
    calculatePolicyEffects(policyNames) {
        let totalCost = 0;
        let totalEffects = {};
        let interactions = [];

        // 개별 정책 효과 계산
        policyNames.forEach(policyName => {
            const policy = GameData.findPolicy(policyName);
            if (!policy) return;

            // 비용 계산 (국가별 조정 적용)
            let cost = this.calculatePolicyCost(policy);
            totalCost += cost;

            // 효과 합산
            Object.entries(policy.효과).forEach(([indicator, value]) => {
                totalEffects[indicator] = (totalEffects[indicator] || 0) + value;
            });
        });

        // 정책 간 상호작용 계산
        if (policyNames.length === 2) {
            const interaction = this.calculatePolicyInteraction(policyNames[0], policyNames[1]);
            if (interaction.type !== 'none') {
                interactions.push(interaction);
                
                // 상호작용에 따른 효과 조정
                if (interaction.type === 'conflict') {
                    // 충돌: 효과 감소
                    Object.keys(totalEffects).forEach(indicator => {
                        totalEffects[indicator] = Math.floor(totalEffects[indicator] * 0.8);
                    });
                    totalCost += 10; // 추가 비용
                } else if (interaction.type === 'synergy') {
                    // 시너지: 효과 증가
                    Object.keys(totalEffects).forEach(indicator => {
                        totalEffects[indicator] = Math.floor(totalEffects[indicator] * 1.2);
                    });
                    totalCost -= 5; // 비용 절약
                }
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
        const nationData = GameData.getNation(this.currentNation);
        let cost = policy.비용;

        // 국가별 비용 조정 (간소화된 버전)
        if (this.currentNation === '복지 강국' && this.getCurrentCategory() === '복지') {
            cost = Math.floor(cost * 0.85); // 15% 할인
        } else if (this.currentNation === '기술 선진국' && this.getCurrentCategory() === '복지') {
            cost = Math.floor(cost * 1.3); // 30% 증가
        } else if (this.currentNation === '위기국가') {
            cost = Math.floor(cost * 1.2); // 20% 증가
        }

        return cost;
    }

    // 정책 상호작용 계산
    calculatePolicyInteraction(policy1Name, policy2Name) {
        const policy1 = GameData.findPolicy(policy1Name);
        const policy2 = GameData.findPolicy(policy2Name);

        if (!policy1 || !policy2) {
            return { type: 'none', message: '' };
        }

        // 충돌 확인
        if (policy1.충돌정책.includes(policy2Name) || policy2.충돌정책.includes(policy1Name)) {
            return {
                type: 'conflict',
                message: '⚠️ 정책 간 충돌이 발생했습니다. 효과가 감소하고 비용이 증가합니다.',
                modifier: -0.2
            };
        }

        // 시너지 확인
        if (policy1.시너지정책.includes(policy2Name) || policy2.시너지정책.includes(policy1Name)) {
            return {
                type: 'synergy',
                message: '✨ 정책 간 시너지가 발생했습니다! 효과가 증가하고 비용이 절약됩니다.',
                modifier: 0.2
            };
        }

        return { type: 'none', message: '' };
    }

    // 효과 적용
    applyEffects(effects) {
        Object.entries(effects).forEach(([indicator, value]) => {
            if (this.indicators.hasOwnProperty(indicator)) {
                this.indicators[indicator] = Math.max(
                    GAME_CONFIG.min_indicator_value,
                    Math.min(GAME_CONFIG.max_indicator_value, this.indicators[indicator] + value)
                );
            }
        });

        // 예산 페널티 적용
        if (this.budget < 0) {
            const penalty = GameData.getBudgetPenalty(this.budget);
            if (penalty) {
                this.applyEffects(penalty.effects);
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
            category: this.getCurrentCategory(),
            budget: this.budget
        };
    }

    // 게임 종료
    finishGame() {
        this.gameActive = false;
        const totalScore = Object.values(this.indicators).reduce((sum, val) => sum + val, 0);
        const ending = GameData.getEnding(totalScore, this.indicators);
        
        console.log('게임 종료!');
        console.log(`최종 점수: ${totalScore}`);
        console.log(`엔딩: ${ending.grade} - ${ending.title}`);
        
        return {
            finished: true,
            totalScore,
            ending,
            finalIndicators: { ...this.indicators },
            selectedPolicies: [...this.selectedPolicies],
            turnHistory: [...this.turnHistory]
        };
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
    }

    // 게임 상태 요약
    getStatus() {
        return {
            nation: this.currentNation,
            turn: this.currentTurn,
            maxTurns: this.maxTurns,
            category: this.getCurrentCategory(),
            budget: this.budget,
            debtLimit: this.debtLimit,
            indicators: { ...this.indicators },
            currentSelection: [...this.currentSelection],
            gameActive: this.gameActive,
            totalScore: Object.values(this.indicators).reduce((sum, val) => sum + val, 0)
        };
    }
}

// 전역 게임 상태 인스턴스
let gameState = null;

// 게임 API 함수들
function initializeGame() {
    gameState = new GameState();
    console.log('게임 시스템 초기화 완료');
}

function startGame(nationName) {
    if (!gameState) initializeGame();
    
    try {
        gameState.startNewGame(nationName);
        return { success: true, status: gameState.getStatus() };
    } catch (error) {
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

    const result = gameState.calculatePolicyEffects(gameState.currentSelection);
    return { success: true, ...result };
}

function confirmPolicies() {
    if (!gameState || !gameState.gameActive) {
        return { success: false, error: '게임이 활성화되지 않았습니다' };
    }

    try {
        const result = gameState.confirmPolicies();
        return { success: true, ...result, status: gameState.getStatus() };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function advanceToNextTurn() {
    if (!gameState || !gameState.gameActive) {
        return { success: false, error: '게임이 활성화되지 않았습니다' };
    }

    const result = gameState.nextTurn();
    return { success: true, ...result, status: gameState.getStatus() };
}

function triggerRandomEvent() {
    if (!gameState || !gameState.gameActive) {
        return null;
    }

    return gameState.checkForEvents();
}

function applyEventChoice(event, choiceKey) {
    if (!gameState || !gameState.gameActive) {
        return { success: false, error: '게임이 활성화되지 않았습니다' };
    }

    try {
        gameState.applyEventEffect(event, choiceKey);
        return { success: true, status: gameState.getStatus() };
    } catch (error) {
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
    // -5 ~ 5 범위를 0 ~ 100% 로 변환
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

// 효과 텍스트 생성
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

// 정책 요구조건 확인
function checkPolicyRequirements(policy, indicators) {
    if (!policy.요구조건) return true;
    
    return Object.entries(policy.요구조건).every(([indicator, required]) => {
        const current = indicators[indicator] || 0;
        return current >= required;
    });
}

// 토스트 알림 표시
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toast-out 0.3s ease-in forwards';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 애니메이션 효과
function addAnimation(element, animationClass) {
    element.classList.add(animationClass);
    setTimeout(() => {
        element.classList.remove(animationClass);
    }, 500);
}

// 사운드 효과 (간단한 구현)
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

// 로컬 스토리지 관리
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

// 게임 통계
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

// 디버그 정보
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

// 전역 함수로 내보내기
window.gameAPI = {
    startGame,
    selectPolicy,
    deselectPolicy,
    clearPolicySelection,
    calculateCurrentSelection,
    confirmPolicies,
    advanceToNextTurn,
    triggerRandomEvent,
    applyEventChoice,
    getGameStatus,
    restartGame,
    saveGameToStorage,
    loadGameFromStorage,
    clearGameStorage,
    calculateGameStats,
    getDebugInfo
};

window.gameUtils = {
    formatBudget,
    getBudgetStatus,
    getIndicatorBarWidth,
    getIndicatorClass,
    formatIndicatorValue,
    generateEffectText,
    checkPolicyRequirements,
    showToast,
    addAnimation,
    playSound
};