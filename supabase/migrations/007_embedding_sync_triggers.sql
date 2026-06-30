-- Keep knowledge_embeddings in sync when source rows are deleted

CREATE OR REPLACE FUNCTION delete_knowledge_on_event_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM knowledge_embeddings
  WHERE doc_type = 'event_post' AND source_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_delete_event_embedding ON events;
CREATE TRIGGER trg_delete_event_embedding
  AFTER DELETE ON events
  FOR EACH ROW EXECUTE FUNCTION delete_knowledge_on_event_delete();

CREATE OR REPLACE FUNCTION delete_knowledge_on_maintenance_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM knowledge_embeddings
  WHERE doc_type = 'maintenance_log' AND source_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_delete_maintenance_embedding ON maintenance_logs;
CREATE TRIGGER trg_delete_maintenance_embedding
  AFTER DELETE ON maintenance_logs
  FOR EACH ROW EXECUTE FUNCTION delete_knowledge_on_maintenance_delete();

CREATE OR REPLACE FUNCTION delete_knowledge_on_activity_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM knowledge_embeddings
  WHERE doc_type = 'activity_plan'
    AND (
      source_id = OLD.servicio_ait_id || '-' || COALESCE(OLD.codigo, '')
      OR source_id = OLD.servicio_ait_id || '-' || COALESCE(OLD.nombre_servicio, '')
    );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_delete_activity_embedding ON activities;
CREATE TRIGGER trg_delete_activity_embedding
  AFTER DELETE ON activities
  FOR EACH ROW EXECUTE FUNCTION delete_knowledge_on_activity_delete();

CREATE OR REPLACE FUNCTION delete_knowledge_on_servicio_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM knowledge_embeddings
  WHERE servicio_ait_id = OLD.id
     OR (doc_type = 'service_summary' AND source_id = OLD.id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_delete_servicio_embeddings ON servicios_ait;
CREATE TRIGGER trg_delete_servicio_embeddings
  AFTER DELETE ON servicios_ait
  FOR EACH ROW EXECUTE FUNCTION delete_knowledge_on_servicio_delete();
