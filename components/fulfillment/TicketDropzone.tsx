'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Barcode, Sparkles } from 'lucide-react';
import { parseAndFulfillTicketFile, ParseResult } from '@/lib/barcode-parser';

interface TicketDropzoneProps {
  selectedOrderId?: number;
  onFulfillSuccess?: () => void;
}

export default function TicketDropzone({ selectedOrderId, onFulfillSuccess }: TicketDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setProcessing(true);
    setResult(null);

    try {
      const res = await parseAndFulfillTicketFile(file, selectedOrderId);
      setResult(res);
      if (res.success && onFulfillSuccess) {
        onFulfillSuccess();
      }
    } catch (err: any) {
      setResult({
        success: false,
        barcodesExtracted: [],
        message: `Dropzone Ingestion Error: ${err?.message || 'Failed to parse file'}`,
      });
    } finally {
      setProcessing(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileDrop(e.dataTransfer.files);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2 text-purple-400 font-bold font-mono text-sm uppercase">
          <Barcode className="w-4 h-4" />
          <span>Stage 3 Drag-and-Drop Ingestion Zone</span>
        </div>
        <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-mono">
          PDF / Mobile Screenshot Parser
        </span>
      </div>

      {/* Interactive Dropzone Box */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 ${
          isDragging
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-gray-800 hover:border-purple-500/50 bg-gray-950/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={(e) => handleFileDrop(e.target.files)}
          className="hidden"
        />

        <div className="w-12 h-12 bg-purple-600/20 border border-purple-500/30 rounded-2xl flex items-center justify-center text-purple-400 shadow-inner">
          <Upload className="w-6 h-6" />
        </div>

        <div>
          <h4 className="text-sm font-bold text-white font-mono">
            {processing ? 'Scanning Ticket PDF & Extracting Barcodes...' : 'Drop Mock PDF Tickets / Screenshots Here'}
          </h4>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Accepts <span className="text-purple-400">.pdf, .png, .jpg</span> ticket files. Auto-parses barcodes & fulfills matching order.
          </p>
        </div>

        {/* Mock Sample Buttons for fast testing */}
        <div className="pt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => {
              const mockFile = new File(['mock content'], 'Ticket_ORD-91024_BC-994102.pdf', { type: 'application/pdf' });
              handleFileDrop([mockFile] as any);
            }}
            className="text-[10px] bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 px-2.5 py-1 rounded-lg font-mono flex items-center gap-1 transition"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Simulate Dropping ORD-91024 Ticket PDF</span>
          </button>
        </div>
      </div>

      {/* Parse Feedback Banner */}
      {result && (
        <div
          className={`p-4 rounded-xl border text-xs font-mono space-y-2 ${
            result.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {result.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{result.message}</span>
          </div>

          {result.barcodesExtracted.length > 0 && (
            <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className="text-gray-400">Barcodes Ingested:</span>
              {result.barcodesExtracted.map((bc, idx) => (
                <span
                  key={idx}
                  className="bg-gray-950 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold"
                >
                  {bc}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
