import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType,
  HeadingLevel,
  TabStopPosition,
  TabStopType,
  SectionType,
  PageBreak,
  UnderlineType,
} from "docx";

/**
 * Mock data for testing the report generation
 */
const mockServiceInfo = {
  EmpresaMinera: "ANTAMINA",
  NombreServicio: "SERVICIO DE CAMBIO DE REDUCTOR B CVB-758",
  Codigo: "FH-PROY-ANT-01",
  Version: "00",
  Pagina: "1 de 1",
  ElaboradoPor: "RM",
  RevisadoPor: "PC",
  AprobadoPor: "NH",
  Fecha: "16/04/2025",
  RUC: "20564502546",
  Direccion:
    "Jr. María Parado de Bellido Grupo18 Mz 2 Semirrural Pachacútec, Cerro Colorado - Arequipa",
  Telefono: "054 - 574755",
  Email: "ventas@fhingenieros.com.pe",
  OS: "4000009532",
  PO: "-",
  Area: "CHANCADO",
  SOLPED: "4000009532",
  FechaInicio: "05/04/2025",
  FechaFin: "10/04/2025",
};

const mockPersonal = [
  { nombre: "Nayhua Yana Luis", cargo: "Líder Mecánico" },
  { nombre: "Palomino Arotaipe Larry", cargo: "Mecánico" },
  { nombre: "Luis Arenas Kevin", cargo: "Mecánico" },
  { nombre: "Qquellhua Sarcca Armando", cargo: "Soldador" },
  { nombre: "Quispe Ccorahua Emerson", cargo: "Soldador" },
  { nombre: "Sandoval Huaman Ronald", cargo: "Supervisor SSOMA" },
  { nombre: "Layme Canaza Ruel", cargo: "Supervisor Mecánico" },
];

const mockCharlas = [
  { fecha: "5/03/2025", tema: "AUTOESTIMA" },
  { fecha: "6/03/2025", tema: "PROTECCION DE CAIDAS ARNESES CORPORALES" },
  { fecha: "7/03/2025", tema: "SEGURIDAD CON LOS APAREJOS" },
  { fecha: "8/03/2025", tema: "SEGURIDAD EN ESCALERAS Y ANDAMIOS" },
  { fecha: "9/03/2025", tema: "SUPERFICIES DE TRANSITO Y MANTENIMIENTO" },
  { fecha: "10/03/2025", tema: "PREVENCION DE LESIONES A LA COLUMNA" },
];

const mockHerramientas = [
  "Gata Hidraulica Tipo Pastilla De 20 Tn",
  "Turbineta",
  'Pistola Neumática De Encastre De ¾", 1" Y 1 ½"',
  "Maquina De Soldar Completa",
  "Llave Hytorc",
];

const mockComponentes = ["Reductor de velocidad", "Lainas", "Aceite"];

/**
 * Creates the header section with company info and title
 */
function createHeader(serviceInfo: any) {
  return [
    // Company header
    new Paragraph({
      children: [
        new TextRun({
          text: "FH INGENIEROS Y CONTRATISTAS GENERALES SAC",
          bold: true,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `RUC: ${serviceInfo.RUC}`,
          size: 20,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 },
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Dirección: ${serviceInfo.Direccion}`,
          size: 20,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 },
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Teléfonos: ${serviceInfo.Telefono} e-mail: ${serviceInfo.Email}`,
          size: 20,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),

    // Main title
    new Paragraph({
      children: [
        new TextRun({
          text: `${serviceInfo.EmpresaMinera} S.A.`,
          bold: true,
          size: 32,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `OS: ${serviceInfo.OS}`,
          bold: true,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `"${serviceInfo.NombreServicio}"`,
          bold: true,
          size: 28,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: '"INFORME TÉCNICO"',
          bold: true,
          size: 28,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: 'Rev. "00"',
          bold: true,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
  ];
}

/**
 * Creates the approval table
 */
function createApprovalTable(serviceInfo: any) {
  return new Table({
    columnWidths: [2505, 2505, 2000],

    // width: {
    //   size: 100,
    //   type: WidthType.PERCENTAGE,
    // },
    // borders: {
    //   top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    //   bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    //   left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    //   right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    //   insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    //   insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    // },
    rows: [
      // Header row
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "APROBADO POR:",
                    bold: true,
                  }),
                ],
                spacing: { after: 100 },
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Nombre – Empresa",
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Fecha",
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      // Elaborado por
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun("Elaborado por:")],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun("Ing. Roberth Manturano")],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun("16/04/2025")],
              }),
            ],
          }),
        ],
      }),
      // Residente de proyecto
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun("Residente de proyecto:")],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun("Ing. Percy Chirinos")],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun("17/04/2025")],
              }),
            ],
          }),
        ],
      }),
      // Dirigido a
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun("Dirigido a:")],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun("Ing. Sergio Salas")],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun("17/04/2025")],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/**
 * Creates project information section
 */
function createProjectInfo(serviceInfo: any) {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: "NOMBRE DEL PROYECTO: ",
          bold: true,
        }),
        new TextRun(serviceInfo.NombreServicio),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "PO: ",
          bold: true,
        }),
        new TextRun(serviceInfo.PO),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "AREA: ",
          bold: true,
        }),
        new TextRun(serviceInfo.Area),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "SOLPED: ",
          bold: true,
        }),
        new TextRun(serviceInfo.SOLPED),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "FECHA: ",
          bold: true,
        }),
        new TextRun(
          `DEL ${serviceInfo.FechaInicio} al ${serviceInfo.FechaFin}`
        ),
      ],
      spacing: { after: 200 },
    }),
  ];
}

/**
 * Creates objective and scope sections
 */
function createObjectiveAndScope() {
  return [
    // Objective section
    new Paragraph({
      children: [
        new TextRun({
          text: "OBJETIVO",
          bold: true,
          underline: { type: UnderlineType.SINGLE },
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun(
          "- Informar detalladamente los alcances de los trabajos realizados desde el 05/04 al 10/04 en el SERVICIO CAMBIO DE REDUCTOR B CVB-758 cumpliendo con los estándares de Antamina y los propios de FH INGENIEROS"
        ),
      ],
      spacing: { after: 200 },
    }),

    // Personnel section
    new Paragraph({
      children: [
        new TextRun({
          text: "PERSONAL DESTACADO DEL SERVICIO",
          bold: true,
          underline: { type: UnderlineType.SINGLE },
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [new TextRun("Cambio de reductor B CVB-758")],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun("Supervisor Operativo FH (día): Ing. Ruel Layme Canaza"),
      ],
      spacing: { after: 50 },
    }),
    new Paragraph({
      children: [
        new TextRun(
          "Supervisor de Seguridad FH (día): Ing. Ronal Sandoval Huamán"
        ),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Supervisión Antamina",
          bold: true,
        }),
      ],
      spacing: { after: 50 },
    }),
    new Paragraph({
      children: [new TextRun("Supervisor turno día: Ing. Sergio Salas")],
      spacing: { after: 200 },
    }),

    // Scope section
    new Paragraph({
      children: [
        new TextRun({
          text: "ALCANCE DEL SERVICIO",
          bold: true,
          underline: { type: UnderlineType.SINGLE },
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun(
          "- FH INGENIEROS Y CONTRATISTAS GENERALES fue contratada por ANTAMINA para realizar los trabajos de mantenimiento en la Parada de Planta Abril 2025, el trabajo consistió en el SERVICIO CAMBIO DE REDUCTOR B CVB-758"
        ),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun("- CAMBIO PUNTOS DE TRABAJO DE REDUCTOR LADO C a LADO B"),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun(
          "En vista que no llego el reductor lado C se procederá a cambiar el lado B en coordinación con el Ing. Sergio salas y técnico Hugo Gonzales"
        ),
      ],
      spacing: { after: 200 },
    }),
  ];
}

/**
 * Creates personnel table
 */
function createPersonnelTable(personal: any) {
  const rows = [
    // Header
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "TURNO DÍA",
                  bold: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "",
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "APELLIDOS Y NOMBRES",
                  bold: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "CARGO",
                  bold: true,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  // Add personnel rows
  personal.forEach((person: any) => {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun(person.nombre)],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun(person.cargo)],
              }),
            ],
          }),
        ],
      })
    );
  });

  return new Table({
    // width: {
    //   size: 100,
    //   type: WidthType.PERCENTAGE,
    // },
    // borders: {
    //   top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    //   bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    //   left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    //   right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    //   insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    //   insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    // },
    columnWidths: [2505, 2505, 2000],

    rows: rows,
  });
}

/**
 * Creates safety training table
 */
function createSafetyTrainingTable(charlas: any) {
  const rows = [
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "1. Charlas:",
                  bold: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun("")],
            }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "FECHA",
                  bold: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "TEMA",
                  bold: true,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  charlas.forEach((charla: any) => {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun(charla.fecha)],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun(charla.tema)],
              }),
            ],
          }),
        ],
      })
    );
  });

  return new Table({
    // width: {
    //   size: 100,
    //   type: WidthType.PERCENTAGE,
    // },
    // borders: {
    //   top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    //   bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    //   left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    //   right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    //   insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    //   insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    // },
    columnWidths: [2505, 2505, 2000],

    rows: rows,
  });
}

/**
 * Creates resources section
 */
function createResourcesSection(herramientas: any, componentes: any) {
  const content = [
    new Paragraph({
      children: [
        new TextRun({
          text: "RECURSOS, MATERIALES, EQUIPOS Y HERRAMIENTAS",
          bold: true,
          underline: { type: UnderlineType.SINGLE },
        }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "HERRAMIENTAS INDISPENSABLES",
          bold: true,
        }),
      ],
      spacing: { after: 100 },
    }),
  ];

  herramientas.forEach((herramienta: any) => {
    content.push(
      new Paragraph({
        children: [new TextRun(herramienta)],
        spacing: { after: 50 },
      })
    );
  });

  content.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "COMPONENTES",
          bold: true,
        }),
      ],
      spacing: { after: 100, before: 100 },
    })
  );

  componentes.forEach((componente: any) => {
    content.push(
      new Paragraph({
        children: [new TextRun(componente)],
        spacing: { after: 50 },
      })
    );
  });

  return content;
}

/**
 * Creates conclusions and recommendations section
 */
function createConclusionsSection() {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: "CONCLUSIONES Y RECOMENDACIONES",
          bold: true,
          underline: { type: UnderlineType.SINGLE },
        }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "CONCLUSIONES:",
          bold: true,
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun(
          "Se realizo de forma satisfactoria el cambio de reductos B de la faja CVB-758, lo cual permitirá que la faja transportadora pueda operar con normalidad, incrementando la disponibilidad y confiabilidad de los mismos y contribuyendo a la continuidad del proceso de conminución y liberación de material valioso."
        ),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "RECOMENDACIONES:",
          bold: true,
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun(
          "Se recomienda realizar el cambio del reductor del lado C según el plan de parada para el mes de Abril."
        ),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun(
          "Se recomienda hacer un seguimiento detallado al reductor del lado C para que este no pueda perjudicar el proceso de conminución."
        ),
      ],
      spacing: { after: 100 },
    }),
  ];
}

/**
 * Enhanced function to generate a comprehensive Word document
 */
export async function createEnhancedDocxReport(
  postData = null,
  serviceData = null
): Promise<Blob> {
  // Use provided data or fallback to mock data
  const serviceInfo = mockServiceInfo;
  const personal = mockPersonal;
  const charlas = mockCharlas;
  const herramientas = mockHerramientas;
  const componentes = mockComponentes;

  // Build document sections
  const headerContent = createHeader(serviceInfo);
  const approvalTable = createApprovalTable(serviceInfo);
  const projectInfo = createProjectInfo(serviceInfo);
  const objectiveAndScope = createObjectiveAndScope();
  const personnelTable = createPersonnelTable(personal);
  const safetyTrainingTable = createSafetyTrainingTable(charlas);
  const resourcesContent = createResourcesSection(herramientas, componentes);
  const conclusionsContent = createConclusionsSection();

  // Create the document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          // Header section
          ...headerContent,

          // Approval table
          approvalTable,

          new Paragraph({
            children: [new TextRun("")],
            spacing: { after: 400 },
          }),

          // Page break for new section
          new Paragraph({
            children: [new PageBreak()],
          }),

          // Project information
          ...projectInfo,

          // Objective and scope
          ...objectiveAndScope,

          // Personnel table
          new Paragraph({
            children: [
              new TextRun({
                text: "USO DE RECURSOS HUMANOS",
                bold: true,
                underline: { type: UnderlineType.SINGLE },
              }),
            ],
            spacing: { after: 200 },
          }),

          personnelTable,

          new Paragraph({
            children: [new TextRun("")],
            spacing: { after: 400 },
          }),

          // Page break for safety section
          new Paragraph({
            children: [new PageBreak()],
          }),

          // Safety training section
          new Paragraph({
            children: [
              new TextRun({
                text: "REPORTE DE SEGURIDAD",
                bold: true,
                underline: { type: UnderlineType.SINGLE },
              }),
            ],
            spacing: { after: 200 },
          }),

          safetyTrainingTable,

          new Paragraph({
            children: [new TextRun("")],
            spacing: { after: 400 },
          }),

          // Resources section
          ...resourcesContent,

          new Paragraph({
            children: [new TextRun("")],
            spacing: { after: 400 },
          }),

          // Page break for conclusions
          new Paragraph({
            children: [new PageBreak()],
          }),

          // Conclusions section
          ...conclusionsContent,
        ],
      },
    ],
  });

  // Generate and return the blob
  const blob = await Packer.toBlob(doc);
  return blob;
}
