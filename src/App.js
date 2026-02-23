import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Overview from "./components/Overview";
import TeacherAnalytics from "./components/TeacherAnalytics";

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      {/* Side Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Dynamic Content (takes up remaining space) */}
        <div className="flex-1 p-8">
          {activeTab === "overview" ? <Overview /> : <TeacherAnalytics />}
        </div>

        {/* React JSX Style Footer */}
        {/* Simple Coder Footer */}
        <footer className="py-6 text-center text-sm font-mono text-gray-500 bg-white border-t border-gray-200">
          &lt;/&gt; Coded by{" "}
          <span className="font-bold text-indigo-600">Vishal</span>
        </footer>
      </main>
    </div>
  );
}
