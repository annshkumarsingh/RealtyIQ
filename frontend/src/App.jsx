import { useState } from "react";
import Navbar from "./components/Navbar";
import ChatContainer from "./components/ChatContainer";
import InputBar from "./components/InputBar";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const backend_url = import.meta.env.VITE_BACKEND_URL;

  const sendMessage = async () => {
    if (!query.trim()) return;

    setIsTyping(true)
    // Add user message
    setMessages((prev) => [...prev, { sender: "user", message: query }]);

    // Send request to backend
    const res = await fetch(`${backend_url}/api/analyze/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();

    setIsTyping(false)

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
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />

      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <ChatContainer messages={messages} isTyping={isTyping} />
        <InputBar query={query} setQuery={setQuery} sendMessage={sendMessage} />
      </div>
    </>
  );
}
