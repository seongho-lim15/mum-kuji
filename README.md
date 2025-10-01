# 🎫 멈쿠지! (mum-kuji)

> 쿠지(제비뽑기/복권) 구매 습관을 자제하고 건전한 소비 습관을 기르기 위한 지출 관리 애플리케이션

## 📖 프로젝트 소개

**멈쿠지!** 는 쿠지(제일복권)나 기타 충동적인 소비를 줄이고, 체계적인 지출 관리를 통해 건전한 소비 습관을 기르는 것을 목표로 하는 웹 애플리케이션입니다.

모바일 우선으로 설계되어 언제 어디서나 쉽게 지출을 기록하고 분석할 수 있습니다.

## ✨ 주요 기능

### 💰 지출 관리
- **실시간 지출 기록**: 구매 즉시 간편하게 지출 내역 입력
- **품목별 관리**: 자주 구매하는 품목을 등록하여 빠른 입력
- **카테고리 분류**: 만화, 음료, 식사, 교통, 기타로 지출 분류

### 📊 시각적 분석
- **다양한 차트**: 막대그래프와 라인차트로 지출 패턴 분석
- **기간별 필터링**: 일/주/월/년 단위로 데이터 조회
- **품목별 필터링**: 특정 품목의 지출 패턴 분석

### 🎯 예산 관리
- **월별 예산 설정**: 목표 예산 설정 및 실시간 모니터링
- **진행률 표시**: 시각적 프로그레스 바로 예산 사용률 확인
- **남은 예산 알림**: 예산 초과 시 시각적 경고

### 🔐 사용자 관리
- **개인 계정**: 안전한 로그인/회원가입 시스템
- **데이터 보안**: JWT 기반 인증으로 개인 데이터 보호

## 🛠 기술 스택

### Frontend
- **Next.js 15**: React 기반 풀스택 프레임워크
- **React 19**: 최신 React 기능 활용
- **TypeScript**: 타입 안전성을 위한 정적 타입 언어
- **Tailwind CSS 4**: 유틸리티 우선 CSS 프레임워크

### Backend & Database
- **Next.js API Routes**: 서버리스 API 엔드포인트
- **Vercel KV**: Redis 기반 서버리스 데이터베이스
- **bcryptjs**: 비밀번호 암호화
- **jsonwebtoken**: JWT 토큰 기반 인증

### Libraries
- **Recharts**: 반응형 차트 라이브러리
- **Lucide React**: 모던 아이콘 라이브러리

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone [repository-url]
cd mum-kuji
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Vercel KV 데이터베이스
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token

# JWT 시크릿
JWT_SECRET=your_jwt_secret_key
```

> Vercel KV 설정 방법은 `VERCEL_KV_SETUP.md`를 참고하세요.

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

### 5. 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 코드 품질 검사
npm run lint
```

## 📁 프로젝트 구조

```
mum-kuji/
├── src/
│   ├── app/
│   │   ├── api/                # API 라우트
│   │   │   ├── auth/          # 인증 관련 API
│   │   │   └── data/          # 데이터 관리 API
│   │   ├── globals.css        # 전역 스타일
│   │   ├── layout.tsx         # 루트 레이아웃
│   │   └── page.tsx           # 홈 페이지
│   ├── components/
│   │   ├── AuthProvider.tsx   # 인증 컨텍스트
│   │   ├── ExpenseTracker.tsx # 메인 지출 관리 컴포넌트
│   │   └── LoginForm.tsx      # 로그인 폼
│   └── lib/
│       └── dataService.ts     # 데이터 타입 정의
├── CLAUDE.md                  # Claude Code 설정
├── VERCEL_KV_SETUP.md        # Vercel KV 설정 가이드
└── README.md                  # 프로젝트 문서
```

## 🔌 API 엔드포인트

### 인증 API
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃

### 데이터 관리 API
- `GET/POST /api/data/items` - 품목 조회/추가
- `PUT/DELETE /api/data/items` - 품목 수정/삭제
- `GET/POST /api/data/transactions` - 거래 내역 조회/추가
- `PUT/DELETE /api/data/transactions` - 거래 내역 수정/삭제
- `GET/PUT /api/data/settings` - 사용자 설정 조회/수정

## 📱 사용법

### 1. 회원가입 및 로그인
- 앱 첫 접속 시 로그인 화면에서 계정 생성
- 기존 사용자는 로그인하여 개인 데이터 접근

### 2. 지출 기록
- 우하단 '+' 버튼으로 새 지출 추가
- 품목 검색으로 기존 품목 선택 또는 새 품목 생성
- 단가와 수량 설정 후 총 금액 자동 계산
- 카테고리와 날짜 선택 후 저장

### 3. 데이터 분석
- 리스트/그래프 탭으로 보기 방식 전환
- 일/주/월/년 필터로 기간별 조회
- 품목별 필터로 특정 항목 분석

### 4. 예산 관리
- 설정 메뉴에서 월별 예산 한도 설정
- 메인 화면에서 예산 사용률 실시간 확인

### 5. 품목 관리
- 상단 '+' 버튼으로 새 품목 등록
- 품목 목록에서 수정/삭제 가능

## 🎯 프로젝트 목표

이 애플리케이션은 단순한 가계부를 넘어서 **행동 변화**를 유도하는 것을 목표로 합니다:

- **자각**: 지출 패턴을 시각화하여 소비 습관 인식
- **절제**: 예산 설정과 모니터링을 통한 자제력 강화
- **분석**: 데이터 기반 의사결정으로 현명한 소비
- **습관**: 꾸준한 기록을 통한 건전한 소비 습관 형성

## 📄 라이선스

이 프로젝트는 개인 사용 목적으로 제작되었습니다.

## 🤝 기여하기

버그 리포트나 기능 제안은 이슈를 통해 알려주세요.

---

💡 **Tip**: 쿠지를 사고 싶은 충동이 들 때마다 이 앱을 열어서 지금까지의 지출을 확인해보세요. 시각화된 데이터가 현명한 선택을 도와줄 것입니다!