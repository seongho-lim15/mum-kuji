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

        // 사용자 인증 (KV에서 조회 및 비밀번호 검증)
        const user = await AuthService.authenticateUser(email, password);

        // 로그인 성공
        const response = NextResponse.json({
            message: '로그인 성공',
            email: user.email
        });

        // 쿠키 기반 세션 설정
        response.cookies.set('auth', user.email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7일
        });

        return response;

    } catch (error) {
        // AuthService에서 던진 에러 처리
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: '서버 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}