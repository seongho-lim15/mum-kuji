"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Calendar, DollarSign, Tag, Search, Settings, BarChart3, List, Target, LogOut, Edit2, Trash2, Minus } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from './AuthProvider';
import { Item, Transaction, UserSettings } from '@/lib/dataService';

const ExpenseTracker = () => {
    const { user, logout } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [itemList, setItemList] = useState<Item[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAddItemForm, setShowAddItemForm] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
    const [currentView, setCurrentView] = useState('list');
    const [timeFilter, setTimeFilter] = useState('month');
    const [budget, setBudget] = useState(100000);
    const [searchTerm, setSearchTerm] = useState('');
    const [editSearchTerm, setEditSearchTerm] = useState('');
    const [selectedItemFilter, setSelectedItemFilter] = useState<string>('전체');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        unitPrice: '',
        quantity: '1',
        description: '',
        category: '만화',
        date: new Date().toISOString().split('T')[0],
        selectedItem: null as Item | null
    });

    const [editFormData, setEditFormData] = useState({
        unitPrice: '',
        quantity: '1',
        description: '',
        category: '만화',
        date: '',
        selectedItem: null as Item | null
    });

    const [addItemFormData, setAddItemFormData] = useState({
        name: '',
        price: '',
        category: '만화'
    });

    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [showEditItemForm, setShowEditItemForm] = useState(false);
    const [showDeleteItemConfirm, setShowDeleteItemConfirm] = useState(false);
    const [deletingItem, setDeletingItem] = useState<Item | null>(null);

    const [editItemFormData, setEditItemFormData] = useState({
        name: '',
        price: '',
        category: '만화'
    });

    // 총 금액 계산 (등록용)
    const totalAmount = useMemo(() => {
        const price = parseFloat(formData.unitPrice) || 0;
        const qty = parseInt(formData.quantity) || 1;
        return price * qty;
    }, [formData.unitPrice, formData.quantity]);

    // 총 금액 계산 (수정용)
    const editTotalAmount = useMemo(() => {
        const price = parseFloat(editFormData.unitPrice) || 0;
        const qty = parseInt(editFormData.quantity) || 1;
        return price * qty;
    }, [editFormData.unitPrice, editFormData.quantity]);

    // 데이터 로드
    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            try {
                setIsLoading(true);

                // 병렬로 데이터 로드
                const [itemsRes, transactionsRes, settingsRes] = await Promise.all([
                    fetch('/api/data/items'),
                    fetch('/api/data/transactions'),
                    fetch('/api/data/settings')
                ]);

                if (itemsRes.ok) {
                    const { items } = await itemsRes.json();
                    setItemList(items);
                }

                if (transactionsRes.ok) {
                    const { transactions } = await transactionsRes.json();
                    setTransactions(transactions);
                }

                if (settingsRes.ok) {
                    const { settings } = await settingsRes.json();
                    setBudget(settings.budget);
                    setTimeFilter(settings.timeFilter);
                    setCurrentView(settings.currentView);
                }

            } catch (err) {
                setError('데이터를 불러오는 중 오류가 발생했습니다');
                console.error('데이터 로드 오류:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user]);

    // 필터링된 품목 리스트 (등록용)
    const filteredItems = useMemo(() => {
        return itemList.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [itemList, searchTerm]);

    // 필터링된 품목 리스트 (수정용)
    const editFilteredItems = useMemo(() => {
        return itemList.filter(item =>
            item.name.toLowerCase().includes(editSearchTerm.toLowerCase())
        );
    }, [itemList, editSearchTerm]);

    // 품목 선택 시 자동 금액 설정 (등록용)
    const handleItemSelect = (item: Item) => {
        setFormData({
            ...formData,
            selectedItem: item,
            description: item.name,
            unitPrice: item.price.toString(),
            quantity: '1',
            category: item.category
        });
        setSearchTerm('');
    };

    // 품목 선택 시 자동 금액 설정 (수정용)
    const handleEditItemSelect = (item: Item) => {
        setEditFormData({
            ...editFormData,
            selectedItem: item,
            description: item.name,
            unitPrice: item.price.toString(),
            category: item.category
        });
        setEditSearchTerm('');
    };

    // 새 품목 추가 (API 호출)
    const addNewItem = async (item: { name: string; price: number; category: string }) => {
        try {
            const response = await fetch('/api/data/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });

            if (response.ok) {
                const { items } = await response.json();
                setItemList(items);
                return items[items.length - 1]; // 새로 추가된 품목 반환
            } else {
                const { error } = await response.json();
                setError(error);
                return null;
            }
        } catch {
            setError('품목 추가 중 오류가 발생했습니다');
            return null;
        }
    };

    // 거래 추가 (API 호출)
    const addTransaction = async (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
        try {
            const response = await fetch('/api/data/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transaction)
            });

            if (response.ok) {
                const { transactions } = await response.json();
                setTransactions(transactions);
                return true;
            } else {
                const { error } = await response.json();
                setError(error);
                return false;
            }
        } catch {
            setError('거래 추가 중 오류가 발생했습니다');
            return false;
        }
    };

    // 거래 삭제 (API 호출)
    const deleteTransaction = async (transactionId: number) => {
        try {
            const response = await fetch(`/api/data/transactions?id=${transactionId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const { transactions } = await response.json();
                setTransactions(transactions);
                return true;
            } else {
                const { error } = await response.json();
                setError(error);
                return false;
            }
        } catch {
            setError('거래 삭제 중 오류가 발생했습니다');
            return false;
        }
    };

    // 설정 업데이트 (API 호출)
    const updateSettings = async (settings: Partial<UserSettings>) => {
        try {
            const response = await fetch('/api/data/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (!response.ok) {
                const { error } = await response.json();
                setError(error);
            }
        } catch {
            setError('설정 저장 중 오류가 발생했습니다');
        }
    };

    const handleSubmit = async () => {
        if (!formData.unitPrice || !formData.description || !formData.quantity) return;

        setError('');

        let selectedItemId: string | undefined;

        // 선택된 품목이 있는 경우 해당 품목의 ID 사용
        if (formData.selectedItem) {
            selectedItemId = formData.selectedItem.id;
        } else {
            // 새 품목 추가 (중복되지 않는 경우)
            const existingItem = itemList.find(item => item.name === formData.description);
            if (existingItem) {
                selectedItemId = existingItem.id;
            } else {
                const newItem = await addNewItem({
                    name: formData.description,
                    price: parseInt(formData.unitPrice),
                    category: formData.category
                });
                if (newItem) {
                    selectedItemId = newItem.id;
                }
            }
        }

        // 거래 추가 (총 금액과 단가, 수량, 품목 ID 저장)
        const success = await addTransaction({
            amount: totalAmount,
            unitPrice: parseFloat(formData.unitPrice),
            quantity: parseInt(formData.quantity),
            description: formData.description,
            category: formData.category,
            date: formData.date,
            itemId: selectedItemId
        });

        if (success) {
            setFormData({
                unitPrice: '',
                quantity: '1',
                description: '',
                category: '만화',
                date: new Date().toISOString().split('T')[0],
                selectedItem: null
            });
            setShowForm(false);
        }
    };

    // 수정 폼 열기
    const handleEditTransaction = (transaction: Transaction) => {
        setEditingTransaction(transaction);

        // 기존 거래에서 품목 ID로 해당 품목 찾기 (itemId가 있을 때만)
        const existingItem = transaction.itemId ?
            itemList.find(item => item.id === transaction.itemId) :
            null;

        setEditFormData({
            unitPrice: transaction.unitPrice ? transaction.unitPrice.toString() : transaction.amount.toString(),
            quantity: transaction.quantity ? transaction.quantity.toString() : '1',
            description: transaction.description,
            category: transaction.category,
            date: transaction.date,
            selectedItem: existingItem || null
        });
        setEditSearchTerm('');
        setShowEditForm(true);
    };

    // 수정 처리
    const handleEditSubmit = async () => {
        if (!editFormData.unitPrice || !editFormData.description || !editFormData.quantity || !editingTransaction) return;

        setError('');

        // 품목 ID 설정
        let selectedItemId: string | undefined = editingTransaction.itemId;

        // 선택된 품목이 있는 경우에만 해당 품목의 ID 사용
        if (editFormData.selectedItem) {
            selectedItemId = editFormData.selectedItem.id;
        }

        try {
            const response = await fetch(`/api/data/transactions?id=${editingTransaction.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: editTotalAmount,
                    unitPrice: parseFloat(editFormData.unitPrice),
                    quantity: parseInt(editFormData.quantity),
                    description: editFormData.description,
                    category: editFormData.category,
                    date: editFormData.date,
                    itemId: selectedItemId
                })
            });

            if (response.ok) {
                const { transactions } = await response.json();
                setTransactions(transactions);
                setEditFormData({
                    unitPrice: '',
                    quantity: '1',
                    description: '',
                    category: '만화',
                    date: '',
                    selectedItem: null
                });
                setEditSearchTerm('');
                setEditingTransaction(null);
                setShowEditForm(false);
            } else {
                const { error } = await response.json();
                setError(error);
            }
        } catch {
            setError('거래 수정 중 오류가 발생했습니다');
        }
    };

    // 삭제 확인 열기
    const handleDeleteTransaction = (transaction: Transaction) => {
        setDeletingTransaction(transaction);
        setShowDeleteConfirm(true);
    };

    // 삭제 처리
    const confirmDelete = async () => {
        if (!deletingTransaction) return;

        const success = await deleteTransaction(deletingTransaction.id);
        if (success) {
            setDeletingTransaction(null);
            setShowDeleteConfirm(false);
        }
    };

    // 금액 증감 함수 (등록용)
    const adjustAmount = (amount: number) => {
        const currentAmount = parseFloat(formData.unitPrice) || 0;
        const newAmount = Math.max(0, currentAmount + amount);
        setFormData({...formData, unitPrice: newAmount.toString()});
    };

    // 금액 증감 함수 (수정용)
    const adjustEditAmount = (amount: number) => {
        const currentAmount = parseFloat(editFormData.unitPrice) || 0;
        const newAmount = Math.max(0, currentAmount + amount);
        setEditFormData({...editFormData, unitPrice: newAmount.toString()});
    };

    // 수량 증감 함수 (등록용)
    const adjustQuantity = (amount: number) => {
        const currentQuantity = parseInt(formData.quantity) || 1;
        const newQuantity = Math.max(1, currentQuantity + amount);
        setFormData({...formData, quantity: newQuantity.toString()});
    };

    // 수량 증감 함수 (수정용)
    const adjustEditQuantity = (amount: number) => {
        const currentQuantity = parseInt(editFormData.quantity) || 1;
        const newQuantity = Math.max(1, currentQuantity + amount);
        setEditFormData({...editFormData, quantity: newQuantity.toString()});
    };

    // 품목 추가용 금액 증감 함수
    const adjustAddItemPrice = (amount: number) => {
        const currentPrice = parseFloat(addItemFormData.price) || 0;
        const newPrice = Math.max(0, currentPrice + amount);
        setAddItemFormData({...addItemFormData, price: newPrice.toString()});
    };

    // 품목 추가 처리
    const handleAddItemSubmit = async () => {
        if (!addItemFormData.name || !addItemFormData.price) return;

        setError('');

        const success = await addNewItem({
            name: addItemFormData.name,
            price: parseFloat(addItemFormData.price),
            category: addItemFormData.category
        });

        if (success) {
            setAddItemFormData({
                name: '',
                price: '',
                category: '만화'
            });
            setShowAddItemForm(false);
        }
    };

    // 품목 수정 폼 열기
    const handleEditItem = (item: Item) => {
        setEditingItem(item);
        setEditItemFormData({
            name: item.name,
            price: item.price.toString(),
            category: item.category
        });
        setShowEditItemForm(true);
    };

    // 품목 수정 처리
    const handleEditItemSubmit = async () => {
        if (!editItemFormData.name || !editItemFormData.price || !editingItem) return;

        setError('');

        try {
            const response = await fetch(`/api/data/items?id=${editingItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editItemFormData.name,
                    price: parseFloat(editItemFormData.price),
                    category: editItemFormData.category
                })
            });

            if (response.ok) {
                const { items } = await response.json();
                setItemList(items);
                setEditItemFormData({
                    name: '',
                    price: '',
                    category: '만화'
                });
                setEditingItem(null);
                setShowEditItemForm(false);
            } else {
                const { error } = await response.json();
                setError(error);
            }
        } catch {
            setError('품목 수정 중 오류가 발생했습니다');
        }
    };

    // 품목 삭제 확인 열기
    const handleDeleteItem = (item: Item) => {
        setDeletingItem(item);
        setShowDeleteItemConfirm(true);
    };

    // 품목 삭제 처리
    const confirmDeleteItem = async () => {
        if (!deletingItem) return;

        try {
            const response = await fetch(`/api/data/items?id=${deletingItem.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const { items } = await response.json();
                setItemList(items);
                setDeletingItem(null);
                setShowDeleteItemConfirm(false);
            } else {
                const { error } = await response.json();
                setError(error);
            }
        } catch {
            setError('품목 삭제 중 오류가 발생했습니다');
        }
    };

    // 품목 수정용 금액 증감 함수
    const adjustEditItemPrice = (amount: number) => {
        const currentPrice = parseFloat(editItemFormData.price) || 0;
        const newPrice = Math.max(0, currentPrice + amount);
        setEditItemFormData({...editItemFormData, price: newPrice.toString()});
    };

    // 시간과 품목으로 필터링된 거래 목록
    const getFilteredTransactions = () => {
        const now = new Date();
        let timeFilteredTransactions: Transaction[] = [];

        switch (timeFilter) {
            case 'day':
                // 최근 7일
                timeFilteredTransactions = transactions.filter(t => {
                    const transactionDate = new Date(t.date);
                    const daysDiff = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
                    return daysDiff < 7;
                });
                break;
            case 'week':
                // 최근 4주
                timeFilteredTransactions = transactions.filter(t => {
                    const transactionDate = new Date(t.date);
                    const weeksDiff = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
                    return weeksDiff < 4;
                });
                break;
            case 'month':
                // 최근 6개월
                timeFilteredTransactions = transactions.filter(t => {
                    const transactionDate = new Date(t.date);
                    const monthsDiff = (now.getFullYear() - transactionDate.getFullYear()) * 12 +
                        (now.getMonth() - transactionDate.getMonth());
                    return monthsDiff < 6;
                });
                break;
            case 'year':
                // 최근 3년
                timeFilteredTransactions = transactions.filter(t => {
                    const transactionDate = new Date(t.date);
                    const yearsDiff = now.getFullYear() - transactionDate.getFullYear();
                    return yearsDiff < 3;
                });
                break;
            default:
                timeFilteredTransactions = transactions;
                break;
        }

        // 품목별 필터링
        if (selectedItemFilter === '전체') {
            return timeFilteredTransactions;
        } else {
            const selectedItem = itemList.find(item => item.name === selectedItemFilter);
            if (selectedItem) {
                return timeFilteredTransactions.filter(t => t.itemId === selectedItem.id);
            }
            // itemId가 없는 기존 데이터를 위한 fallback
            return timeFilteredTransactions.filter(t => t.description === selectedItemFilter);
        }
    };

    // 필터링된 거래 목록과 합계
    const filteredTransactions = getFilteredTransactions();
    const filteredTotal = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

    // 날짜별 데이터 그룹핑
    const getGroupedData = () => {
        // 이미 필터링된 거래 목록 사용
        const transactionsToGroup = filteredTransactions;

        // 데이터 그룹핑
        const grouped: { [key: string]: { period: string; amount: number; count: number } } = {};
        transactionsToGroup.forEach(transaction => {
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

    // 설정 변경 핸들러들
    const handleViewChange = async (view: string) => {
        setCurrentView(view);
        await updateSettings({ currentView: view });
    };

    const handleTimeFilterChange = async (filter: string) => {
        setTimeFilter(filter);
        await updateSettings({ timeFilter: filter });
    };

    const handleBudgetChange = async (newBudget: number) => {
        setBudget(newBudget);
        await updateSettings({ budget: newBudget });
    };

    const chartData = getGroupedData();

    // 이번 달 지출 계산
    const thisMonthSpent = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const now = new Date();
        return transactionDate.getFullYear() === now.getFullYear() &&
               transactionDate.getMonth() === now.getMonth();
    }).reduce((sum, t) => sum + t.amount, 0);

    const remainingBudget = budget - thisMonthSpent;

    // 로딩 상태
    if (isLoading) {
        return (
            <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-white min-h-screen">
            {/* 에러 표시 */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4 rounded">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-red-400">⚠️</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                            <button
                                onClick={() => setError('')}
                                className="text-xs text-red-600 hover:text-red-800 mt-1"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 헤더 */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">지출 관리</h1>
                        <p className="text-sm opacity-90">{user}님 환영합니다!</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowAddItemForm(true)}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                            title="품목 추가"
                        >
                            <Plus size={20} />
                        </button>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                            title="설정"
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
                            style={{ width: `${Math.min((thisMonthSpent / budget) * 100, 100)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                        <div>
                            <div className="text-lg font-bold">{thisMonthSpent.toLocaleString()}원</div>
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
                    onClick={() => handleViewChange('list')}
                    className={`flex-1 py-3 flex items-center justify-center space-x-2 ${
                        currentView === 'list' ? 'bg-white shadow-sm' : ''
                    }`}
                >
                    <List size={18} />
                    <span>리스트</span>
                </button>
                <button
                    onClick={() => handleViewChange('chart')}
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
                            onClick={() => handleTimeFilterChange(filter.key)}
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
                {/* 품목 필터 */}
                <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-2">품목별 필터</label>
                    <select
                        value={selectedItemFilter}
                        onChange={(e) => setSelectedItemFilter(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                    >
                        <option value="전체">전체</option>
                        {itemList.map((item) => (
                            <option key={item.id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 필터링된 기간의 합계 표시 */}
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">
                        {timeFilter === 'day' ? '최근 7일' :
                         timeFilter === 'week' ? '최근 4주' :
                         timeFilter === 'month' ? '최근 6개월' : '최근 3년'}
                        {selectedItemFilter !== '전체' ? ` (${selectedItemFilter})` : ''} 총 지출:
                        <span className="text-green-800 font-bold ml-1">{filteredTotal.toLocaleString()}원</span>
                    </div>
                </div>

                {currentView === 'list' ? (
                    <div>
                        <h2 className="text-lg font-semibold mb-4">
                            {timeFilter === 'day' ? '최근 7일' :
                                timeFilter === 'week' ? '최근 4주' :
                                    timeFilter === 'month' ? '최근 6개월' : '최근 3년'} 내역
                        </h2>

                        {filteredTransactions.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p>해당 조건의 내역이 없어요</p>
                                <p className="text-sm mt-2">다른 기간이나 품목을 선택해보세요!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredTransactions
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .map(transaction => (
                                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center mb-1">
                                                <span className="text-sm text-gray-500">{transaction.category}</span>
                                                <span className="mx-2 text-gray-300">•</span>
                                                <span className="text-sm text-gray-500">{transaction.date}</span>
                                            </div>
                                            <div className="font-medium">{transaction.description}</div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="font-bold text-red-600">
                                                -{transaction.amount.toLocaleString()}원
                                            </div>
                                            <div className="flex space-x-1">
                                                <button
                                                    onClick={() => handleEditTransaction(transaction)}
                                                    className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                                                    title="수정"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTransaction(transaction)}
                                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                                    title="삭제"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
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
                                    {filteredItems.map((item) => (
                                        <button
                                            key={item.id}
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
                                onChange={(e) => setFormData({...formData, description: e.target.value, selectedItem: null})}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500"
                            />
                            {formData.selectedItem && (
                                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                                    선택된 품목: {formData.selectedItem.name} ({formData.selectedItem.price.toLocaleString()}원)
                                </div>
                            )}
                        </div>

                        {/* 단가 입력 */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2">단가</label>
                            <div className="flex items-center space-x-2">
                                <div className="flex-1 relative">
                                    <DollarSign className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={formData.unitPrice}
                                        onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 border rounded-lg text-right text-xl focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => adjustAmount(-1000)}
                                        className="flex-shrink-0 w-12 h-12 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors"
                                        type="button"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <button
                                        onClick={() => adjustAmount(1000)}
                                        className="flex-shrink-0 w-12 h-12 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-colors"
                                        type="button"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 갯수 입력 */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2">갯수</label>
                            <div className="flex items-center space-x-2">
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        placeholder="1"
                                        min="1"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                        className="w-full px-4 py-3 border rounded-lg text-right text-xl focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => adjustQuantity(-1)}
                                        className="flex-shrink-0 w-12 h-12 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors"
                                        type="button"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <button
                                        onClick={() => adjustQuantity(1)}
                                        className="flex-shrink-0 w-12 h-12 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-colors"
                                        type="button"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 총 금액 표시 */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2">총 금액</label>
                            <div className="w-full px-4 py-3 border rounded-lg text-right text-xl bg-gray-50 text-gray-700 font-bold">
                                {totalAmount.toLocaleString()}원
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
                        <div className="mb-6 w-full">
                            <label className="block text-sm text-gray-600 mb-2">날짜</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                onClick={(e) => e.currentTarget.showPicker?.()}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
                            />
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

            {/* 수정 폼 */}
            {showEditForm && editingTransaction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
                    <div className="bg-white w-full rounded-t-lg p-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">지출 수정</h2>
                            <button
                                onClick={() => {
                                    setShowEditForm(false);
                                    setEditingTransaction(null);
                                    setEditSearchTerm('');
                                }}
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
                                    value={editSearchTerm}
                                    onChange={(e) => setEditSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* 품목 리스트 */}
                            {editSearchTerm && (
                                <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg">
                                    {editFilteredItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleEditItemSelect(item)}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                                        >
                                            <div className="flex justify-between">
                                                <span>{item.name}</span>
                                                <span className="text-gray-500">{item.price.toLocaleString()}원</span>
                                            </div>
                                            <div className="text-xs text-gray-400">{item.category}</div>
                                        </button>
                                    ))}
                                    {editFilteredItems.length === 0 && (
                                        <div className="px-4 py-2 text-gray-500 text-sm">
                                            검색 결과가 없습니다.
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
                                value={editFormData.description}
                                onChange={(e) => setEditFormData({...editFormData, description: e.target.value, selectedItem: null})}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500"
                            />
                            {editFormData.selectedItem && (
                                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                                    선택된 품목: {editFormData.selectedItem.name} ({editFormData.selectedItem.price.toLocaleString()}원)
                                </div>
                            )}
                        </div>

                        {/* 단가 입력 */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2">단가</label>
                            <div className="flex items-center space-x-2">
                                <div className="flex-1 relative">
                                    <DollarSign className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={editFormData.unitPrice}
                                        onChange={(e) => setEditFormData({...editFormData, unitPrice: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 border rounded-lg text-right text-xl focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => adjustEditAmount(-1000)}
                                        className="flex-shrink-0 w-12 h-12 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors"
                                        type="button"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <button
                                        onClick={() => adjustEditAmount(1000)}
                                        className="flex-shrink-0 w-12 h-12 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-colors"
                                        type="button"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 갯수 입력 */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2">갯수</label>
                            <div className="flex items-center space-x-2">
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        placeholder="1"
                                        min="1"
                                        value={editFormData.quantity}
                                        onChange={(e) => setEditFormData({...editFormData, quantity: e.target.value})}
                                        className="w-full px-4 py-3 border rounded-lg text-right text-xl focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => adjustEditQuantity(-1)}
                                        className="flex-shrink-0 w-12 h-12 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors"
                                        type="button"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <button
                                        onClick={() => adjustEditQuantity(1)}
                                        className="flex-shrink-0 w-12 h-12 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-colors"
                                        type="button"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 총 금액 표시 */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2">총 금액</label>
                            <div className="w-full px-4 py-3 border rounded-lg text-right text-xl bg-gray-50 text-gray-700 font-bold">
                                {editTotalAmount.toLocaleString()}원
                            </div>
                        </div>

                        {/* 카테고리 선택 */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2">카테고리</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-3 text-gray-400" size={20} />
                                <select
                                    value={editFormData.category}
                                    onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
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
                            <input
                                type="date"
                                value={editFormData.date}
                                onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                                onClick={(e) => e.currentTarget.showPicker?.()}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
                            />
                        </div>

                        {/* 수정 버튼 */}
                        <button
                            onClick={handleEditSubmit}
                            className="w-full py-3 rounded-lg text-white font-semibold bg-green-600 hover:bg-green-700 transition-colors"
                        >
                            수정하기
                        </button>
                    </div>
                </div>
            )}

            {/* 삭제 확인 모달 */}
            {showDeleteConfirm && deletingTransaction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-80">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold mb-2">삭제 확인</h2>
                            <p className="text-gray-600">정말로 삭제하시겠습니까?</p>
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <div className="font-medium">{deletingTransaction.description}</div>
                                <div className="text-sm text-gray-500">{deletingTransaction.date}</div>
                                <div className="font-bold text-red-600">-{deletingTransaction.amount.toLocaleString()}원</div>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeletingTransaction(null);
                                }}
                                className="flex-1 py-3 rounded-lg text-gray-700 font-semibold bg-gray-200 hover:bg-gray-300 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 rounded-lg text-white font-semibold bg-red-600 hover:bg-red-700 transition-colors"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 품목 추가 모달 */}
            {showAddItemForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-80">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">품목 추가</h2>
                            <button
                                onClick={() => setShowAddItemForm(false)}
                                className="text-gray-500 text-xl hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        {/* 품목명 입력 */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2">품목명</label>
                            <input
                                type="text"
                                placeholder="품목명을 입력하세요"
                                value={addItemFormData.name}
                                onChange={(e) => setAddItemFormData({...addItemFormData, name: e.target.value})}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* 단가 입력 */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2">단가</label>
                            <div className="flex items-center space-x-2">
                                <div className="flex-1 relative">
                                    <DollarSign className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={addItemFormData.price}
                                        onChange={(e) => setAddItemFormData({...addItemFormData, price: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 border rounded-lg text-right text-xl focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => adjustAddItemPrice(-1000)}
                                        className="flex-shrink-0 w-12 h-12 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors"
                                        type="button"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <button
                                        onClick={() => adjustAddItemPrice(1000)}
                                        className="flex-shrink-0 w-12 h-12 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-colors"
                                        type="button"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 카테고리 선택 */}
                        <div className="mb-6">
                            <label className="block text-sm text-gray-600 mb-2">카테고리</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-3 text-gray-400" size={20} />
                                <select
                                    value={addItemFormData.category}
                                    onChange={(e) => setAddItemFormData({...addItemFormData, category: e.target.value})}
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

                        {/* 저장 버튼 */}
                        <button
                            onClick={handleAddItemSubmit}
                            className="w-full py-3 rounded-lg text-white font-semibold bg-green-600 hover:bg-green-700 transition-colors mb-6"
                        >
                            품목 추가
                        </button>

                        {/* 품목 리스트 */}
                        <div>
                            <h3 className="text-md font-semibold mb-3 text-gray-700">등록된 품목</h3>
                            <div className="max-h-60 overflow-y-auto border rounded-lg">
                                {itemList.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 text-sm">
                                        등록된 품목이 없습니다
                                    </div>
                                ) : (
                                    itemList.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50">
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-800">{item.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {item.price.toLocaleString()}원 • {item.category}
                                                </div>
                                            </div>
                                            <div className="flex space-x-1 ml-2">
                                                <button
                                                    onClick={() => handleEditItem(item)}
                                                    className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                                                    title="수정"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(item)}
                                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                                    title="삭제"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
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
                                    onChange={(e) => handleBudgetChange(parseInt(e.target.value) || 0)}
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

            {/* 품목 수정 모달 */}
            {showEditItemForm && editingItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-80">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">품목 수정</h2>
                            <button
                                onClick={() => {
                                    setShowEditItemForm(false);
                                    setEditingItem(null);
                                }}
                                className="text-gray-500 text-xl hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        {/* 품목명 입력 */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2">품목명</label>
                            <input
                                type="text"
                                placeholder="품목명을 입력하세요"
                                value={editItemFormData.name}
                                onChange={(e) => setEditItemFormData({...editItemFormData, name: e.target.value})}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* 단가 입력 */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2">단가</label>
                            <div className="flex items-center space-x-2">
                                <div className="flex-1 relative">
                                    <DollarSign className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={editItemFormData.price}
                                        onChange={(e) => setEditItemFormData({...editItemFormData, price: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 border rounded-lg text-right text-xl focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => adjustEditItemPrice(-1000)}
                                        className="flex-shrink-0 w-12 h-12 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors"
                                        type="button"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <button
                                        onClick={() => adjustEditItemPrice(1000)}
                                        className="flex-shrink-0 w-12 h-12 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-colors"
                                        type="button"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 카테고리 선택 */}
                        <div className="mb-6">
                            <label className="block text-sm text-gray-600 mb-2">카테고리</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-3 text-gray-400" size={20} />
                                <select
                                    value={editItemFormData.category}
                                    onChange={(e) => setEditItemFormData({...editItemFormData, category: e.target.value})}
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

                        {/* 수정 버튼 */}
                        <button
                            onClick={handleEditItemSubmit}
                            className="w-full py-3 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                            품목 수정
                        </button>
                    </div>
                </div>
            )}

            {/* 품목 삭제 확인 모달 */}
            {showDeleteItemConfirm && deletingItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-80">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold mb-2">품목 삭제 확인</h2>
                            <p className="text-gray-600">정말로 삭제하시겠습니까?</p>
                            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="font-medium text-gray-800">{deletingItem.name}</div>
                                <div className="text-sm text-gray-500">
                                    {deletingItem.price.toLocaleString()}원 • {deletingItem.category}
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteItemConfirm(false);
                                    setDeletingItem(null);
                                }}
                                className="flex-1 py-3 rounded-lg text-gray-700 font-semibold bg-gray-200 hover:bg-gray-300 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={confirmDeleteItem}
                                className="flex-1 py-3 rounded-lg text-white font-semibold bg-red-600 hover:bg-red-700 transition-colors"
                            >
                                삭제
                            </button>
                        </div>
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