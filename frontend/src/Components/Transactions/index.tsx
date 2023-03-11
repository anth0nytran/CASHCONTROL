import React, { useState, useEffect } from "react";
import Button from "plaid-threads/Button";
import Note from "plaid-threads/Note";

import Table from "../Table";
import Error from "../Error";
import { DataItem, Categories, ErrorDataItem, Data } from "../../dataUtilities";

import styles from "./index.module.scss";

interface Props {}

const Transactions = (props: Props) => {
  const [showTable, setShowTable] = useState(false);
  const [data, setData] = useState([]);
  const [transformedData, setTransformedData] = useState<Data>([]);
  const [pdf, setPdf] = useState<string | null>(null);
  const [error, setError] = useState<ErrorDataItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getData = async () => {
    setIsLoading(true);
    const response = await fetch(`/api/transactions/sync`, { method: "GET" });
    const data = await response.json();
    setData(data);
    if (data.error != null) {
      setError(data.error);
      setIsLoading(false);
      return;
    }
    if (data.pdf != null) {
      setPdf(data.pdf);
    }
    setShowTable(true);
    setIsLoading(false);
  };

  useEffect(() => {
    getData();
  });

  return <p>{JSON.stringify(data)}</p>;
};

Transactions.displayName = "Transactions";

export default Transactions;
