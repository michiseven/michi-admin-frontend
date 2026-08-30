# Michi Admin UI 기준

## 제품 톤

- 관광 서비스의 따뜻한 녹색 계열을 유지하되 운영 도구답게 조용하고 밀도 높게 구성한다.
- 장식용 gradient와 과도한 card 중첩을 사용하지 않는다.
- 숫자가 없으면 `0`을 만들지 않고 `—`와 미연결 이유를 표시한다.

## 핵심 토큰

| 역할 | 값 |
| --- | --- |
| Background | `#f4f5f2` |
| Surface | `#ffffff` |
| Ink | `#17221f` |
| Muted | `#5d6965` |
| Primary | `#0f6253` |
| Sidebar | `#15211e` |
| Danger | `#9a2c2c` |
| Focus | `#1769aa` |

## 상호작용

- 모든 주요 target은 최소 44px다.
- `:focus-visible`을 제거하지 않는다.
- 상태는 색뿐 아니라 text와 dot을 함께 쓴다.
- disabled mutation에는 이유를 `title` 또는 인접 안내문으로 제공한다.
- 모바일 840px 이하에서는 sidebar를 drawer로 전환한다.
