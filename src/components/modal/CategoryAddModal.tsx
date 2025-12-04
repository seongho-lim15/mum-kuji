import { DollarSign, Edit2, Minus, Plus, Tag, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { postAddCategory } from "@/api/item";

export const CategoryAddModal = ({
  onClose,
  onEditItem,
  onDeleteItem,
  itemList,
  onSetError,
}) => {
  const [addItemFormData, setAddItemFormData] = useState({
    name: "",
    price: "",
    category: "만화",
  });

  // 품목 추가용 금액 증감 함수
  const adjustAddItemPrice = (amount: number) => {
    const currentPrice = parseFloat(addItemFormData.price) || 0;
    const newPrice = Math.max(0, currentPrice + amount);
    setAddItemFormData({ ...addItemFormData, price: newPrice.toString() });
  };

  // 품목 추가 처리
  const handleAddItemSubmit = async () => {
    if (!addItemFormData.name || !addItemFormData.price) return;

    onSetError("");

    const req = {
      name: addItemFormData.name,
      price: parseFloat(addItemFormData.price),
      category: addItemFormData.category,
    };

    const success = await postAddCategory(req); // 새품목 추가 API 호출
    console.log("success: ", success);
    if (success) {
      setAddItemFormData({
        name: "",
        price: "",
        category: "만화",
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">품목 추가</h2>
          <button
            onClick={onClose}
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
            onChange={(e) =>
              setAddItemFormData({
                ...addItemFormData,
                name: e.target.value,
              })
            }
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 단가 입력 */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">단가</label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <DollarSign
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="number"
                placeholder="0"
                value={addItemFormData.price}
                onChange={(e) =>
                  setAddItemFormData({
                    ...addItemFormData,
                    price: e.target.value,
                  })
                }
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
              onChange={(e) =>
                setAddItemFormData({
                  ...addItemFormData,
                  category: e.target.value,
                })
              }
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
          <h3 className="text-md font-semibold mb-3 text-gray-700">
            등록된 품목
          </h3>
          <div className="max-h-60 overflow-y-auto border rounded-lg">
            {itemList.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                등록된 품목이 없습니다
              </div>
            ) : (
              itemList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-sm text-gray-500">
                      {item.price.toLocaleString()}원 • {item.category}
                    </div>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => onEditItem(item)}
                      className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                      title="수정"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item)}
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
  );
};
