import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";

export const ChartTab = ({ timeFilter, filteredTransactions }) => {
  const chartData = useMemo(() => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      return [];
    }

    // 데이터 그룹핑
    const grouped: {
      [key: string]: {
        period: string;
        amount: number;
        count: number;
        sortKey: string;
      };
    } = {};

    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      let key;
      let sortKey;

      switch (timeFilter) {
        case "day":
          key = `${date.getMonth() + 1}/${date.getDate()}`;
          sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          break;
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `${weekStart.getMonth() + 1}/${weekStart.getDate()}주`;
          sortKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, "0")}-${String(weekStart.getDate()).padStart(2, "0")}`;
          break;
        case "month":
          key = `${date.getFullYear()}.${date.getMonth() + 1}`;
          sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          break;
        case "year":
          key = `${date.getFullYear()}년`;
          sortKey = `${date.getFullYear()}`;
          break;
        default:
          key = "unknown";
          sortKey = "0";
      }

      if (!grouped[key]) {
        grouped[key] = { period: key, amount: 0, count: 0, sortKey: sortKey };
      }
      grouped[key].amount += transaction.amount;
      grouped[key].count += 1;
    });

    return Object.values(grouped).sort((a, b) =>
      a.sortKey.localeCompare(b.sortKey),
    );
  }, [timeFilter, filteredTransactions]); // 의존성 배열: 이 두 값이 바뀔 때만 재계산

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">지출 통계</h2>

      {chartData.length > 0 ? (
        <div className="space-y-6">
          {/* 막대 그래프 */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-3">
              {timeFilter === "day"
                ? "일별"
                : timeFilter === "week"
                  ? "주별"
                  : timeFilter === "month"
                    ? "월별"
                    : "년별"}{" "}
              지출
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `${value.toLocaleString()}원`,
                    "지출액",
                  ]}
                />
                <Bar dataKey="amount" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 라인 그래프 */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600 mb-3">
              지출 추이
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `${value.toLocaleString()}원`,
                    "지출액",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 통계 요약 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-600">총 지출</div>
              <div className="text-lg font-bold text-blue-700">
                {chartData
                  .reduce((sum, item) => sum + item.amount, 0)
                  .toLocaleString()}
                원
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-green-600">평균 지출</div>
              <div className="text-lg font-bold text-green-700">
                {Math.round(
                  chartData.reduce((sum, item) => sum + item.amount, 0) /
                    Math.max(chartData.length, 1),
                ).toLocaleString()}
                원
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
  );
};
