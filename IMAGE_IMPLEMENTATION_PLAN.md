# 복싱 게임 이미지 시스템 구현 계획

## 📋 개요
POV 형식의 복싱 게임에 이미지 리소스를 적용하기 위한 상세 구현 계획서입니다.

## 🗂️ 1. 디렉토리 구조 생성
```
assets/
├── images/
│   ├── characters/          # 캐릭터 스틸컷 (25개)
│   │   ├── neutral.png     # 중립 자세
│   │   ├── jab.png         # 잽
│   │   ├── straight.png    # 스트레이트
│   │   ├── left_hook.png   # 레프트 훅
│   │   ├── right_hook.png  # 라이트 훅
│   │   ├── left_body.png   # 레프트 바디
│   │   ├── right_body.png  # 라이트 바디
│   │   ├── uppercut.png    # 어퍼컷
│   │   ├── duck.png        # 숙이기
│   │   ├── left_step.png   # 좌측 스텝
│   │   ├── right_step.png  # 우측 스텝
│   │   ├── left_guard.png  # 레프트 가드
│   │   ├── right_guard.png # 라이트 가드
│   │   ├── backstep.png    # 백스텝
│   │   ├── hit.png         # 피격
│   │   ├── ko.png          # KO
│   │   ├── victory.png     # 승리
│   │   └── stunned.png     # 무방비 상태
│   ├── effects/            # 이펙트 이미지
│   │   ├── punch_impact.png    # 펀치 타격 효과
│   │   ├── guard_spark.png     # 가드 시 반짝임
│   │   ├── counter_flash.png   # 카운터 효과
│   │   ├── uppercut_trail.png  # 어퍼컷 궤적
│   │   └── damage_text.png     # 데미지 텍스트 배경
│   ├── backgrounds/        # 배경 이미지
│   │   ├── boxing_ring_pov.png # POV 복싱 링 배경
│   │   └── menu_bg.png         # 메뉴 배경
│   ├── hands/              # 플레이어 손/글러브
│   │   ├── left_glove.png      # 왼쪽 글러브
│   │   └── right_glove.png     # 오른쪽 글러브
│   └── ui/                 # UI 요소
│       ├── health_bar.png      # 체력바
│       ├── stamina_bar.png     # 스태미너바
│       └── round_indicator.png # 라운드 표시
```

## 🎮 2. 이미지 로딩 시스템 구현

### 2.1 Phaser preload 함수 수정
```javascript
preload() {
    // 캐릭터 스틸컷 로딩
    this.load.image('char_neutral', 'assets/images/characters/neutral.png');
    this.load.image('char_jab', 'assets/images/characters/jab.png');
    // ... 25개 스틸컷 모두 로딩
    
    // 이펙트 이미지 로딩
    this.load.image('effect_punch', 'assets/images/effects/punch_impact.png');
    this.load.image('effect_guard', 'assets/images/effects/guard_spark.png');
    // ... 이펙트 이미지들 로딩
    
    // 배경 및 UI 로딩
    this.load.image('bg_ring', 'assets/images/backgrounds/boxing_ring_pov.png');
    this.load.image('left_glove', 'assets/images/hands/left_glove.png');
    this.load.image('right_glove', 'assets/images/hands/right_glove.png');
}
```

## 🖼️ 3. POV 화면 구성 개선

### 3.1 레이어 구조
```
화면 레이어 순서 (뒤에서 앞으로):
1. 배경 레이어: 복싱 링 POV 이미지 (1200x800px)
2. 상대방 레이어: 중앙에 상대방 캐릭터 (400x600px)
3. 이펙트 레이어: 타격/방어 효과 (가변 크기)
4. 손 레이어: 양쪽에 자신의 글러브 (200x300px)
5. UI 레이어: 체력바, 스태미너바 등
```

### 3.2 화면 배치
- **왼쪽 글러브**: 화면 좌하단 (100, 600)
- **오른쪽 글러브**: 화면 우하단 (1100, 600)
- **상대방**: 화면 중앙 (600, 400)
- **이펙트**: 상대방 위치 기준으로 동적 배치

## ⚡ 4. 이펙트 시스템 구현

### 4.1 EffectManager 클래스 생성
```javascript
class EffectManager {
    constructor(scene) {
        this.scene = scene;
        this.activeEffects = [];
    }
    
    playEffect(effectType, x, y, duration = 300) {
        // 이펙트 생성 및 애니메이션
        // 자동 페이드아웃 및 제거
    }
    
    clearAllEffects() {
        // 모든 활성 이펙트 제거
    }
}
```

### 4.2 이펙트 종류별 설정
- **타격 효과**: 0.3초 지속, 크기 1.0 → 1.5 → 0 애니메이션
- **방어 효과**: 0.2초 지속, 알파 1.0 → 0 페이드아웃
- **카운터 효과**: 0.5초 지속, 회전 + 크기 변화
- **특수 공격**: 궤적 효과, 0.4초 지속

## 🎨 5. 스프라이트 매니저 클래스 생성

### 5.1 CharacterSpriteManager 클래스
```javascript
class CharacterSpriteManager {
    constructor(scene, playerId) {
        this.scene = scene;
        this.playerId = playerId;
        this.currentSprite = null;
        this.spriteMap = {
            'neutral': 'char_neutral',
            'jab': 'char_jab',
            'straight': 'char_straight',
            // ... 모든 상태 매핑
        };
    }
    
    updateSprite(playerState) {
        // 플레이어 상태에 따라 스프라이트 변경
    }
    
    playStateAnimation(state, callback) {
        // 상태별 애니메이션 재생
    }
}
```

## 📏 6. 이미지 사양 및 최적화

### 6.1 권장 이미지 사양
- **캐릭터 스틸컷**: 400x600px, PNG-24
- **이펙트 이미지**: 투명 PNG, 다양한 크기 (100x100 ~ 300x300)
- **배경 이미지**: 1200x800px, PNG-24 또는 JPG (압축률 고려)
- **글러브 이미지**: 200x300px, PNG-24 (투명배경)

### 6.2 최적화 방법
- **WebP 포맷** 사용 (브라우저 지원 시)
- **이미지 압축**: TinyPNG 등 도구 활용
- **스프라이트 시트**: 작은 이펙트들은 하나의 시트로 통합
- **지연 로딩**: 필요한 시점에만 로딩

## 🔧 7. 구현 단계

### Phase 1: 기본 구조
1. 디렉토리 구조 생성
2. 임시 이미지로 기본 시스템 구축
3. 이미지 로딩 및 표시 테스트

### Phase 2: 스프라이트 시스템
1. CharacterSpriteManager 구현
2. 플레이어 상태와 이미지 연동
3. 기본 상태 전환 테스트

### Phase 3: 이펙트 시스템
1. EffectManager 구현
2. 타격/방어 이펙트 추가
3. 애니메이션 및 타이밍 조정

### Phase 4: 최적화 및 완성
1. 실제 게임 아트 적용
2. 성능 최적화
3. 크로스 브라우저 테스트

## 📝 8. 개발 시 고려사항

### 8.1 이미지 제작 가이드
- **일관된 스타일**: 모든 스틸컷이 동일한 아트 스타일 유지
- **POV 시점**: 플레이어 시선에서 보는 상대방 모습
- **감정 표현**: 타격받을 때, 공격할 때의 표정 변화
- **투명도 활용**: 이펙트는 반투명 효과로 겹쳐보이게

### 8.2 성능 고려사항
- **메모리 관리**: 사용하지 않는 이미지는 언로드
- **프레임률 유지**: 60FPS 목표로 최적화
- **로딩 시간**: 전체 용량 5MB 이하 권장

### 8.3 확장성
- **새로운 캐릭터**: 스프라이트 맵만 수정하면 추가 가능
- **새로운 이펙트**: EffectManager에 타입만 추가
- **다양한 해상도**: 반응형 크기 조정 지원

## 🎯 9. 완성 목표

최종적으로 구현될 모습:
- 실제 POV 시점의 생생한 복싱 경험
- 부드러운 스틸컷 전환과 이펙트
- 직관적이고 반응성 좋은 시각 피드백
- 최적화된 성능으로 웹에서 원활한 실행