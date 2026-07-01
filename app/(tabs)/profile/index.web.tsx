import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Button } from "@rneui/themed";
import { getAuth, signOut } from "firebase/auth";
import ConnectedInfoUser from "../../../components/InfoUser/InfoUser";
import styles from "./index.styles";
import { connect } from "react-redux";
import { update_firebaseUserUid } from "../../../redux/actions/auth";
import ConnectedChangeDisplayNameForm from "./components/ChangeDisplayNameForm/ChangeDisplayNameForm";
import { Modal } from "@/components/Modal/Modal";
import { update_firebaseProfile } from "../../../redux/actions/profile";
import { getEventsByProject } from "@/lib/db/events";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Redirect } from "expo-router";
import { FeatherIcon } from "@/components/FeatherIcon";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { titulo_proyecto } from "../../../redux/actions/auth";
import { RagScreen } from "./components/RagScreen/RagScreen";

function capitalizeFirstLetter(str: any) {
  return str?.charAt(0).toUpperCase() + str?.slice(1);
}

function parseEventDate(ev: any): Date | null {
  const d = ev?.createdAt;
  if (!d) return null;
  if (d instanceof Date && !isNaN(d.getTime())) return d;
  if (typeof d?.toDate === "function") {
    const parsed = d.toDate();
    return parsed instanceof Date && !isNaN(parsed.getTime()) ? parsed : null;
  }
  if (typeof d === "object" && d.seconds) return new Date(d.seconds * 1000);
  if (typeof d === "number") return new Date(d > 1e12 ? d : d * 1000);
  if (typeof d === "string") {
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function isSameUser(ev: any, email: string) {
  return (
    String(ev?.emailPerfil || "").trim().toLowerCase() ===
    String(email || "").trim().toLowerCase()
  );
}

function eventKey(ev: any): string {
  return (
    ev?.idDocFirestoreDB ||
    ev?.unicoID ||
    `${ev?.emailPerfil}-${ev?.createdAt}-${ev?.titulo}`
  );
}

function dedupeEvents(events: any[]): any[] {
  const seen = new Set<string>();
  return events.filter((ev) => {
    const k = eventKey(ev);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function ProfileRaw(props: any) {
  const [showModal, setShowModal] = useState(false);
  const [renderComponent, setRenderComponent] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [allProjectEvents, setAllProjectEvents] = useState<any[]>([]);

  const regex = /@(.+?)\./i;
  const companyName =
    capitalizeFirstLetter(props.email?.match(regex)?.[1]) || "Anonimo";
  const projectId =
    props.servicesData?.[0]?.projectId ||
    props.totalEventServiceAITLIST?.[0]?.projectId ||
    "";

  const onCloseOpenModal = () => setShowModal((prevState) => !prevState);

  const update_Data = () => {
    setRenderComponent(
      <ConnectedChangeDisplayNameForm onClose={onCloseOpenModal} />
    );
    setShowModal(true);
  };

  useEffect(() => {
    if (!props.email) {
      setLoadingStats(false);
      return;
    }

    async function loadEvents() {
      setLoadingStats(true);
      try {
        const embedded: any[] = [];
        (props.servicesData || []).forEach((svc: any) => {
          (Array.isArray(svc.events) ? svc.events : []).forEach((ev: any) => {
            embedded.push({
              ...ev,
              AITNombreServicio: ev.AITNombreServicio || svc.NombreServicio,
              projectId: ev.projectId || svc.projectId,
            });
          });
        });

        let fetched: any[] = [];
        if (projectId) {
          fetched = await getEventsByProject(projectId, 300);
        }

        const feed = Array.isArray(props.totalEventServiceAITLIST)
          ? props.totalEventServiceAITLIST
          : [];

        const merged = dedupeEvents([...feed, ...fetched, ...embedded]).sort(
          (a, b) => {
            const da = parseEventDate(a)?.getTime() || 0;
            const db = parseEventDate(b)?.getTime() || 0;
            return db - da;
          }
        );

        setAllProjectEvents(merged);
      } catch (error) {
        console.error("Error loading usage stats:", error);
        const feed = Array.isArray(props.totalEventServiceAITLIST)
          ? props.totalEventServiceAITLIST
          : [];
        setAllProjectEvents(feed);
      } finally {
        setLoadingStats(false);
      }
    }

    loadEvents();
  }, [
    props.email,
    projectId,
    props.servicesData,
    props.totalEventServiceAITLIST,
  ]);

  const stats = useMemo(() => {
    const email = props.email || "";
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const myEvents = allProjectEvents.filter((ev) => isSameUser(ev, email));
    const eventsThisWeek = myEvents.filter((ev) => {
      const d = parseEventDate(ev);
      return d && d >= weekAgo;
    });
    const eventsThisMonth = myEvents.filter((ev) => {
      const d = parseEventDate(ev);
      return d && d >= monthStart;
    });

    const servicesCreated = (props.servicesData || []).filter(
      (s: any) =>
        isSameUser(s, email) && s.isGlobalProject !== true && s.NombreServicio
    ).length;

    const weeklyBars: { label: string; count: number; isToday: boolean }[] =
      [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const count = myEvents.filter((ev) => {
        const d = parseEventDate(ev);
        return d && d >= dayStart && d < dayEnd;
      }).length;
      weeklyBars.push({
        label: DAY_LABELS[day.getDay()],
        count,
        isToday: i === 0,
      });
    }

    const maxBar = Math.max(...weeklyBars.map((b) => b.count), 1);

    const byUser: Record<
      string,
      { name: string; email: string; count: number }
    > = {};
    allProjectEvents.forEach((ev) => {
      const em = String(ev.emailPerfil || "sin-email").trim().toLowerCase();
      const name = ev.nombrePerfil || ev.emailPerfil || "Usuario";
      if (!byUser[em]) byUser[em] = { name, email: ev.emailPerfil || em, count: 0 };
      byUser[em].count += 1;
    });

    const leaderboard = Object.values(byUser)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const recentMine = myEvents.slice(0, 6);

    const avgPerWeek =
      myEvents.length > 0
        ? Math.round(
            (myEvents.length /
              Math.max(
                1,
                Math.ceil(
                  (now.getTime() -
                    (parseEventDate(myEvents[myEvents.length - 1])?.getTime() ||
                      now.getTime())) /
                    (7 * 86400000)
                )
              )) *
              10
          ) / 10
        : 0;

    return {
      totalEvents: myEvents.length,
      eventsThisWeek: eventsThisWeek.length,
      eventsThisMonth: eventsThisMonth.length,
      servicesCreated,
      weeklyBars,
      maxBar,
      leaderboard,
      recentMine,
      avgPerWeek,
      teamTotal: allProjectEvents.length,
    };
  }, [allProjectEvents, props.email, props.servicesData]);

  const logout = async () => {
    const auth = getAuth();
    await signOut(auth);
    props.update_firebaseUserUid("");
    props.titulo_proyecto("");
    return <Redirect href="/" />;
  };

  return (
    <SafeAreaView style={[{ flex: 1 }, styles.AndroidSafeArea]}>
      <KeyboardAwareScrollView
        style={{ backgroundColor: "#F4F6FA" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pageWrap}
      >
        <ConnectedInfoUser />

        <View style={styles.actionRow}>
          <Button
            title="Editar perfil"
            buttonStyle={styles.btnActualizarStyles}
            titleStyle={styles.btnTextStyle}
            onPress={() => update_Data()}
          />
          <Button
            title="Cerrar sesión"
            buttonStyle={styles.btncerrarStyles}
            titleStyle={styles.btnTextStyle}
            onPress={() => logout()}
          />
        </View>

        {/* Asistente IA — RAG + Gemini */}
        <View style={styles.aiCard}>
          <View style={{ height: 580 }}>
            <RagScreen embedded />
          </View>
        </View>

        {/* Estadísticas de uso */}
        <View style={styles.dashHeader}>
          <Text style={styles.dashHeaderTitle}>Estadísticas de uso</Text>
          <Text style={styles.dashHeaderMeta}>
            {props.profile || props.email} · {companyName}
            {projectId ? ` · Proyecto activo` : ""}
          </Text>
        </View>

        {loadingStats ? (
          <View style={styles.loadingWrap}>
            <LoadingSpinner />
            <Text style={styles.emptyText}>Cargando actividad…</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: "#E6F7FF" },
                  ]}
                >
                  <FeatherIcon name="calendar" size={22} color="#1890FF" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statValue}>{stats.totalEvents}</Text>
                  <Text style={styles.statLabel}>Eventos publicados</Text>
                  <Text style={styles.statHint}>Total en el proyecto</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: "#F6FFED" },
                  ]}
                >
                  <FeatherIcon name="trending-up" size={22} color="#52C41A" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statValue}>{stats.eventsThisWeek}</Text>
                  <Text style={styles.statLabel}>Esta semana</Text>
                  <Text style={styles.statHint}>
                    {stats.eventsThisMonth} este mes
                  </Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: "#FFF7E6" },
                  ]}
                >
                  <FeatherIcon name="briefcase" size={22} color="#FA8C16" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statValue}>{stats.servicesCreated}</Text>
                  <Text style={styles.statLabel}>Trabajos adicionales</Text>
                  <Text style={styles.statHint}>AIT creados por ti</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: "#F9F0FF" },
                  ]}
                >
                  <FeatherIcon name="users" size={22} color="#722ED1" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statValue}>{stats.teamTotal}</Text>
                  <Text style={styles.statLabel}>Eventos del equipo</Text>
                  <Text style={styles.statHint}>
                    {stats.leaderboard.length} supervisores activos
                  </Text>
                </View>
              </View>
            </View>

            {/* Gráfico semanal */}
            <View style={styles.activitySummary}>
              <Text style={styles.sectionTitle}>Tu actividad — últimos 7 días</Text>
              <Text style={styles.sectionSubtitle}>
                Eventos que publicaste por día. Promedio semanal:{" "}
                <Text style={{ fontWeight: "700", color: "#2A3B76" }}>
                  {stats.avgPerWeek}/sem
                </Text>
              </Text>
              <View style={styles.barChartContainer}>
                {stats.weeklyBars.map((bar, index) => {
                  const h = bar.count > 0 ? (bar.count / stats.maxBar) * 110 : 4;
                  return (
                    <View key={index} style={styles.barChartColumn}>
                      <View style={styles.barLabelContainer}>
                        <Text style={styles.barValue}>{bar.count}</Text>
                      </View>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: h,
                            backgroundColor: bar.isToday ? "#2A3B76" : "#B8C5E8",
                          },
                        ]}
                      />
                      <Text style={styles.barLabel}>{bar.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Ranking supervisores */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Ranking de supervisores — eventos publicados
              </Text>
              <Text style={styles.sectionSubtitle}>
                Mide cuánto usa la plataforma cada supervisor del proyecto.
              </Text>
              {stats.leaderboard.length === 0 ? (
                <Text style={styles.emptyText}>Sin eventos en el proyecto aún.</Text>
              ) : (
                stats.leaderboard.map((row, i) => {
                  const isMe =
                    String(row.email || "").toLowerCase() ===
                    String(props.email || "").toLowerCase();
                  return (
                    <View
                      key={row.email + i}
                      style={[
                        styles.leaderboardRow,
                        isMe && { backgroundColor: "#F8FAFF", borderRadius: 8 },
                      ]}
                    >
                      <View
                        style={[
                          styles.leaderboardRank,
                          i < 3 && styles.leaderboardRankTop,
                        ]}
                      >
                        <Text
                          style={[
                            styles.leaderboardRankText,
                            i < 3 && styles.leaderboardRankTextTop,
                          ]}
                        >
                          {i + 1}
                        </Text>
                      </View>
                      <View style={styles.leaderboardInfo}>
                        <Text style={styles.leaderboardName}>
                          {row.name}
                          {isMe ? " (tú)" : ""}
                        </Text>
                        <Text style={styles.leaderboardEmail} numberOfLines={1}>
                          {row.email}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.leaderboardCount}>{row.count}</Text>
                        <Text style={styles.leaderboardCountLabel}>eventos</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* Actividad reciente */}
            <View style={styles.recentActivityContainer}>
              <Text style={styles.sectionTitle}>Tus últimos eventos</Text>
              {stats.recentMine.length === 0 ? (
                <Text style={styles.emptyText}>
                  Aún no has publicado eventos en este proyecto.
                </Text>
              ) : (
                stats.recentMine.map((ev, i) => {
                  const d = parseEventDate(ev);
                  const dateStr = d
                    ? d.toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";
                  return (
                    <View key={eventKey(ev) + i} style={styles.activityItem}>
                      <View
                        style={[
                          styles.activityIcon,
                          { backgroundColor: "#E6F7FF" },
                        ]}
                      >
                        <FeatherIcon name="file-text" size={16} color="#1890FF" />
                      </View>
                      <View style={styles.activityDetails}>
                        <Text style={styles.activityTitle} numberOfLines={1}>
                          {ev.titulo || ev.etapa || "Evento de avance"}
                        </Text>
                        <Text style={styles.activityDate} numberOfLines={1}>
                          {ev.AITNombreServicio || "Servicio"} · {dateStr}
                        </Text>
                      </View>
                      {ev.etapa ? (
                        <Text style={styles.activityEtapa}>{ev.etapa}</Text>
                      ) : null}
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}
      </KeyboardAwareScrollView>

      <Modal show={showModal} close={onCloseOpenModal}>
        {renderComponent}
      </Modal>
    </SafeAreaView>
  );
}

const mapStateToProps = (reducers: any) => ({
  profile: reducers.profile.firebase_user_name,
  email: reducers.profile.email,
  approvalQuantity: reducers.profile.approvalQuantity,
  approvalList: reducers.home.approvalList,
  totalEventServiceAITLIST: reducers.home.totalEventServiceAITLIST,
  servicesData: reducers.home.servicesData,
});

const Profile = connect(mapStateToProps, {
  update_firebaseUserUid,
  update_firebaseProfile,
  titulo_proyecto,
})(ProfileRaw);

export default Profile;
