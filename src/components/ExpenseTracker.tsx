"use client"

import React, { useState, useMemo } from 'react';
import { Plus, Calendar, DollarSign, Tag, Search, Settings, BarChart3, List, Target, LogOut } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from './AuthProvider';

const ExpenseTracker = () => {
    const { user, logout } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [currentView, setCurrentView] = useState('list'); // 'list', 'chart'
    const [timeFilter, setTimeFilter] = useState('month'); // 'day', 'week', 'month', 'year'
    const [budget, setBudget] = useState(100000); // 한도 금액
    const [searchTerm, setSearchTerm] = useState('');

    // 기본 품목 리스트
    const [itemList, setItemList] = useState([
        { name: '원피스', price: 13000, category: '만화' },
        { name: '나루토', price: 12000, category: '만화' },
        { name: '블리치', price: 11000, category: '만화' },
        { name: '커피', price: 4500, category: '음료' },
        { name: '점심', price: 8000, category: '식사' },
        { name: '지하철', price: 1500, category: '교통' }
    ]);

    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        category: '만화',
        date: new Date().toISOString().split('T')[0],
        selectedItem: null
    });

    // 필터링된 품목 리스트
    const filteredItems = useMemo(() => {
        return itemList.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [itemList, searchTerm]);

    // 품목 선택 시 자동 금액 설정
    const handleItemSelect = (item) => {
        setFormData({
            ...formData,
            selectedItem: item,
            description: item.name,
            amount: item.price.toString(),
            category: item.category
        });
        setSearchTerm('');
    };

    // 새 품목 추가
    const addNewItem = () => {
        if (formData.description && formData.amount && !itemList.find(item => item.name === formData.description)) {
            const newItem = {
                name: formData.description,
                price: parseInt(formData.amount),
                category: formData.category
            };
            setItemList([...itemList, newItem]);
        }
    };

    const handleSubmit = () => {
        if (!formData.amount || !formData.description) return;

        addNewItem(); // 새 품목이면 추가

        const newTransaction = {
            id: Date.now(),
            amount: parseFloat(formData.amount),
            description: formData.description,
            category: formData.category,
            date: formData.date,
            timestamp: new Date(formData.date).getTime()
        };

        // @ts-expect-error - Adding new transaction to existing array
        setTransactions([newTransaction, ...transactions]);
        setFormData({
            amount: '',
            description: '',
            category: '만화',
            date: new Date().toISOString().split('T')[0],
            selectedItem: null
        });
        setShowForm(false);
    };

    // 날짜별 데이터 그룹핑
    const getGroupedData = () => {
        const now = new Date();
        let filteredTransactions = [];

        switch (timeFilter) {
            case 'day':
                // 최근 7일
                filteredTransactions = transactions.filter(t => {
                    const transactionDate = new Date(t.date);
                    const daysDiff = Math.floor((now - transactionDate) / (1000 * 60 * 60 * 24));
                    return daysDiff < 7;
                });
                break;
            case 'week':
                // 최근 4주
                filteredTransactions = transactions.filter(t => {
                    const transactionDate = new Date(t.date);
                    const weeksDiff = Math.floor((now - transactionDate) / (1000 * 60 * 60 * 24 * 7));
                    return weeksDiff < 4;
                });
                break;
            case 'month':
                // 최근 6개월
                filteredTransactions = transactions.filter(t => {
                    const transactionDate = new Date(t.date);
                    const monthsDiff = (now.getFullYear() - transactionDate.getFullYear()) * 12 +
                        (now.getMonth() - transactionDate.getMonth());
                    return monthsDiff < 6;
                });
                break;
            case 'year':
                // 최근 3년
                filteredTransactions = transactions.filter(t => {
                    const transactionDate = new Date(t.date);
                    const yearsDiff = now.getFullYear() - transactionDate.getFullYear();
                    return yearsDiff < 3;
                });
                break;
        }

        // 데이터 그룹핑
        const grouped = {};
        filteredTransactions.forEach(transaction => {
            const date = new Date(transaction.date);
            let key;

            switch (timeFilter) {
                case 'day':
                    key = `${date.getMonth() + 1}/${date.getDate()}`;
                    break;
                case 'week':
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    key = `${weekStart.getMonth() + 1}/${weekStart.getDate()}주`;
                    break;
                case 'month':
                    key = `${date.getFullYear()}.${date.getMonth() + 1}`;
                    break;
                case 'year':
                    key = `${date.getFullYear()}년`;
                    break;
            }

            if (!grouped[key]) {
                grouped[key] = { period: key, amount: 0, count: 0 };
            }
            grouped[key].amount += transaction.amount;
            grouped[key].count += 1;
        });

        return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
    };

    const chartData = getGroupedData();
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const remainingBudget = budget - totalSpent;

    return (
        <div className="max-w-md mx-auto bg-white min-h-screen">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">지출 관리</h1>
                        <p className="text-sm opacity-90">{user}님 환영합니다!</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                        >
                            <Settings size={20} />
                        </button>
                        <button
                            onClick={logout}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                            title="로그아웃"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* 예산 현황 */}
                <div className="mt-4">
                    <div className="flex justify-between text-sm opacity-90">
                        <span>이번 달 예산</span>
                        <span>{budget.toLocaleString()}원</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-2">
                        <div
                            className="bg-white h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((totalSpent / budget) * 100, 100)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                        <div>
                            <div className="text-lg font-bold">{totalSpent.toLocaleString()}원</div>
                            <div className="text-xs opacity-90">사용금액</div>
                        </div>
                        <div className="text-right">
                            <div className={`text-lg font-bold ${remainingBudget < 0 ? 'text-red-200' : ''}`}>
                                {remainingBudget.toLocaleString()}원
                            </div>
                            <div className="text-xs opacity-90">남은금액</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 탭 메뉴 */}
            <div className="flex bg-gray-100">
                <button
                    onClick={() => setCurrentView('list')}
                    className={`flex-1 py-3 flex items-center justify-center space-x-2 ${
                        currentView === 'list' ? 'bg-white shadow-sm' : ''
                    }`}
                >
                    <List size={18} />
                    <span>리스트</span>
                </button>
                <button
                    onClick={() => setCurrentView('chart')}
                    className={`flex-1 py-3 flex items-center justify-center space-x-2 ${
                        currentView === 'chart' ? 'bg-white shadow-sm' : ''
                    }`}
                >
                    <BarChart3 size={18} />
                    <span>그래프</span>
                </button>
            </div>

            {/* 기간 필터 */}
            <div className="p-4 bg-gray-50">
                <div className="flex space-x-2">
                    {[
                        { key: 'day', label: '일' },
                        { key: 'week', label: '주' },
                        { key: 'month', label: '월' },
                        { key: 'year', label: '년' }
                    ].map(filter => (
                        <button
                            key={filter.key}
                            onClick={() => setTimeFilter(filter.key)}
                            className={`px-3 py-1 rounded-full text-sm ${
                                timeFilter === filter.key
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white text-gray-600'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="p-4">
                {currentView === 'list' ? (
                    <div>
                        <h2 className="text-lg font-semibold mb-4">
                            {timeFilter === 'day' ? '최근 7일' :
                                timeFilter === 'week' ? '최근 4주' :
                                    timeFilter === 'month' ? '최근 6개월' : '최근 3년'} 내역
                        </h2>

                        {transactions.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p>아직 내역이 없어요</p>
                                <p className="text-sm mt-2">+ 버튼을 눌러 추가해보세요!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactions.slice(0, 20).map(transaction => (
                                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center mb-1">
                                                <span className="text-sm text-gray-500">{transaction.category}</span>
                                                <span className="mx-2 text-gray-300">•</span>
                                                <span className="text-sm text-gray-500">{transaction.date}</span>
                                            </div>
                                            <div className="font-medium">{transaction.description}</div>
                                        </div>
                                        <div className="font-bold text-red-600">
                                            -{transaction.amount.toLocaleString()}원
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <h2 className="text-lg font-semibold mb-4">지출 통계</h2>

                        {chartData.length > 0 ? (
                            <div className="space-y-6">
                                {/* 막대 그래프 */}
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h3 className="text-sm font-medium text-gray-600 mb-3">
                                        {timeFilter === 'day' ? '일별' :
                                            timeFilter === 'week' ? '주별' :
                                                timeFilter === 'month' ? '월별' : '년별'} 지출
                                    </h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="period" />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value) => [`${value.toLocaleString()}원`, '지출액']}
                                            />
                                            <Bar dataKey="amount" fill="#3B82F6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* 라인 그래프 */}
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h3 className="text-sm font-medium text-gray-600 mb-3">지출 추이</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="period" />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value) => [`${value.toLocaleString()}원`, '지출액']}
                                            />
                                            <Line type="monotone" dataKey="amount" stroke="#8B5CF6" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* 통계 요약 */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <div className="text-sm text-blue-600">총 지출</div>
                                        <div className="text-lg font-bold text-blue-700">
                                            {chartData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}원
                                        </div>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <div className="text-sm text-green-600">평균 지출</div>
                                        <div className="text-lg font-bold text-green-700">
                                            {Math.round(chartData.reduce((sum, item) => sum + item.amount, 0) / Math.max(chartData.length, 1)).toLocaleString()}원
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <p>표시할 데이터가 없어요</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 입력 폼 */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
                    <div className="bg-white w-full rounded-t-lg p-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">지출 추가</h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-gray-500 text-xl hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        {/* 품목 검색 */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2">품목 검색</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="품목명을 검색하세요"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* 품목 리스트 */}
                            {searchTerm && (
                                <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg">
                                    {filteredItems.map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleItemSelect(item)}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                                        >
                                            <div className="flex justify-between">
                                                <span>{item.name}</span>
                                                <span className="text-gray-500">{item.price.toLocaleString()}원</span>
                                            </div>
                                            <div className="text-xs text-gray-400">{item.category}</div>
                                        </button>
                                    ))}
                                    {filteredItems.length === 0 && (
                                        <div className="px-4 py-2 text-gray-500 text-sm">
                                            검색 결과가 없습니다. 새로운 품목으로 추가됩니다.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 품목명 입력 */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2">품목명</label>
                            <input
                                type="text"
                                placeholder="품목명을 입력하세요"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* 금액 입력 */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2">금액</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                    className="w-full pl-10 pr-4 py-3 border rounded-lg text-right text-xl focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* 카테고리 선택 */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2">카테고리</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-3 text-gray-400" size={20} />
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    className="w-full pl-10 pr-4 py-3 border rounded-lg appearance-none focus:outline-none focus:border-blue-500"
                                >
                                    <option value="만화">만화</option>
                                    <option value="음료">음료</option>
                                    <option value="식사">식사</option>
                                    <option value="교통">교통</option>
                                    <option value="기타">기타</option>
                                </select>
                            </div>
                        </div>

                        {/* 날짜 선택 */}
                        <div className="mb-6">
                            <label className="block text-sm text-gray-600 mb-2">날짜</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* 저장 버튼 */}
                        <button
                            onClick={handleSubmit}
                            className="w-full py-3 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                            저장하기
                        </button>
                    </div>
                </div>
            )}

            {/* 설정 화면 */}
            {showSettings && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-80">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">설정</h2>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="text-gray-500 text-xl hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2">월 예산 한도</label>
                            <div className="relative">
                                <Target className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="number"
                                    value={budget}
                                    onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
                                    className="w-full pl-10 pr-4 py-3 border rounded-lg text-right text-xl focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => setShowSettings(false)}
                            className="w-full py-3 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                            저장
                        </button>
                    </div>
                </div>
            )}

            {/* 추가 버튼 */}
            <button
                onClick={() => setShowForm(true)}
                className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-colors z-40"
            >
                <Plus size={24} />
            </button>
        </div>
    );
};

export default ExpenseTracker;