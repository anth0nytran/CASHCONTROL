import React, { useContext } from "react";
import { Transactions } from "../Transactions";
import Context from "../../Context";
import ProductTypesContainer from "./ProductTypesContainer";
import {
  transactionsCategories,
  authCategories,
  identityCategories,
  balanceCategories,
  investmentsCategories,
  investmentsTransactionsCategories,
  liabilitiesCategories,
  paymentCategories,
  assetsCategories,
  incomePaystubsCategories,
  transferCategories,
  transformAuthData,
  transformTransactionsData,
  transformBalanceData,
  transformInvestmentsData,
  transformInvestmentTransactionsData,
  transformLiabilitiesData,
  transformIdentityData,
  transformPaymentData,
  transformAssetsData,
  transformTransferData,
  transformIncomePaystubsData,
} from "../../dataUtilities";
import { access } from "fs";

const Products = () => {
  const { products, accessToken } = useContext(Context);
  return <Transactions token={accessToken} />;
};

Products.displayName = "Products";

export default Products;
