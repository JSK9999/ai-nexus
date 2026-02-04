# Node/Express 프로젝트 설정

이 파일은 프로젝트 루트의 `.claude/CLAUDE.md`에 복사됩니다.

## 기본 규칙

- 모든 커뮤니케이션은 **한국어**로 진행
- 파일 크기는 100~300줄 범위 유지
- 작업 전 목표와 접근 방식을 명시적으로 설명

## TypeScript 규칙

- `any` 타입 사용 금지
- 모든 함수에 반환 타입 명시
- 인터페이스는 `types/` 폴더에 정의
- 에러 타입도 명시적으로 정의

## API 설계 규칙

### 라우트 구조
```
src/
├── routes/           # 라우트 정의
├── controllers/      # 비즈니스 로직
├── services/         # 외부 서비스 연동
├── middlewares/      # 미들웨어
├── models/           # 데이터 모델
├── types/            # TypeScript 타입
└── utils/            # 유틸리티 함수
```

### REST 컨벤션
- GET: 조회 (멱등성 보장)
- POST: 생성
- PUT: 전체 수정
- PATCH: 부분 수정
- DELETE: 삭제

### 응답 형식
```typescript
// 성공
{ success: true, data: T }

// 실패
{ success: false, error: { code: string, message: string } }
```

## 에러 처리

- 모든 에러는 중앙 에러 핸들러에서 처리
- catch 블록에서 상세한 에러 메시지 작성
- 적절한 HTTP 상태 코드 사용
- 프로덕션에서 스택 트레이스 노출 금지

## 로깅

- 적절한 로깅 레벨 사용 (debug, info, warn, error)
- 민감 정보 로깅 금지
- 요청/응답 로깅 미들웨어 사용

## 보안

- 모든 입력 검증 (Joi, Zod 등 사용)
- 환경 변수로 민감 정보 관리
- 모든 API 엔드포인트에 인증/인가 확인
- CORS 설정 확인
- Rate limiting 적용

## 금지 사항

- `any` 타입
- 동기 파일 I/O (`fs.readFileSync` 등)
- `console.log` (logger 사용)
- 하드코딩된 비밀값
- SQL 문자열 연결 (파라미터 바인딩 사용)
