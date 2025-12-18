# NestJS Advanced API Server

프로덕션 수준의 NestJS 기반 REST API 서버로, JWT 인증, 동시성 제어가 적용된 쿠폰 시스템, 파일 업로드 등 고급 백엔드 기능들을 포함합니다.

A comprehensive NestJS-based REST API server demonstrating production-ready patterns and advanced backend features including authentication, coupon management with concurrency control, and file uploads.

## Features / 주요 기능

### Core Functionalities / 핵심 기능

#### **JWT 인증 & 권한 관리 (Authentication & Authorization)**

- Access token (15분) + Refresh token (7일) 메커니즘
- 역할 기반 접근 제어 (ADMIN/GENERAL)
- HTTP-only 쿠키를 통한 Refresh token 보안
- 임시 비밀번호 이메일 발송을 통한 비밀번호 재설정

#### **사용자 관리 (User Management)**

- 사용자 CRUD 작업
- 역할 관리 (ADMIN 전용)
- 프로필 조회 및 업데이트
- Bcrypt 비밀번호 해싱

#### **게시글 시스템 (Post System)**

- Soft delete가 적용된 게시글 CRUD
- 페이지네이션 및 작성자 검색
- 조회수 추적 (hits)
- 좋아요/좋아요 취소 토글 기능
- 작성자 기반 접근 제어

#### **고급 쿠폰 시스템 (Advanced Coupon System)**

- 관리자 쿠폰 관리 (생성, 수정, 삭제)
- 일반 쿠폰 발급 (무제한)
- **선착순(FCFS) 쿠폰 발급**
  - 제한된 수량의 동시성 제어 (Race Condition 처리)
  - 트랜잭션 격리 수준 (READ COMMITTED)
  - 데이터베이스 레벨 검증을 통한 원자적 증가
  - 과다 발급 방지
- 사용자당 1개 쿠폰 제약
- 쿠폰 사용 추적 및 감사 로깅
- 성능 최적화를 위한 Redis 캐싱

#### **파일 업로드 서비스 (File Upload Service)**

- AWS S3 통합 파일 저장소
- 단일 및 다중 파일 업로드 지원
- 파일 검증 (크기, MIME 타입)
- 업로드 실패 시 롤백 메커니즘

#### **이메일 서비스 (Email Service)**

- @nestjs-modules/mailer를 사용한 SMTP 통합
- 임시 비밀번호 전송

#### **Redis 캐싱 (Redis Caching)**

- 전역 캐시 모듈
- 쿠폰 목록을 위한 TTL 기반 캐싱
- Docker 및 로컬 환경 지원

## Tech Stack / 기술 스택

### Core Framework / 핵심 프레임워크

- **NestJS** - Progressive Node.js 프레임워크
- **TypeScript** - 타입 안전 개발
- **Express** - 기본 HTTP 서버

### Database & ORM / 데이터베이스 & ORM

- **MySQL** - 주 데이터베이스
- **TypeORM** - 마이그레이션 지원 ORM
- **Redis** - 캐싱 레이어

### Authentication & Security / 인증 & 보안

- **Passport JWT** - JWT 인증 전략
- **Bcrypt** - 비밀번호 해싱
- **Cookie Parser** - 쿠키 처리

### Cloud Services / 클라우드 서비스

- **AWS S3** - 파일 저장소

### Validation & Documentation / 검증 & 문서화

- **Class Validator** - DTO 검증
- **Class Transformer** - 객체 변환
- **Swagger** - API 문서화

### Testing / 테스트

- **Jest** - 테스트 프레임워크
- **Supertest** - HTTP 테스트

## Project Structure / 프로젝트 구조

```
nest-prac/
├── entities/                    # TypeORM 엔티티 (src 외부)
│   ├── coupons/                # 쿠폰 관련 엔티티
│   │   ├── coupon.entity.ts
│   │   ├── coupon-issued.entity.ts
│   │   └── coupon-issued-log.entity.ts
│   ├── user.entity.ts
│   ├── post.entity.ts
│   └── post-like.entity.ts
├── src/
│   ├── _common/                # 공통 유틸리티
│   │   ├── _dto/              # 공통 DTO
│   │   ├── _middlewares/      # 보안 강화 미들웨어
│   │   ├── pipes/             # 커스텀 파이프
│   │   └── unified-exception.filter.ts
│   ├── _config/               # 설정 파일
│   │   ├── config.ts          # 환경 감지
│   │   └── data-source.ts     # TypeORM 마이그레이션 설정
│   ├── _migrations/           # 데이터베이스 마이그레이션
│   ├── auth/                  # 인증 모듈
│   │   ├── security/          # Guards, Strategies
│   │   └── decorator/         # 커스텀 데코레이터 (@User, @Roles)
│   ├── user/                  # 사용자 관리
│   ├── post/                  # 게시글 관리
│   ├── coupon/                # 쿠폰 관리
│   │   └── coupon-issued/    # 쿠폰 발급 서브 모듈
│   ├── file-upload/           # AWS S3 파일 업로드
│   ├── mail/                  # 이메일 서비스
│   └── redis/                 # Redis 캐시 설정
└── test/                      # E2E 테스트
```

## Installation / 설치

```bash
# 의존성 설치
npm install
```

## Environment Configuration / 환경 설정

`.env.sample`을 기반으로 프로젝트 루트에 `.env` 파일을 생성하세요:

```bash
# 환경 (production, development, local, docker-local)
NODE_ENV=local

# 서버 포트
PROD_PORT=443
DEV_PORT=80

# 데이터베이스 설정
DB_HOST=localhost
DB_USER_NAME=your-db-username
DB_PASSWORD=your-db-password

# AWS S3 설정
AWS_S3_BUCKET=your-s3-bucket-name
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key

# 이메일 설정 (SMTP)
USER_EMAIL=your-email@example.com
EMAIL_PASS=your-email-app-password

# JWT 시크릿 (추가 필요)
JWT_SECRET=your-jwt-secret-key

# Redis 설정 (선택사항, 기본값: localhost)
REDIS_HOST=localhost
```

### Environment Detection / 환경 감지

애플리케이션은 자동으로 환경을 감지합니다:

- `production` - 프로덕션 환경 (HTTPS, 포트 443)
- `development` - 개발 환경 (HTTP, 포트 80)
- `local` - 로컬 개발 환경 (HTTP, 포트 80)
- `docker-local` - Docker 기반 로컬 환경

## Database Setup / 데이터베이스 설정

### Running Migrations / 마이그레이션 실행

```bash
# 새 마이그레이션 생성
npm run migration:generate:local src/_migrations/MigrationName

# 마이그레이션 실행
npm run migration:run:local

# 마지막 마이그레이션 되돌리기
npm run migration:revert:local
```

다른 환경의 경우 `:local`을 `:dev` 또는 `:prod`로 변경하세요.

## Running the Application / 애플리케이션 실행

```bash
# watch 모드로 개발 서버 실행
npm run start:dev

# 프로덕션 모드
npm run start:prod

# 디버그 모드
npm run start:debug
```

API 접근 주소:

- Local/Dev: `http://localhost` (포트 80)
- Production: `https://your-domain` (포트 443)

## API Documentation / API 문서

서버 실행 후 Swagger 문서에 접근하세요:

```
http://localhost/api/docs
```

## API Endpoints Overview / API 엔드포인트 개요

### Authentication / 인증 (`/api/auth`)

- `POST /login` - 사용자 로그인
- `POST /refresh` - Access token 갱신
- `GET /me` - 현재 사용자 정보 조회
- `POST /logout` - 로그아웃
- `PATCH /password/reset` - 비밀번호 재설정

### Users / 사용자 (`/api/user`)

- `GET /list` - 모든 사용자 조회
- `GET /` - 쿼리로 사용자 조회
- `POST /` - 새 사용자 등록
- `PUT /` - 사용자 정보 업데이트
- `PATCH /:id` - 사용자 역할 업데이트 (ADMIN)

### Posts / 게시글 (`/api/post`)

- `POST /` - 게시글 생성
- `GET /list` - 게시글 목록 (페이지네이션 + 검색)
- `GET /` - 게시글 상세 조회
- `PUT /:id` - 게시글 수정
- `DELETE /` - 게시글 삭제
- `POST /:postId/like` - 좋아요 토글

### Admin Coupon / 관리자 쿠폰 (`/api/admin/coupon`)

- `POST /` - 쿠폰 생성 (ADMIN)
- `GET /` - 쿠폰 목록 조회
- `GET /:id` - 쿠폰 상세 조회
- `PUT /:id` - 쿠폰 수정
- `DELETE /:id` - 쿠폰 삭제

### Coupon Issuance / 쿠폰 발급 (`/api/coupon-issued`)

- `POST /general` - 일반 쿠폰 발급
- `POST /fcfs` - 선착순 쿠폰 발급 (제한 수량)
- `GET /my` - 내 쿠폰 조회

### File Upload / 파일 업로드 (`/api/file-upload`)

- `POST /single` - 단일 파일 업로드
- `POST /multiple` - 다중 파일 업로드

## Testing / 테스트

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov

# Watch 모드
npm run test:watch
```

## Key Features Explained / 주요 기능 설명

### 1. 동시성 제어가 적용된 쿠폰 시스템 (Coupon System with Concurrency Control)

선착순(FCFS) 쿠폰 발급 시스템은 다음을 통해 Race Condition을 처리합니다:

- **트랜잭션 격리**: `READ COMMITTED` 레벨
- **원자적 연산**: 데이터베이스 레벨 증가 검증
- **유니크 제약**: 사용자당 중복 발급 방지
- **감사 로깅**: 모든 발급 시도 추적
- **롤백 메커니즘**: 과다 발급 시 자동 롤백

### 2. 보안 기능 (Security Features)

- **강화 미들웨어**: 일반적인 공격 벡터 차단 (.git, .env, .php 파일, WordPress 경로)
- **JWT with Refresh Tokens**: 헤더의 Access token, HTTP-only 쿠키의 Refresh token
- **역할 기반 가드**: 엔드포인트 보호를 위한 `@Roles()` 데코레이터
- **비밀번호 해싱**: Salt rounds가 적용된 Bcrypt
- **HTTP 메서드 화이트리스트**: 안전한 HTTP 메서드만 허용

### 3. 예외 처리 (Exception Handling)

스마트 로깅이 적용된 통합 예외 필터:

- `WARN` - 404, 405 에러
- `ERROR` - 5xx 서버 에러
- `LOG` - 4xx 클라이언트 에러

### 4. 커스텀 데코레이터 (Custom Decorators)

- `@User()` - JWT 페이로드 추출
- `@Roles(UserType.ADMIN)` - 역할 기반 접근 제어

### 5. 다중 환경 지원 (Multi-Environment Support)

다음을 위한 설정이 포함된 자동 환경 감지:

- 데이터베이스 연결
- 서버 포트
- SSL 인증서
- Redis 호스트
- 로깅 레벨

## License / 라이선스

UNLICENSED - Private project
