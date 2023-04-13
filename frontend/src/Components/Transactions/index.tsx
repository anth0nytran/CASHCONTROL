import React, { useState, useEffect } from "react";
import { Table } from "../Table";
import { Data, Categories } from "../../interfaces";

interface Props {
  token: string | null;
  categories: Categories[];
  transformData: (data: any[]) => Data[];
}

export const Transactions: React.FC<Props> = (props) => {
  const [data, setData] = useState<Data[]>([]);
  const [transformedData, setTransformedData] = useState<Data[]>([]);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: props.token,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setData(data.response);
        setTransformedData(props.transformData(data.response));
      }
    };

    if (props.token) {
      getData();
    }
  }, [props.token, props.transformData]);

  return (
    <div>
      <h3>Transactions</h3>
      {showTable && (
        <Table
          categories={props.categories}
          data={transformedData}
          isIdentity={false}
          isTransactions
        />
      )}
      <button onClick={() => setShowTable(!showTable)}>
        {showTable ? "Hide" : "Show"} Table
      </button>
    </div>
  );
};
