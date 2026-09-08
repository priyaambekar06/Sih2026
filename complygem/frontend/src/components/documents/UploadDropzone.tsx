import { useRef, useState } from "react";
import { UploadCloud, FileText, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { BidDocument } from "@/types";

const CATEGORIES = ["PAN", "GST", "UDYAM", "EPFO", "ESIC", "NSIC", "MCA", "OTHER"] as const;

interface QueueItem {
  id: string;
  file: File;
  docType: string;
  progress: number;
  status: "uploading" | "done" | "error";
}

export function UploadDropzone({ bidId, onUploaded }: { bidId: string; onUploaded: (doc: BidDocument) => void }) {
  const [dragging, setDragging] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [docType, setDocType] = useState<string>("PAN");
  const inputRef = useRef<HTMLInputElement>(null);
  const { push } = useToast();

  async function uploadFiles(files: FileList | File[]) {
    for (const file of Array.from(files)) {
      const id = `${Date.now()}-${file.name}`;
      setQueue((q) => [...q, { id, file, docType, progress: 15, status: "uploading" }]);

      const form = new FormData();
      form.append("file", file);
      form.append("bidId", bidId);
      form.append("docType", docType);

      try {
        setQueue((q) => q.map((it) => (it.id === id ? { ...it, progress: 60 } : it)));
        const doc = await api.post<BidDocument>("/documents/upload", form);
        setQueue((q) => q.map((it) => (it.id === id ? { ...it, progress: 100, status: "done" } : it)));
        onUploaded(doc);
        push({ title: "Document uploaded", description: `${file.name} sent for OCR processing.`, tone: "success" });
      } catch (err: any) {
        setQueue((q) => q.map((it) => (it.id === id ? { ...it, status: "error" } : it)));
        push({ title: "Upload failed", description: err.message, tone: "critical" });
      }
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <label className="text-sm font-medium text-ink-900">Document category</label>
        <select value={docType} onChange={(e) => setDocType(e.target.value)} className="h-8 rounded-md border border-line px-2 text-sm">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c === "MCA" ? "MCA21" : c}</option>)}
        </select>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragging ? "border-teal-500 bg-teal-100/40" : "border-line bg-navy-100/20 hover:border-teal-500/60"
        )}
      >
        <UploadCloud size={30} className="mb-3 text-teal-600" />
        <p className="text-sm font-semibold text-ink-900">Drag documents here, or click to browse</p>
        <p className="mt-1 text-xs text-ink-500">Accepted: PDF, JPG, JPEG, PNG · Max 10MB per file</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {queue.length > 0 && (
        <div className="mt-4 space-y-2">
          {queue.map((it) => (
            <div key={it.id} className="flex items-center gap-3 rounded-md border border-line px-3.5 py-2.5">
              <FileText size={16} className="shrink-0 text-ink-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink-900">{it.file.name}</p>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-navy-100">
                  <div
                    className={cn("h-full rounded-full transition-all", it.status === "error" ? "bg-critical-500" : "bg-teal-500")}
                    style={{ width: `${it.progress}%` }}
                  />
                </div>
              </div>
              {it.status === "uploading" && <Loader2 size={15} className="animate-spin text-teal-600" />}
              {it.status === "done" && <span className="text-xs font-medium text-success-700">Queued for OCR</span>}
              {it.status === "error" && <X size={15} className="text-critical-500" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
