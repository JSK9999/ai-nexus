# React/Next.js 프로젝트 설정

이 파일은 프로젝트 루트의 `.claude/CLAUDE.md`에 복사됩니다.

## 기본 규칙

- 모든 커뮤니케이션은 **한국어**로 진행
- 작업 전 목표와 접근 방식을 명시적으로 설명
- 파일 크기는 100~300줄 범위 유지
- 함수 중복 검사를 철저히 수행

## 컴포넌트 규칙

### 구조 패턴
- Container/Presentation 분리 원칙
- 새 컴포넌트는 `components/features/` 또는 `components/ui/`에 생성
- 복잡한 컴포넌트는 폴더로 분리

### 재사용성
- 새 컴포넌트 생성 전 기존 `components/` 검토
- 공통 로직은 `hooks/`로 추출
- 공통 유틸리티는 `lib/`에 배치

### 스타일링
- Tailwind CSS 우선 사용
- 복잡한 스타일은 CSS Modules 사용
- 인라인 스타일 지양

## 기술 규칙

### TypeScript
- `any` 타입 사용 금지
- API 응답 타입은 `types/` 폴더에 정의
- Props 타입은 컴포넌트 파일 내 정의

### 데이터 통신
- 서버 컴포넌트: `fetch` 사용
- 클라이언트: React Query 또는 SWR 사용
- `useEffect`로 데이터 페칭 금지

### 상태 관리
- 서버 상태: React Query / SWR
- 클라이언트 상태: Zustand (필요 시)
- 로컬 상태: useState

## 코드 품질

- import문은 ESLint 규칙에 따라 정렬
- 명확한 네이밍으로 주석 최소화
- 모든 새 페이지는 에러 처리 로직 포함
- useEffect cleanup으로 메모리 누수 방지

## 금지 사항

- `any` 타입
- Props drilling (3단계 이상)
- `useEffect`로 데이터 페칭
- `key`에 배열 index 사용
- 인라인 함수 남용
