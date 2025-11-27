export default function TableCard({ tableData }) {
  return (
    <div className="animate-fadeIn bg-white border shadow-md rounded-xl p-4 my-4 ">
      
      <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
        📄 Filtered Data
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-max border-collapse w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b">
              {Object.keys(tableData[0] || {}).map((col) => (
                <th key={col} className="p-2 text-gray-700 font-medium border">
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {tableData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 border-b">
                {Object.values(row).map((val, i) => (
                  <td key={i} className="p-2 border">
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
