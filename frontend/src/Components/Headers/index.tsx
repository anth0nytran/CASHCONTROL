import React, { useContext } from "react";
import Callout from "plaid-threads/Callout";
import Button from "plaid-threads/Button";
import InlineLink from "plaid-threads/InlineLink";

import Link from "../Link";
import Context from "../../Context";

import styles from "./index.module.scss";

const Header = () => {
  const {
    itemId,
    accessToken,
    linkToken,
    linkSuccess,
    isItemAccess,
    backend,
    linkTokenError,
    isPaymentInitiation,
  } = useContext(Context);


  return (
    <div className={styles.container}>
    <div className={styles.grid}>

      {!linkSuccess ? (
        <>
           <div className={styles.logo} />
          <div className={styles.chip} />
           <div className={styles.cardNumber}>
            1234 5678 9012 3456
          </div>
          {/* message if backend is not running and there is no link token */}
          {!backend ? (
            <Callout warning>
              Unable to fetch link_token: please make sure your backend server
              is running and that your .env file has been configured with your
              <code>PLAID_CLIENT_ID</code> and <code>PLAID_SECRET</code>.
            </Callout>
          ) : /* message if backend is running and there is no link token */
            linkToken == null && backend ? null : linkToken === "" ? (
              <div className={styles.linkButton}>
                <Button large disabled>
                  Loading...
                </Button>
              </div>
            ) : (
              <div className={styles.linkButton}>
                <Link />
              </div>
            )}
        </>
      ) : (
        <>
          {isPaymentInitiation ? (
            <>
              <h4 className={styles.subtitle}>
                Congrats! Your payment is now confirmed.
                <p />
                <Callout>
                  You can see information of all your payments in the{" "}
                  <InlineLink
                    href="https://dashboard.plaid.com/activity/payments"
                    target="_blank"
                  >
                    Payments Dashboard
                  </InlineLink>
                  .
                </Callout>
              </h4>
              <p className={styles.requests}>
                Now that the 'payment_id' stored in your server, you can use it
                to access the payment information:
              </p>
            </>
          ) : (
            /* If not using the payment_initiation product, show the item_id and access_token information */ <>
              {isItemAccess ? (
                <h4 className={styles.subtitle}>
                </h4>
              ) : (
                <h4 className={styles.subtitle}>
                  <Callout warning>
                    Unable to create an item. Please check your backend server
                  </Callout>
                </h4>
              )}
            </>
          )}
        </>
      )}
    </div>
    </div>
  );
};

Header.displayName = "Header";

export default Header;
