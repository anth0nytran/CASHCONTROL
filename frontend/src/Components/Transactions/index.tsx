import React, { useState, useEffect } from "react";
import { Table } from "../Table";
import { Data, Categories } from "../../interfaces";

interface Props {
  token?: string | null;
  categories?: Categories[];
  transformData?: (data: any[]) => Data[];
}

export const Transactions: React.FC<Props> = (props) => {
  const [data, setData] = useState<Data[]>([]);
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

  return (
    <div>
      <h3>Transaction History</h3>
      {data.map((item) => {
        return <div>{JSON.stringify(item)}</div>;
      })}
    </div>
  );
};
