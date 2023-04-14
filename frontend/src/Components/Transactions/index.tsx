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

// terms and agreements + name

  const [nameInput, setNameInput] = useState('');

  const {
    accessToken,
    showTermsConditions,
    acceptedTermsConditions,
    userName,
    dispatch,
  } = useContext(Context);

  const handleAcceptTermsConditions = () => {
    dispatch({ type: "SET_STATE", state: { acceptedTermsConditions: true } });
    const name = "Steve Jobs"
    if (name) {
      dispatch({ type: "SET_STATE", state: { userName: name } });
    }
  };

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(e.target.value);
  };
  
  const handleSetName = () => {
    if (nameInput) {
      dispatch({ type: 'SET_STATE', state: { userName: nameInput } });
      setNameInput('');
    }
  };
//end of terms and agreements + name
    return (
      //start of terms and agreements + name
      <div>
        {
          accessToken && !acceptedTermsConditions && (
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
          )    //end of terms and agreements + name
        } 
        <h3>
          {userName ? `Hi, ${userName}!` : "Hi!"}
        </h3> 
      
       <h2>Transaction History:</h2> 
      <div className={styles.container}> 
        {data.map((item: Transaction, index: number) => ( // start of transaction history
          <div key={index} className={styles.transactionCard}>
            <p>
              <strong>Date:</strong> {item.date}
            </p>
            <p>
              <strong>Name:</strong> {item.name}
            </p>
            <p>
              <strong>Amount:</strong> ${item.amount.toFixed(2)}
            </p>
            <p>
              <strong>Category:</strong> {item.category.join(', ')}
            </p>
          </div>
        ))}
      </div>
    </div> //end of transaction history
  );
};
      {/* <div>
      <h3>Transaction History</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Amount</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.date}</td>
              <td>{item.name}</td>
              <td>${item.amount.toFixed(2)}</td>
              <td>{item.category.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div> */}
//     </div>
//   );
// };
