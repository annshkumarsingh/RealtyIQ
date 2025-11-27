import { useState } from "react";

export default function InputBar({ query, setQuery, sendMessage }) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:8000/api/upload_excel/", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("Upload response:", data);

    setUploading(false);
  };

  const removeFile = () => {
    setFileName("");
  };

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">

        {/* Upload Excel */}
        <label
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer text-sm
            ${uploading ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"}`}
        >
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleUpload}
          />
          📁 {uploading ? "Uploading…" : "Upload Excel"}
        </label>

        {/* File Name + Remove Button */}
        {fileName && (
          <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
            <span className="text-xs text-gray-600 truncate max-w-[110px]">
              {fileName}
            </span>
            <button
              onClick={removeFile}
              className="text-gray-500 hover:text-red-500 text-sm font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Query Input */}
        <input
          type="text"
          className="flex-1 border rounded-xl p-3 outline-none focus:ring-2 ring-blue-600"
          placeholder="Ask about any locality…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Send */}
        <button
          onClick={sendMessage}
          className="btn btn-primary px-4 py-3"
        >
          Send
        </button>
      </div>
    </div>
  );
}
