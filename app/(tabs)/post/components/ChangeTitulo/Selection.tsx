import { SelectList } from "react-native-dropdown-select-list";
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import {
  Reparacion,
  Fabricacion,
  Ingenieria,
  IngenieriayFabricacion,
} from "../../../../../utils/tipoServicioList";
import { db } from "@/firebaseConfig";
import {
  collection,
  query,
  onSnapshot,
  where,
  limit,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";

type Task = {
  id: string;
  name: string;
  FechaInicio: string;
  FechaFin?: string;
  dependencies?: string[];
};

const SelectExampleBare = (props: any) => {
  const [selected, setSelected] = useState("");
  const [list, setList] = useState([]);
  const { setText, formik, id, idServiciosAIT } = props;
  const [data, setData] = useState<any[]>();

  //render the list the best suit depend of TipoServicio property
  let serviceType: any;
  if (props.actualServiceAIT.TipoServicio === "Reparacion") {
    serviceType = Reparacion;
  } else if (props.actualServiceAIT.TipoServicio === "Fabricacion") {
    serviceType = Fabricacion;
  } else if (props.actualServiceAIT.TipoServicio === "Ingenieria") {
    serviceType = Ingenieria;
  } else if (props.actualServiceAIT.TipoServicio === "IngenieriayFabricacion") {
    serviceType = IngenieriayFabricacion;
  } else {
    serviceType = [
      {
        value: "Tareo",
      },
    ];
  }
  //--------------------------------------------------------------------------------
  // let tasks = props.totalActivies;
  // // Convertir fechas a objetos Date y calcular duración en milisegundos
  // // Convertir fechas a objetos Date y calcular duración en milisegundos
  // // Encontrar la última fecha de finalización

  // tasks.forEach((task: any) => {
  //   if (typeof task.FechaInicio === "string") {
  //     task.FechaInicio = new Date(task.FechaInicio.replace(",", "T"));
  //   } else if (!task.FechaInicio) {
  //     task.FechaInicio = null; // O podrías asignar una fecha predeterminada
  //   }

  //   if (typeof task.FechaFin === "string") {
  //     task.FechaFin = new Date(task.FechaFin.replace(",", "T"));
  //   } else if (!task.FechaFin) {
  //     task.FechaFin = null;
  //   }

  //   task.Duracion =
  //     task.FechaInicio && task.FechaFin
  //       ? task.FechaFin.getTime() - task.FechaInicio.getTime()
  //       : 0;
  // });

  // const maxEndDate = new Date(
  //   Math.max(...tasks.map((t: any) => t.FechaFin.getTime()))
  // );

  // // Función para obtener todas las tareas de la ruta crítica
  // function findCriticalPath(tasks: Task[]) {
  //   let criticalPath: Task[] = [];
  //   let taskMap = new Map<string, Task>();

  //   // Crear un mapa de tareas por ID para acceder más rápido
  //   tasks.forEach((task) => taskMap.set(task.id, task));

  //   // Encontrar tareas que terminan en la última fecha posible
  //   let endTasks = tasks.filter(
  //     (t: any) => t.FechaFin.getTime() === maxEndDate?.getTime()
  //   );

  //   // Recorrer hacia atrás para encontrar la ruta crítica
  //   function traceCriticalPath(task: Task) {
  //     if (!criticalPath.includes(task)) {
  //       criticalPath.push(task);
  //       if (task.dependencies) {
  //         task.dependencies.forEach((depId) => {
  //           let depTask = taskMap.get(depId);
  //           if (depTask) traceCriticalPath(depTask);
  //         });
  //       }
  //     }
  //   }

  //   // Iniciar la traza desde las tareas finales
  //   endTasks.forEach(traceCriticalPath);
  //   return criticalPath;
  // }

  // const criticalTasks = findCriticalPath(tasks);

  //--------------------------------------------------------------------------------

  useEffect(() => {
    async function fetchData() {
      try {
        const docRef = doc(db, "ServiciosAIT", idServiciosAIT); // Replace with your document ID
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const documentData = docSnap.data();
          setData(documentData.activities || []);
        } else {
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    }
    fetchData();
  }, []);

  const filterNamesActivities = data?.map((item: any) => {
    return {
      value: item,
    };
  });

  const tipoServicioList: any = filterNamesActivities ?? [];

  const tipoServicioList2: any = filterNamesActivities?.concat(
    {
      value: "Servicio concluido",
    },
    {
      value: "Reporte de seguridad y/o Medio Ambiente",
    },
    {
      value: "Otro tipo de Reporte",
    },
    {
      value: "Tareo",
    },
    {
      value: "Previos",
    }
  );

  const tipoServicioList3: any = [
    {
      value: "Inicio de  Servicio",
    },
    {
      value: "Avance de Servicio",
    },
    {
      value: "Servicio concluido",
    },
    {
      value: "Reporte de seguridad y/o Medio Ambiente",
    },
    {
      value: "Otro tipo de Reporte",
    },
    {
      value: "Tareo",
    },
    {
      value: "Previos",
    },
  ];

  function saveProperty(itemValue: any) {
    setText(itemValue);
  }

  return (
    <SelectList
      setSelected={(val: any) => setSelected(val)}
      data={tipoServicioList.length > 0 ? tipoServicioList2 : tipoServicioList3}
      save="value"
      maxHeight={150}
      onSelect={() => saveProperty(selected)}
    />
  );
};

const mapStateToProps = (reducers: any) => {
  return {
    actualServiceAIT: reducers.post.actualServiceAIT,
    totalActivies: reducers.post.totalActivities,
  };
};

const SelectExample = connect(mapStateToProps, {})(SelectExampleBare);
export default SelectExample;
