import React from "react";
import { Endpoint } from "../Endpoint";
import ProductTypesContainer from "./ProductTypesContainer";
import { transformItemData, itemCategories } from "../../dataUtilities";

const itemsEndpoint = "/items/get";

const Items: React.FC = () => {
  return (
    <ProductTypesContainer title="Items">
      <Endpoint
        endpoint={itemsEndpoint}
        transformData={transformItemData}
        categories={itemCategories}
      />
    </ProductTypesContainer>
  );
};

export default Items;