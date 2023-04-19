import React, { useState } from "react";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle
} from "@ionic/react";
import ReactCardFlip from "react-card-flip";


const CreditCard = ({ name = '', number = '', totalSpending = '', accountBalance = '',  userProfile = null as any}) => {
  const [flipped, setFlipped] = useState(false);

  const handleClick = () => {
    setFlipped(!flipped);
  };

  return (
    <div style={{ width: "300px" }}>
      <ReactCardFlip isFlipped={flipped}>
        <IonCard onClick={handleClick}>
          <IonCardHeader>
            <IonCardTitle>Total Account Balances</IonCardTitle>
            <IonCardSubtitle>{accountBalance}</IonCardSubtitle>
            <IonCardTitle>Total Spending (30d)</IonCardTitle>
            <IonCardSubtitle>{totalSpending}</IonCardSubtitle>
          </IonCardHeader>
        </IonCard>

        <IonCard onClick={handleClick}>
          <IonCardHeader>
            <IonCardTitle>Personal Information</IonCardTitle>
            <IonCardSubtitle>{userProfile}</IonCardSubtitle>
          </IonCardHeader>
        </IonCard>
      </ReactCardFlip>
    </div>
  );
};

export default CreditCard;
