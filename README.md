# Michi Admin

Michi 관리자 시스템을 위한 Next.js 16 기반 운영 콘솔 웹 애플리케이션입니다.

장소(POI) 데이터, 한국관광 데이터랩 동기화 내역, 관광 데이터 수동 Import Lineage, 그리고 Baseline vs Michi 추천 평가 결과를 실시간으로 모니터링하고 분석합니다.

## 시스템 아키텍처 및 연결 상태

```text
michi-admin (Next.js, port 3100)
        ↓ HttpOnly session cookie + /api/admin/*
michi-backend (Kotlin/Ktor Admin API, port 4100)
        ├── public 스키마 Read-only
        └── admin 스키마 회원·세션·감사 로그
PostgreSQL/PostGIS michi DB
```

- **Admin API 연결**: 모든 관리자 화면은 이미 Kotlin/Ktor 기반의 `michi-backend` REST API (`/api/admin/*`)와 연동되어 동작합니다.
- **LIVE / DEMO 분리**: 명시적 데모 모드(`NEXT_PUBLIC_ADMIN_DEMO_MODE=true`)에서만 합성 픽스처를 반환하고 화면 상단에 `DEMO DATA` 배지를 표시합니다. 라이브 모드에서 백엔드 연결에 실패하면 가짜 데이터로 대체하지 않고 오류 상태를 표시합니다.
- **세션 인증**: `/login`에서 로그인하며 브라우저 JavaScript가 읽을 수 없는 HttpOnly 세션 쿠키를 사용합니다.
- **현재 Mutation 제한**: 동기화 실행, 파일 업로드, 장소 수정/내보내기 API는 아직 비활성화되어 있습니다.

## 구현된 화면 목록

1. **대시보드 (`/`)**:
   - DB 전수 수치 기반 장소 source(KTO/NAVER/Kakao/기타), 좌표 누락, 가격 근거 coverage, 일반 회원, 관광 지표, 최신 Import 및 평가 상태
   - 시스템 헬스(Admin Ktor, Public API, PostgreSQL DB) 종합 모니터링
2. **장소 관리 (`/places`)**:
   - KTO 일문 POI 및 NAVER/Kakao 검색 장소 필터링(Provider, 좌표, 관광 지표, 가격 근거 상태)
   - WGS84 좌표, 장소별 관광 지표, 예상 비용과 `priceEvidence` 상세 확인
3. **동기화 작업 (`/sync`)**:
   - KTO 서울 POI 동기화 및 DataLab 관광지 집중률 수집 작업 이력 조회
   - 실행 이력 추적 상태(`historyStatus="unavailable"`) 및 Mutation 비활성화 안내
4. **추천 평가 (`/evaluations`)**:
   - Baseline vs Michi 동일 후보 snapshot 기반 추천 시나리오 평가 이력
   - `ExpectedDispersionEffect v1` 지표 분석(관광 집중도 감소폭, 비핫스팟 포함률, 취향 적합도, 이동거리/시간 델타) 상세 드로어
5. **데이터 Import (`/imports`)**:
   - canonical CSV/JSON 관광 데이터 수동 Import 실행 이력 및 Lineage 조회
   - 12자리 SHA-256 Checksum prefix 및 거절된 행(Rejected Count) 상태 모니터링
6. **서비스 회원 (`/members`)**:
   - 일반 여행자 회원의 기본 언어, 활성 상태, 저장 일정 수를 읽기 전용으로 조회
   - 비밀번호 hash, refresh token, 일정 snapshot과 메모는 목록 API에서 제외
7. **관리자 계정 (`/users`) / 감사 로그 (`/audit`)**:
   - 일반 회원과 분리된 관리자 초대, 역할·상태 관리 및 감사 이력 조회
8. **설정 및 보안 (`/settings`)**:
   - Admin API / Public API 연결 정보 및 엔드포인트 URL 점검
   - 실제 Provider 동작 모드(Live / Mock) 조회 및 운영 전 보안 체크리스트 확인

## 환경변수

`.env.example`을 복사하여 `.env.local`을 구성합니다.

```bash
cp .env.example .env.local
```

| 환경변수 | 기본값 | 설명 |
| --- | --- | --- |
| `NEXT_PUBLIC_ADMIN_API_URL` | `http://localhost:4100/api/admin` | Ktor Admin API 기본 URL |
| `NEXT_PUBLIC_PUBLIC_API_URL` | `http://localhost:4000/api` | 기존 Michi Public API 기본 URL |
| `NEXT_PUBLIC_APP_ENV` | `development` | 애플리케이션 실행 환경 (`development` / `production` / `test`) |
| `NEXT_PUBLIC_ADMIN_DEMO_MODE` | `false` | 백엔드 미연결 시 데모 픽스처 강제 사용 여부 |
| `NEXT_PUBLIC_ADMIN_AUTH_MODE` | `disabled` | `session`이면 로그인 화면과 세션 확인 활성화 |

> **보안 주의**: 데이터베이스 비밀번호, API Secret, 외부 서비스 인증 정보는 브라우저 코드나 클라이언트 환경변수에 절대 포함하지 않습니다.

## 실행 및 검증 명령

### 로컬 개발 서버 실행 (Port 3100)
```bash
npm ci
npm run dev
```

### 코드 품질 및 검증
```bash
# ESLint 검사
npm run lint

# TypeScript 타입 검사
npm run typecheck

# 단위 및 컴포넌트 테스트 (Vitest)
npm test

# 프로덕션 빌드 검증
npm run build
```

## 현재 구현 제약 및 다음 단계

- **관리자 인증 구현**: Argon2id 비밀번호와 HttpOnly 불투명 세션 쿠키 로그인·로그아웃이 연결되어 있습니다.
- **RBAC 구현**: owner/admin/operator/viewer 권한이 endpoint별로 적용되어 있습니다.
- **CSRF 제한**: 현재 데이터 변경 API가 없으며, Mutation 추가 전 CSRF 방어를 구현해야 합니다.
- **Mutation 미구현**: 데이터 무결성을 위해 모든 CUD(Create/Update/Delete) API 및 동기화 트리거는 비활성화되어 있습니다.
- **다음 단계**: CSRF 방어와 실행 단위 감사 로그를 먼저 구현한 후 KTO/DataLab 수집 Mutation을 연동합니다.
