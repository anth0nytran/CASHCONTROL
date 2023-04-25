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
              <div className={styles.scrollableContainer}>
                <IonList>
                  <IonItem style={{ fontSize: '' }}>
                    CashControl provides an online platform to help individuals manage their finances.<br>
                    </br>
                    By accessing or using the CashControl website, you agree to be bound by the following terms and conditions:
                  </IonItem>
                  <IonItem>
                    <p>You are responsible for keeping your account information and password confidential and secure. </p>
                  </IonItem>
                  <IonItem>
                    <p>You are also responsible for any activity that occurs under your account.</p>
                  </IonItem>
                  <IonItem>
                    <p>CashControl provides its services on an "as is" and "as available" basis and does not guarantee the accuracy, reliability, or timeliness of any information available through the platform.</p>
                  </IonItem>
                  <p>The content and information on the CashControl website is for general informational purposes only and is not intended as investment, financial, or other professional advice.</p>
                  <IonItem>
                    <p>CashControl reserves the right to modify or discontinue the website or any portion thereof at any time without notice.</p>
                  </IonItem>
                  <p>By using CashControl, you acknowledge and agree to these terms and conditions. If you do not agree to these terms, please do not use the CashControl website.</p>
                </IonList>
                <p>By using Cash Control, you agree to these terms and conditions. If you do not agree to these terms, please do not use our application</p>
              </div>
            </div>
          </IonContent>
          <IonButton
            expand="full"
            onClick={handleAcceptTermsConditions}
            className={styles.acceptButton}>
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

