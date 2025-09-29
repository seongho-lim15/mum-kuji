# Vercel KV 설정 가이드

## 1. Vercel KV 데이터베이스 생성

### Vercel 대시보드에서 설정:
1. [Vercel 대시보드](https://vercel.com/dashboard)에 접속
2. 프로젝트 선택
3. **Storage** 탭 클릭
4. **Create Database** 버튼 클릭
5. **KV** 선택
6. 데이터베이스 이름 입력 (예: `mum-kuji-users`)
7. **Create** 클릭

## 2. 환경 변수 설정

### 로컬 개발 환경:
1. `.env.local.example` 파일을 `.env.local`로 복사
2. Vercel 대시보드의 KV 설정 페이지에서 환경 변수 복사
3. `.env.local` 파일에 붙여넣기

```bash
cp .env.local.example .env.local
```

### Vercel 프로덕션 환경:
KV 데이터베이스를 생성하면 환경 변수가 자동으로 설정됩니다.

## 3. 환경 변수 확인

필요한 환경 변수들:
- `KV_REST_API_URL`: KV REST API 엔드포인트
- `KV_REST_API_TOKEN`: KV REST API 토큰
- `KV_URL`: KV 연결 URL

## 4. 데이터 구조

사용자 데이터는 다음 구조로 저장됩니다:

```
Key: user:user@example.com
Value: {
  "email": "user@example.com",
  "hashedPassword": "hashed_password_string",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 5. 보안 사항

- 비밀번호는 bcrypt로 해싱되어 저장
- saltRounds = 12로 설정
- 이메일은 소문자로 정규화
- 세션은 HttpOnly 쿠키로 관리

## 6. 배포 전 체크리스트

- [ ] Vercel KV 데이터베이스 생성 완료
- [ ] 환경 변수 설정 확인
- [ ] 로컬에서 회원가입/로그인 테스트
- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인

## 7. 문제 해결

### KV 연결 오류 시:
1. 환경 변수가 올바르게 설정되었는지 확인
2. Vercel 프로젝트와 KV 데이터베이스가 연결되어 있는지 확인
3. 네트워크 연결 상태 확인

### 개발 환경에서 KV 접근 불가 시:
```bash
# Vercel CLI로 환경 변수 가져오기
npx vercel env pull .env.local
```