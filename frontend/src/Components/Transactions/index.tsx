import React, { useState, useEffect, useContext } from "react";
import { Data, Transaction, Categories, RecurringTransaction } from '../../interfaces';
import Context from "../../Context";
import UserProfile from './UserProfile';
import InvestmentTransactionList from "./InvestmentTransactionList";
import './DropdownMenu.css';
import styles from './Transactions.module.css';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';
import MonthlySpendingPieChart from './MonthlySpendingPieChart';
import CreditCard from "./CreditCard";
// import LineChart30Days from "./LineChart30Days";
import LineChartBalanceHistory from "./LineChartBalanceHistory";

import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";


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

  const [showTermsModal, setShowTermsModal] = useState(!acceptedTermsConditions);

  const handleAcceptTermsConditions = () => {
    dispatch({ type: 'SET_STATE', state: { acceptedTermsConditions: true } });
    setShowTermsModal(false);
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
    // setShowUserProfile(!showUserProfile);
    setShowUserProfile((prevShowUserProfile) => {
      console.log('Before toggle:', prevShowUserProfile);
      console.log('After toggle:', !prevShowUserProfile);
      return !prevShowUserProfile;
    });
  };

  const [cardFlipped, setCardFlipped] = useState(false);

  return (
    <>
      {showTermsModal && (
        <div className={styles.termsModal}>
          <div className={styles.modalContent}>
            <h3>Terms and Conditions</h3>
            <p>Please read and accept our terms and conditions to use the application.</p>
            {/* Add the actual content of your terms and conditions here */}
            <button onClick={handleAcceptTermsConditions}>Accept</button>
          </div>
        </div>
      )}
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.logoAndSlogan}>
            <span className={styles.logo}>Cash Control</span>
            <span className={styles.slogan}>Control your finances with us!</span>
          </div>
          <div className={styles.userControls}>
            <div className={styles.greetingAndBell}>
              <span className={styles.greeting}>{userName ? `Hi, ${userName}!` : "Hi!"}</span>

              {/* <button className={styles.personalInfoButton} onClick={toggleUserProfile}>Personal Information</button>
              <div className={`${styles.dropdownContent} ${showUserProfile ? styles.show : ''}`}>
                <UserProfile accessToken={accessToken} />
              </div> */}
            </div>
            <div className={styles.bellIcon} onClick={() => setNotificationsVisible(!notificationsVisible)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path d="M12 2C9.243 2 7 4.243 7 7v5.586l-.707.707A.996.996 0 006 14v2c0 .552.448 1 1 1h9c.552 0 1-.448 1-1v-2c0-.379-.214-.725-.553-.895l-.004-.002-.006-.003-.01-.005-.018-.01a.955.955 0 00-.31-.182l-.023-.012a1.02 1.02 0 00-.07-.037l-.024-.012-.007-.003-.002-.001-.707-.293V7c0-2.757-2.243-5-5-5zm0 21c-1.654 0-3-1.346-3-3h6c0 1.654-1.346 3-3 3z" />
              </svg>
              {notificationsVisible && (
                <div className={`${styles.dropdown} ${notificationsVisible ? styles.show : ''}`}>
                  <div className={styles.notificationList}>
                    {notifications.slice(0, 30).map((notification, index) => (
                      <Notification
                        key={index}
                        type={notification.type}
                        message={notification.message}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <CreditCard 
          totalSpending = {`$${totalSpending.toFixed(2)}`}
          accountBalance = {`$${accountBalance ? accountBalance.toFixed(2) : "Loading..."}`}
          userProfile = {<UserProfile accessToken={accessToken} />}
        />
        {/* <div className={styles.mainContent}>
  <div className={styles.card} onClick={() => setCardFlipped(!cardFlipped)}>
    <div className={`${styles.cardInner} ${cardFlipped ? 'flipped' : ''}`}>
      <div className={styles.cardFront}>
        <div className={styles.totalSpendingContainer}>
          <span className={styles.totalSpendingLabel}>
            Total spending in the last 30 days:
          </span>
          <span className={styles.totalSpending}>
            ${totalSpending.toFixed(2)}
          </span>
        </div>
        <div className={styles.accountBalanceContainer}>
          <span className={styles.accountBalanceLabel}>
            Total Account Balances:
          </span>
          <span className={styles.accountBalance}>
            ${accountBalance ? accountBalance.toFixed(2) : "Loading..."}
          </span>
        </div>
      </div>
      <div className={styles.cardBack}>
        <UserProfile accessToken={accessToken} />
      </div>
    </div>
  </div>
</div>               */}
        {/* <div className={styles.mainContent}>
          <div className={styles.totalSpendingContainer}>
            <span className={styles.totalSpendingLabel}>Total spending in the last 30 days:</span>
            <span className={styles.totalSpending}>${totalSpending.toFixed(2)}</span>
          </div>
          <div className={styles.accountBalanceContainer}>
            <span className={styles.accountBalanceLabel}>Total Account Balances:</span>
            <span className={styles.accountBalance}>${accountBalance ? accountBalance.toFixed(2) : "Loading..."}</span>
          </div>
        </div> */}

        <div className={styles.graphContainer}>
          <div className={styles.graphContent}>
            <MonthlySpendingPieChart transactions={data} />
          </div>
          <div className={styles.lineChartContainer}>
          {/* <LineChart30Days /> */}
          <LineChartBalanceHistory transactions = {data}/>
          </div>
        </div>

        <div className={styles.transactions}>
          <h2>Transaction History</h2>
          <div className={styles.container}>
            <div className={styles.headers}>
              <strong>Date</strong>
              <strong>Name</strong>
              <strong>Amount</strong>
              <strong>Category</strong>
            </div>
              
            {data.map((item: Transaction, index: number) => {
              const itemAmountStyle = {
                color: item.amount > 0 ? 'red' : 'green',
              };
              return(
              <div key={index} className={styles.transactionCard}>
              <p>{item.date}</p>
              <p>{item.name}</p>
              <p style={itemAmountStyle}>{(item.amount * -1).toFixed(2)}</p>
              <p>{item.category.join(", ")}</p>
            </div>
            );
          })}
          </div>
        </div>

        <div className={styles.bills}>
          <h2>Bills</h2>
          <div className={styles.container}>
            <div className={styles.headers}>
              <strong>Date</strong>
              <strong>Description</strong>
              <strong>Amount</strong>
              <strong>Frequency</strong>
            </div>
            {recurringTransactions?.map((item: RecurringTransaction, index: number) => {
              const itemAmountStyle = {
                color: item.average_amount.amount > 0 ? 'red' : 'green',
              };
              return(
              <div key={index} className={styles.transactionCard}>
                <p>{item.last_date}</p>
                <p>{item.description}</p>
                <p style={itemAmountStyle}>{(item.average_amount.amount * -1).toFixed(2)}</p>
                <p>{item.frequency}</p>
              </div>
              );
          })}
          </div>
        </div>
        <div className={styles.investments}>
          <InvestmentTransactionList token={accessToken} />
        </div>
      </div>
    </>
  );
}