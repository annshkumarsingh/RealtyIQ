export default function MessageArea({ sender, message }) {
  const isUser = sender === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } w-full my-2`}
    >
      <div
        className={`max-w-[75%] p-3 rounded-xl text-sm ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-900 border"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
