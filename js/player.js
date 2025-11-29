// Player Class - 플레이어 상태 및 액션 관리
class Player {
    constructor(playerId, x, y) {
        this.id = playerId;
        this.x = x;
        this.y = y;

        // 기본 스탯
        this.health = 100;
        this.maxHealth = 100;
        this.stamina = 100;
        this.maxStamina = 100;

        // 상태
        this.state = 'neutral'; // neutral, attack, defense, evading
        this.currentAction = null;

        // 타이밍 관련
        this.actionStartTime = 0;
        this.stateTimer = 0;
        this.staminaRecoveryTimer = 0;

        // 방어 관련
        this.isDefending = false;
        this.defenseDirection = 'neutral'; // neutral, up, down, left, right

        // 회피 관련 (새로운 시스템)
        this.isEvading = false;
        this.evasionTimer = 0;
        this.evasionDirection = null; // 'left' or 'right'
    }

    // 플레이어 상태 업데이트
    update(time, delta) {
        this.updateTimers(delta);
        this.updateStamina(delta);
        this.updateState(time);
    }

    // 타이머 업데이트
    updateTimers(delta) {
        if (this.stateTimer > 0) {
            this.stateTimer -= delta;
            if (this.stateTimer <= 0) {
                this.returnToNeutral();
            }
        }

        // 회피 타이머
        if (this.evasionTimer > 0) {
            this.evasionTimer -= delta;
            if (this.evasionTimer <= 0) {
                this.isEvading = false;
                this.evasionDirection = null;
            }
        }

        // 스태미너 회복 타이머 (항상 회복)
        if (this.stamina < this.maxStamina) {
            this.staminaRecoveryTimer += delta;
            if (this.staminaRecoveryTimer >= 100) { // 0.1초마다
                this.stamina = Math.min(this.maxStamina, this.stamina + 1);
                this.staminaRecoveryTimer = 0;
            }
        } else {
            this.staminaRecoveryTimer = 0;
        }
    }

    // 스태미너 시스템 업데이트
    updateStamina(delta) {
        // 스태미너가 0이면 강제로 중립 상태 유지
        if (this.stamina <= 0 && this.state !== 'neutral') {
            this.returnToNeutral();
        }
    }

    // 상태 업데이트
    updateState(time) {
        switch (this.state) {
            case 'attack':
                // 공격 지속 시간 체크
                break;
            case 'defense':
                // 방어 상태 유지 (키 입력에 따라)
                break;
            case 'evading':
                // 회피 상태 (evasionTimer로 관리)
                break;
        }
    }


    // 공격 실행
    performAttack(attackType) {
        if (!this.canAct()) {
            debugLog(`Player ${this.id} cannot act - state: ${this.state}, stamina: ${this.stamina}`);
            return false;
        }

        const attackData = this.getAttackData(attackType);
        if (this.stamina < attackData.staminaCost) {
            debugLog(`Player ${this.id} insufficient stamina for ${attackType} - need: ${attackData.staminaCost}, have: ${this.stamina}`);
            return false;
        }

        debugLog(`Player ${this.id} executes ${attackType} attack`);
        this.state = 'attack';
        this.currentAction = attackType;
        this.stamina -= attackData.staminaCost;
        this.stateTimer = attackData.duration || 300;
        this.actionStartTime = Date.now();

        return true;
    }

    // 회피 실행 (스틸컷만 표시 + 0.3초 무적, 이동 없음)
    startEvasion(direction) {
        const stepAction = direction === 'left' ? 'leftStep' : 'rightStep';
        const evasionData = this.getAttackData(stepAction);

        if (this.stamina < evasionData.staminaCost) {
            debugLog(`Player ${this.id} insufficient stamina for evasion`);
            return false;
        }

        // 회피 상태로 설정
        this.state = 'evading';
        this.currentAction = stepAction;  // 'leftStep' 또는 'rightStep'
        this.actionStartTime = Date.now();
        this.stateTimer = evasionData.duration || 300;

        this.isEvading = true;
        this.evasionTimer = 300; // 0.3초 동안 회피 무적
        this.evasionDirection = direction;
        this.stamina -= evasionData.staminaCost;

        debugLog(`Player ${this.id} evades to ${direction} - action: ${stepAction} (no movement)`);
        return true;
    }

    // 방어 실행
    performDefense(defenseDirection, isHolding = false) {
        // 방어는 스태미너 소모 없음
        this.state = 'defense';
        this.isDefending = true;
        this.defenseDirection = defenseDirection; // 'neutral', 'up', 'down', 'left', 'right'

        debugLog(`Player ${this.id} defends: ${defenseDirection}`);
        return true;
    }


    // 피격 처리
    takeDamage(damage, attackType) {
        // 회피 중이고 잽/스트레이트면 완전 무효화
        if (this.isEvading && (attackType === 'jab' || attackType === 'straight')) {
            debugLog(`Player ${this.id} evades ${attackType}!`);
            return { damage: 0, type: 'evaded' };
        }

        // 방어 체크
        const defense = this.checkDefense(attackType);

        let finalDamage = Math.floor(damage * defense.damageRate);
        let hitType = 'hit';

        // 방어 성공 여부 판단
        if (defense.damageRate === 0.2) {
            hitType = 'blocked';
        }

        this.health = Math.max(0, this.health - finalDamage);

        // hit state 제거 - 경직 없이 즉시 행동 가능

        return { damage: finalDamage, type: hitType };
    }

    // 방어 체크 (새로운 매칭 시스템)
    checkDefense(attackType) {
        if (!this.isDefending) return { damageRate: 1.0 };

        // 방어 매칭 규칙
        const defenseMap = {
            'jab': ['up', 'down'],        // 위, 아래 방향키로 방어
            'straight': ['up', 'down'],   // 위, 아래 방향키로 방어
            'leftHook': ['left'],         // 스페이스+좌만 방어
            'rightHook': ['right']        // 스페이스+우만 방어
        };

        if (defenseMap[attackType]?.includes(this.defenseDirection)) {
            debugLog(`Player ${this.id} blocks ${attackType} with ${this.defenseDirection} (20% damage)`);
            return { damageRate: 0.2 }; // 20%만 받음
        }

        debugLog(`Player ${this.id} fails to block ${attackType} with ${this.defenseDirection}`);
        return { damageRate: 1.0 }; // 방어 실패
    }

    // 행동 가능 여부 체크
    canAct() {
        return this.state === 'neutral' && this.stamina > 0;
    }

    // 중립 상태로 복귀
    returnToNeutral() {
        this.state = 'neutral';
        this.currentAction = null;
        this.isDefending = false;
        this.defenseDirection = 'neutral';
        this.stateTimer = 0;
    }


    // 공격 데이터 가져오기 (간소화된 시스템)
    getAttackData(attackType) {
        const attackData = {
            'jab': { damage: 8, staminaCost: 15, duration: 300 },
            'straight': { damage: 10, staminaCost: 20, duration: 300 },
            'leftHook': { damage: 12, staminaCost: 20, duration: 300 },
            'rightHook': { damage: 12, staminaCost: 20, duration: 300 },
            'leftStep': { damage: 0, staminaCost: 7, duration: 300 },    // 좌측 이동 (회피)
            'rightStep': { damage: 0, staminaCost: 7, duration: 300 }     // 우측 이동 (회피)
        };

        return attackData[attackType] || attackData['jab'];
    }

    // 현재 상태 가져오기
    getState() {
        return {
            id: this.id,
            health: this.health,
            stamina: this.stamina,
            state: this.state,
            action: this.currentAction,
            canAct: this.canAct(),
            isDefending: this.isDefending,
            defenseDirection: this.defenseDirection,
            isEvading: this.isEvading,
            evasionDirection: this.evasionDirection
        };
    }
}