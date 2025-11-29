// Global Debug System
window.DEBUG_MODE = false;

// Debug logging helper functions - only log when debug mode is active
function debugLog(...args) {
    if (window.DEBUG_MODE) {
        console.log(...args);
    }
}

function debugError(...args) {
    if (window.DEBUG_MODE) {
        console.error(...args);
    }
}

// Boxing Game Main Configuration
class BoxingGame {
    constructor() {
        this.config = {
            type: Phaser.AUTO,
            width: 1200,
            height: 800,
            parent: 'game-container',
            backgroundColor: '#2c1810',
            scene: [MenuScene, GameScene, ResultScene],
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            }
        };

        this.game = new Phaser.Game(this.config);
    }
}

// Menu Scene
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // 임시 색상 사각형 생성 (이미지 대용)
        this.load.image('temp-bg', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
    }

    create() {
        // 배경
        this.add.rectangle(600, 400, 1200, 800, 0x2c1810);
        
        // 제목
        const title = this.add.text(600, 200, 'BOXING GAME', {
            fontSize: '64px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#8B4513',
            strokeThickness: 4
        }).setOrigin(0.5);

        // 부제목
        const subtitle = this.add.text(600, 280, '2P POV Boxing Game', {
            fontSize: '24px',
            fill: '#cccccc',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // 플레이 버튼
        const playButton = this.add.rectangle(600, 400, 200, 80, 0x8B4513)
            .setInteractive()
            .setStrokeStyle(4, 0x654321);

        const playText = this.add.text(600, 400, 'PLAY', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 조작법 안내
        const controls = this.add.text(600, 550, 
            'Player 1 (왼쪽): WASD + Shift\nPlayer 2 (오른쪽): 방향키 + 스페이스바\n\n클릭하여 게임 시작!', {
            fontSize: '18px',
            fill: '#aaaaaa',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);

        // 버튼 이벤트
        playButton.on('pointerdown', () => {
            debugLog('Play button clicked!');
            this.scene.start('GameScene');
        });

        playButton.on('pointerover', () => {
            playButton.setFillStyle(0xA0522D);
        });

        playButton.on('pointerout', () => {
            playButton.setFillStyle(0x8B4513);
        });
    }
}

// Character Sprite Manager - 플레이어 상태에 따라 이미지 키를 반환
class CharacterSpriteManager {
    constructor(scene, playerId, opponentType = 'opponent1') {
        this.scene = scene;
        this.playerId = playerId;
        this.opponentType = opponentType;  // 'opponent1' or 'opponent2'

        // 스프라이트 객체
        this.opponentSprite = null;
        this.povSprite = null;
        this.effectSprite = null;
    }

    // 스프라이트 생성
    createSprites(opponentX, opponentY, povX, povY, effectX) {
        // 상대방 스프라이트 (다른 플레이어의 화면에 보이는 나)
        this.opponentSprite = this.scene.add.sprite(opponentX, opponentY, `${this.opponentType}_neutral`);
        this.opponentSprite.setScale(0.48);  // 0.2배 더 축소 (0.6 * 0.8 = 0.48)
        this.opponentSprite.setDepth(1);  // 배경 바로 위

        // POV 스프라이트 (내 화면에 보이는 내 손/글러브)
        // 화면 하단에 크게 배치하여 전완(forearm) 전체가 보이도록
        this.povSprite = this.scene.add.sprite(povX, povY + 200, 'pov_neutral');
        this.povSprite.setScale(1.04);  // 1.3 * 0.8 = 1.04
        this.povSprite.setDepth(3);  // 게임 레이어 최상단

        // 이펙트 스프라이트 (초기에는 숨김)
        // 공격자의 POV 화면에서 상대방 가슴 부위에 표시
        // effectX는 공격자의 화면 좌표 (P1=300, P2=900)
        this.effectSprite = this.scene.add.sprite(effectX, opponentY - 30, 'effect_hit');
        this.effectSprite.setVisible(false);
        this.effectSprite.setScale(0.4);  // 어깨 넓이 정도 크기
        this.effectSprite.setDepth(1001);  // UI보다도 위에 (UI는 100, 분할선은 1000)
        this.effectSprite.setAlpha(1.0);  // 완전 불투명

        return {
            opponent: this.opponentSprite,
            pov: this.povSprite,
            effect: this.effectSprite
        };
    }

    // 플레이어 상태에 따라 이미지 키 반환
    getImageKey(playerState, viewType = 'opponent') {
        const prefix = viewType === 'opponent' ? this.opponentType : 'pov';
        const state = playerState.state;
        const action = playerState.action;
        const defenseDirection = playerState.defenseDirection;

        // neutral 상태 (기본 자세)
        if (state === 'neutral') {
            return `${prefix}_neutral`;
        }

        // attack 상태
        if (state === 'attack') {
            const attackMap = {
                'jab': `${prefix}_jab`,
                'straight': `${prefix}_straight`,
                'leftHook': `${prefix}_left_hook`,
                'rightHook': `${prefix}_right_hook`
            };
            return attackMap[action] || `${prefix}_neutral`;
        }

        // evading 상태 (회피)
        if (state === 'evading') {
            const evadingMap = {
                'leftStep': `${prefix}_left_step`,
                'rightStep': `${prefix}_right_step`
            };
            return evadingMap[action] || `${prefix}_neutral`;
        }

        // defense 상태 (방어)
        if (state === 'defense') {
            // pov는 좌우 방어 이미지가 없으므로 모두 defense로 통일
            if (prefix === 'pov') {
                return `${prefix}_defense`;
            }

            // opponent는 방어 방향에 따라 이미지 선택
            if (defenseDirection === 'left') {
                return `${prefix}_left_guard`;
            } else if (defenseDirection === 'right') {
                return `${prefix}_right_guard`;
            } else if (defenseDirection === 'up' || defenseDirection === 'down') {
                // 위/아래 방향키는 모두 기본 막기
                return `${prefix}_defense`;
            }
            // 기본 방어
            return `${prefix}_defense`;
        }

        // 기본값
        return `${prefix}_neutral`;
    }

    // 스프라이트 업데이트
    updateSprites(myState, opponentState) {
        // 상대방 화면에 보이는 나의 이미지 업데이트 (opponent 캐릭터)
        if (this.opponentSprite) {
            const opponentKey = this.getImageKey(myState, 'opponent');
            this.opponentSprite.setTexture(opponentKey);
        }

        // 내 화면에 보이는 내 POV 주먹 업데이트 (내 상태 반영)
        if (this.povSprite) {
            const povKey = this.getImageKey(myState, 'pov');
            this.povSprite.setTexture(povKey);
        }
    }

    // 이펙트 표시
    showEffect(effectType, duration = 300) {
        if (!this.effectSprite) return;

        const effectKey = effectType === 'hit' ? 'effect_hit' : 'effect_defense';
        this.effectSprite.setTexture(effectKey);
        this.effectSprite.setVisible(true);
        this.effectSprite.setAlpha(1.0);  // 완전 불투명
        this.effectSprite.setScale(0.4);  // 어깨 넓이 정도
        this.effectSprite.setDepth(1001);   // UI보다도 위에 (맨 앞)

        debugLog(`Effect shown: ${effectKey} at position (${this.effectSprite.x}, ${this.effectSprite.y}), visible: ${this.effectSprite.visible}, depth: ${this.effectSprite.depth}`);

        // 펄스 애니메이션 (크기 증가 -> 감소)
        this.scene.tweens.add({
            targets: this.effectSprite,
            scaleX: 0.5,
            scaleY: 0.5,
            alpha: 0.7,
            duration: duration / 2,
            yoyo: true,
            ease: 'Power2'
        });

        // duration 후 숨기기
        this.scene.time.delayedCall(duration, () => {
            if (this.effectSprite) {
                this.effectSprite.setVisible(false);
                debugLog('Effect hidden');
            }
        });
    }

    // 정리
    destroy() {
        if (this.opponentSprite) this.opponentSprite.destroy();
        if (this.povSprite) this.povSprite.destroy();
        if (this.effectSprite) this.effectSprite.destroy();
    }
}

// Game Scene
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    // 게임 상태 초기화
    initGameState() {
        this.gameState = {
            currentRound: 1,
            totalRounds: 3,
            roundTime: 30,
            timeLeft: 30
        };
        debugLog('Game state initialized:', this.gameState);
    }

    preload() {
        // 배경 이미지 로드
        this.load.image('boxing_ring_background', 'assets/images/boxing_ring_background.png');

        // Opponent 1 이미지 로드
        this.load.image('opponent1_neutral', 'assets/images/opponent1/opponent1_neutral.png');
        this.load.image('opponent1_jab', 'assets/images/opponent1/opponent1_jab.png');
        this.load.image('opponent1_straight', 'assets/images/opponent1/opponent1_straight.png');
        this.load.image('opponent1_left_hook', 'assets/images/opponent1/opponent1_left_hook.png');
        this.load.image('opponent1_right_hook', 'assets/images/opponent1/opponent1_right_hook.png');
        this.load.image('opponent1_left_step', 'assets/images/opponent1/opponent1_left_step.png');
        this.load.image('opponent1_right_step', 'assets/images/opponent1/opponent1_right_step.png');
        this.load.image('opponent1_defense', 'assets/images/opponent1/opponent1_defense.png');
        this.load.image('opponent1_left_guard', 'assets/images/opponent1/opponent1_left_guard.png');
        this.load.image('opponent1_right_guard', 'assets/images/opponent1/opponent1_right_guard.png');

        // Opponent 2 이미지 로드
        this.load.image('opponent2_neutral', 'assets/images/opponent2/opponent2_neutral.png');
        this.load.image('opponent2_jab', 'assets/images/opponent2/opponent2_jab.png');
        this.load.image('opponent2_straight', 'assets/images/opponent2/opponent2_straight.png');
        this.load.image('opponent2_left_hook', 'assets/images/opponent2/opponent2_left_hook.png');
        this.load.image('opponent2_right_hook', 'assets/images/opponent2/opponent2_right_hook.png');
        this.load.image('opponent2_left_step', 'assets/images/opponent2/opponent2_left_step.png');
        this.load.image('opponent2_right_step', 'assets/images/opponent2/opponent2_right_step.png');
        this.load.image('opponent2_defense', 'assets/images/opponent2/opponent2_defense.png');
        this.load.image('opponent2_left_guard', 'assets/images/opponent2/opponent2_left_guard.png');
        this.load.image('opponent2_right_guard', 'assets/images/opponent2/opponent2_right_guard.png');

        // Player POV 이미지 로드
        this.load.image('pov_neutral', 'assets/images/player_pov/pov_neutral.png');
        this.load.image('pov_jab', 'assets/images/player_pov/pov_jab.png');
        this.load.image('pov_straight', 'assets/images/player_pov/pov_straight.png');
        this.load.image('pov_left_hook', 'assets/images/player_pov/pov_left_hook.png');
        this.load.image('pov_right_hook', 'assets/images/player_pov/pov_right_hook.png');
        this.load.image('pov_left_step', 'assets/images/player_pov/pov_left_step.png');
        this.load.image('pov_right_step', 'assets/images/player_pov/pov_right_step.png');
        this.load.image('pov_defense', 'assets/images/player_pov/pov_defense.png');

        // Effect 이미지 로드
        this.load.image('effect_hit', 'assets/images/effects/effect_hit.png');
        this.load.image('effect_defense', 'assets/images/effects/effect_defense.png');
    }

    create() {
        // 게임 상태 초기화 (매번 새로 시작할 때마다)
        this.initGameState();

        // 배경 이미지 추가 (전체 화면에 맞게)
        const background = this.add.image(600, 400, 'boxing_ring_background');
        background.setDisplaySize(1200, 800);  // 화면 크기에 맞춤
        background.setDepth(0);  // 맨 뒤에 배치

        // Player 1 영역 (왼쪽) - 마스크를 먼저 생성
        this.player1Area = this.add.group();
        this.createPlayer1Area();

        // Player 2 영역 (오른쪽) - 마스크를 먼저 생성
        this.player2Area = this.add.group();
        this.createPlayer2Area();

        // 화면 분할선 (타이머 바로 아래부터 시작)
        // y=100부터 y=800까지 그리기 (타이머 배경 하단 y=95 + 5px 여유)
        const dividerLine = this.add.rectangle(600, 450, 4, 700, 0xffffff);
        dividerLine.setOrigin(0.5, 0); // 상단 중앙 기준
        dividerLine.y = 100;
        dividerLine.setDepth(2);  // 배경 바로 위, 캐릭터 스프라이트보다 아래

        // UI 생성
        this.createUI();

        // 입력 시스템 초기화
        this.inputManager = new InputManager(this);

        // 플레이어 시스템 초기화
        this.player1 = new Player(1, 300, 400);  // P1은 왼쪽 (WASD + Shift)
        this.player2 = new Player(2, 900, 400);  // P2는 오른쪽 (방향키 + 스페이스바)
        debugLog('Players initialized - P1 HP:', this.player1.health, 'P2 HP:', this.player2.health);

        // 스프라이트 매니저 초기화
        // Player 1: 왼쪽 화면에서 상대(opponent2)를 봄, 오른쪽 화면에 나(opponent1)가 보임
        this.spriteManager1 = new CharacterSpriteManager(this, 1, 'opponent1');
        // opponentX=900 (P2화면에 보이는 P1), povX=300 (P1화면), effectX는 P1화면에서 상대 위치
        const sprites1 = this.spriteManager1.createSprites(900, 400, 300, 400, 300);
        this.player1Area.add(sprites1.pov);
        // P1의 이펙트는 P1 화면(왼쪽)에서 상대방(오른쪽에 위치한 opponent)에게 표시
        this.player1Area.add(sprites1.effect);
        this.player2Area.add(sprites1.opponent);

        // Player 1 영역 스프라이트에 마스크 적용
        sprites1.pov.setMask(this.player1Mask);
        // P1의 이펙트는 P1 화면(왼쪽, 300px)에 표시
        sprites1.effect.setMask(this.player1Mask);

        // Player 2: 오른쪽 화면에서 상대(opponent1)를 봄, 왼쪽 화면에 나(opponent2)가 보임
        this.spriteManager2 = new CharacterSpriteManager(this, 2, 'opponent2');
        // opponentX=300 (P1화면에 보이는 P2), povX=900 (P2화면), effectX는 P2화면에서 상대 위치
        const sprites2 = this.spriteManager2.createSprites(300, 400, 900, 400, 900);
        this.player2Area.add(sprites2.pov);
        this.player2Area.add(sprites2.effect);
        this.player1Area.add(sprites2.opponent);

        // Player 2 영역 스프라이트에 마스크 적용
        sprites2.pov.setMask(this.player2Mask);
        // P2의 이펙트는 P2 화면(오른쪽, 900px)에 표시
        sprites2.effect.setMask(this.player2Mask);

        // 상대방 스프라이트에도 각각의 영역 마스크 적용
        sprites1.opponent.setMask(this.player2Mask);  // P1의 opponent는 P2 화면에 보임
        sprites2.opponent.setMask(this.player1Mask);  // P2의 opponent는 P1 화면에 보임

        // 게임 타이머 시작
        this.startRoundTimer();
    }

    createPlayer1Area() {
        // Player 1 영역 마스크 생성 (왼쪽 절반만 보이도록)
        const maskShape1 = this.make.graphics();
        maskShape1.fillStyle(0xffffff);
        maskShape1.fillRect(0, 0, 600, 800);  // 왼쪽 절반 (0~600)

        const mask1 = maskShape1.createGeometryMask();
        this.player1Mask = mask1;

        // 배경 이미지를 사용하므로 배경색 사각형 제거

        // 스프라이트는 create() 함수에서 추가됨
    }

    createPlayer2Area() {
        // Player 2 영역 마스크 생성 (오른쪽 절반만 보이도록)
        const maskShape2 = this.make.graphics();
        maskShape2.fillStyle(0xffffff);
        maskShape2.fillRect(600, 0, 600, 800);  // 오른쪽 절반 (600~1200)

        const mask2 = maskShape2.createGeometryMask();
        this.player2Mask = mask2;

        // 배경 이미지를 사용하므로 배경색 사각형 제거

        // 스프라이트는 create() 함수에서 추가됨
    }

    createUI() {
        // UI 매니저 초기화
        this.uiManager = new UIManager(this);
    }

    // 매 프레임마다 호출되는 업데이트 함수
    update(time, delta) {
        // 플레이어 상태 업데이트
        if (this.player1) this.player1.update(time, delta);
        if (this.player2) this.player2.update(time, delta);

        // 입력 시스템 업데이트
        if (this.inputManager) this.inputManager.update(time, delta);

        // 공격 충돌 체크
        this.checkAttackCollisions();

        // 스프라이트 업데이트
        if (this.spriteManager1 && this.player1 && this.player2) {
            const player1State = this.player1.getState();
            const player2State = this.player2.getState();
            this.spriteManager1.updateSprites(player1State, player2State);
        }

        if (this.spriteManager2 && this.player1 && this.player2) {
            const player1State = this.player1.getState();
            const player2State = this.player2.getState();
            this.spriteManager2.updateSprites(player2State, player1State);
        }

        // UI 업데이트
        if (this.uiManager) {
            const player1State = this.player1 ? this.player1.getState() : null;
            const player2State = this.player2 ? this.player2.getState() : null;
            this.uiManager.update(this.gameState, player1State, player2State);
        }
    }

    // 씬 종료 시 정리
    shutdown() {
        debugLog('GameScene shutting down');
        if (this.roundTimer) {
            this.roundTimer.remove();
        }
        if (this.inputManager) {
            this.inputManager.destroy();
        }
        if (this.uiManager) {
            this.uiManager.destroy();
        }
        if (this.spriteManager1) {
            this.spriteManager1.destroy();
        }
        if (this.spriteManager2) {
            this.spriteManager2.destroy();
        }
    }

    // 공격 충돌 체크
    checkAttackCollisions() {
        if (!this.player1 || !this.player2) return;

        const p1State = this.player1.getState();
        const p2State = this.player2.getState();

        // Player 1이 공격 중일 때
        if (p1State.state === 'attack' && this.player1.actionStartTime) {
            const timeSinceAttack = Date.now() - this.player1.actionStartTime;
            // 공격 시작 후 100ms 내에 한 번만 데미지 적용
            if (timeSinceAttack <= 100 && !this.player1.damageApplied) {
                debugLog(`P1 damage check: ${timeSinceAttack}ms since attack start, action: ${p1State.action}`);
                this.applyDamage(this.player1, this.player2, p1State.action);
                this.player1.damageApplied = true;
            }
        } else {
            this.player1.damageApplied = false;
        }

        // Player 2가 공격 중일 때
        if (p2State.state === 'attack' && this.player2.actionStartTime) {
            const timeSinceAttack = Date.now() - this.player2.actionStartTime;
            // 공격 시작 후 100ms 내에 한 번만 데미지 적용
            if (timeSinceAttack <= 100 && !this.player2.damageApplied) {
                debugLog(`P2 damage check: ${timeSinceAttack}ms since attack start, action: ${p2State.action}`);
                this.applyDamage(this.player2, this.player1, p2State.action);
                this.player2.damageApplied = true;
            }
        } else {
            this.player2.damageApplied = false;
        }
    }

    // 데미지 적용 (간소화된 시스템)
    applyDamage(attacker, defender, attackType) {
        // 회피 동작(leftStep, rightStep)은 공격이 아니므로 데미지 적용 안 함
        if (attackType === 'leftStep' || attackType === 'rightStep') {
            return;
        }

        const attackData = attacker.getAttackData(attackType);
        const damage = attackData.damage;

        // 데미지 적용 (방어/회피 체크는 takeDamage 내부에서 처리)
        const result = defender.takeDamage(damage, attackType);
        const finalDamage = result.damage;
        const hitType = result.type;

        debugLog(`Player ${attacker.id} attacks Player ${defender.id} with ${attackType} - ${hitType} for ${finalDamage} damage`);

        // 이펙트 표시 (공격자의 화면에 표시)
        // 공격자가 P1이면 P1의 스프라이트 매니저를 사용 (왼쪽 화면)
        // 공격자가 P2이면 P2의 스프라이트 매니저를 사용 (오른쪽 화면)
        if (hitType === 'blocked') {
            // 방어 이펙트
            if (attacker.id === 1 && this.spriteManager1) {
                this.spriteManager1.showEffect('defense', 300);
                debugLog('P1 defense effect triggered');
            } else if (attacker.id === 2 && this.spriteManager2) {
                this.spriteManager2.showEffect('defense', 300);
                debugLog('P2 defense effect triggered');
            }
        } else if (hitType === 'hit' && finalDamage > 0) {
            // 히트 이펙트
            if (attacker.id === 1 && this.spriteManager1) {
                this.spriteManager1.showEffect('hit', 300);
                debugLog('P1 hit effect triggered');
            } else if (attacker.id === 2 && this.spriteManager2) {
                this.spriteManager2.showEffect('hit', 300);
                debugLog('P2 hit effect triggered');
            }
        }
        // hitType === 'evaded'인 경우 이펙트 없음

        // 데미지 텍스트 표시
        if (this.uiManager && finalDamage > 0) {
            const x = defender.id === 1 ? 300 : 900;  // P1=왼쪽(300), P2=오른쪽(900)
            const y = 400;
            this.uiManager.showDamageText(x, y, finalDamage, false);
        }

        // KO 체크
        if (defender.health <= 0) {
            this.handleKO(attacker.id);
        }
    }

    // KO 처리
    handleKO(winnerId) {
        debugLog(`Player ${winnerId} wins by KO!`);
        this.roundTimer.remove();
        
        if (this.uiManager) {
            this.uiManager.showKOMessage(winnerId);
        }
    }

    startRoundTimer() {
        this.roundTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    updateTimer() {
        this.gameState.timeLeft--;
        debugLog(`Round ${this.gameState.currentRound} - Time left: ${this.gameState.timeLeft}`);

        if (this.gameState.timeLeft <= 0) {
            debugLog('Round ended!');
            this.endRound();
        }
    }

    endRound() {
        this.roundTimer.remove();
        
        if (this.gameState.currentRound >= this.gameState.totalRounds) {
            // 게임 종료
            this.scene.start('ResultScene');
        } else {
            // 다음 라운드
            this.gameState.currentRound++;
            this.gameState.timeLeft = this.gameState.roundTime;
            this.showNextRoundScreen();
        }
    }

    showNextRoundScreen() {
        // Next Round 화면 표시
        const nextRoundBg = this.add.rectangle(600, 400, 1200, 800, 0xffffff);
        nextRoundBg.setDepth(200);  // 전환 화면 레이어

        const nextRoundText = this.add.text(600, 400, `Round ${this.gameState.currentRound}`, {
            fontSize: '48px',
            fill: '#000000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        nextRoundText.setDepth(200);  // 전환 화면 레이어

        // 2초 후 다음 라운드 시작
        this.time.delayedCall(2000, () => {
            nextRoundBg.destroy();
            nextRoundText.destroy();
            this.startRoundTimer();
        });
    }
}

// Result Scene
class ResultScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ResultScene' });
    }

    create() {
        // 배경
        this.add.rectangle(600, 400, 1200, 800, 0x2c1810);

        // 임시 승리 화면
        const winnerText = this.add.text(600, 300, 'Game Over!', {
            fontSize: '48px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Retry 버튼
        const retryButton = this.add.rectangle(600, 500, 200, 80, 0x8B4513)
            .setInteractive()
            .setStrokeStyle(4, 0x654321);

        const retryText = this.add.text(600, 500, 'RETRY', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 버튼 이벤트
        retryButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}

// 게임 시작
window.onload = () => {
    debugLog('페이지 로드 완료');

    // Phaser가 로드되었는지 확인
    if (typeof Phaser === 'undefined') {
        debugError('Phaser가 로드되지 않았습니다!');
        document.getElementById('game-container').innerHTML =
            '<div style="color: white; padding: 20px;">게임 로딩 오류: Phaser.js를 불러올 수 없습니다.</div>';
        return;
    }

    debugLog('Phaser 버전:', Phaser.VERSION);

    try {
        const game = new BoxingGame();
        debugLog('게임 초기화 완료');
    } catch (error) {
        debugError('게임 초기화 오류:', error);
        document.getElementById('game-container').innerHTML =
            '<div style="color: white; padding: 20px;">게임 초기화 오류가 발생했습니다.</div>';
    }
};