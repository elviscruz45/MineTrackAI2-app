import { SelectList } from "react-native-dropdown-select-list";
import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { tagEquipoList } from "../../../../../../utils/tagEquipoList";
import styles from "./ChangeTagEquipo.styles";

const OTRO_VALUE = "__OTRO__";

const tagEquipoData = [
  ...tagEquipoList,
  { key: OTRO_VALUE, value: "✏️  Otro / Ingreso manual" },
];

interface Props {
  setText: (val: string) => void;
}

const TagEquipoSelection = ({ setText }: Props) => {
  const [selected, setSelected] = useState("");
  const [manualText, setManualText] = useState("");
  const isManual = selected === OTRO_VALUE;

  const handleSelect = (val: string) => {
    setSelected(val);
    if (val !== OTRO_VALUE) {
      setText(val);
    } else {
      setText(manualText);
    }
  };

  const handleManualChange = (text: string) => {
    setManualText(text);
    setText(text);
  };

  return (
    <View style={{ width: "95%" }}>
      <SelectList
        setSelected={(val: string) => setSelected(val)}
        data={tagEquipoData}
        save="key"
        maxHeight={300}
        placeholder="Seleccionar equipo..."
        searchPlaceholder="Buscar equipo o tag..."
        onSelect={() => handleSelect(selected)}
      />
      {isManual && (
        <>
          <Text style={styles.manualLabel}>Tag manual (ej: C3-ML001)</Text>
          <TextInput
            style={styles.manualInput}
            placeholder="Ingresa el tag del equipo"
            value={manualText}
            onChangeText={handleManualChange}
            autoCapitalize="characters"
          />
        </>
      )}
    </View>
  );
};

export default TagEquipoSelection;
