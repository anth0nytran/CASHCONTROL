import React, { useState, useEffect } from "react";

interface InvestmentTransaction {
  name: string;
  available: number | null;
  current: number | null;
  subtype: string | null;
  type: string;
}

const InvestmentTransactionList = (props: { token: string | null | undefined }) => {
  const [investmentTransactions, setInvestmentTransactions] = useState<InvestmentTransaction[]>([]);

  useEffect(() => {
    const fetchInvestmentTransactions = async () => {
      const response = await fetch("/api/investments_transactions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${props.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvestmentTransactions(data.investments_transactions || []);
      }
    };

    if (props.token) {
      fetchInvestmentTransactions();
    }
  }, [props.token]);

  return (
    <div>
  <h2>Investment Transactions</h2>
  {investmentTransactions.length > 0 ? (
    investmentTransactions.map((transaction: InvestmentTransaction, index: number) => (
      <div key={index}>
        <h3>{transaction.name}</h3>
        <p>Type: {transaction.type}</p>
        <p>Subtype: {transaction.subtype || 'N/A'}</p>
        <p>Available Balance: {transaction.available !== null ? transaction.available : 'N/A'}</p>
        <p>Current Balance: {transaction.current !== null ? transaction.current : 'N/A'}</p>
      </div>
    ))
  ) : (
    <p>No investment accounts available.</p>
  )}
</div>

  );
};

export default InvestmentTransactionList;
