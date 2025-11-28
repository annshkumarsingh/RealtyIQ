import MessageArea from "./MessageArea";
import SummaryCard from "./SummaryCard";
import ChartCard from "./ChartCard";
import TableCard from "./TableCard";

export default function ChatContainer({ messages, isTyping }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-32 pt-6">
      {messages.map((msg, index) => (
        <div key={index}>
          <MessageArea sender={msg.sender} message={msg.message} />

          {msg.summary && <SummaryCard summary={msg.summary} />}
          {msg.chartData && Object.keys(msg.chartData).length > 0 && (<ChartCard chartData={msg.chartData} />)}
          {msg.tableData && <TableCard tableData={msg.tableData} />}
        </div>
      ))}

      {isTyping && (
        <div className="flex items-center gap-2 my-4 px-4">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></div>
          <span className="text-gray-600 text-sm ml-2">Analyzing data...</span>
        </div>
      )}
    </div>
  );
}
