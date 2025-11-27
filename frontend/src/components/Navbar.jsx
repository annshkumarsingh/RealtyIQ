export default function Navbar() {
  return (
    <div className="w-full bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">

        <div>
          <h1 className="font-bold text-xl text-gray-900">RealtyIQ</h1>
          <p className="text-xs text-gray-500 -mt-1">AI Real Estate Insights</p>
        </div>

        <div className="flex items-center gap-5">
          <a
            href="#"
            className="text-sm no-underline! hover:underline! text-gray-600 hover:text-gray-900"
          >
            Docs
          </a>

          <a
            href="#"
            className="px-4 py-1.5 no-underline! bg-blue-600 text-white rounded-lg text-sm font-medium shadow hover:bg-blue-700 transition"
          >
            GitHub
          </a>
        </div>

      </div>
    </div>
  );
}
