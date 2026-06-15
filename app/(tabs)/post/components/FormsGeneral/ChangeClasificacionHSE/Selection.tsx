import { SelectList } from "react-native-dropdown-select-list";
import React, { useState } from "react";
import { clasificacionHSEList } from "../../../../../../utils/clasificacionHSEList";

const SelectExample = (props: any) => {
  const [selected, setSelected] = useState("");
  const { setText } = props;

  function saveProperty(itemValue: any) {
    setText(itemValue);
  }

  return (
    <SelectList
      setSelected={(val: any) => setSelected(val)}
      data={clasificacionHSEList}
      save="value"
      maxHeight={200}
      onSelect={() => saveProperty(selected)}
      search={false}
    />
  );
};

export default SelectExample;
