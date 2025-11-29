// Input Manager - 키 입력 처리 및 플레이어 액션 연결
class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.keys = {};
        this.inputBuffer = {
            player1: [],
            player2: []
        };

        // 키 상태 추적
        this.keyStates = {
            player1: {
                w: false, a: false, s: false, d: false, shift: false
            },
            player2: {
                up: false, down: false, left: false, right: false, space: false
            }
        };

        this.setupKeyboardInput();
        this.lastInputTime = { player1: 0, player2: 0 };

        // 2회 연타 시스템 (훅 발동용)
        this.lastMoveInput = {
            player1: { key: null, time: 0 },
            player2: { key: null, time: 0 }
        };

        // 디버깅 시스템
        this.debugMode = false;
        this.debugUI = null;
        this.recentActions = [];
        this.setupDebugMode();
    }

    setupDebugMode() {
        // Cmd+Shift+T 조합키로 디버그 모드 토글
        this.scene.input.keyboard.on('keydown', (event) => {
            // Cmd(Meta) + Shift + T
            if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 't') {
                this.toggleDebugMode();
            }
        });
    }

    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        window.DEBUG_MODE = this.debugMode;  // 전역 플래그 동기화

        if (this.debugMode) {
            this.createDebugUI();
            debugLog('=== 키 입력 디버깅 모드 활성화 ===');
            debugLog('🕒 연속 키 입력 타이밍이 ms 단위로 표시됩니다.');
            debugLog('✅ 300ms 이내 = 성공, ❌ 300ms 초과 = 실패');
            debugLog('Cmd+Shift+T: 디버그 모드 토글');
        } else {
            this.destroyDebugUI();
            debugLog('=== 키 입력 디버깅 모드 비활성화 ===');
        }
    }

    createDebugUI() {
        // 디버그 모드 라벨
        this.debugUI = {
            label: this.scene.add.text(10, 600, '🐛 DEBUG MODE', {
                fontSize: '16px',
                fill: '#ff0000',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                backgroundColor: '#000000',
                padding: { x: 5, y: 3 }
            }),
            
            // 플레이어 1 액션 표시
            player1Actions: this.scene.add.text(10, 630, 'P1 Actions:', {
                fontSize: '14px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                backgroundColor: '#000000',
                padding: { x: 5, y: 3 }
            }),
            
            // 플레이어 2 액션 표시  
            player2Actions: this.scene.add.text(600, 630, 'P2 Actions:', {
                fontSize: '14px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                backgroundColor: '#000000',
                padding: { x: 5, y: 3 }
            }),
            
            // 2회 연타 상태 표시
            doubleInputStatus: this.scene.add.text(10, 700, 'Double Input Status:', {
                fontSize: '14px',
                fill: '#ffff00',
                fontFamily: 'Arial',
                backgroundColor: '#000000',
                padding: { x: 5, y: 3 }
            })
        };
    }

    destroyDebugUI() {
        if (this.debugUI) {
            Object.values(this.debugUI).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.debugUI = null;
        }
    }

    // 액션 기록
    recordAction(player, action, type = 'action') {
        const timestamp = Date.now();
        this.recentActions.push({
            player,
            action,
            type,
            time: timestamp
        });
        
        // 최근 10개만 유지
        if (this.recentActions.length > 20) {
            this.recentActions.shift();
        }
        
        this.updateDebugUI();

        // 콘솔에도 출력
        const timeStr = new Date(timestamp).toLocaleTimeString();
        debugLog(`[${timeStr}] ${player}: ${action} (${type})`);
    }

    updateDebugUI() {
        if (!this.debugMode || !this.debugUI) return;
        
        // 최근 액션들을 플레이어별로 분류 (타이밍 정보 강조)
        const player1Actions = this.recentActions
            .filter(action => action.player === 'player1')
            .slice(-5)  // 최근 5개
            .map(action => {
                if (action.type === 'timing') {
                    return `🕒 ${action.action}`;  // 타이밍 정보 강조
                }
                return `${action.action} (${action.type})`;
            })
            .join('\n');
            
        const player2Actions = this.recentActions
            .filter(action => action.player === 'player2')
            .slice(-5)  // 최근 5개
            .map(action => {
                if (action.type === 'timing') {
                    return `🕒 ${action.action}`;  // 타이밍 정보 강조
                }
                return `${action.action} (${action.type})`;
            })
            .join('\n');
        
        this.debugUI.player1Actions.setText(`P1 Actions:\n${player1Actions || '(none)'}`);
        this.debugUI.player2Actions.setText(`P2 Actions:\n${player2Actions || '(none)'}`);

        // 2회 연타 상태
        const p1Last = this.lastMoveInput.player1;
        const p2Last = this.lastMoveInput.player2;
        const p1Status = p1Last.key ? `P1: ${p1Last.key} (${Date.now() - p1Last.time}ms ago)` : 'P1: none';
        const p2Status = p2Last.key ? `P2: ${p2Last.key} (${Date.now() - p2Last.time}ms ago)` : 'P2: none';

        this.debugUI.doubleInputStatus.setText(`Double Input:\n${p1Status}\n${p2Status}`);
    }

    setupKeyboardInput() {
        // Player 1 키 설정 (WASD + Shift) - 왼쪽 화면
        this.keys.player1 = {
            w: this.scene.input.keyboard.addKey('W'),
            a: this.scene.input.keyboard.addKey('A'),
            s: this.scene.input.keyboard.addKey('S'),
            d: this.scene.input.keyboard.addKey('D'),
            shift: this.scene.input.keyboard.addKey('SHIFT')
        };

        // Player 2 키 설정 (방향키 + 스페이스) - 오른쪽 화면
        this.keys.player2 = {
            up: this.scene.input.keyboard.addKey('UP'),
            down: this.scene.input.keyboard.addKey('DOWN'),
            left: this.scene.input.keyboard.addKey('LEFT'),
            right: this.scene.input.keyboard.addKey('RIGHT'),
            space: this.scene.input.keyboard.addKey('SPACE')
        };

        // 키 이벤트 리스너 설정
        this.setupKeyEvents();
    }

    setupKeyEvents() {
        // Player 1 키 이벤트
        Object.keys(this.keys.player1).forEach(key => {
            this.keys.player1[key].on('down', () => {
                this.handleKeyDown('player1', key);
            });
            
            this.keys.player1[key].on('up', () => {
                this.handleKeyUp('player1', key);
            });
        });

        // Player 2 키 이벤트
        Object.keys(this.keys.player2).forEach(key => {
            this.keys.player2[key].on('down', () => {
                this.handleKeyDown('player2', key);
            });
            
            this.keys.player2[key].on('up', () => {
                this.handleKeyUp('player2', key);
            });
        });
    }

    handleKeyDown(player, key) {
        const currentTime = Date.now();
        this.keyStates[player][key] = true;
        
        // 키 입력 기록
        this.recordAction(player, `Key Down: ${key.toUpperCase()}`, 'input');

        // 입력 우선순위: 방어 > 공격
        if (this.isDefenseKey(player, key)) {
            this.handleDefenseInput(player, key, currentTime);
        } else if (this.isAttackKey(player, key)) {
            // 방어 중이 아닐 때만 공격 허용
            if (!this.isDefending(player)) {
                this.handleAttackInput(player, key, currentTime);
            } else {
                this.recordAction(player, `Attack blocked (defending)`, 'blocked');
            }
        }
    }

    handleKeyUp(player, key) {
        this.keyStates[player][key] = false;

        // 방어 키를 뗐을 때 방어 해제
        if (this.isDefenseKey(player, key)) {
            this.handleDefenseRelease(player, key);
        }
    }

    // 방어 키 체크
    isDefenseKey(player, key) {
        if (player === 'player1') {
            return key === 'shift' || (this.keyStates[player].shift && key !== 'shift');
        } else {
            return key === 'space' || (this.keyStates[player].space && key !== 'space');
        }
    }

    // 공격 키 체크
    isAttackKey(player, key) {
        const attackKeys = {
            'player1': ['w', 'a', 's', 'd'],
            'player2': ['up', 'down', 'left', 'right']
        };
        return attackKeys[player].includes(key);
    }

    // 현재 방어 중인지 체크
    isDefending(player) {
        return this.keyStates[player][player === 'player1' ? 'shift' : 'space'];
    }

    // 공격 입력 처리 (간소화된 시스템)
    handleAttackInput(player, key, time) {
        const playerObj = this.getPlayerObject(player);
        if (!playerObj) return;

        // 입력 버퍼에 추가
        this.inputBuffer[player].push({ key, time });

        // 이동 키인지 체크 (2회 연타 훅 시스템)
        const moveKeys = {
            'player1': ['a', 'd'],
            'player2': ['left', 'right']
        };

        if (moveKeys[player].includes(key)) {
            this.handleMoveInput(player, key, time);
            return;
        }

        // 일반 공격 처리
        if (!playerObj.canAct()) {
            this.recordAction(player, `Cannot act - state: ${playerObj.state}`, 'blocked');
            return;
        }

        const attack = this.getAttackFromInput(player, key);
        if (attack) {
            playerObj.performAttack(attack);
            this.recordAction(player, `Attack: ${attack}`, 'attack');
        } else {
            this.recordAction(player, `No attack mapped for key: ${key}`, 'info');
        }
    }

    // 이동 입력 처리 (첫 입력=스탭, 300ms 이내 재입력=훅)
    handleMoveInput(player, key, time) {
        const playerObj = this.getPlayerObject(player);
        if (!playerObj) return;

        const last = this.lastMoveInput[player];
        const timeDiff = time - last.time;

        if (last.key === key && timeDiff <= 300) {
            // 2회 연타 성공 → 스탭에서 훅으로 전환
            const hookType = (key === 'a' || key === 'left') ? 'leftHook' : 'rightHook';
            this.recordAction(player, `Double tap ${key} (${timeDiff}ms) → ${hookType}`, 'hook');

            // 현재 상태 강제 중립으로 만들고 훅 실행
            playerObj.returnToNeutral();

            // 훅 공격 실행 (이동 없음, 스틸컷만)
            const success = playerObj.performAttack(hookType);
            if (success) {
                // actionStartTime 재설정하여 데미지/이펙트 정상 적용
                playerObj.actionStartTime = Date.now();
                debugLog(`Player ${playerObj.id} performs ${hookType} (step→hook transition, no movement)`);
            } else {
                this.recordAction(player, `Hook failed - stamina: ${playerObj.stamina}`, 'blocked');
            }

            // 연타 기록 초기화
            this.lastMoveInput[player] = { key: null, time: 0 };
        } else {
            // 첫 번째 입력 → 스탭 실행 (회피 무적 + 스틸컷)
            if (playerObj.canAct()) {
                const direction = (key === 'a' || key === 'left') ? 'left' : 'right';
                const success = playerObj.startEvasion(direction);

                if (success) {
                    this.recordAction(player, `Step: ${key} (evading, waiting for hook)`, 'evading');
                    // 연타 추적 갱신
                    this.lastMoveInput[player] = { key, time };
                } else {
                    this.recordAction(player, `Step failed - stamina: ${playerObj.stamina}`, 'blocked');
                }
            } else {
                this.recordAction(player, `Cannot move - state: ${playerObj.state}`, 'blocked');
            }
        }

        this.updateDebugUI();
    }

    // 방어 입력 처리
    handleDefenseInput(player, key, time) {
        const playerObj = this.getPlayerObject(player);
        if (!playerObj) return;

        const defenseAction = this.getDefenseFromInput(player, key);
        if (defenseAction) {
            playerObj.performDefense(defenseAction.direction, defenseAction.isHolding);
            this.recordAction(player, `Defense: ${defenseAction.direction}`, 'defense');
        } else {
            this.recordAction(player, `Defense key pressed but no action: ${key}`, 'info');
        }
    }

    // 방어 해제 처리
    handleDefenseRelease(player, key) {
        const playerObj = this.getPlayerObject(player);
        if (!playerObj) return;

        // 방어 중이었다면, 방어 조건을 체크해서 해제
        if (playerObj.isDefending) {
            if (!this.hasActiveDefenseKeys(player)) {
                playerObj.returnToNeutral();
                this.recordAction(player, 'Defense released', 'defense');
            }
        }
    }

    // 활성 방어 키가 있는지 체크 (Space/Shift + 방향키 모두 필요)
    hasActiveDefenseKeys(player) {
        if (player === 'player1') {
            // Shift가 눌려있고, 방향키 중 하나라도 눌려있어야 방어 유지
            const hasDefenseKey = this.keyStates[player].shift;
            const hasDirectionKey = this.keyStates[player].w ||
                                   this.keyStates[player].a ||
                                   this.keyStates[player].s ||
                                   this.keyStates[player].d;
            return hasDefenseKey && hasDirectionKey;
        } else {
            // Space가 눌려있고, 방향키 중 하나라도 눌려있어야 방어 유지
            const hasDefenseKey = this.keyStates[player].space;
            const hasDirectionKey = this.keyStates[player].up ||
                                   this.keyStates[player].down ||
                                   this.keyStates[player].left ||
                                   this.keyStates[player].right;
            return hasDefenseKey && hasDirectionKey;
        }
    }

    // 입력으로부터 공격 타입 결정 (간소화된 시스템)
    getAttackFromInput(player, key) {
        // 새로운 공격 매핑: 위=스트레이트, 아래=잽, 좌우=이동(회피)
        const attackMap = {
            'player1': {
                'w': 'straight',  // 위 = 스트레이트
                's': 'jab'         // 아래 = 잽
                // a, d는 handleMoveInput()에서 처리
            },
            'player2': {
                'up': 'straight',  // 위 = 스트레이트
                'down': 'jab'       // 아래 = 잽
                // left, right는 handleMoveInput()에서 처리
            }
        };

        return attackMap[player][key] || null;
    }


    // 입력으로부터 방어 방향 결정 (새로운 매칭 시스템)
    getDefenseFromInput(player, key) {
        if (player === 'player1') {
            if (!this.keyStates[player].shift) return null;

            // 방어 방향 설정
            if (this.keyStates[player].w) {
                return { direction: 'up', isHolding: true };
            }
            if (this.keyStates[player].s) {
                return { direction: 'down', isHolding: true };
            }
            if (this.keyStates[player].a) {
                return { direction: 'left', isHolding: true };
            }
            if (this.keyStates[player].d) {
                return { direction: 'right', isHolding: true };
            }
            // Shift만 누른 경우 - 방어 없음
            return null;
        } else {
            if (!this.keyStates[player].space) return null;

            // 방어 방향 설정
            if (this.keyStates[player].up) {
                return { direction: 'up', isHolding: true };
            }
            if (this.keyStates[player].down) {
                return { direction: 'down', isHolding: true };
            }
            if (this.keyStates[player].left) {
                return { direction: 'left', isHolding: true };
            }
            if (this.keyStates[player].right) {
                return { direction: 'right', isHolding: true };
            }
            // Space만 누른 경우 - 방어 없음
            return null;
        }
    }

    // 플레이어 객체 가져오기 (키 매핑 변경)
    getPlayerObject(player) {
        // player1 = WASD+Shift (왼쪽 화면의 P1)
        // player2 = 방향키+스페이스바 (오른쪽 화면의 P2) 
        return player === 'player1' ? this.scene.player1 : this.scene.player2;
    }

    // 매 프레임 업데이트
    update(time, delta) {
        // 오래된 입력 버퍼 정리
        Object.keys(this.inputBuffer).forEach(player => {
            this.inputBuffer[player] = this.inputBuffer[player]
                .filter(input => time - input.time < 1000); // 1초 이상된 입력 제거
        });
    }

    // 입력 시스템 정리
    destroy() {
        // 키 이벤트 리스너 제거
        Object.values(this.keys.player1).forEach(key => key.removeAllListeners());
        Object.values(this.keys.player2).forEach(key => key.removeAllListeners());

        // 디버깅 UI 정리
        this.destroyDebugUI();
    }
}