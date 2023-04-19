import React, { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface BalanceData {
  date: string;
  balance: number;
}

const LineChart30Days: React.FC = () => {
  const [balanceData, setBalanceData] = useState<BalanceData[]>([]);

  useEffect(() => {
    fetch("/api/balance")
      .then((response) => response.json())
      .then((data) => {
        const last30DaysData = data.accounts.map((account: any) => {
          return {
            date: new Date(account.update_date).toLocaleDateString(),
            balance: account.balances.current,
          };
        });

        setBalanceData(last30DaysData);
      });
  }, []);

  return (
    <ResponsiveContainer width={250} height={200}>
      <LineChart width={300} height={100} data={balanceData}>
        <Line type="monotone" dataKey="balance" stroke="#8884d8" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChart30Days;