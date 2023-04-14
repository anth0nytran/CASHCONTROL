import React, { useState, useEffect, useContext } from "react";
import { Table } from "../Table";
import { Data, Transaction, Categories } from '../../interfaces';
import styles from './Transactions.module.css';
import Context from "../../Context";

interface Props {
  token?: string | null;
  categories?: Categories[];
  transformData?: (data: any[]) => Data[];
}


export const Transactions: React.FC<Props> = (props) => {
  const [data, setData] = useState<Transaction[]>([]);
  const [transformedData, setTransformedData] = useState<Data[]>([]);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const response = await fetch("/api/transactions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setData(data.latest_transactions);
        setTransformedData(
          props.transformData
            ? props.transformData(data.response)
            : data.response
        );
      }
    };

    if (props.token) {
      getData();
    }
  }, [props.token, props.transformData]);

//  start of terms and agreements + name

  const [nameInput, setNameInput] = useState('');

  const {
    accessToken,
    showTermsConditions,
    acceptedTermsConditions,
    userName,
    dispatch,
  } = useContext(Context);

  const handleAcceptTermsConditions = () => {
  };

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(e.target.value);
  };
  
  const handleSetName = () => {
    if (nameInput && !acceptedTermsConditions) {
      dispatch({ type: 'SET_STATE', state: { userName: nameInput, acceptedTermsConditions: true } });
      setNameInput('');
    }
  };
//end of terms and agreements + name

// Start of account balance:
const [accountBalance, setAccountBalance] = useState<number | null>(null);

useEffect(() => {
  const fetchAccountBalance = async () => {
    const response = await fetch('/api/balance', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const balanceData = await response.json();
      const fetchedAccountBalance = balanceData.accounts[0].balances.current;
      setAccountBalance(fetchedAccountBalance);
    } else {
      console.error('Failed to fetch account balance.');
    }
  };

  if (accessToken) {
    fetchAccountBalance();
  }
}, [accessToken]);
// End of account balance

//recurring transactions
const [recurringTransactions, setRecurringTransactions] = useState([]);

useEffect(() => {
  const fetchRecurringTransactions = async () => {
    const response = await fetch('/api/recurring-transactions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setRecurringTransactions(data.recurring_transactions);
    } else {
      console.error('Failed to fetch recurring transactions.');
    }
  };

  if (accessToken) {
    fetchRecurringTransactions();
  }
}, [accessToken]);

//end of recurring transactions

return (
  //start of terms and agreements + name
  <div>
    {accessToken && !acceptedTermsConditions && (
      <div className={styles.termsConditionsOverlay}>
        <div className={styles.termsConditionsContent}>
          <h1>Hello, welcome to Cash Control</h1>
          <p>
            {/* Add your Terms and Conditions text here */}
            <label>
              <input
                type="checkbox"
                onChange={handleAcceptTermsConditions} //NEED TO FIX THIS DOES A PROMPT
              />
              I accept the Terms and Conditions
            </label>
          </p>
          {!userName && (
            <div>
              <p>Hello, what is your name?</p>
              <input
                type="text"
                value={nameInput}
                onChange={handleNameInputChange}
              />
              <button onClick={handleSetName}>Submit</button>
            </div>
          )}
        </div>
      </div>
    ) //end of terms and agreements + name
    }
    <h3>{userName ? `Hi, ${userName}!` : "Hi!"}</h3>
    <p>
      Account Balance: ${accountBalance ? accountBalance.toFixed(2) : "Loading..."}
    </p>
    <h2>Transaction History:</h2>
    <div className={styles.container}>
      <div className={styles.headers}>
        <strong>Date</strong>
        <strong>Name</strong>
        <strong>Amount</strong>
        <strong>Category</strong>
      </div>
      {data.map((item: Transaction, index: number) => (
        <div key={index} className={styles.transactionCard}>
          <p>{item.date}</p>
          <p>{item.name}</p>
          <p>${item.amount.toFixed(2)}</p>
          <p>{item.category.join(", ")}</p>
        </div>
      ))}
    </div>

    <h2>Recurring Transactions:</h2>
    <div className={styles.container}>
      <div className={styles.headers}>
        <strong>Date</strong>
        <strong>Name</strong>
        <strong>Amount</strong>
        <strong>Category</strong>
      </div>
      {recurringTransactions.map((item: Transaction, index: number) => (
        <div key={index} className={styles.transactionCard}>
          <p>{item.date}</p>
          <p>{item.name}</p>
          <p>${item.amount.toFixed(2)}</p>
          <p>{item.category.join(", ")}</p>
        </div>
      ))}
    </div>
  </div>
);
      }