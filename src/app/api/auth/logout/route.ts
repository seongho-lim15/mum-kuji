import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const response = NextResponse.json({ message: '로그아웃 성공' });

        // 인증 쿠키 삭제
        response.cookies.delete('auth');

        return response;
    } catch {
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}