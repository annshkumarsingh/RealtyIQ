import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ChartCard({ chartData }) {
  if (!chartData) return null;

  let formatted = [];

  // --- Case 1: chart = { metric: [...], secondary: [...] }
  if (!Array.isArray(chartData)) {
    const keys = Object.keys(chartData);
    formatted = mergeSeries(chartData, keys);
  }

  // --- Case 2: comparison = { area1: [...], area2: [...] }
  else if (Array.isArray(chartData) && chartData[0]?.area === undefined) {
    const keys = Object.keys(chartData);
    formatted = mergeSeries(chartData, keys);
  }

  // --- Case 3: chart = [ { area, data: [...] }, ... ]
  else if (Array.isArray(chartData) && chartData[0]?.area) {
    const obj = {};
    chartData.forEach((areaSet) => {
      obj[areaSet.area] = areaSet.data;
    });
    formatted = mergeSeries(obj, Object.keys(obj));
  }

  return (
    <div className="bg-white border shadow-sm rounded-xl p-4 my-3">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Trends</h2>

      <div className="w-full h-64">
        <ResponsiveContainer>
          <LineChart data={formatted}>
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />

            {Object.keys(formatted[0] || {})
              .filter((k) => k !== "year")
              .map((k, idx) => (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  strokeWidth={2}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function mergeSeries(chartObj, keys) {
  const merged = {};

  keys.forEach((key) => {
    chartObj[key].forEach((point) => {
      const y = point.year;
      if (!merged[y]) merged[y] = { year: y };
      merged[y][key] = point[Object.keys(point)[1]];
    });
  });

  return Object.values(merged).sort((a, b) => a.year - b.year);
}
