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
import { IonModal, IonContent, IonButton, IonLabel, IonCheckbox, IonItem, IonList, IonBadge, IonPopover} from '@ionic/react';

import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';



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


  const {
    accessToken,
    showTermsConditions,
    acceptedTermsConditions,
    dispatch,
  } = useContext(Context);

  const [showTermsModal, setShowTermsModal] = useState(!acceptedTermsConditions);

  const handleAcceptTermsConditions = () => {
    dispatch({ type: 'SET_STATE', state: { acceptedTermsConditions: true } });
    setShowTermsModal(false);
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

  type CustomMouseEvent = MouseEvent & {
    currentTarget: {
      getBoundingClientRect(): DOMRect;
    };
  };

  const handleNotificationsClick = (
    event: React.MouseEvent<HTMLIonBadgeElement, CustomMouseEvent>
  ) => {
    setNotificationsVisible({ open: !notificationsVisible.open, event: event.nativeEvent });
  };

  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const [notificationsVisible, setNotificationsVisible] = useState<{
    open: boolean;
    event: CustomMouseEvent | undefined | React.MouseEvent<HTMLIonBadgeElement, CustomMouseEvent>;
  }>({
    open: false,
    event: undefined,
  });

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
            message: `New transaction: ${txn.name}: ${txn.amount * - 1 }`,
          })),
          ...transactionUpdates.modified.map((txn: any) => ({
            type: 'modified',
            message: `Modified transaction: ${txn.name} - ${txn.amount * - 1}`,
          })),
          ...transactionUpdates.removed.map((txnId: any) => ({
            type: 'removed',
            message: `Removed transaction with ID: ${txnId}`,
          })),
        ];

        setNotifications((prevNotifications) => [
          ...newNotifications,
        ]);

      } else {
        console.error('Failed to fetch transaction updates.');
      }
    };

    if (accessToken) {
      fetchTransactionsUpdates();
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
        <IonModal isOpen={showTermsModal} backdropDismiss={false} cssClass={styles.termsModal}>
          <IonContent className={`${styles.modalContent} custom-ion-content`}>
            <div className={styles.contentWrapper}>
              <h3>Terms and Conditions</h3>
              <p >Please read and accept our terms and conditions to use the application.</p>
              <div className={styles.scrollableContainer}>
              <IonList>
                  <IonItem>
                    <IonLabel>Use of Services:</IonLabel>
                    <p>Cash Control is a tool to help you manage your finances. It is intended for personal use only.</p>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Account Information:</IonLabel>
                    <p>To use Cash Control, you will need to provide us with access to your financial accounts. We will keep your information confidential and secure.</p>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Third-Party Links:</IonLabel>
                    <p>Cash Control may link to external websites for your convenience. We are not responsible for the content or security of those sites.</p>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Security:</IonLabel>
                    <p>We use industry-standard security measures to protect your account information, but we cannot guarantee the security of your data.</p>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Your Responsibilities:</IonLabel>
                    <p>You are responsible for maintaining the confidentiality of your login information and for complying with all applicable laws and regulations.</p>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Modifications and Termination:</IonLabel>
                    <p>Cash Control may modify or discontinue our services at any time without notice.</p>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Intellectual Property:</IonLabel>
                    <p>All content on Cash Control is protected by copyright and other intellectual property laws.</p>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Disclaimer of Warranties:</IonLabel>
                    <p>Cash Control provides its services "as is" and without any warranty or representation.</p>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Limitation of Liability:</IonLabel>
                    <p>Cash Control and its affiliates will not be liable for any damages arising out of or in connection with your use of our services.</p>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Governing Law:</IonLabel>
                    <p>These terms and conditions are governed by the laws of the state of Texas.</p>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Changes to these Terms:</IonLabel>
                    <p>Cash Control reserves the right to modify these terms and conditions at any time.</p>
                  </IonItem>
                </IonList>
                By using Cash Control, you agree to these terms and conditions. If you do not agree to these terms, please do not use our application
              </div>
            </div>
          </IonContent>
          <IonButton
            expand="full"
            onClick={handleAcceptTermsConditions}
            className={styles.acceptButton}
          >
            I Accept The Terms And Conditions.
          </IonButton>
        </IonModal>
      )}
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.logoAndSlogan}>
            <span className={styles.logo}>Cash Control</span>
            <span className={styles.slogan}>Control your finances with us!</span>
          </div>
          <IonBadge color="danger" onClick={handleNotificationsClick}>
           <span style={{color: '#FFFFF'}}>Notifications ({notifications.length})</span>
          </IonBadge>
          <IonPopover
            isOpen={notificationsVisible.open}
            onDidDismiss={() => setNotificationsVisible({ open: false, event: undefined })}
            event={notificationsVisible.event as Event}
            cssClass="popover-notification"
          >
            <IonContent>
              <div className={`${styles.notificationList} ${styles.scrollableNotificationList}`}>
                {notifications.slice(0, 30).map((notification, index) => (
                  <Notification
                    key={index}
                    type={notification.type}
                    message={notification.message}
                  />
                ))}
              </div>
            </IonContent>
          </IonPopover>
        </header>
        <IonCard className={styles.cardWrapper}>
          <IonCardContent>
            <CreditCard
              totalSpending={`$${totalSpending.toFixed(2)}`}
              accountBalance={`$${accountBalance ? accountBalance.toFixed(2) : "Loading..."}`}
              userProfile={<UserProfile accessToken={accessToken} />}
            />
          </IonCardContent>
        </IonCard>
        <div className={styles.graphTitles}>
          <h3 className={styles.leftTitle}>Monthly Expenses</h3>
          <h3 className={styles.rightTitle}>Balance History (30d)</h3>
        </div>
        <div className={styles.graphContainer}>
          <MonthlySpendingPieChart transactions={data} />
          <LineChartBalanceHistory transactions={data} />
        </div>

        <IonCard className={styles.transactions}>
          <IonCardHeader>
            <IonCardTitle>Transaction History</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
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
                return (
                  <div key={index} className={styles.transactionCard}>
                    <p>{item.date}</p>
                    <p>{item.name}</p>
                    <p style={itemAmountStyle}>{(item.amount * -1).toFixed(2)}</p>
                    <p>{item.category.join(", ")}</p>
                  </div>
                );
              })}
            </div>
          </IonCardContent>
        </IonCard>
        <IonCard className={styles.bills}>
          <IonCardHeader>
            <IonCardTitle>Bills</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
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
                return (
                  <div key={index} className={styles.transactionCard}>
                    <p>{item.last_date}</p>
                    <p>{item.description}</p>
                    <p style={itemAmountStyle}>{(item.average_amount.amount * -1).toFixed(2)}</p>
                    <p>{item.frequency}</p>
                  </div>
                );
              })}
            </div>
          </IonCardContent>
        </IonCard>
        <IonCard className={styles.investments}>
          <IonCardHeader>
            <IonCardTitle>Investments</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <InvestmentTransactionList token={accessToken} />
          </IonCardContent>
        </IonCard>
      </div>
    </>
  );
}

//trying to add modernisitic ionic componenets above^
// return (
//   <>
//     {showTermsModal && (
//       <div className={styles.termsModal}>
//         <div className={styles.modalContent}>
//           <h3>Terms and Conditions</h3>
//           <p>Please read and accept our terms and conditions to use the application.</p>
//           {/* Add the actual content of your terms and conditions here */}
//           <button onClick={handleAcceptTermsConditions}>Accept</button>
//         </div>
//       </div>
//     )}
//     <div className={styles.container}>
//       <header className={styles.header}>
//         <div className={styles.logoAndSlogan}>
//           <span className={styles.logo}>Cash Control</span>
//           <span className={styles.slogan}>Control your finances with us!</span>
//         </div>
//         <div className={styles.userControls}>
//           <div className={styles.greetingAndBell}>
//             <span className={styles.greeting}>{userName ? `Hi, ${userName}!` : "Hi!"}</span>
//           </div>
//           <div className={styles.bellIcon} onClick={() => setNotificationsVisible(!notificationsVisible)}>
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
//               <path d="M12 2C9.243 2 7 4.243 7 7v5.586l-.707.707A.996.996 0 006 14v2c0 .552.448 1 1 1h9c.552 0 1-.448 1-1v-2c0-.379-.214-.725-.553-.895l-.004-.002-.006-.003-.01-.005-.018-.01a.955.955 0 00-.31-.182l-.023-.012a1.02 1.02 0 00-.07-.037l-.024-.012-.007-.003-.002-.001-.707-.293V7c0-2.757-2.243-5-5-5zm0 21c-1.654 0-3-1.346-3-3h6c0 1.654-1.346 3-3 3z" />
//             </svg>
//             {notificationsVisible && (
//               <div className={`${styles.dropdown} ${notificationsVisible ? styles.show : ''}`}>
//                 <div className={styles.notificationList}>
//                   {notifications.slice(0, 30).map((notification, index) => (
//                     <Notification
//                       key={index}
//                       type={notification.type}
//                       message={notification.message}
//                     />
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </header>
//       <div className ={styles.cardWrapper}>
//       <CreditCard 
//         totalSpending = {`$${totalSpending.toFixed(2)}`}
//         accountBalance = {`$${accountBalance ? accountBalance.toFixed(2) : "Loading..."}`}
//         userProfile = {<UserProfile accessToken={accessToken} />}
//       />
//       </div>
//       <div className={styles.graphContainer}>
//         <div className={styles.graphContent}>
//           <MonthlySpendingPieChart transactions={data} />
//         </div>
//         <div className={styles.lineChartContainer}>
//         {/* <LineChart30Days /> */}
//         <LineChartBalanceHistory transactions = {data}/>
//         </div>
//       </div>

//       <div className={styles.transactions}>
//         <h2>Transaction History</h2>
//         <div className={styles.container}>
//           <div className={styles.headers}>
//             <strong>Date</strong>
//             <strong>Name</strong>
//             <strong>Amount</strong>
//             <strong>Category</strong>
//           </div>
            
//           {data.map((item: Transaction, index: number) => {
//             const itemAmountStyle = {
//               color: item.amount > 0 ? 'red' : 'green',
//             };
//             return(
//             <div key={index} className={styles.transactionCard}>
//             <p>{item.date}</p>
//             <p>{item.name}</p>
//             <p style={itemAmountStyle}>{(item.amount * -1).toFixed(2)}</p>
//             <p>{item.category.join(", ")}</p>
//           </div>
//           );
//         })}
//         </div>
//       </div>

//       <div className={styles.bills}>
//         <h2>Bills</h2>
//         <div className={styles.container}>
//           <div className={styles.headers}>
//             <strong>Date</strong>
//             <strong>Description</strong>
//             <strong>Amount</strong>
//             <strong>Frequency</strong>
//           </div>
//           {recurringTransactions?.map((item: RecurringTransaction, index: number) => {
//             const itemAmountStyle = {
//               color: item.average_amount.amount > 0 ? 'red' : 'green',
//             };
//             return(
//             <div key={index} className={styles.transactionCard}>
//               <p>{item.last_date}</p>
//               <p>{item.description}</p>
//               <p style={itemAmountStyle}>{(item.average_amount.amount * -1).toFixed(2)}</p>
//               <p>{item.frequency}</p>
//             </div>
//             );
//         })}
//         </div>
//       </div>
//       <div className={styles.investments}>
//         <InvestmentTransactionList token={accessToken} />
//       </div>
//     </div>
//   </>
// );
// }