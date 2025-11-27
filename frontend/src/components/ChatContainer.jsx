import MessageArea from "./MessageArea";
import SummaryCard from "./SummaryCard";
import ChartCard from "./ChartCard";
import TableCard from "./TableCard";

export default function ChatContainer({ messages }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-32 pt-6">
      {messages.map((msg, index) => (
        <div key={index}>
          <MessageArea sender={msg.sender} message={msg.message} />

          {msg.summary && <SummaryCard summary={msg.summary} />}
          {msg.chartData && <ChartCard chartData={msg.chartData} />}
          {msg.tableData && <TableCard tableData={msg.tableData} />}
        </div>
      ))}
    </div>
  );
}
