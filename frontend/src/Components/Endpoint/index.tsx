import React, { useState, useEffect } from "react";
import { Table } from "../Table";
import { Data, Categories } from "../../interfaces";

interface Props {
  endpoint: string;
  token: string | null;
  categories: Categories[];
  transformData: (data: any[]) => Data[];
}

export const Endpoint: React.FC<Props> = (props) => {
  const [data, setData] = useState<Data[]>([]);
  const [transformedData, setTransformedData] = useState<Data[]>([]);
  const [pdf, setPdf] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const response = await fetch(`/api/${props.endpoint}`, {
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
        if (data.pdf != null) {
          setPdf(data.pdf);
        }
      }
    };

    if (props.token) {
      getData();
    }
  }, [props.token, props.endpoint, props.transformData]);

  return (
    <div>
      <h3>{props.endpoint}</h3>
      {pdf && (
        <button
          onClick={() => {
            setShowTable(!showTable);
          }}
        >
          {showTable ? "Hide" : "Show"} Table
        </button>
      )}
      {showTable && (
        <Table
          categories={props.categories}
          data={transformedData}
          isIdentity={props.endpoint === "identity"}
        />
      )}
    </div>
  );
};
