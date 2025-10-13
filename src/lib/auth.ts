import {kv} from '@vercel/kv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface User {
    email: string;
    hashedPassword: string;
    createdAt: string;
}

export class AuthService {
    private static getUserKey(email: string): string {
        return `user:${email.toLowerCase()}`;
    }

    static async createUser(email: string, password: string): Promise<User> {
        const userKey = this.getUserKey(email);

        // 이미 존재하는 사용자 확인
        const existingUser = await kv.get<User>(userKey);
        if (existingUser) {
            throw new Error('이미 가입된 이메일입니다');
        }

        // 비밀번호 해싱
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 새 사용자 생성
        const newUser: User = {
            email: email.toLowerCase(),
            hashedPassword,
            createdAt: new Date().toISOString(),
        };

        // KV에 저장
        await kv.set(userKey, newUser);

        return newUser;
    }

    /**
     * 로그인
     * @param email
     * @param password
     */
    static async authenticateUser(email: string, password: string): Promise<User> {
        const userKey = this.getUserKey(email);

        // 사용자 조회
        const user = await kv.get<User>(userKey);
        if (!user) {
            throw new Error('이메일 또는 비밀번호가 잘못되었습니다');
        }

        // 비밀번호 검증
        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isValid) {
            throw new Error('이메일 또는 비밀번호가 잘못되었습니다');
        }

        return user;
    }

    static async getUserByEmail(email: string): Promise<User | null> {
        const userKey = this.getUserKey(email);
        return await kv.get<User>(userKey);
    }

    static validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password: string): { isValid: boolean; message?: string } {
        if (!password) {
            return { isValid: false, message: '비밀번호를 입력해주세요' };
        }
        if (password.length < 6) {
            return { isValid: false, message: '비밀번호는 최소 6자 이상이어야 합니다' };
        }
        return { isValid: true };
    }

    /**
     * 토큰 생성
     * @param user
     */
    static generateToken(user: User): string {
        const secret = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
        const payload = {
            email: user.email,
            createdAt: user.createdAt
        };

        return jwt.sign(payload, secret, {
            expiresIn: '7d',
            algorithm: 'HS256'
        });
    }

    static verifyToken(token: string): { email: string; createdAt: string } | null {
        try {
            const secret = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
            return jwt.verify(token, secret) as { email: string; createdAt: string };
        } catch {
            return null;
        }
    }
}