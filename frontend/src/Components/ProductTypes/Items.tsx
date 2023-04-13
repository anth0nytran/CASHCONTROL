import React from "react";
import { Endpoint } from "../Endpoint";
import ProductTypesContainer from "./ProductTypesContainer";
import { transformItemData, itemCategories } from "../../dataUtilities";

const itemsEndpoint = "/items/get";

const Items: React.FC = () => {
  return (
    <ProductTypesContainer productType="Items">
      <Endpoint
        token={null}
        endpoint={itemsEndpoint}
        transformData={transformItemData as any}
        categories={itemCategories as any}
      />
    </ProductTypesContainer>
  );
};

export default Items;
