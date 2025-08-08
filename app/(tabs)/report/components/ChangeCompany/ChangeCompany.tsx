import React, { useState } from "react";
import { SelectList } from "react-native-dropdown-select-list";
import { companyListFormat } from "../../../../../utils/companyList";

 function ChangeDisplayCompany(props: any) {
  const { onClose, setCompany, companyList } = props;
  const [selected, setSelected] = useState("");
  let combinedCompanies = [
    ...companyListFormat,
    ...companyList?.map((item: any) => ({ value: item.toUpperCase() })),
  ];

  function saveProperty(itemValue: any) {
    setCompany(itemValue);
    onClose();
  }

  return (
    <SelectList
      setSelected={(val: any) => setSelected(val)}
      data={combinedCompanies}
      save="value"
      maxHeight={300}
      onSelect={() => saveProperty(selected)}
    />
  );
}

export default ChangeDisplayCompany;