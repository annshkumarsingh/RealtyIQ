export default function SummaryCard({ summary }) {
  return (
    <div className="card my-3">
      <div className="card bg-white border shadow-sm rounded-xl p-4 my-3">
        <h2 className="card-title text-lg font-semibold text-gray-900 mb-2">
          Summary
        </h2>
        <p className="card-text text-gray-700 leading-relaxed">{summary}</p>
      </div>
    </div>
  );
}
