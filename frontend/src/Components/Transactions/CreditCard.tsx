import React, { useState } from "react";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle
} from "@ionic/react";
import ReactCardFlip from "react-card-flip";
import styles from "./CreditCard.module.css";


const CreditCard = ({ name = '', number = '', totalSpending = '', accountBalance = '',  userProfile = null as any}) => {
  const [flipped, setFlipped] = useState(false);

  const handleClick = () => {
    setFlipped(!flipped);
  };

  return (
    <div className={styles.card_container}>
    <ReactCardFlip isFlipped={flipped}>
      <IonCard className={styles.ionCard} onClick={handleClick}>
        <div className={styles.card_logo}></div>
        <div className={styles.card_chip}></div>
        <IonCardTitle className={styles.name_number}>{number}</IonCardTitle>
        <div className={styles.card_info}>
          <div className={styles.card_numbers}>
            <IonCardSubtitle className={styles.total_spending}>{totalSpending}</IonCardSubtitle>
            <IonCardSubtitle className={styles.total_balance}>{accountBalance}</IonCardSubtitle>
          </div>
          <div className={styles.card_labels}>
            <IonCardTitle className={styles.total_spending_label}>Total Spending (30d)</IonCardTitle>
            <IonCardTitle className={styles.total_balance_label}>Total Balance</IonCardTitle>
          </div>
        </div>
        <p className={styles.fine_print}>More Information On The Back <span className={styles.arrow}>↻</span></p>
      </IonCard>

        <IonCard className={styles.ionCard} onClick={handleClick}>
          <IonCardHeader>
            <IonCardTitle className ={styles.personalinfo_label}>Personal Information</IonCardTitle>
            <IonCardSubtitle className ="">{userProfile}</IonCardSubtitle>
          </IonCardHeader>
        </IonCard>
      </ReactCardFlip>
    </div>
  );
};

//   return (
//     <div style={{ width: "300px" }}>
//       <ReactCardFlip isFlipped={flipped}>
//         <IonCard onClick={handleClick}>
//           <IonCardHeader>
//             <IonCardTitle>Total Account Balances</IonCardTitle>
//             <IonCardSubtitle>{accountBalance}</IonCardSubtitle>
//             <IonCardTitle>Total Spending (30d)</IonCardTitle>
//             <IonCardSubtitle>{totalSpending}</IonCardSubtitle>
//           </IonCardHeader>
//         </IonCard>

//         <IonCard onClick={handleClick}>
//           <IonCardHeader>
//             <IonCardTitle>Personal Information</IonCardTitle>
//             <IonCardSubtitle>{userProfile}</IonCardSubtitle>
//           </IonCardHeader>
//         </IonCard>
//       </ReactCardFlip>
//     </div>
//   );
// };

export default CreditCard;
