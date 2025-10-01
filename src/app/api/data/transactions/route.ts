import { NextRequest, NextResponse } from 'next/server';
import { DataService, Transaction } from '@/lib/dataService';

export async function GET(request: NextRequest) {
    try {
        const email = await DataService.validateUserAccess(request);
        const transactions = await DataService.getUserTransactions(email);

        return NextResponse.json({ transactions });
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
        const { amount, unitPrice, quantity, description, category, date } = await request.json();

        // 입력 검증
        if (!amount || !unitPrice || !quantity || !description || !category || !date) {
            return NextResponse.json(
                { error: '모든 필드를 입력해주세요' },
                { status: 400 }
            );
        }

        if (amount <= 0 || unitPrice <= 0 || quantity <= 0) {
            return NextResponse.json(
                { error: '금액과 수량은 0보다 큰 값이어야 합니다' },
                { status: 400 }
            );
        }

        const newTransaction: Transaction = {
            id: Date.now(),
            amount: parseFloat(amount),
            unitPrice: parseFloat(unitPrice),
            quantity: parseInt(quantity),
            description: description.trim(),
            category: category.trim(),
            date: date,
            timestamp: new Date(date).getTime()
        };

        const transactions = await DataService.addUserTransaction(email, newTransaction);

        return NextResponse.json({
            transactions,
            transaction: newTransaction,
            message: '거래 내역이 추가되었습니다'
        });
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

export async function PUT(request: NextRequest) {
    try {
        const email = await DataService.validateUserAccess(request);
        const { searchParams } = new URL(request.url);
        const transactionId = searchParams.get('id');

        if (!transactionId) {
            return NextResponse.json(
                { error: '수정할 거래 ID를 지정해주세요' },
                { status: 400 }
            );
        }

        const { amount, unitPrice, quantity, description, category, date } = await request.json();

        // 입력 검증
        if (!amount || !unitPrice || !quantity || !description || !category || !date) {
            return NextResponse.json(
                { error: '모든 필드를 입력해주세요' },
                { status: 400 }
            );
        }

        if (amount <= 0 || unitPrice <= 0 || quantity <= 0) {
            return NextResponse.json(
                { error: '금액과 수량은 0보다 큰 값이어야 합니다' },
                { status: 400 }
            );
        }

        const updatedTransactionData = {
            amount: parseFloat(amount),
            unitPrice: parseFloat(unitPrice),
            quantity: parseInt(quantity),
            description: description.trim(),
            category: category.trim(),
            date: date
        };

        const transactions = await DataService.updateUserTransaction(email, parseInt(transactionId), updatedTransactionData);

        return NextResponse.json({
            transactions,
            message: '거래 내역이 수정되었습니다'
        });
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

export async function DELETE(request: NextRequest) {
    try {
        const email = await DataService.validateUserAccess(request);
        const { searchParams } = new URL(request.url);
        const transactionId = searchParams.get('id');

        if (!transactionId) {
            return NextResponse.json(
                { error: '삭제할 거래 ID를 지정해주세요' },
                { status: 400 }
            );
        }

        const transactions = await DataService.removeUserTransaction(email, parseInt(transactionId));

        return NextResponse.json({ transactions, message: '거래 내역이 삭제되었습니다' });
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