import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  FileScan, Upload, Loader2, FileJson, 
  Download, CheckCircle2, AlertTriangle, Image as ImageIcon, ChevronRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ScanDocument = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
    }
  };

  const fileToGenerativePart = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          inlineData: {
            data: reader.result.split(',')[1],
            mimeType: file.type
          }
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleScan = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("VITE_GEMINI_API_KEY is missing from your .env file!");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const imagePart = await fileToGenerativePart(file);

      const prompt = `
        You are an expert AI Document Scanner.
        Analyze this image carefully. Extract all the key structured data you can find.
        If it's a receipt, extract amounts, dates, and items.
        If it's a signup sheet, extract names, emails, and phone numbers.
        If it's an inventory list, extract items and quantities.
        
        Format your response ONLY as a valid JSON object or array. Do not include any markdown formatting like \`\`\`json.
      `;

      const aiResult = await model.generateContent([prompt, imagePart]);
      let responseText = aiResult.response.text();
      
      // Clean up markdown block if the model included it despite instructions
      responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      const parsedJSON = JSON.parse(responseText);
      setResult(parsedJSON);

    } catch (err) {
      console.error("Scan error:", err);
      setError(err.message || "Failed to process the document. Please try a clearer image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCSV = () => {
    if (!result) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Attempt to convert JSON to a flat CSV structure
    const dataArray = Array.isArray(result) ? result : [result];
    if (dataArray.length === 0) return;

    // Get all unique headers
    const headers = new Set();
    dataArray.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(k => headers.add(k));
      }
    });

    const headerRow = Array.from(headers).join(",");
    csvContent += headerRow + "\r\n";

    dataArray.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        const row = Array.from(headers).map(header => {
          let val = item[header] !== undefined ? item[header] : "";
          if (typeof val === 'object') val = JSON.stringify(val);
          // escape quotes
          return `"${String(val).replace(/"/g, '""')}"`;
        });
        csvContent += row.join(",") + "\r\n";
      } else {
        csvContent += `"${String(item).replace(/"/g, '""')}"\r\n`;
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "scanned_document.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = () => {
    if (!result) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", "scanned_document.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full font-sans animate-in fade-in duration-500 pb-20">
      
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-indigo-600 font-medium">Scan Document</span>
      </div>

      <div className="mb-8">
        <h1 className="font-serif text-3xl lg:text-4xl font-bold text-slate-900 mb-3 flex items-center gap-3">
          <FileScan className="w-8 h-8 text-indigo-500" />
          AI Document Scanner
        </h1>
        <p className="text-slate-600 text-lg">
          Upload unstructured photos of receipts, sign-up sheets, or inventory lists. 
          Impact AI will organize them into structured data instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upload Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-500" /> Upload Image
            </h3>
            
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors relative overflow-hidden group">
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="w-full h-full object-contain opacity-50 group-hover:opacity-30 transition-opacity" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">
                    <ImageIcon className="w-10 h-10 text-indigo-600 mb-2" />
                    <span className="text-indigo-700 font-bold bg-white/80 px-4 py-1 rounded-full backdrop-blur-sm">Click to change image</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="mb-2 text-sm text-slate-600 font-medium"><span className="font-bold text-indigo-600">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-slate-500">PNG, JPG, JPEG (Max 5MB)</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>

            <button 
              onClick={handleScan}
              disabled={!file || isProcessing}
              className={`w-full mt-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md ${
                !file || isProcessing 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 hover:-translate-y-0.5'
              }`}
            >
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Image...</>
              ) : (
                <><FileScan className="w-5 h-5" /> Scan & Extract Data</>
              )}
            </button>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-start gap-3 text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>
          
          {/* Info Card */}
          <div className="bg-indigo-50 text-indigo-900 rounded-2xl p-6 border border-indigo-100">
            <h4 className="font-bold flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Supported Formats</h4>
            <ul className="text-sm space-y-2 text-indigo-700/80">
              <li>• Handwritten volunteer sign-up sheets</li>
              <li>• Donation receipts and invoices</li>
              <li>• Printed food inventory lists</li>
              <li>• Whiteboard meeting notes</li>
            </ul>
          </div>
        </div>

        {/* Results Column */}
        <div className="flex flex-col h-full min-h-[400px]">
          <div className="bg-slate-900 flex-1 rounded-3xl shadow-xl border border-slate-800 flex flex-col overflow-hidden relative">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between z-10 relative">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FileJson className="w-5 h-5 text-indigo-400" /> Structured Output
              </h3>
              {result && (
                <div className="flex gap-2">
                  <button onClick={downloadCSV} className="text-xs font-bold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                    <Download className="w-3 h-3" /> CSV / Excel
                  </button>
                  <button onClick={downloadJSON} className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                    <Download className="w-3 h-3" /> JSON
                  </button>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto z-10 relative font-mono text-sm custom-scrollbar">
              {!result && !isProcessing && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                  <FileScan className="w-12 h-12 mb-3 opacity-20" />
                  <p>Upload an image and hit scan to see results here.</p>
                </div>
              )}
              
              {isProcessing && (
                <div className="h-full flex flex-col items-center justify-center text-indigo-400">
                  <div className="w-16 h-16 relative flex items-center justify-center mb-4">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <FileScan className="w-6 h-6 animate-pulse" />
                  </div>
                  <p className="animate-pulse font-sans font-medium">Gemini is reading your document...</p>
                </div>
              )}

              {result && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-emerald-400">
                  <pre className="whitespace-pre-wrap break-words">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            
            {/* Abstract Background Element for the Dark Panel */}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/3 translate-x-1/3 pointer-events-none" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScanDocument;
