
import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TransactionData {
  date: string;
  balance: number;
}

interface LineChartBalanceHistoryProps {
  transactions: any[];
}

const LineChartBalanceHistory: React.FC<LineChartBalanceHistoryProps> = ({ transactions }) => {
  const [transactionData, setTransactionData] = useState<TransactionData[]>([]);

  useEffect(() => {
    const currentDate = new Date();
    const thirtyDaysAgo = new Date(currentDate.setDate(currentDate.getDate() - 30));

    const transactionsByDate = new Map<string, number>();

    transactions
      .filter((transaction: any) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= thirtyDaysAgo;
      })
      .forEach((transaction: any) => {
        const dateString = new Date(transaction.date).toLocaleDateString();
        const currentAmount = transactionsByDate.get(dateString) || 0;
        transactionsByDate.set(dateString, currentAmount + transaction.amount * -1);
      });

    let balance = 0;
    const last30DaysData = Array.from(transactionsByDate.entries()).map(([date, amount]) => {
      balance += amount;
      return {
        date,
        balance,
      };
    });

    setTransactionData(last30DaysData);
  }, [transactions]);

  return (
    // <ResponsiveContainer width={400} height={200}>
    <ResponsiveContainer width="100%" height={250}>
      <LineChart
        data={transactionData}
        margin={{
          top: 20,
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
        <Line type="monotone" dataKey="balance" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartBalanceHistory;
