import { useState } from "react";
import Navbar from "./components/Navbar";
import ChatContainer from "./components/ChatContainer";
import InputBar from "./components/InputBar";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");

  const backend_url = import.meta.env.VITE_BACKEND_URL;

  const sendMessage = async () => {
    if (!query.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", message: query }]);

    // Send request to backend
    const res = await fetch(`${backend_url}/api/analyze/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();

    // Add bot message
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        message: "Here is your analysis:",
        summary: data.summary,
        chartData: data.chart || data.comparison || null,
        tableData: data.table || null,
      },
    ]);

    setQuery("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ChatContainer messages={messages} />
      <InputBar query={query} setQuery={setQuery} sendMessage={sendMessage} />
    </div>
  );
}
