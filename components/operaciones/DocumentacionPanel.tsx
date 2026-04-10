"use client";

import { DocSubStageBadge } from "./OperacionStatusBadge";
import DocumentRow from "./DocumentRow";
import type {
  ChecklistStep,
  DocumentStatus,
  OperacionViewerRole,
} from "@/lib/mock/operaciones-types";

interface DocumentacionPanelProps {
  step: ChecklistStep;
  role: OperacionViewerRole;
  docStatuses: Record<string, DocumentStatus>;
  onDocStatusChange: (docId: string, status: DocumentStatus) => void;
}

const DocumentacionPanel = ({
  step,
  role,
  docStatuses,
  onDocStatusChange,
}: DocumentacionPanelProps) => {
  const documents = step.documents || [];
  const subStage = step.documentacionSubStage;

  return (
    <div className="space-y-3">
      {/* Sub-stage indicator */}
      {subStage && (
        <div className="bg-muted/50 rounded-lg px-3 py-2">
          <DocSubStageBadge stage={subStage} />
        </div>
      )}

      {/* Documents list */}
      <div className="space-y-2">
        {documents.map((doc) => (
          <DocumentRow
            key={doc.id}
            document={doc}
            status={docStatuses[doc.id] ?? doc.status}
            role={role}
            onStatusChange={onDocStatusChange}
          />
        ))}
      </div>
    </div>
  );
};

export default DocumentacionPanel;
