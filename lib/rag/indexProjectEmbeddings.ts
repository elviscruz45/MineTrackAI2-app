import {
  buildActivityChunk,
  buildServiceSummaryChunk,
  type DocType,
} from "@/lib/rag/chunkText";

export interface ProjectServicePayload {
  serviceId: string;
  serviceData: Record<string, unknown>;
  activitiesData: Record<string, unknown>[];
  projectId: string;
  projectName: string;
  projectType: string;
}

export interface EmbeddingChunkSpec {
  docType: DocType;
  sourceId: string;
  content: string;
  servicioAitId: string;
  projectId: string;
  tagEquipo?: string | null;
  activityCodigo?: string | null;
  metadata?: Record<string, unknown>;
}

export function buildEmbeddingChunksForService(
  payload: ProjectServicePayload
): EmbeddingChunkSpec[] {
  const {
    serviceId,
    serviceData,
    activitiesData,
    projectId,
    projectName,
    projectType,
  } = payload;

  const enrichedService = { ...serviceData, projectName, projectType };
  const chunks: EmbeddingChunkSpec[] = [
    {
      docType: "service_summary",
      sourceId: serviceId,
      content: buildServiceSummaryChunk(enrichedService, activitiesData),
      servicioAitId: serviceId,
      projectId,
      tagEquipo: String(serviceData.TagEquipo ?? ""),
      metadata: {
        codigo: serviceData.Codigo,
        nombreServicio: serviceData.NombreServicio,
        projectName,
        projectType,
      },
    },
  ];

  for (const activity of activitiesData) {
    const actCode = String(activity.Codigo ?? activity.codigo ?? "");
    const actKey = actCode || String(activity.NombreServicio ?? "");
    if (!actKey) continue;

    chunks.push({
      docType: "activity_plan",
      sourceId: `${serviceId}-${actKey}`,
      content: buildActivityChunk(activity, serviceData),
      servicioAitId: serviceId,
      projectId,
      tagEquipo: String(
        activity.TagEquipo ??
          activity.tag_equipo ??
          serviceData.TagEquipo ??
          ""
      ),
      activityCodigo: actCode || null,
      metadata: { nombre: activity.NombreServicio },
    });
  }

  return chunks;
}

export function buildEmbeddingChunksForProject(
  services: ProjectServicePayload[]
): EmbeddingChunkSpec[] {
  return services.flatMap(buildEmbeddingChunksForService);
}
