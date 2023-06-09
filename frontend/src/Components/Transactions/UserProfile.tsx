import React, { useEffect, useState } from 'react';
import styles from './Transactions.module.css';

import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle
} from "@ionic/react";

interface UserProfileProps {
  accessToken?: string | null;
}

interface IdentityData {
  name: string;
  address: string;
  email: string;
  phone: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ accessToken = '' }) => {
  const [identity, setIdentity] = useState<IdentityData | null>(null);

  useEffect(() => {
    const fetchIdentity = async () => {
      const response = await fetch('/api/identity', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const account = data.identity[0];
        if (account && account.owners) {
          const owner = account.owners[0];
          const primaryAddress = owner.addresses.find((address: any) => address.primary);
          const primaryEmail = owner.emails.find((email: any) => email.primary);
          const primaryPhone = owner.phone_numbers.find((phone: any) => phone.primary);
          setIdentity({
            name: owner.names[0],
            address: `${primaryAddress.data.street}, ${primaryAddress.data.city}, ${primaryAddress.data.region} ${primaryAddress.data.postal_code}, ${primaryAddress.data.country}`,
            email: primaryEmail?.data || 'Not available',
            phone: primaryPhone?.data || 'Not available',
          });
        }
      } else {
        console.error('Failed to fetch identity.');
      }
    };
    fetchIdentity();
  }, [accessToken]);

  return (
    <div className={styles.personal_info_container}>
      {identity && (
        <>
          <p style={{ color: 'white' }}>Name: {identity.name}</p>
          <p style={{ color: 'white' }}>Address: {identity.address}</p>
          <p style={{ color: 'white' }}>Email: {identity.email}</p>
          <p style={{ color: 'white' }}>Phone: {identity.phone}</p>
        </>
      )}
    </div>
  );
};

export default UserProfile;
