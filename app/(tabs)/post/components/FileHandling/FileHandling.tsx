import React, { useState } from "react";
import { View, Button, Text, ScrollView } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import Papa from "papaparse";

interface CSVRow {
  Código: string;
  Descripción: string;
  parentCode?: string;
}

function FileHandling() {
  const [codes4, setCodes4] = useState<CSVRow[]>([]);
  const [codes5, setCodes5] = useState<CSVRow[]>([]);

  const pickCSV = async () => {
    try {
      // 1️⃣ Seleccionar archivo CSV
      const file: any = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
      });

      if (file.type === "cancel") return; // Si el usuario cancela, salir

      // 2️⃣ Leer contenido del archivo
      const fileContent = await FileSystem.readAsStringAsync(file.uri);

      // 3️⃣ Convertir CSV a JSON
      const { data } = Papa.parse<CSVRow>(fileContent, { header: true });

      // 4️⃣ Filtrar códigos de 4 y 5 niveles
      const list4 = data.filter((row) => row.Código.split(".").length === 4);
      const list5 = data
        .filter((row) => row.Código.split(".").length === 5)
        .map((row) => ({
          ...row,
          parentCode: row.Código.split(".").slice(0, 4).join("."), // Relacionarlo con su código padre de 4 niveles
        }));

      // 5️⃣ Guardar en el estado
      setCodes4(list4);
      setCodes5(list5);
    } catch (error) {
      console.error("Error al procesar el CSV:", error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title="Seleccionar CSV" onPress={pickCSV} />

      <ScrollView>
        <Text style={{ fontWeight: "bold", marginTop: 10 }}>
          📌 Códigos 4 niveles:
        </Text>
        {codes4.map((item, index) => (
          <Text key={index}>
            🔹 {item.Código} - {item.Descripción}
          </Text>
        ))}

        <Text style={{ fontWeight: "bold", marginTop: 10 }}>
          📌 Códigos 5 niveles:
        </Text>
        {codes5.map((item, index) => (
          <Text key={index}>
            🔸 {item.Código} (Padre: {item.parentCode}) - {item.Descripción}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

export default FileHandling;
