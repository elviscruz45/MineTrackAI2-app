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
  Footer,
  Header,
  PageNumber,
  NumberFormat,
  Shading,
  PageOrientation,
} from "docx";

/**
 * Mock data for testing the report generation
 */

// Define theme colors for consistent styling
const THEME = {
  PRIMARY: "1976d2", // Blue
  SECONDARY: "2A3B76", // Dark Blue
  ACCENT: "4CAF50", // Green
  LIGHT_BG: "f5f5f5", // Light Gray
  MEDIUM_BG: "e0e0e0", // Medium Gray
  TEXT_DARK: "333333", // Dark Gray for text
  TEXT_LIGHT: "FFFFFF", // White for text on dark backgrounds
  SUCCESS: "198754", // Green
  WARNING: "ffc107", // Yellow
  DANGER: "dc3545", // Red
  BORDER: "adb5bd", // Border color
};

// Helper function for styled headings
const createHeading = (text: string, level: 1 | 2 | 3 | 4 = 1) => {
  const sizes = { 1: 36, 2: 30, 3: 26, 4: 22 };
  const size = sizes[level] || 24;

  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: size,
        color: level === 1 ? THEME.SECONDARY : THEME.PRIMARY,
      }),
    ],
    spacing: { before: 240, after: 120 },
    heading: HeadingLevel.HEADING_1,
    border: {
      bottom: { color: THEME.BORDER, style: BorderStyle.SINGLE, size: 1 },
    },
  });
};

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
function createHeader(serviceInfo: any, catBlob: any) {
  return [
    // Company header with styled box
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 2, color: THEME.PRIMARY },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: THEME.PRIMARY },
        left: { style: BorderStyle.SINGLE, size: 2, color: THEME.PRIMARY },
        right: { style: BorderStyle.SINGLE, size: 2, color: THEME.PRIMARY },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                // Company name
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "FH INGENIEROS Y CONTRATISTAS GENERALES SAC",
                      bold: true,
                      size: 28,
                      color: THEME.SECONDARY,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 80 },
                }),
                // Company details
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `RUC: 20564502546`,
                      size: 20,
                      color: THEME.TEXT_DARK,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 40 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Dirección:  Jr. María Parado de Bellido Grupo18 Mz 2 Semirrural Pachacútec, Cerro Colorado - Arequipa`,
                      size: 20,
                      color: THEME.TEXT_DARK,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 40 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Teléfonos: 054 - 574755  e-mail: ventas@fhingenieros.com.pe`,
                      size: 20,
                      color: THEME.TEXT_DARK,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 40 },
                }),
              ],
              shading: {
                fill: THEME.LIGHT_BG,
              },
            }),
          ],
        }),
      ],
    }),

    // Spacer
    new Paragraph({
      children: [new TextRun("")],
      spacing: { after: 200 },
    }),

    // Main title
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: { style: BorderStyle.NONE, size: 0 },
        bottom: { style: BorderStyle.NONE, size: 0 },
        left: { style: BorderStyle.NONE, size: 0 },
        right: { style: BorderStyle.NONE, size: 0 },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${serviceInfo.EmpresaMinera} S.A.`,
                      bold: true,
                      size: 36,
                      color: THEME.SECONDARY,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 100 },
                }),
              ],
              borders: {
                top: { style: BorderStyle.NONE, size: 0 },
                bottom: { style: BorderStyle.NONE, size: 0 },
                left: { style: BorderStyle.NONE, size: 0 },
                right: { style: BorderStyle.NONE, size: 0 },
              },
            }),
          ],
        }),
      ],
    }),

    // Fecha
    new Paragraph({
      children: [
        new TextRun({
          text: `Fecha de Inicio: ${
            // Handle Firestore Timestamp object
            serviceInfo?.FechaInicio?.seconds
              ? new Date(
                  serviceInfo.FechaInicio.seconds * 1000
                ).toLocaleDateString("en-GB")
              : // Fallback for string dates or other formats
                new Date(serviceInfo?.FechaInicio)?.toLocaleDateString("en-GB")
          }`,
          bold: true,
          size: 24,
          color: THEME.PRIMARY,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: `OS: ${serviceInfo.NumeroAIT}`,
          bold: true,
          size: 24,
          color: THEME.PRIMARY,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),

    // Service title with colored background
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: THEME.PRIMARY },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: THEME.PRIMARY },
        left: { style: BorderStyle.SINGLE, size: 1, color: THEME.PRIMARY },
        right: { style: BorderStyle.SINGLE, size: 1, color: THEME.PRIMARY },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `"${serviceInfo.NombreServicio}"`,
                      bold: true,
                      size: 38,
                      color: THEME.TEXT_LIGHT,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 100, after: 100 },
                }),
              ],
              shading: {
                fill: THEME.SECONDARY,
              },
            }),
          ],
        }),
      ],
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: '"INFORME TÉCNICO"',
          bold: true,
          size: 28,
          color: THEME.PRIMARY,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 80 },
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: 'Rev. "00"',
          bold: true,
          size: 24,
          color: THEME.TEXT_DARK,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),

    // Logo image with border
    new Table({
      width: {
        size: 50,
        type: WidthType.PERCENTAGE,
      },
      alignment: AlignmentType.CENTER,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: THEME.BORDER },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: THEME.BORDER },
        left: { style: BorderStyle.SINGLE, size: 1, color: THEME.BORDER },
        right: { style: BorderStyle.SINGLE, size: 1, color: THEME.BORDER },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: catBlob,
                      transformation: {
                        width: 300,
                        height: 300,
                      },
                      type: "jpg", // or "png", "gif", etc.
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 80, after: 80 },
                }),
              ],
              borders: {
                top: { style: BorderStyle.NONE, size: 0 },
                bottom: { style: BorderStyle.NONE, size: 0 },
                left: { style: BorderStyle.NONE, size: 0 },
                right: { style: BorderStyle.NONE, size: 0 },
              },
            }),
          ],
        }),
      ],
    }),
  ];
}

/**
 * Creates the approval table
 */
function createApprovalTable(serviceInfo: any) {
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: THEME.PRIMARY },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: THEME.PRIMARY },
      left: { style: BorderStyle.SINGLE, size: 1, color: THEME.PRIMARY },
      right: { style: BorderStyle.SINGLE, size: 1, color: THEME.PRIMARY },
      insideHorizontal: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: THEME.PRIMARY,
      },
      insideVertical: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: THEME.PRIMARY,
      },
    },
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
                    color: THEME.TEXT_LIGHT,
                    size: 24,
                  }),
                ],
                spacing: { after: 100 },
                alignment: AlignmentType.CENTER,
              }),
            ],
            columnSpan: 3,
            shading: {
              fill: THEME.SECONDARY,
            },
          }),
        ],
      }),
      // Column headers row
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Rol",
                    bold: true,
                    color: THEME.TEXT_DARK,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: {
              fill: THEME.LIGHT_BG,
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Nombre – Empresa",
                    bold: true,
                    color: THEME.TEXT_DARK,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: {
              fill: THEME.LIGHT_BG,
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Fecha",
                    bold: true,
                    color: THEME.TEXT_DARK,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: {
              fill: THEME.LIGHT_BG,
            },
          }),
        ],
      }),
      // Elaborado por
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Elaborado por:", bold: true })],
                alignment: AlignmentType.LEFT,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun("Ing. Roberth Manturano")],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun("16/04/2025")],
                alignment: AlignmentType.CENTER,
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
                children: [
                  new TextRun({ text: "Residente de proyecto:", bold: true }),
                ],
                alignment: AlignmentType.LEFT,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun("Ing. Percy Chirinos")],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun("17/04/2025")],
                alignment: AlignmentType.CENTER,
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
                children: [new TextRun({ text: "Dirigido a:", bold: true })],
                alignment: AlignmentType.LEFT,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun("Ing. Sergio Salas")],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun("17/04/2025")],
                alignment: AlignmentType.CENTER,
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
    createHeading("1. INFORMACIÓN DEL PROYECTO", 1),

    // Project info in a styled box
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: THEME.BORDER },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: THEME.BORDER },
        left: { style: BorderStyle.SINGLE, size: 1, color: THEME.BORDER },
        right: { style: BorderStyle.SINGLE, size: 1, color: THEME.BORDER },
        insideHorizontal: {
          style: BorderStyle.SINGLE,
          size: 1,
          color: THEME.BORDER,
        },
      },
      rows: [
        // Project name
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "NOMBRE DEL PROYECTO: ",
                      bold: true,
                      color: THEME.SECONDARY,
                      size: 24,
                    }),
                  ],
                  spacing: { after: 60 },
                }),
              ],
              width: {
                size: 40,
                type: WidthType.PERCENTAGE,
              },
              shading: {
                fill: THEME.LIGHT_BG,
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: serviceInfo.NombreServicio,
                      size: 24,
                    }),
                  ],
                  spacing: { before: 60, after: 60 },
                }),
              ],
            }),
          ],
        }),

        // PO
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "PO: ",
                      bold: true,
                      color: THEME.SECONDARY,
                    }),
                  ],
                  spacing: { before: 60, after: 60 },
                }),
              ],
              shading: {
                fill: THEME.LIGHT_BG,
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: serviceInfo.NumeroAIT,
                    }),
                  ],
                  spacing: { before: 60, after: 60 },
                }),
              ],
            }),
          ],
        }),

        // Area
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "AREA: ",
                      bold: true,
                      color: THEME.SECONDARY,
                    }),
                  ],
                  spacing: { before: 60, after: 60 },
                }),
              ],
              shading: {
                fill: THEME.LIGHT_BG,
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: serviceInfo.AreaServicio || "CHANCADO",
                    }),
                  ],
                  spacing: { before: 60, after: 60 },
                }),
              ],
            }),
          ],
        }),

        // SOLPED
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "SOLPED: ",
                      bold: true,
                      color: THEME.SECONDARY,
                    }),
                  ],
                  spacing: { before: 60, after: 60 },
                }),
              ],
              shading: {
                fill: THEME.LIGHT_BG,
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: serviceInfo.NumeroAIT,
                    }),
                  ],
                  spacing: { before: 60, after: 60 },
                }),
              ],
            }),
          ],
        }),

        // Dates
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "FECHA: ",
                      bold: true,
                      color: THEME.SECONDARY,
                    }),
                  ],
                  spacing: { before: 60, after: 60 },
                }),
              ],
              shading: {
                fill: THEME.LIGHT_BG,
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `DEL ${
                        // Handle Firestore Timestamp object
                        serviceInfo?.FechaInicio?.seconds
                          ? new Date(
                              serviceInfo.FechaInicio.seconds * 1000
                            ).toLocaleDateString("en-GB")
                          : // Fallback for string dates or other formats
                            new Date(
                              serviceInfo?.FechaInicio
                            )?.toLocaleDateString("en-GB")
                      } al ${serviceInfo.FechaFin}`,
                    }),
                  ],
                  spacing: { before: 60, after: 60 },
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];
}

/**
 * Creates objective and scope sections
 */
function createObjectiveAndScope(serviceInfo: any) {
  return [
    // Objective section
    createHeading("OBJETIVO", 2),

    new Paragraph({
      children: [
        new TextRun({
          text: `Informar detalladamente los alcances de los trabajos realizados desde el ${
            // Handle Firestore Timestamp object
            serviceInfo?.FechaInicio?.seconds
              ? new Date(
                  serviceInfo.FechaInicio.seconds * 1000
                ).toLocaleDateString("en-GB")
              : // Fallback for string dates or other formats
                new Date(serviceInfo?.FechaInicio)?.toLocaleDateString("en-GB")
          } al ${serviceInfo.FechaFin} en el ${
            serviceInfo.NombreServicio
          } cumpliendo con los estándares de ${
            serviceInfo.EmpresaMinera
          } y los propios de FH INGENIEROS`,
          color: THEME.TEXT_DARK,
          size: 24,
        }),
      ],
      spacing: { after: 200 },
      border: {
        bottom: { color: THEME.BORDER, style: BorderStyle.SINGLE, size: 1 },
      },
      indent: { left: 720 },
    }),

    // Personnel section
    createHeading("PERSONAL DESTACADO DEL SERVICIO", 2),

    // Personnel in a styled table
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: THEME.BORDER },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: THEME.BORDER },
        left: { style: BorderStyle.SINGLE, size: 1, color: THEME.BORDER },
        right: { style: BorderStyle.SINGLE, size: 1, color: THEME.BORDER },
      },
      rows: [
        // Project
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Proyecto:",
                      bold: true,
                      color: THEME.SECONDARY,
                    }),
                  ],
                }),
              ],
              width: {
                size: 30,
                type: WidthType.PERCENTAGE,
              },
              shading: {
                fill: THEME.LIGHT_BG,
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Cambio de reductor B CVB-758",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        // Supervisor Operativo
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Supervisor Operativo FH (día):",
                      bold: true,
                      color: THEME.SECONDARY,
                    }),
                  ],
                }),
              ],
              shading: {
                fill: THEME.LIGHT_BG,
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Ing. .....................",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        // Supervisor de Seguridad
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Supervisor de Seguridad FH (día):",
                      bold: true,
                      color: THEME.SECONDARY,
                    }),
                  ],
                }),
              ],
              shading: {
                fill: THEME.LIGHT_BG,
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Ing. .....................",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        // Supervisor turno día
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Supervisor turno día:",
                      bold: true,
                      color: THEME.SECONDARY,
                    }),
                  ],
                }),
              ],
              shading: {
                fill: THEME.LIGHT_BG,
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Ing. .....................",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),

    // Spacer
    new Paragraph({
      children: [new TextRun("")],
      spacing: { after: 120 },
    }),

    // Scope section
    createHeading("ALCANCE DEL SERVICIO", 2),

    new Paragraph({
      children: [
        new TextRun({
          text: `FH INGENIEROS Y CONTRATISTAS GENERALES fue contratada por ${
            serviceInfo.EmpresaMinera
          } para realizar los trabajos de mantenimiento en la Parada de Planta del ${
            // Handle Firestore Timestamp object
            serviceInfo?.FechaInicio?.seconds
              ? new Date(
                  serviceInfo.FechaInicio.seconds * 1000
                ).toLocaleDateString("en-GB")
              : // Fallback for string dates or other formats
                new Date(serviceInfo?.FechaInicio)?.toLocaleDateString("en-GB")
          }, el trabajo consistió en el ${serviceInfo.NombreServicio}`,
          size: 24,
          color: THEME.TEXT_DARK,
        }),
      ],
      spacing: { after: 200 },
      indent: { left: 720 },
    }),

    // Title for activities
    createHeading("ACTIVIDADES REALIZADAS", 2),

    // Create a proper bullet list from activities array
    ...(serviceInfo.activities && Array.isArray(serviceInfo.activities)
      ? serviceInfo.activities.map(
          (activity: string, index: number) =>
            new Paragraph({
              children: [
                new TextRun({
                  text: activity,
                  color: THEME.TEXT_DARK,
                  size: 24,
                }),
              ],
              bullet: {
                level: 0, // Indentation level (0 for top level)
              },
              spacing: { after: 120 },
              indent: { left: 720, hanging: 360 },
            })
        )
      : [
          new Paragraph({
            children: [
              new TextRun({
                text: "No se registraron actividades",
                color: THEME.DANGER,
                size: 24,
              }),
            ],
            spacing: { after: 200 },
            indent: { left: 720 },
          }),
        ]),
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
    createHeading("CONCLUSIONES Y RECOMENDACIONES", 2),

    // Styled section for conclusions
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: THEME.PRIMARY },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: THEME.PRIMARY },
        left: { style: BorderStyle.SINGLE, size: 1, color: THEME.PRIMARY },
        right: { style: BorderStyle.SINGLE, size: 1, color: THEME.PRIMARY },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "CONCLUSIONES:",
                      bold: true,
                      size: 24,
                      color: THEME.TEXT_LIGHT,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
              ],
              shading: {
                fill: THEME.SECONDARY,
              },
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
                      text: "Se realizo de forma satisfactoria el cambio de reductos B de la faja CVB-758, lo cual permitirá que la faja transportadora pueda operar con normalidad, incrementando la disponibilidad y confiabilidad de los mismos y contribuyendo a la continuidad del proceso de conminución y liberación de material valioso.",
                      size: 22,
                    }),
                  ],
                  spacing: { before: 100, after: 100 },
                  indent: { left: 360 },
                }),
              ],
            }),
          ],
        }),
      ],
    }),

    new Paragraph({
      children: [new TextRun("")],
      spacing: { after: 200 },
    }),

    // Styled section for recommendations
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: THEME.PRIMARY },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: THEME.PRIMARY },
        left: { style: BorderStyle.SINGLE, size: 1, color: THEME.PRIMARY },
        right: { style: BorderStyle.SINGLE, size: 1, color: THEME.PRIMARY },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "RECOMENDACIONES:",
                      bold: true,
                      size: 24,
                      color: THEME.TEXT_LIGHT,
                    }),
                  ],
                  spacing: { after: 100 },
                }),
              ],
              shading: {
                fill: THEME.ACCENT,
              },
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
                      text: "• Se recomienda realizar el cambio del reductor del lado C según el plan de parada para el mes de Abril.",
                      size: 22,
                    }),
                  ],
                  spacing: { before: 80, after: 80 },
                  indent: { left: 360 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "• Se recomienda hacer un seguimiento detallado al reductor del lado C para que este no pueda perjudicar el proceso de conminución.",
                      size: 22,
                    }),
                  ],
                  spacing: { before: 80, after: 80 },
                  indent: { left: 360 },
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];
}

async function createImagesSection(postData: any): Promise<Paragraph[]> {
  // Handle empty or invalid data
  if (!postData || !Array.isArray(postData) || postData.length === 0) {
    return [
      createHeading("REGISTRO FOTOGRÁFICO", 2),
      new Paragraph({
        children: [
          new TextRun({
            text: "No hay imágenes disponibles para este informe.",
            color: THEME.DANGER,
            size: 24,
          }),
        ],
        spacing: { after: 200 },
        indent: { left: 720 },
      }),
    ];
  }

  // Start with a header for the photo section
  const paragraphs: Paragraph[] = [createHeading("REGISTRO FOTOGRÁFICO", 2)];

  // Process images in pairs for better layout
  for (let i = 0; i < postData.length; i += 2) {
    const item1 = postData[i];
    const item2 = i + 1 < postData.length ? postData[i + 1] : null;

    try {
      // Process first image
      if (item1?.fotoPrincipal) {
        const response1 = await fetch(item1.fotoPrincipal);
        if (!response1.ok) {
          throw new Error(`Image fetch failed: ${response1.status}`);
        }
        const imageData1 = await response1.arrayBuffer();

        // Process second image if available
        let imageData2 = null;
        if (item2?.fotoPrincipal) {
          const response2 = await fetch(item2.fotoPrincipal);
          if (response2.ok) {
            imageData2 = await response2.arrayBuffer();
          }
        }

        // Create image table
        const tableRows = [];

        // Images row
        const imageCells = [];
        imageCells.push(
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new ImageRun({
                    data: new Uint8Array(imageData1),
                    transformation: {
                      width: 300,
                      height: 220,
                    },
                    type: "jpg",
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 20 },
              }),
            ],
            width: {
              size: 50,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
          })
        );

        if (imageData2) {
          imageCells.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: new Uint8Array(imageData2),
                      transformation: {
                        width: 300,
                        height: 220,
                      },
                      type: "jpg",
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 20 },
                }),
              ],
              width: {
                size: 50,
                type: WidthType.PERCENTAGE,
              },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
            })
          );
        } else {
          imageCells.push(
            new TableCell({
              children: [new Paragraph("")],
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
            })
          );
        }

        tableRows.push(new TableRow({ children: imageCells }));

        // Captions row
        const captionCells = [];
        captionCells.push(
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Figura ${i + 1}: ${item1.titulo || ""}`,
                    bold: true,
                    color: THEME.SECONDARY,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 20 },
              }),
            ],
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
          })
        );

        if (item2) {
          captionCells.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Figura ${i + 2}: ${item2.titulo || ""}`,
                      bold: true,
                      color: THEME.SECONDARY,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 20 },
                }),
              ],
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
            })
          );
        } else {
          captionCells.push(
            new TableCell({
              children: [new Paragraph("")],
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
            })
          );
        }

        tableRows.push(new TableRow({ children: captionCells }));

        // Description row
        const descCells = [];
        descCells.push(
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: item1.comentarios || "",
                    color: THEME.TEXT_DARK,
                  }),
                ],
                alignment: AlignmentType.JUSTIFIED,
                spacing: { after: 40 },
              }),
            ],
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
          })
        );

        if (item2) {
          descCells.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: item2.comentarios || "",
                      color: THEME.TEXT_DARK,
                    }),
                  ],
                  alignment: AlignmentType.JUSTIFIED,
                  spacing: { after: 40 },
                }),
              ],
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
            })
          );
        } else {
          descCells.push(
            new TableCell({
              children: [new Paragraph("")],
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
            })
          );
        }

        tableRows.push(new TableRow({ children: descCells }));

        // Add table to paragraphs
        paragraphs.push(
          new Paragraph({
            children: [new TextRun("")],
            spacing: { after: 0 },
            pageBreakBefore: i > 0 && i % 4 === 0, // Page break every 4 images (2 rows)
          })
        );

        // Create and add the image table
        const imageTable = new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: THEME.BORDER },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: THEME.BORDER },
            left: { style: BorderStyle.SINGLE, size: 1, color: THEME.BORDER },
            right: { style: BorderStyle.SINGLE, size: 1, color: THEME.BORDER },
          },
          rows: tableRows,
        });

        paragraphs.push(
          new Paragraph({
            children: [new TextRun("")],
            spacing: { after: 200 },
          })
        );
      }
    } catch (error) {
      console.error(`Error processing images ${i + 1}-${i + 2}:`, error);
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[Error al cargar imágenes ${i + 1}-${i + 2}: ${error}]`,
              color: THEME.DANGER,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    }
  }

  return paragraphs;
}
/**
 * Creates a footer with page numbering and company name
 */
function createDocumentFooter() {
  return new Footer({
    children: [
      new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: THEME.BORDER },
          bottom: { style: BorderStyle.NONE, size: 0 },
          left: { style: BorderStyle.NONE, size: 0 },
          right: { style: BorderStyle.NONE, size: 0 },
        },
        rows: [
          new TableRow({
            children: [
              // Company name
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "FH INGENIEROS Y CONTRATISTAS GENERALES SAC",
                        bold: true,
                        size: 16,
                        color: THEME.SECONDARY,
                      }),
                    ],
                    alignment: AlignmentType.LEFT,
                  }),
                ],
                borders: {
                  top: { style: BorderStyle.NONE, size: 0 },
                  bottom: { style: BorderStyle.NONE, size: 0 },
                  left: { style: BorderStyle.NONE, size: 0 },
                  right: { style: BorderStyle.NONE, size: 0 },
                },
              }),
              // Page number
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Página ",
                        size: 16,
                        color: THEME.TEXT_DARK,
                      }),
                      new TextRun({
                        children: [PageNumber.CURRENT],
                        size: 16,
                        color: THEME.TEXT_DARK,
                      }),
                      new TextRun({
                        text: " de ",
                        size: 16,
                        color: THEME.TEXT_DARK,
                      }),
                      new TextRun({
                        children: [PageNumber.TOTAL_PAGES],
                        size: 16,
                        color: THEME.TEXT_DARK,
                      }),
                    ],
                    alignment: AlignmentType.RIGHT,
                  }),
                ],
                borders: {
                  top: { style: BorderStyle.NONE, size: 0 },
                  bottom: { style: BorderStyle.NONE, size: 0 },
                  left: { style: BorderStyle.NONE, size: 0 },
                  right: { style: BorderStyle.NONE, size: 0 },
                },
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/**
 * Creates a table of contents for the document
 */
function createTableOfContents() {
  return [
    createHeading("ÍNDICE", 1),

    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "1. INFORMACIÓN DEL PROYECTO",
          size: 24,
          color: THEME.TEXT_DARK,
        }),
      ],
    }),

    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "2. OBJETIVO Y ALCANCE",
          size: 24,
          color: THEME.TEXT_DARK,
        }),
      ],
    }),

    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "3. REGISTRO FOTOGRÁFICO",
          size: 24,
          color: THEME.TEXT_DARK,
        }),
      ],
    }),

    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "4. CONCLUSIONES Y RECOMENDACIONES",
          size: 24,
          color: THEME.TEXT_DARK,
        }),
      ],
    }),

    // End the TOC page
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
}
function createCoverPage(serviceInfo: any, logoBlob: Uint8Array) {
  return [
    // Logo at the top
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new ImageRun({
          data: logoBlob,
          transformation: {
            width: 300,
            height: 100,
          },
          type: "png",
        }),
      ],
    }),

    // Company name
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "FH INGENIEROS Y CONTRATISTAS GENERALES SAC",
          bold: true,
          size: 36,
          color: THEME.SECONDARY,
        }),
      ],
    }),

    // Document title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 400 },
      children: [
        new TextRun({
          text: "INFORME DE SERVICIO",
          bold: true,
          size: 48,
          color: THEME.PRIMARY,
        }),
      ],
    }),

    // Service title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 800 },
      children: [
        new TextRun({
          text: serviceInfo.serviceType.toUpperCase(),
          bold: true,
          size: 36,
          color: THEME.TEXT_DARK,
        }),
      ],
    }),

    // Project name
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: serviceInfo.projectName,
          bold: true,
          size: 32,
          color: THEME.TEXT_DARK,
        }),
      ],
    }),

    // Client name
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 800 },
      children: [
        new TextRun({
          text: `Cliente: ${serviceInfo.clientName}`,
          size: 28,
          color: THEME.TEXT_DARK,
        }),
      ],
    }),

    // Date
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1200, after: 200 },
      children: [
        new TextRun({
          text: `Fecha: ${new Date().toLocaleDateString("es-PE", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`,
          size: 24,
          color: THEME.TEXT_DARK,
        }),
      ],
    }),

    // End the cover page
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
}

/**
 * Enhanced function to generate a comprehensive Word document
 */
export async function createEnhancedDocxReport(
  postData: any,
  serviceData: any
): Promise<Blob> {
  // Use provided data or fallback to mock data
  const serviceInfo = serviceData ?? mockServiceInfo;
  const personal = mockPersonal;
  const charlas = mockCharlas;
  const herramientas = mockHerramientas;
  const componentes = mockComponentes;

  // Fetch logo image
  const catBlobResponse = await fetch(
    `https://firebasestorage.googleapis.com/v0/b/fh-servicios.firebasestorage.app/o/mainImageEvents%2F%222025-06-03T00%3A47%3A16.757Z%22?alt=media&token=3ad4ee7b-e56c-448e-bf8d-65769775a516`
  );
  const catBlobData = await catBlobResponse.arrayBuffer();
  const catBlob = new Uint8Array(catBlobData);

  // Build document sections
  const coverPage = createCoverPage(serviceInfo, catBlob);
  const tableOfContents = createTableOfContents();
  const headerContent = createHeader(serviceInfo, catBlob);
  const approvalTable = createApprovalTable(serviceInfo);
  const projectInfo = createProjectInfo(serviceInfo);
  const objectiveAndScope = createObjectiveAndScope(serviceInfo);
  const personnelTable = createPersonnelTable(personal);
  const safetyTrainingTable = createSafetyTrainingTable(charlas);
  const resourcesContent = createResourcesSection(herramientas, componentes);
  const conclusionsContent = createConclusionsSection();
  const documentFooter = createDocumentFooter();
  const eventImages = await createImagesSection(postData);

  // Create the document
  const doc = new Document({
    sections: [
      // Cover page section (no headers/footers)
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
        children: coverPage,
      },
      // Table of contents section
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
        footers: {
          default: documentFooter,
        },
        children: tableOfContents,
      },
      // Main content section with headers and footers
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
        footers: {
          default: documentFooter,
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

          // Page break before images
          new Paragraph({
            children: [new PageBreak()],
          }),

          // Event images
          ...eventImages,

          // Page break before conclusions
          new Paragraph({
            children: [new PageBreak()],
          }),

          // Conclusions and recommendations
          ...conclusionsContent,
        ],
      },
    ],
  });

  // Generate and return the blob
  const blob = await Packer.toBlob(doc);
  return blob;
}
