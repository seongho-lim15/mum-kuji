import { kv } from '@vercel/kv';
import { AuthService } from './auth';

export interface Item {
    name: string;
    price: number;
    category: string;
}

export interface Transaction {
    id: number;
    amount: number;
    description: string;
    category: string;
    date: string;
    timestamp: number;
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

    // 기본 품목 리스트
    private static getDefaultItems(): Item[] {
        return [
            { name: '원피스', price: 13000, category: '만화' },
            { name: '나루토', price: 12000, category: '만화' },
            { name: '블리치', price: 11000, category: '만화' },
            { name: '커피', price: 4500, category: '음료' },
            { name: '점심', price: 8000, category: '식사' },
            { name: '지하철', price: 1500, category: '교통' }
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

        return items;
    }

    static async addUserItem(email: string, item: Item): Promise<Item[]> {
        const items = await this.getUserItems(email);

        // 중복 체크
        if (items.find(existing => existing.name === item.name)) {
            throw new Error('이미 존재하는 품목입니다');
        }

        const newItems = [...items, item];
        await kv.set(this.getItemsKey(email), newItems);
        return newItems;
    }

    static async removeUserItem(email: string, itemName: string): Promise<Item[]> {
        const items = await this.getUserItems(email);
        const newItems = items.filter(item => item.name !== itemName);
        await kv.set(this.getItemsKey(email), newItems);
        return newItems;
    }

    // 거래 내역 관리
    static async getUserTransactions(email: string): Promise<Transaction[]> {
        const transactionsKey = this.getTransactionsKey(email);
        const transactions = await kv.get<Transaction[]>(transactionsKey);
        return transactions || [];
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