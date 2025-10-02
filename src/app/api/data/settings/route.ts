import { NextRequest, NextResponse } from 'next/server';
import { DataService, UserSettings } from '@/lib/dataService';

export async function GET(request: NextRequest) {
    try {
        const email = await DataService.validateUserAccess(request);
        const settings = await DataService.getUserSettings(email);

        return NextResponse.json({ settings });
    } catch (error) {
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

export async function PUT(request: NextRequest) {
    try {
        const email = await DataService.validateUserAccess(request);
        const updates = await request.json();

        // 입력 검증
        const allowedFields = ['budget', 'timeFilter', 'currentView'];
        const validUpdates: Partial<UserSettings> = {};

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                if (key === 'budget' && (typeof value !== 'number' || value < 0)) {
                    return NextResponse.json(
                        { error: '예산은 0 이상의 숫자여야 합니다' },
                        { status: 400 }
                    );
                }
                // if (key === 'timeFilter' && !['day', 'week', 'month', 'year'].includes(value as string)) {
                //     return NextResponse.json(
                //         { error: '유효하지 않은 시간 필터입니다' },
                //         { status: 400 }
                //     );
                // }
                if (key === 'currentView' && !['list', 'chart', 'calendar'].includes(value as string)) {
                    return NextResponse.json(
                        { error: '유효하지 않은 뷰 타입입니다' },
                        { status: 400 }
                    );
                }
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                validUpdates[key as keyof UserSettings] = value;
            }
        }

        if (Object.keys(validUpdates).length === 0) {
            return NextResponse.json(
                { error: '업데이트할 설정이 없습니다' },
                { status: 400 }
            );
        }

        const settings = await DataService.updateUserSettings(email, validUpdates);

        return NextResponse.json({ settings, message: '설정이 업데이트되었습니다' });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: error.message.includes('인증') || error.message.includes('토큰') ? 401 : 500 }
            );
        }

        return NextResponse.json(
            { error: '서버 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
