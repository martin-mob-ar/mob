"use client";

import { useState } from "react";
import { FileText, Upload, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocStatusBadge } from "./OperacionStatusBadge";
import { AnimateHeight } from "@/components/ui/animate-height";
import { cn } from "@/lib/utils";
import type {
  DocumentStatus,
  OperacionDocument,
  OperacionViewerRole,
} from "@/lib/mock/operaciones-types";

interface DocumentRowProps {
  document: OperacionDocument;
  status: DocumentStatus;
  role: OperacionViewerRole;
  onStatusChange: (docId: string, status: DocumentStatus) => void;
}

const DocumentRow = ({
  document: doc,
  status,
  role,
  onStatusChange,
}: DocumentRowProps) => {
  const [rejectionText, setRejectionText] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const canUpload =
    role === "inquilino" &&
    (status === "pendiente" || status === "rechazado");
  const canReview =
    (role === "hoggax" || role === "admin") && status === "subido";

  const handleUpload = () => {
    onStatusChange(doc.id, "subido");
  };

  const handleApprove = () => {
    onStatusChange(doc.id, "aprobado");
    setShowRejectInput(false);
  };

  const handleReject = () => {
    if (rejectionText.trim()) {
      onStatusChange(doc.id, "rechazado");
      setShowRejectInput(false);
      setRejectionText("");
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-3 space-y-2",
        status === "rechazado"
          ? "border-destructive/30 bg-destructive/5"
          : "border-border bg-card"
      )}
    >
      {/* Main row */}
      <div className="flex items-center gap-3">
        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{doc.name}</p>
          {doc.fileName && status !== "pendiente" && (
            <p className="text-xs text-muted-foreground truncate">
              {doc.fileName}
            </p>
          )}
        </div>
        <DocStatusBadge status={status} />
      </div>

      {/* Rejection comment */}
      <AnimateHeight show={status === "rechazado" && !!doc.rejectionComment}>
        <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/5 rounded-md p-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{doc.rejectionComment}</span>
        </div>
      </AnimateHeight>

      {/* Actions */}
      {canUpload && (
        <Button
          size="sm"
          variant="outline"
          className="w-full h-9 text-xs"
          onClick={handleUpload}
        >
          <Upload className="h-3.5 w-3.5 mr-1.5" />
          {status === "rechazado" ? "Volver a subir" : "Subir archivo"}
        </Button>
      )}

      {canReview && (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 h-9 text-xs bg-green-600 hover:bg-green-700"
            onClick={handleApprove}
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            Aprobar
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1 h-9 text-xs"
            onClick={() => setShowRejectInput(!showRejectInput)}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Rechazar
          </Button>
        </div>
      )}

      {/* Reject input */}
      <AnimateHeight show={showRejectInput}>
        <div className="space-y-2 pt-1">
          <textarea
            value={rejectionText}
            onChange={(e) => setRejectionText(e.target.value)}
            placeholder="Motivo del rechazo..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs min-h-[60px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button
            size="sm"
            variant="destructive"
            className="w-full h-8 text-xs"
            onClick={handleReject}
            disabled={!rejectionText.trim()}
          >
            Confirmar rechazo
          </Button>
        </div>
      </AnimateHeight>
    </div>
  );
};

export default DocumentRow;
