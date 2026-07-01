import type { EventAttachedDocument } from "@/lib/db/types";

export function collectEventDocuments(
  event: Record<string, unknown>,
): EventAttachedDocument[] {
  const docs: EventAttachedDocument[] = [];
  const seen = new Set<string>();

  const push = (doc: EventAttachedDocument) => {
    if (!doc.url || seen.has(doc.url)) return;
    seen.add(doc.url);
    docs.push(doc);
  };

  const pdfPrincipal = String(event.pdfPrincipal ?? "");
  if (pdfPrincipal) {
    push({
      url: pdfPrincipal,
      filename: String(event.FilenameTitle || "Documento adjunto"),
      tipoFile: String(event.tipoFile || ""),
    });
  }

  const attached = (event.attachedDocuments as EventAttachedDocument[]) ?? [];
  attached.forEach(push);

  return docs;
}

export function extractPdfStoragePath(url: string): string | null {
  const marker = "/object/public/pdfs/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export function buildEventAfterDocumentRemoval(
  event: Record<string, unknown>,
  urlToRemove: string,
): {
  pdfPrincipal: string;
  FilenameTitle: string;
  tipoFile: string;
  attachedDocuments: EventAttachedDocument[];
} {
  let pdfPrincipal = String(event.pdfPrincipal ?? "");
  let filenameTitle = String(event.FilenameTitle ?? "");
  let tipoFile = String(event.tipoFile ?? "");
  let attachedDocuments = [
    ...((event.attachedDocuments as EventAttachedDocument[]) ?? []),
  ];

  if (pdfPrincipal === urlToRemove) {
    pdfPrincipal = "";
    filenameTitle = "";
    tipoFile = "";
  }

  attachedDocuments = attachedDocuments.filter((doc) => doc.url !== urlToRemove);

  if (!pdfPrincipal && attachedDocuments.length > 0) {
    const [first, ...rest] = attachedDocuments;
    pdfPrincipal = first.url;
    filenameTitle = first.filename;
    tipoFile = first.tipoFile ?? "";
    attachedDocuments = rest;
  }

  return {
    pdfPrincipal,
    FilenameTitle: filenameTitle,
    tipoFile,
    attachedDocuments,
  };
}
