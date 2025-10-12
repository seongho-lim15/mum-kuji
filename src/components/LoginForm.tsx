"use client"

import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import {postLogin, postSignUp} from "@/services/auth";

interface LoginFormProps {
    onLoginSuccess: (email: string, token?: string) => void;
}

const LoginForm = ({ onLoginSuccess } : LoginFormProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 유효성 검사
        if (!email || !password) {
            setError('모든 필드를 입력해주세요!');
            return;
        }

        if (!email.includes('@')) {
            setError('올바른 이메일 형식이 아닙니다');
            return;
        }

        if (password.length < 6) {
            setError('비밀번호는 최소 6자 이상이어야 합니다');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const handleAuth = isLogin ? postLogin : postSignUp;
            const data = await handleAuth({email, password});

            if (isLogin) {
                // 로그인 성공 - 토큰과 함께 콜백 호출
                onLoginSuccess(data.email, data.token);

                // AuthProvider 상태 변경으로 자동으로 ExpenseTracker가 렌더링됨
                // router.push('/') 제거 - 불필요한 페이지 새로고침 방지
            } else {
                // 회원가입 성공
                setIsLogin(true);
                setPassword('');
                setError('');
                alert('🎉 회원가입 완료! 이제 로그인해주세요.');
            }
        } catch {
            setError('서버와 연결할 수 없습니다');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
            {/* 배경 장식 */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 backdrop-blur-sm">
                {/* 헤더 */}
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                        <div className="text-4xl">💰</div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        지출 관리
                    </h1>
                    <p className="text-gray-600">
                        {isLogin ? '돌아오신 것을 환영합니다!' : '새로운 시작을 응원합니다!'}
                    </p>
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center">
                        <span className="mr-2">⚠️</span>
                        {error}
                    </div>
                )}

                {/* 폼 */}
                <div className="space-y-5">
                    {/* 이메일 입력 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            이메일
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-500"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* 비밀번호 입력 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            비밀번호
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-500"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {!isLogin && (
                            <p className="text-xs text-gray-500 mt-1">
                                최소 6자 이상 입력해주세요
                            </p>
                        )}
                    </div>

                    {/* 제출 버튼 */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !email || !password}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3.5 rounded-lg font-semibold transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 shadow-lg"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>처리중...</span>
                            </>
                        ) : (
                            <>
                                {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                                <span>{isLogin ? '로그인' : '회원가입'}</span>
                            </>
                        )}
                    </button>
                </div>

                {/* 모드 전환 */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setPassword('');
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                        disabled={loading}
                    >
                        {isLogin
                            ? '계정이 없으신가요? 회원가입 →'
                            : '이미 계정이 있으신가요? 로그인 →'}
                    </button>
                </div>

                {/* 하단 정보 */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                        <span>🔒</span>
                        <span>Vercel KV 클라우드 저장소</span>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-2">
                        모든 기기에서 데이터 동기화
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
