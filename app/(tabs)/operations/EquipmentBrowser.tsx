import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { connect } from "react-redux";
import { Image as ImageExpo } from "expo-image";
import { getTagActivityCounts } from "@/lib/db/equipmentTags";
import { saveActualServiceAIT } from "@/redux/actions/post";
import {
  tagEquipoListFallback,
  getTagEquipoAreaSections,
  getTagAreaColor,
  getTagEquipoImage,
  getTagEquipoNombre,
  buildStandaloneEquipmentContext,
  type TagEquipoItem,
} from "@/utils/tagEquipoList";

type EquipmentBrowserProps = {
  embedded?: boolean;
  nestedScroll?: boolean;
  selectionMode?: "browse" | "createEvent";
  onQuickEventSelect?: (item: TagEquipoItem) => void;
  saveActualServiceAIT: (item: any) => void;
};

function EquipmentBrowserRaw({
  embedded = false,
  nestedScroll = false,
  selectionMode = "browse",
  onQuickEventSelect,
  saveActualServiceAIT,
}: EquipmentBrowserProps) {
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    getTagActivityCounts(30).then(setCounts).catch(console.error);
  }, []);

  const grouped = useMemo(() => {
    const q = search.toLowerCase().trim();
    const filtered = tagEquipoListFallback.filter((item) => {
      if (!q) return true;
      const nombre = getTagEquipoNombre(item).toLowerCase();
      return (
        item.key.toLowerCase().includes(q) ||
        nombre.includes(q) ||
        item.area.toLowerCase().includes(q) ||
        item.value.toLowerCase().includes(q)
      );
    });

    return getTagEquipoAreaSections(filtered);
  }, [search]);

  const handleEquipmentPress = (item: TagEquipoItem) => {
    if (selectionMode === "createEvent") {
      const context = buildStandaloneEquipmentContext(item);
      saveActualServiceAIT(context);
      if (onQuickEventSelect) {
        onQuickEventSelect(item);
        return;
      }
      router.push({
        pathname: "/post",
        params: { equipmentEvent: item.key },
      });
      return;
    }

    router.push({
      pathname: "/operations/equipment/[tagCode]",
      params: { tagCode: item.key },
    });
  };

  const renderEquipmentCard = (item: TagEquipoItem) => {
    const count = counts[item.key] || 0;
    const nombre = getTagEquipoNombre(item);
    return (
      <TouchableOpacity
        key={item.key}
        onPress={() => handleEquipmentPress(item)}
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 12,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <ImageExpo
          source={getTagEquipoImage(item.key)}
          style={{ width: 56, height: 56, borderRadius: 8 }}
          contentFit="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", fontSize: 14, color: "#1e293b" }}>
            {item.key}
          </Text>
          <Text style={{ fontSize: 13, color: "#334155", marginTop: 2 }}>
            {nombre}
          </Text>
          <Text style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
            {item.area}
          </Text>
        </View>
        {count > 0 && (
          <View
            style={{
              backgroundColor: "#2A3B76",
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
              {count} / 30d
            </Text>
          </View>
        )}
        {selectionMode === "browse" && (
          <Text style={{ color: "#94a3b8", fontSize: 18 }}>›</Text>
        )}
      </TouchableOpacity>
    );
  };

  const listBody =
    grouped.length === 0 ? (
      <Text style={{ color: "#64748b", textAlign: "center", marginTop: 24 }}>
        No se encontraron equipos
      </Text>
    ) : (
      grouped.map(({ area, items }) => (
        <View key={area} style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
              gap: 8,
            }}
          >
            <View
              style={{
                width: 4,
                height: 22,
                borderRadius: 2,
                backgroundColor: getTagAreaColor(area),
              }}
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: getTagAreaColor(area),
              }}
            >
              {area}
            </Text>
            <Text style={{ fontSize: 12, color: "#94a3b8" }}>({items.length})</Text>
          </View>
          {items.map(renderEquipmentCard)}
        </View>
      ))
    );

  const content = (
    <View style={{ padding: embedded ? 0 : 16, flex: 1 }}>
      {!embedded && (
        <>
          <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 4 }}>
            Equipos
          </Text>
          <Text style={{ color: "#64748b", marginBottom: 16 }}>
            Historial unificado por TagEquipo
          </Text>
        </>
      )}

      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#e2e8f0",
          borderRadius: 8,
          padding: 12,
          backgroundColor: "#fff",
          marginBottom: 16,
        }}
        placeholder="Buscar por tag, nombre o área..."
        value={search}
        onChangeText={setSearch}
      />

      {nestedScroll ? <View>{listBody}</View> : (
        <ScrollView showsVerticalScrollIndicator={false}>{listBody}</ScrollView>
      )}
    </View>
  );

  if (embedded) return content;

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>{content}</View>
  );
}

const EquipmentBrowser = connect(null, { saveActualServiceAIT })(
  EquipmentBrowserRaw,
);

export default EquipmentBrowser;
