import { kv } from '@vercel/kv';
import { AuthService } from './auth';

export interface Item {
    id: string;
    name: string;
    price: number;
    category: string;
}

export interface Transaction {
    id: number;
    amount: number;
    unitPrice: number;
    quantity: number;
    description: string;
    category: string;
    date: string;
    timestamp: number;
    itemId?: string; // 품목 ID 참조 (기존 데이터 호환성을 위해 optional)
}

export interface UserSettings {
    budget: number;
    timeFilter: string;
    currentView: string;
}

export class DataService {
    private static getItemsKey(email: string): string {
        return `user-items:${email.toLowerCase()}`;
    }

    private static getTransactionsKey(email: string): string {
        return `user-transactions:${email.toLowerCase()}`;
    }

    private static getSettingsKey(email: string): string {
        return `user-settings:${email.toLowerCase()}`;
    }

    // 고유 ID 생성 함수
    private static generateItemId(): string {
        return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 기본 품목 리스트
    private static getDefaultItems(): Item[] {
        return [
            { id: this.generateItemId(), name: '원피스', price: 13000, category: '만화' },
            { id: this.generateItemId(), name: '나루토', price: 12000, category: '만화' },
            { id: this.generateItemId(), name: '블리치', price: 11000, category: '만화' },
            { id: this.generateItemId(), name: '커피', price: 4500, category: '음료' },
            { id: this.generateItemId(), name: '점심', price: 8000, category: '식사' },
            { id: this.generateItemId(), name: '지하철', price: 1500, category: '교통' }
        ];
    }

    private static getDefaultSettings(): UserSettings {
        return {
            budget: 100000,
            timeFilter: 'month',
            currentView: 'list'
        };
    }

    // 품목 관리
    static async getUserItems(email: string): Promise<Item[]> {
        const itemsKey = this.getItemsKey(email);
        const items = await kv.get<Item[]>(itemsKey);

        // 처음 접속하는 사용자는 기본 품목으로 초기화
        if (!items) {
            const defaultItems = this.getDefaultItems();
            await kv.set(itemsKey, defaultItems);
            return defaultItems;
        }

        // 기존 데이터에 ID가 없는 경우 마이그레이션
        const migratedItems = items.map(item => {
            if (!item.id) {
                return { ...item, id: this.generateItemId() };
            }
            return item;
        });

        // 마이그레이션이 일어났다면 저장
        if (migratedItems.some((item, index) => item.id !== items[index]?.id)) {
            await kv.set(itemsKey, migratedItems);
        }

        return migratedItems;
    }

    static async addUserItem(email: string, item: Omit<Item, 'id'>): Promise<Item[]> {
        const items = await this.getUserItems(email);

        // 중복 체크
        if (items.find(existing => existing.name === item.name)) {
            throw new Error('이미 존재하는 품목입니다');
        }

        // 새 품목에 ID 할당
        const newItem: Item = {
            ...item,
            id: this.generateItemId()
        };

        const newItems = [...items, newItem];
        await kv.set(this.getItemsKey(email), newItems);
        return newItems;
    }

    static async updateUserItem(email: string, itemId: string, updatedData: Omit<Item, 'id'>): Promise<Item[]> {
        const items = await this.getUserItems(email);

        // 중복 체크 (자기 자신 제외)
        const duplicateItem = items.find(item => item.id !== itemId && item.name === updatedData.name);
        if (duplicateItem) {
            throw new Error('이미 존재하는 품목명입니다');
        }

        const newItems = items.map(item =>
            item.id === itemId ? { ...updatedData, id: itemId } : item
        );

        await kv.set(this.getItemsKey(email), newItems);
        return newItems;
    }

    static async removeUserItem(email: string, itemId: string): Promise<Item[]> {
        const items = await this.getUserItems(email);
        const newItems = items.filter(item => item.id !== itemId);
        await kv.set(this.getItemsKey(email), newItems);
        return newItems;
    }

    // 거래 내역 관리
    static async getUserTransactions(email: string): Promise<Transaction[]> {
        const transactionsKey = this.getTransactionsKey(email);
        const transactions = await kv.get<Transaction[]>(transactionsKey);

        if (!transactions) {
            return [];
        }

        // 기존 데이터에 itemId가 없는 경우 마이그레이션
        // 현재는 단순히 undefined로 설정 (필요시 나중에 품목명으로 매칭 로직 추가 가능)
        const migratedTransactions = transactions.map(transaction => {
            if (transaction.itemId === undefined) {
                return { ...transaction, itemId: undefined };
            }
            return transaction;
        });

        return migratedTransactions;
    }

    static async addUserTransaction(email: string, transaction: Transaction): Promise<Transaction[]> {
        const transactions = await this.getUserTransactions(email);
        const newTransactions = [transaction, ...transactions];
        await kv.set(this.getTransactionsKey(email), newTransactions);
        return newTransactions;
    }

    static async removeUserTransaction(email: string, transactionId: number): Promise<Transaction[]> {
        const transactions = await this.getUserTransactions(email);
        const newTransactions = transactions.filter(t => t.id !== transactionId);
        await kv.set(this.getTransactionsKey(email), newTransactions);
        return newTransactions;
    }

    static async updateUserTransaction(email: string, transactionId: number, updatedTransaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction[]> {
        const transactions = await this.getUserTransactions(email);
        const newTransactions = transactions.map(t =>
            t.id === transactionId
                ? { ...updatedTransaction, id: transactionId, timestamp: t.timestamp }
                : t
        );
        await kv.set(this.getTransactionsKey(email), newTransactions);
        return newTransactions;
    }

    // 설정 관리
    static async getUserSettings(email: string): Promise<UserSettings> {
        const settingsKey = this.getSettingsKey(email);
        const settings = await kv.get<UserSettings>(settingsKey);

        // 처음 접속하는 사용자는 기본 설정으로 초기화
        if (!settings) {
            const defaultSettings = this.getDefaultSettings();
            await kv.set(settingsKey, defaultSettings);
            return defaultSettings;
        }

        return settings;
    }

    static async updateUserSettings(email: string, settings: Partial<UserSettings>): Promise<UserSettings> {
        const currentSettings = await this.getUserSettings(email);
        const newSettings = { ...currentSettings, ...settings };
        await kv.set(this.getSettingsKey(email), newSettings);
        return newSettings;
    }

    // 인증 체크
    static async validateUserAccess(request: Request): Promise<string> {
        const authCookie = request.headers.get('cookie')?.split(';')
            .find(c => c.trim().startsWith('auth-token='))
            ?.split('=')[1];

        if (!authCookie) {
            throw new Error('인증이 필요합니다');
        }

        const tokenData = AuthService.verifyToken(authCookie);
        if (!tokenData) {
            throw new Error('유효하지 않은 토큰입니다');
        }

        return tokenData.email;
    }
}