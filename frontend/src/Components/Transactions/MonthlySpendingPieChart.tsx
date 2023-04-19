// import React, { useEffect, useState } from 'react';
// import {
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
// } from 'recharts';

// interface Transaction {
//   category: string[];
//   amount: number;
// }

// interface Props {
//   transactions: Transaction[];
// }

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
// const RADIAN = Math.PI / 180;

// const renderCustomizedLabel = ({
//   cx,
//   cy,
//   midAngle,
//   innerRadius,
//   outerRadius,
//   percent,
//   index,
// }: any) => {
//   const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//   const x = cx + radius * Math.cos(-midAngle * RADIAN);
//   const y = cy + radius * Math.sin(-midAngle * RADIAN);

//   return (
//     <text
//       x={x}
//       y={y}
//       fill="white"
//       textAnchor={x > cx ? 'start' : 'end'}
//       dominantBaseline="central"
//     >
//       {`${(percent * 100).toFixed(0)}%`}
//     </text>
//   );
// };

// export const MonthlySpendingPieChart: React.FC<Props> = ({ transactions }) => {
//   const [pieChartData, setPieChartData] = useState<any[]>([]);

//   const processDataForPieChart = (transactions: Transaction[]) => {
//     const categoriesMap = new Map<string, number>();
  
//     transactions.forEach((transaction) => {
//       const category = transaction.category[0]; // Use the main category
//       const amount = transaction.amount;

//       if(amount <= 0){
//         return;
//       }
  
//       if (categoriesMap.has(category)) {
//         const currentAmount = categoriesMap.get(category) as number;
//         categoriesMap.set(category, currentAmount + amount);
//       } else {
//         categoriesMap.set(category, amount);
//       }
//     });
  
//     const processedData = Array.from(categoriesMap.entries()).map(([name, value]) => ({
//       name,
//       value,
//     }));
//     console.log(processedData);
//     return processedData;
//   };
  
//   useEffect(() => {
//     console.log('Transactions updated:', transactions);
//     if (transactions.length > 0) {
//       setPieChartData(processDataForPieChart(transactions));
//     }
//   }, [transactions]);

//   return (
//     <>
//       {console.log('Pie chart data:', pieChartData)}
//       <ResponsiveContainer width="100%" height="100%">
//         <PieChart width={400} height={400}>
//           <Pie
//             data={pieChartData}
//             cx="50%"
//             cy="50%"
//             labelLine={false}
//             label={renderCustomizedLabel}
//             outerRadius={80}
//             fill="#8884d8"
//             dataKey="value"
//           >
//             {pieChartData.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//             ))}
//           </Pie>
//         </PieChart>
//       </ResponsiveContainer>
//     </>
//   );
//             }

// export default MonthlySpendingPieChart;
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
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return (
    <text
      x={x}
      y={y}
      fill="black"
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
    <ResponsiveContainer width="100%" height="100%">
      <PieChart width={800} height={400}>
        <Pie
          data={pieChartData}
          cx={120}
          cy={200}
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
