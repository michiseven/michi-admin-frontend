# AGENTS.md — Michi Admin

## 책임

`michi-admin`은 Michi 운영자가 장소 데이터, 외부 데이터 동기화, Import lineage와 추천 평가 결과를 검토하는 별도 Next.js 애플리케이션이다.

- 일반 여행자 UI를 복제하지 않는다.
- 관리자 API가 없는 기능을 동작하는 것처럼 표시하지 않는다.
- 실제 데이터, MOCK, 결측을 명확히 구분한다.
- 관광 집중률 예측을 실시간 혼잡이나 실제 방문자 수로 표현하지 않는다.
- mutation은 관리자 인증, 권한 확인, 감사 로그가 준비된 뒤에만 연결한다.
- secret과 Backend credential을 브라우저에 노출하지 않는다.
- 접근성, 키보드 탐색, 44px touch target과 명확한 loading/empty/error 상태를 유지한다.

## 검증

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
