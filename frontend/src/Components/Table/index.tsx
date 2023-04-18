import React from "react";
import styles from "./Table.module.css";
import { Data, Categories } from "../../interfaces";

interface Props {
  categories: Categories[];
  data: Data[];
  isIdentity: boolean;
  isTransactions?: boolean;
}

export const Table: React.FC<Props> = ({ categories, data, isIdentity, isTransactions }) => {
  return (
    null
    // <table className={styles.table}>
    //   <thead>
    //     <tr>
    //       {categories.map((category) => (
    //         <th key={category}>{category}</th>
    //       ))}
    //     </tr>
    //   </thead>
    //   <tbody>
    //     {data.map((item, index) => (
    //       <tr key={`row-${index}`}>
    //         {categories.map((category, catIndex) => (
    //           <td key={`cell-${index}-${catIndex}`}>
    //             {isIdentity && category === "amount" ? (
    //               <span className={styles.identity}>{item[category as keyof typeof item]}</span>
    //             ) : (
    //               <span>{item[category as keyof typeof item]}</span>
    //             )}
    //           </td>
    //         ))}
    //       </tr>
    //     ))}
    //   </tbody>
    // </table>
  );
};
