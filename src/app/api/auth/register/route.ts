import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        // 입력 검증
        if (!email || !password) {
            return NextResponse.json(
                { error: '이메일과 비밀번호를 입력해주세요' },
                { status: 400 }
            );
        }

        // 이메일 형식 검증
        if (!AuthService.validateEmail(email)) {
            return NextResponse.json(
                { error: '올바른 이메일 형식이 아닙니다' },
                { status: 400 }
            );
        }

        // 비밀번호 검증
        const passwordValidation = AuthService.validatePassword(password);
        if (!passwordValidation.isValid) {
            return NextResponse.json(
                { error: passwordValidation.message },
                { status: 400 }
            );
        }

        // 사용자 생성 (KV에 저장)
        const user = await AuthService.createUser(email, password);

        return NextResponse.json({
            message: '회원가입 성공',
            email: user.email
        });

    } catch (error) {
        // AuthService에서 던진 에러 처리
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: '서버 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}