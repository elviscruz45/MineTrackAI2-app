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
} from "docx";

/**
 * Generates a Word document from post and serviceInfo data using docx.js
 * @param post Object containing post data (expects title, description, images, etc)
 * @param serviceInfo Object containing service information (expects fields and images)
 * @returns Promise<Blob> representing the generated .docx file
 */
export async function createDocxReport(
  post: any,
  serviceInfo: any
): Promise<Blob> {
  console.log("111===>", post[0].fotoPrincipal);

  // Add post title
  const title1 = new Paragraph({
    children: [
      new TextRun({
        text:
          "Empresa Minera " + serviceInfo.EmpresaMinera + " S.A." ||
          "Post Title",
        bold: true,
        size: 45,
      }),
    ],
    spacing: { after: 200 },
  });
  const title2 = new Paragraph({
    children: [
      new TextRun({
        text: serviceInfo.NombreServicio || "Post Title",
        bold: true,
        size: 45,
      }),
    ],
    spacing: { after: 200 },
  });
  const title3 = new Paragraph({
    children: [
      new TextRun({
        text: "Informe tecnico de servicio",
        bold: true,
        size: 45,
      }),
    ],
    spacing: { after: 600 },
  });

  // Create a table for the document
  const table = new Table({
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
      // Header Row
      new TableRow({
        children: [
          new TableCell({
            width: {
              size: 535,
              type: WidthType.DXA,
            },
            children: [],
          }),
          new TableCell({
            width: {
              size: 535,
              type: WidthType.DXA,
            },
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
            width: {
              size: 535,
              type: WidthType.DXA,
            },
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
      // Elaborado por row
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
      // Residente de proyecto row
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
      // Dirigido a row
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
  // Add post description
  const description = new Paragraph({
    children: [new TextRun(post.description || "No description provided.")],
    spacing: { after: 200 },
  });

  // Add post images
  let postImages: Paragraph[] = [];
  if (post.images && Array.isArray(post.images)) {
    postImages = await Promise.all(
      post.images.map(async (imgUrl: string) => {
        try {
          const response = await fetch(imgUrl);
          const arrayBuffer = await response.arrayBuffer();

          return new Paragraph({
            children: [
              new ImageRun({
                data: new Uint8Array(arrayBuffer),
                transformation: {
                  width: 500,
                  height: 300,
                },
              }),
            ],
            spacing: { after: 200 },
          });
        } catch (e) {
          return new Paragraph({
            children: [new TextRun("[Image failed to load]")],
          });
        }
      })
    );
  }
  console.log("333===>");

  // Add service info fields
  const serviceFields: Paragraph[] = Object.entries(serviceInfo || {})
    .filter(([key]) => key !== "images") // Skip images field as we handle it separately
    .map(
      ([key, value]) =>
        new Paragraph({
          children: [
            new TextRun({ text: `${key}: `, bold: true }),
            new TextRun(String(value)),
          ],
          spacing: { after: 100 },
        })
    );
  console.log("444===>");

  // // Add service info images
  // let eventImages: Paragraph[] = [];
  // if (post && Array.isArray(post)) {
  //   eventImages = await Promise.all(
  //     post.map(async (item: any) => {
  //       try {
  //         const response = await fetch(item.fotoPrincipal);
  //         const arrayBuffer = await response.arrayBuffer();

  //         return new Paragraph({
  //           children: [
  //             new ImageRun({
  //               data: new Uint8Array(arrayBuffer),
  //               transformation: {
  //                 width: 500,
  //                 height: 300,
  //               },
  //             }),
  //           ],
  //           spacing: { after: 200 },
  //         });
  //       } catch (e) {
  //         return new Paragraph({
  //           children: [new TextRun("[Image failed to load]")],
  //         });
  //       }
  //     })
  //   );
  // }
  console.log("555===>", post[0].fotoPrincipal);
  // Add a sample cat image from GitHub

  // const catBlob = await fetch(
  //   "https://raw.githubusercontent.com/dolanmiu/docx/master/demo/images/cat.jpg"
  // ).then((r) => r.blob());

  const catBlob = await fetch(
    `https://firebasestorage.googleapis.com/v0/b/fh-servicios.firebasestorage.app/o/mainImageEvents%2F%222025-06-03T00%3A47%3A16.757Z%22?alt=media&token=3ad4ee7b-e56c-448e-bf8d-65769775a516`
  ).then((r) => r.blob());

  const catImage = new Paragraph({
    children: [
      new TextRun({
        text: "Sample Cat Image:",
        bold: true,
      }),

      new ImageRun({
        data: catBlob,
        transformation: {
          width: 300,
          height: 300,
        },
      }),
    ],
    spacing: { after: 200 },
  });

  // Create the document with all content
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          title1,
          title2,
          title3,
          table,
          // description,
          // ...postImages,
          // ...serviceFields,
          // catImage,
          // ...eventImages,
          // catImage
        ],
      },
    ],
  });

  console.log("666===>");

  // Generate the Word file as a Blob for browser download
  const blob = await Packer.toBlob(doc);
  console.log("7777===>");

  return blob;
}
