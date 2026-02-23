export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: "overview", label: "Overview Insights" },
    { id: "teacher", label: "Teacher Analytics" },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-indigo-600">SAVRA</h1>
        <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === item.id
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
