// UI Manager - 게임 UI 관리
class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.elements = {};
        this.createUI();
    }

    createUI() {
        this.createHealthBars();
        this.createStaminaBars();
        this.createRoundDisplay();
        this.createTimer();
    }

    // 체력바 생성
    createHealthBars() {
        // ========== Player 1 하단 중앙 체력바 (왼쪽 화면) ==========
        this.elements.player1HealthBg = this.scene.add.rectangle(300, 740, 400, 25, 0x660000);
        this.elements.player1HealthBg.setDepth(100);
        if (this.scene.player1Mask) this.elements.player1HealthBg.setMask(this.scene.player1Mask);

        this.elements.player1Health = this.scene.add.rectangle(300, 740, 400, 25, 0xff0000);
        this.elements.player1Health.setDepth(100);
        if (this.scene.player1Mask) this.elements.player1Health.setMask(this.scene.player1Mask);

        // 체력 수치 텍스트 (바 안에 오버레이)
        this.elements.player1HealthText = this.scene.add.text(300, 740, 'HP: 100', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.elements.player1HealthText.setDepth(101);
        if (this.scene.player1Mask) this.elements.player1HealthText.setMask(this.scene.player1Mask);

        // ========== Player 2 하단 중앙 체력바 (오른쪽 화면) ==========
        this.elements.player2HealthBg = this.scene.add.rectangle(900, 740, 400, 25, 0x660000);
        this.elements.player2HealthBg.setDepth(100);
        if (this.scene.player2Mask) this.elements.player2HealthBg.setMask(this.scene.player2Mask);

        this.elements.player2Health = this.scene.add.rectangle(900, 740, 400, 25, 0xff0000);
        this.elements.player2Health.setDepth(100);
        if (this.scene.player2Mask) this.elements.player2Health.setMask(this.scene.player2Mask);

        // 체력 수치 텍스트 (바 안에 오버레이)
        this.elements.player2HealthText = this.scene.add.text(900, 740, 'HP: 100', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.elements.player2HealthText.setDepth(101);
        if (this.scene.player2Mask) this.elements.player2HealthText.setMask(this.scene.player2Mask);

        // ========== 상대 머리 위 체력바 ==========
        // Player 1 화면에 보이는 상대(P2) 체력바
        this.elements.opponent1HealthBg = this.scene.add.rectangle(300, 155, 150, 15, 0x660000);
        this.elements.opponent1HealthBg.setDepth(100);
        if (this.scene.player1Mask) this.elements.opponent1HealthBg.setMask(this.scene.player1Mask);

        this.elements.opponent1Health = this.scene.add.rectangle(300, 155, 150, 15, 0xff0000);
        this.elements.opponent1Health.setDepth(100);
        if (this.scene.player1Mask) this.elements.opponent1Health.setMask(this.scene.player1Mask);

        // Player 2 화면에 보이는 상대(P1) 체력바
        this.elements.opponent2HealthBg = this.scene.add.rectangle(900, 155, 150, 15, 0x660000);
        this.elements.opponent2HealthBg.setDepth(100);
        if (this.scene.player2Mask) this.elements.opponent2HealthBg.setMask(this.scene.player2Mask);

        this.elements.opponent2Health = this.scene.add.rectangle(900, 155, 150, 15, 0xff0000);
        this.elements.opponent2Health.setDepth(100);
        if (this.scene.player2Mask) this.elements.opponent2Health.setMask(this.scene.player2Mask);
    }

    // 스태미너바 생성
    createStaminaBars() {
        // ========== Player 1 하단 중앙 스태미너바 (왼쪽 화면) ==========
        this.elements.player1StaminaBg = this.scene.add.rectangle(300, 770, 400, 20, 0x006666);
        this.elements.player1StaminaBg.setDepth(100);
        if (this.scene.player1Mask) this.elements.player1StaminaBg.setMask(this.scene.player1Mask);

        this.elements.player1Stamina = this.scene.add.rectangle(300, 770, 400, 20, 0x00ffff);
        this.elements.player1Stamina.setDepth(100);
        if (this.scene.player1Mask) this.elements.player1Stamina.setMask(this.scene.player1Mask);

        // 스태미너 수치 텍스트 (바 안에 오버레이)
        this.elements.player1StaminaText = this.scene.add.text(300, 770, 'SP: 100', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.elements.player1StaminaText.setDepth(101);
        if (this.scene.player1Mask) this.elements.player1StaminaText.setMask(this.scene.player1Mask);

        // ========== Player 2 하단 중앙 스태미너바 (오른쪽 화면) ==========
        this.elements.player2StaminaBg = this.scene.add.rectangle(900, 770, 400, 20, 0x006666);
        this.elements.player2StaminaBg.setDepth(100);
        if (this.scene.player2Mask) this.elements.player2StaminaBg.setMask(this.scene.player2Mask);

        this.elements.player2Stamina = this.scene.add.rectangle(900, 770, 400, 20, 0x00ffff);
        this.elements.player2Stamina.setDepth(100);
        if (this.scene.player2Mask) this.elements.player2Stamina.setMask(this.scene.player2Mask);

        // 스태미너 수치 텍스트 (바 안에 오버레이)
        this.elements.player2StaminaText = this.scene.add.text(900, 770, 'SP: 100', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.elements.player2StaminaText.setDepth(101);
        if (this.scene.player2Mask) this.elements.player2StaminaText.setMask(this.scene.player2Mask);

        // 이전 스태미나 값 저장 (애니메이션용)
        this.prevP1Stamina = 100;
        this.prevP2Stamina = 100;
    }

    // 라운드 표시 생성
    createRoundDisplay() {
        // 배경 박스 추가
        this.elements.roundBg = this.scene.add.rectangle(600, 30, 160, 40, 0x000000, 0.7);
        this.elements.roundBg.setDepth(99);

        this.elements.roundText = this.scene.add.text(600, 30, 'Round 1/3', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.elements.roundText.setDepth(100);
    }

    // 타이머 생성
    createTimer() {
        // 배경 박스 추가
        this.elements.timerBg = this.scene.add.rectangle(600, 70, 80, 50, 0x000000, 0.7);
        this.elements.timerBg.setDepth(99);

        this.elements.timerText = this.scene.add.text(600, 70, '30', {
            fontSize: '36px',
            fill: '#ffff00',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.elements.timerText.setDepth(100);
    }

    // UI 업데이트
    update(gameState, player1State, player2State) {
        this.updateHealthBars(player1State, player2State);
        this.updateStaminaBars(player1State, player2State);
        this.updateRoundDisplay(gameState);
        this.updateTimer(gameState);
        this.updatePlayerStates(player1State, player2State);
    }

    // 체력바 업데이트
    updateHealthBars(player1State, player2State) {
        // ========== Player 1 하단 체력바 (자신의 체력) ==========
        const p1HealthPercent = player1State.health / 100;
        this.elements.player1Health.setScale(p1HealthPercent, 1);
        this.elements.player1Health.x = 100 + (400 * p1HealthPercent / 2);  // 중앙에서 좌측으로 시작

        // Player 1 체력 텍스트 업데이트
        this.elements.player1HealthText.setText(`HP: ${player1State.health}`);

        // ========== Player 2 하단 체력바 (자신의 체력) ==========
        const p2HealthPercent = player2State.health / 100;
        this.elements.player2Health.setScale(p2HealthPercent, 1);
        this.elements.player2Health.x = 700 + (400 * p2HealthPercent / 2);  // 중앙에서 좌측으로 시작

        // Player 2 체력 텍스트 업데이트
        this.elements.player2HealthText.setText(`HP: ${player2State.health}`);

        // ========== 상대 머리 위 체력바 업데이트 ==========
        // Player 1 화면에 보이는 상대(P2) 체력바 (y=155 위치)
        this.elements.opponent1Health.setScale(p2HealthPercent, 1);
        this.elements.opponent1Health.x = 225 + (150 * p2HealthPercent / 2);

        // Player 2 화면에 보이는 상대(P1) 체력바 (y=155 위치)
        this.elements.opponent2Health.setScale(p1HealthPercent, 1);
        this.elements.opponent2Health.x = 825 + (150 * p1HealthPercent / 2);
    }

    // 스태미너바 업데이트
    updateStaminaBars(player1State, player2State) {
        // ========== Player 1 스태미너바 ==========
        const p1StaminaPercent = player1State.stamina / 100;
        this.elements.player1Stamina.setScale(p1StaminaPercent, 1);
        this.elements.player1Stamina.x = 100 + (400 * p1StaminaPercent / 2);  // 중앙에서 좌측으로 시작

        // Player 1 스태미너 텍스트 업데이트
        this.elements.player1StaminaText.setText(`SP: ${player1State.stamina}`);

        // Player 1 스태미나 감소 감지 및 시각 효과
        if (player1State.stamina < this.prevP1Stamina) {
            this.showStaminaEffect(this.elements.player1Stamina);
        }
        this.prevP1Stamina = player1State.stamina;

        // ========== Player 2 스태미너바 ==========
        const p2StaminaPercent = player2State.stamina / 100;
        this.elements.player2Stamina.setScale(p2StaminaPercent, 1);
        this.elements.player2Stamina.x = 700 + (400 * p2StaminaPercent / 2);  // 중앙에서 좌측으로 시작

        // Player 2 스태미너 텍스트 업데이트
        this.elements.player2StaminaText.setText(`SP: ${player2State.stamina}`);

        // Player 2 스태미나 감소 감지 및 시각 효과
        if (player2State.stamina < this.prevP2Stamina) {
            this.showStaminaEffect(this.elements.player2Stamina);
        }
        this.prevP2Stamina = player2State.stamina;

        // 스태미너 부족 시 색상 변경
        if (player1State.stamina <= 0) {
            this.elements.player1Stamina.setFillStyle(0xff6666);
            // 스태미나 0일 때 펄스 효과
            this.showStaminaEmptyPulse(this.elements.player1Stamina);
        } else {
            this.elements.player1Stamina.setFillStyle(0x00ffff);
        }

        if (player2State.stamina <= 0) {
            this.elements.player2Stamina.setFillStyle(0xff6666);
            // 스태미나 0일 때 펄스 효과
            this.showStaminaEmptyPulse(this.elements.player2Stamina);
        } else {
            this.elements.player2Stamina.setFillStyle(0x00ffff);
        }
    }

    // 스태미나 소모 시각 효과
    showStaminaEffect(staminaBar) {
        // 기존 트윈이 있으면 제거
        this.scene.tweens.killTweensOf(staminaBar);

        // 색상 플래시 효과: cyan → yellow → cyan
        const originalColor = staminaBar.fillColor;
        staminaBar.setFillStyle(0xffff00); // 노란색으로 플래시

        this.scene.tweens.add({
            targets: staminaBar,
            alpha: 0.7,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                staminaBar.setFillStyle(0x00ffff); // 다시 cyan으로
                staminaBar.alpha = 1;
            }
        });
    }

    // 스태미나 0일 때 펄스 효과
    showStaminaEmptyPulse(staminaBar) {
        // 기존 펄스 트윈이 없을 때만 시작
        if (!this.scene.tweens.isTweening(staminaBar)) {
            this.scene.tweens.add({
                targets: staminaBar,
                alpha: 0.5,
                duration: 500,
                yoyo: true,
                repeat: 0
            });
        }
    }

    // 라운드 표시 업데이트
    updateRoundDisplay(gameState) {
        this.elements.roundText.setText(`Round ${gameState.currentRound}/${gameState.totalRounds}`);
    }

    // 타이머 업데이트
    updateTimer(gameState) {
        this.elements.timerText.setText(gameState.timeLeft.toString());
        
        // 시간이 적을 때 색상 변경
        if (gameState.timeLeft <= 5) {
            this.elements.timerText.setFill('#ff0000');
        } else if (gameState.timeLeft <= 10) {
            this.elements.timerText.setFill('#ff6600');
        } else {
            this.elements.timerText.setFill('#ffff00');
        }
    }

    // 플레이어 상태 표시 업데이트
    updatePlayerStates(player1State, player2State) {
        // 라벨이 제거되었으므로 이 함수는 비어 있음
        // 향후 다른 상태 표시가 필요하면 여기에 추가
    }

    // 데미지 텍스트 표시
    showDamageText(x, y, damage, isCounter = false) {
        let color = isCounter ? '#ffff00' : '#ffffff';
        let text = isCounter ? `COUNTER! ${damage}` : damage.toString();

        const damageText = this.scene.add.text(x, y, text, {
            fontSize: '20px',
            fill: color,
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        damageText.setDepth(100);

        // 애니메이션
        this.scene.tweens.add({
            targets: damageText,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => damageText.destroy()
        });
    }

    // 라운드 전환 화면 표시
    showRoundTransition(roundNumber) {
        const bg = this.scene.add.rectangle(600, 400, 1200, 800, 0xffffff);
        bg.setDepth(200);  // 전환 화면 레이어
        const text = this.scene.add.text(600, 400, `Round ${roundNumber}`, {
            fontSize: '48px',
            fill: '#000000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        text.setDepth(200);  // 전환 화면 레이어

        // 2초 후 제거
        this.scene.time.delayedCall(2000, () => {
            bg.destroy();
            text.destroy();
        });
    }

    // KO 메시지 표시
    showKOMessage(winner) {
        const bg = this.scene.add.rectangle(600, 400, 400, 200, 0x000000, 0.8);
        bg.setDepth(300);  // 최우선 메시지 레이어
        const text = this.scene.add.text(600, 400, `KO!\nPlayer ${winner} Wins!`, {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        text.setDepth(300);  // 최우선 메시지 레이어

        // 3초 후 결과 화면으로 이동
        this.scene.time.delayedCall(3000, () => {
            this.scene.scene.start('ResultScene', { winner: winner });
        });
    }

    // UI 정리
    destroy() {
        Object.values(this.elements).forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        this.elements = {};
    }
}