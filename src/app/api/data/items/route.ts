import { NextRequest, NextResponse } from 'next/server';
import { DataService, Item } from '@/lib/dataService';

export async function GET(request: NextRequest) {
    try {
        const email = await DataService.validateUserAccess(request);
        const items = await DataService.getUserItems(email);

        return NextResponse.json({ items });
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

export async function POST(request: NextRequest) {
    try {
        const email = await DataService.validateUserAccess(request);
        const { name, price, category } = await request.json();

        // 입력 검증
        if (!name || !price || !category) {
            return NextResponse.json(
                { error: '품목명, 가격, 카테고리를 모두 입력해주세요' },
                { status: 400 }
            );
        }

        if (price <= 0) {
            return NextResponse.json(
                { error: '가격은 0보다 큰 값이어야 합니다' },
                { status: 400 }
            );
        }

        const newItem: Item = {
            name: name.trim(),
            price: parseInt(price),
            category: category.trim()
        };

        const items = await DataService.addUserItem(email, newItem);

        return NextResponse.json({ items, message: '품목이 추가되었습니다' });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: error.message.includes('인증') || error.message.includes('토큰') ? 401 : 409 }
            );
        }

        return NextResponse.json(
            { error: '서버 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const email = await DataService.validateUserAccess(request);
        const { searchParams } = new URL(request.url);
        const itemName = searchParams.get('name');

        if (!itemName) {
            return NextResponse.json(
                { error: '삭제할 품목명을 지정해주세요' },
                { status: 400 }
            );
        }

        const items = await DataService.removeUserItem(email, itemName);

        return NextResponse.json({ items, message: '품목이 삭제되었습니다' });
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