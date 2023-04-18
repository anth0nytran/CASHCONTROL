import React, { useState, useEffect, useContext } from "react";
import { Data, Transaction, Categories, RecurringTransaction } from '../../interfaces';
import Context from "../../Context";
import UserProfile from './UserProfile';
import InvestmentTransactionList from "./InvestmentTransactionList";
import './DropdownMenu.css';
import styles from './Transactions.module.css';

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
const [accounts, setAccounts] = useState<any>([]);

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
      setAccounts(balanceData.accounts);
    } else {
      console.error('Failed to fetch account balance.');
    }
  };

  if (accessToken) {
    fetchAccountBalance();
  }
}, [accessToken]);
// End of account balance

// investment information
// const [investmentTransactions, setInvestmentTransactions] = useState([]);

// useEffect(() => {
//   const fetchInvestmentTransactions = async () => {
//     const response = await fetch("/api/investments_transactions", {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     if (response.ok) {
//       const data = await response.json();
//       setInvestmentTransactions(data.investments_transactions);
//     }
//   };

//   if (props.token) {
//     fetchInvestmentTransactions();
//   }
// }, [props.token]);

// end of investment information

//notification
interface NotificationProps {
  type: 'new' | 'modified' | 'removed';
  message: string;
}

const Notification: React.FC<NotificationProps> = ({ type, message }) => {
  return (
    <div className={styles.notification}>
      <p>{message}</p>
    </div>
  );
};

interface NotificationData {
  type: 'new' | 'modified' | 'removed';
  message: string;
}

const [notifications, setNotifications] = useState<NotificationData[]>([]);
const [notificationsVisible, setNotificationsVisible] = useState(false);

useEffect(() => {
  const fetchTransactionsUpdates = async () => {
    const response = await fetch('/api/transactions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const transactionUpdates = data.transactionUpdates;
      console.log('Transaction updates:', transactionUpdates);
      const newNotifications = [
        ...transactionUpdates.added.map((txn: any) => ({
          type: 'new',
          message: `New transaction: ${txn.name} - ${txn.amount}`,
        })),
        ...transactionUpdates.modified.map((txn: any) => ({
          type: 'modified',
          message: `Modified transaction: ${txn.name} - ${txn.amount}`,
        })),
        ...transactionUpdates.removed.map((txnId: any) => ({
          type: 'removed',
          message: `Removed transaction with ID: ${txnId}`,
        })),
      ];

      setNotifications((prevNotifications) => [
        ...prevNotifications,
        ...newNotifications,
      ]);
    } else {
      console.error('Failed to fetch transaction updates.');
    }
  };

  if (accessToken) {
    const intervalId = setInterval(fetchTransactionsUpdates, 30000); // Poll every 30 seconds
    return () => clearInterval(intervalId);
  }
}, [accessToken]);
// end of notifications


//total spending in 30 days
const [totalSpending, setTotalSpending] = useState<number>(0);
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
        props.transformData ? props.transformData(data.response) : data.response
      );

      // Calculate total spending
      const spending = data.latest_transactions.reduce(
        (acc: number, transaction: Transaction) =>
          acc + (transaction.amount > 0 ? transaction.amount : 0),
        0
      );
      setTotalSpending(spending);
    }
  };

  if (props.token) {
    getData();
  }
}, [props.token, props.transformData]);
//end of total spending of 30 days


//recurring transactions
// State for recurring transactions
const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[] | null>(null);


// Collect all account IDs
const accountIds = accounts ? accounts.map((account: any) => account.account_id).join(',') : '';

// Fetch recurring transactions
const fetchRecurringTransactions = async (accountIds: any) => {
  const response = await fetch(`/api/transactions/recurring?account_ids=${accountIds}`, {
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

// UseEffect for fetching recurring transactions when access token and account_ids are available
useEffect(() => {
  if (accessToken && accountIds) {
    fetchRecurringTransactions(accountIds);
  }
}, [accessToken, accountIds]);

//end of recurring transactions


//user profile:
const [showUserProfile, setShowUserProfile] = useState(false);

const toggleUserProfile = () => {
  setShowUserProfile(!showUserProfile);
};


return (
  <div className={styles.container}>
    <header className={styles.header}>
      <div className={styles.logoAndSlogan}>
        <h1>Cash Control</h1>
          Control your finances
      </div>
      <div className={styles.userControls}>
        <span className={styles.greeting}>{userName ? `Hi, ${userName}!` : "Hi!"}</span>
        <button className={styles.personalInfoButton} onClick={toggleUserProfile}>Personal Information</button>
        <div className={styles.dropdownContent} style={{ display: showUserProfile ? 'block' : 'none' }}>
          <UserProfile accessToken={accessToken} />
        </div>
        <div className={styles.bellIcon} onClick={() => setNotificationsVisible(!notificationsVisible)}>
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
     <path d="M12 2C9.243 2 7 4.243 7 7v5.586l-.707.707A.996.996 0 006 14v2c0 .552.448 1 1 1h9c.552 0 1-.448 1-1v-2c0-.379-.214-.725-.553-.895l-.004-.002-.006-.003-.01-.005-.018-.01a.955.955 0 00-.31-.182l-.023-.012a1.02 1.02 0 00-.07-.037l-.024-.012-.007-.003-.002-.001-.707-.293V7c0-2.757-2.243-5-5-5zm0 21c-1.654 0-3-1.346-3-3h6c0 1.654-1.346 3-3 3z"/>
   </svg>
   {notificationsVisible && (
    <div className={styles.dropdown}>
       <div className={styles.notificationList}>
         {notifications.map((notification, index) => (
           <Notification key={index} type={notification.type} message={notification.message} />
         ))}
       </div>
     </div>
   )}
      </div>
      </div>
    </header>

    <div className={styles.mainContent}>
      <div className={styles.totalSpendingContainer}>
        <span className={styles.totalSpendingLabel}>Total spending in the last 30 days:</span>
        <span className={styles.totalSpending}>${totalSpending.toFixed(2)}</span>
      </div>
      <div className={styles.accountBalanceContainer}>
        <span className={styles.accountBalanceLabel}>Total Account Balances:</span>
        <span className={styles.accountBalance}>${accountBalance ? accountBalance.toFixed(2) : "Loading..."}</span>
      </div>
    </div>

    <div className={styles.graphContainer}>
      {/* Insert your graph component here */}
    </div>

    <div className={styles.transactions}>
      <h2>Transaction History</h2>
         <strong>Date</strong>
        <strong>Name</strong>
         <strong>Amount</strong>
         <strong>Category</strong>
      {data.map((item: Transaction, index: number) => (
        <div key={index} className={styles.transactionCard}>
           <p>{item.date}</p>
           <p>{item.name}</p>
           <p>${item.amount.toFixed(2)}</p>
           <p>{item.category.join(", ")}</p>
           </div>
        ))}
    </div>

    <div className={styles.bills}>
      <h2>Bills</h2>
        <strong>Date</strong>
        <strong>Description</strong>
        <strong>Amount</strong>
        <strong>Frequency</strong>
  
       {recurringTransactions?.map((item: RecurringTransaction, index: number) => (
         <div key={index} className={styles.transactionCard}>
           <p>{item.last_date}</p>
           <p>{item.description}</p>
           <p>${item.average_amount.amount.toFixed(2)}</p>
           <p>{item.frequency}</p>
         </div>
       ))}
    </div>
    <div className={styles.investments}>
      <InvestmentTransactionList token={accessToken} />
    </div>
  </div>
);
      }
// return (
//   //start of terms and agreements + name
//   <div>
//     {accessToken && !acceptedTermsConditions && (
//       <div className={styles.termsConditionsOverlay}>
//         <div className={styles.termsConditionsContent}>
//           <h1>Hello, welcome to Cash Control</h1>
//           <p>
//             {/* Add your Terms and Conditions text here */}
//             <label>
//               <input
//                 type="checkbox"
//                 onChange={handleAcceptTermsConditions} //NEED TO FIX THIS DOES A PROMPT
//               />
//               I accept the Terms and Conditions
//             </label>
//           </p>
//           {!userName && (
//             <div>
//               <p>Hello, what is your name?</p>
//               <input
//                 type="text"
//                 value={nameInput}
//                 onChange={handleNameInputChange}
//               />
//               <button onClick={handleSetName}>Submit</button>
//             </div>
//           )}
//         </div>
//       </div>
//     ) //end of terms and agreements + name
//     }
//     <h3>{userName ? `Hi, ${userName}!` : "Hi!"}</h3>
//     <h4>Notifications</h4>
//     <div className={styles.bellIcon} onClick={() => setNotificationsVisible(!notificationsVisible)}>
//   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
//     <path d="M12 2C9.243 2 7 4.243 7 7v5.586l-.707.707A.996.996 0 006 14v2c0 .552.448 1 1 1h9c.552 0 1-.448 1-1v-2c0-.379-.214-.725-.553-.895l-.004-.002-.006-.003-.01-.005-.018-.01a.955.955 0 00-.31-.182l-.023-.012a1.02 1.02 0 00-.07-.037l-.024-.012-.007-.003-.002-.001-.707-.293V7c0-2.757-2.243-5-5-5zm0 21c-1.654 0-3-1.346-3-3h6c0 1.654-1.346 3-3 3z"/>
//   </svg>
//   {notificationsVisible && (
//     <div className={styles.dropdown}>
//       <div className={styles.notificationList}>
//         {notifications.map((notification, index) => (
//           <Notification key={index} type={notification.type} message={notification.message} />
//         ))}
//       </div>
//     </div>
//   )}
// </div>
//     <p>Total spending in the last 30 days: ${totalSpending.toFixed(2)}</p>
//     <p>
//       Account Balance: ${accountBalance ? accountBalance.toFixed(2) : "Loading..."}
//     </p>
//     <h2>Transaction History:</h2>
//     <div className={styles.container}>
//       <div className={styles.headers}>
//         <strong>Date</strong>
//         <strong>Name</strong>
//         <strong>Amount</strong>
//         <strong>Category</strong>
//       </div>
//       {data.map((item: Transaction, index: number) => (
//         <div key={index} className={styles.transactionCard}>
//           <p>{item.date}</p>
//           <p>{item.name}</p>
//           <p>${item.amount.toFixed(2)}</p>
//           <p>{item.category.join(", ")}</p>
//         </div>
//       ))}
//     </div>

//     <h2>Bills:</h2>
//     <div className={styles.container}>
//       <div className={styles.headers}>
//         <strong>Date</strong>
//         <strong>Description</strong>
//         <strong>Amount</strong>
//         <strong>Frequency</strong>
//       </div>
//       {recurringTransactions?.map((item: RecurringTransaction, index: number) => (
//         <div key={index} className={styles.transactionCard}>
//           <p>{item.last_date}</p>
//           <p>{item.description}</p>
//           <p>${item.average_amount.amount.toFixed(2)}</p>
//           <p>{item.frequency}</p>
//         </div>
//       ))}
//     </div>
//   </div>
// );
      // }
