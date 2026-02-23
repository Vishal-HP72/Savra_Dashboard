import { useEffect, useState } from "react";
import axios from "axios";
import WeeklyChart from "./WeeklyChart.js";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 1. Created a reusable KPI Card Component
const KpiCard = ({ title, value, colorClass }) => {
  return (
    <div
      className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 border-l-4 ${colorClass}`}
    >
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {title}
      </p>
      <div className="flex items-baseline space-x-2">
        <p className="text-4xl font-extrabold text-gray-900">{value}</p>
      </div>
    </div>
  );
};



export default function Overview() {
  const [summary, setSummary] = useState([]);
  const [sortBy, setSortBy] = useState("lessons");

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/summary`)
      .then((res) => setSummary(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Calculate school-wide totals
  const totalTeachers = summary.length;
  const totalLessons = summary.reduce((acc, curr) => acc + curr.lessons, 0);
  const totalQuizzes = summary.reduce((acc, curr) => acc + curr.quizzes, 0);
  const totalAssessments = summary.reduce(
    (acc, curr) => acc + curr.assessments,
    0,
  );

  // Sorting Logic for Top Contributors
  const sortedSummary = [...summary].sort((a, b) => {
    const totalA = a.lessons + a.quizzes + a.assessments;
    const totalB = b.lessons + b.quizzes + b.assessments;

    if (sortBy === "lessons") {
      return (
        b.lessons - a.lessons ||
        b.assessments - a.assessments ||
        b.quizzes - a.quizzes
      );
    } else if (sortBy === "assessments") {
      return (
        b.assessments - a.assessments ||
        b.lessons - a.lessons ||
        b.quizzes - a.quizzes
      );
    } else if (sortBy === "quizzes") {
      return (
        b.quizzes - a.quizzes ||
        b.lessons - a.lessons ||
        b.assessments - a.assessments
      );
    } else {
      return totalB - totalA;
    }
  });

  return (
    <div className="max-w-7xl mx-auto text-gray-800">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
          School Overview
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Monitor your faculty's academic content generation.
        </p>
      </div>

      {/* 2. Top Level KPIs - Now completely modular! */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Total Teachers"
          value={totalTeachers}
          colorClass="border-l-blue-500"
        />
        <KpiCard
          title="Total Lessons"
          value={totalLessons}
          colorClass="border-l-emerald-500"
        />
        <KpiCard
          title="Total Quizzes"
          value={totalQuizzes}
          colorClass="border-l-amber-500"
        />
        <KpiCard
          title="Assessments"
          value={totalAssessments}
          colorClass="border-l-purple-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Trend Chart Section */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              Weekly Activity Trend
            </h3>
            <span className="px-3 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded-full">
              All Time
            </span>
          </div>
          <div className="w-full flex justify-center mt-4">
            <WeeklyChart />
          </div>
        </div>

        {/* Per Teacher Breakdown Section */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full max-h-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Top Teachers</h3>
          </div>

          {/* Sorting View Toggles */}
          <div className="flex flex-wrap gap-2 mb-4 bg-gray-50 p-1 rounded-lg border border-gray-100">
            {["total", "lessons", "assessments", "quizzes"].map((type) => (
              <button
                key={type}
                onClick={() => setSortBy(type)}
                className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-all ${
                  sortBy === type
                    ? "bg-white text-indigo-700 shadow-sm border border-gray-200"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {sortedSummary.map((t) => (
              <div
                key={t._id}
                className="group flex flex-col p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-100"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-gray-900">{t._id}</h4>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                    {t.lessons + t.quizzes + t.assessments} Total
                  </span>
                </div>

                {/* Micro-stats bar for each teacher */}
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  {/* Lesson Stat */}
                  <div
                    className={`py-1.5 rounded-lg border shadow-sm transition-colors ${sortBy === "lessons" ? "bg-emerald-50 border-emerald-200" : "bg-white border-gray-200 group-hover:border-emerald-200"}`}
                  >
                    <span className="block text-xs text-gray-400 font-medium">
                      Lesson
                    </span>
                    <span
                      className={`font-bold ${sortBy === "lessons" ? "text-emerald-700" : "text-gray-700"}`}
                    >
                      {t.lessons}
                    </span>
                  </div>
                  {/* Quiz Stat */}
                  <div
                    className={`py-1.5 rounded-lg border shadow-sm transition-colors ${sortBy === "quizzes" ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200 group-hover:border-amber-200"}`}
                  >
                    <span className="block text-xs text-gray-400 font-medium">
                      Quiz
                    </span>
                    <span
                      className={`font-bold ${sortBy === "quizzes" ? "text-amber-700" : "text-gray-700"}`}
                    >
                      {t.quizzes}
                    </span>
                  </div>
                  {/* Assessment Stat */}
                  <div
                    className={`py-1.5 rounded-lg border shadow-sm transition-colors ${sortBy === "assessments" ? "bg-purple-50 border-purple-200" : "bg-white border-gray-200 group-hover:border-purple-200"}`}
                  >
                    <span className="block text-xs text-gray-400 font-medium">
                      Assessment
                    </span>
                    <span
                      className={`font-bold ${sortBy === "assessments" ? "text-purple-700" : "text-gray-700"}`}
                    >
                      {t.assessments}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
