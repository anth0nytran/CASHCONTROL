import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Transaction {
  category: string[];
  amount: number;
}

interface Props {
  transactions: Transaction[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  name,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 2.3;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);


  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const MonthlySpendingPieChart: React.FC<Props> = ({ transactions }) => {
  const [pieChartData, setPieChartData] = useState<any[]>([]);

  const processDataForPieChart = (transactions: Transaction[]) => {
    const categoriesMap = new Map<string, number>();

    transactions.forEach((transaction) => {
      const category = transaction.category[0];
      const amount = transaction.amount;

      if (amount <= 0) {
        return;
      }
      if (categoriesMap.has(category)) {
        const currentAmount = categoriesMap.get(category) as number;
        categoriesMap.set(category, currentAmount + amount);
      } else {
        categoriesMap.set(category, amount);
      }
    });

    const processedData = Array.from(categoriesMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
    return processedData;
  };

  useEffect(() => {
    if (transactions.length > 0) {
      setPieChartData(processDataForPieChart(transactions));
    }
  }, [transactions]);

  return (
    <ResponsiveContainer width="100%" height={250}>
    {/* // <ResponsiveContainer width={150} height={250}> */}
      {/* <PieChart width={800} height={400}> */}
    <PieChart>
        <Pie
          data={pieChartData}
          // cx={150}
          // cy={150}
          cx ="55%"
          cy ="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          label={renderCustomizedLabel}
        >
          {pieChartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default MonthlySpendingPieChart;
