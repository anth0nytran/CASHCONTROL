// LineChartBalanceHistory.tsx
import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TransactionData {
  date: string;
  amount: number;
}

interface LineChartBalanceHistoryProps {
  transactions: any[];
}

const LineChartBalanceHistory: React.FC<LineChartBalanceHistoryProps> = ({ transactions }) => {
  const [transactionData, setTransactionData] = useState<TransactionData[]>([]);

  useEffect(() => {
    const last30DaysData = transactions
      .filter((transaction: any) => {
        const transactionDate = new Date(transaction.date);
        const currentDate = new Date();
        const thirtyDaysAgo = new Date(currentDate.setDate(currentDate.getDate() - 30));
        return transactionDate >= thirtyDaysAgo;
      })
      .map((transaction: any) => {
        return {
          date: new Date(transaction.date).toLocaleDateString(),
          amount: transaction.amount,
        };
      });

    setTransactionData(last30DaysData);
  }, [transactions]);

  return (
    <ResponsiveContainer width={500} height={300}>
      <LineChart
        width={500}
        height={300}
        data={transactionData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartBalanceHistory;
