import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 1. Reusable KPI Card Component
const KpiCard = ({ title, value, colorClass }) => {
  return (
    <div
      className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all border-l-4 ${colorClass}`}
    >
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {title}
      </p>
      <p className="text-3xl font-extrabold text-gray-900">{value}</p>
    </div>
  );
};




export default function TeacherAnalytics() {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [teacherData, setTeacherData] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("All");

  // Fetch the list of teachers first
  useEffect(() => {
    axios.get(`${API_BASE_URL}/summary`).then((res) => {
      setTeachers(res.data.map((t) => t._id));
      if (res.data.length > 0) {
        setSelectedTeacher(res.data[0]._id); // default to first teacher
      }
    });
  }, []);

  // Fetch specific teacher data when the dropdown changes
  useEffect(() => {
    if (selectedTeacher) {
      axios
        .get(`${API_BASE_URL}/teacher/${selectedTeacher}`)
        .then((res) => {
          setTeacherData(res.data);
          setSelectedGrade("All"); // Reset grade filter on teacher change
        })
        .catch((err) => console.error(err));
    }
  }, [selectedTeacher]);

  // --- DATA PROCESSING ---

  // Helper to categorize activity types consistently
  const getCategory = (type) => {
    const t = type.toLowerCase();
    if (t.includes("lesson")) return "lessons";
    if (t.includes("quiz")) return "quizzes";
    if (t.includes("question paper") || t.includes("assessment"))
      return "assessments";
    return "other";
  };

  // Get unique grades for the filter dropdown
  const availableGrades = [...new Set(teacherData.map((d) => d.Grade))].sort(
    (a, b) => a - b,
  );

  // Filter the data based on the selected grade
  const filteredData =
    selectedGrade === "All"
      ? teacherData
      : teacherData.filter(
          (d) => d.Grade.toString() === selectedGrade.toString(),
        );

  // Calculate KPIs for the filtered data
  let totalLessons = 0,
    totalQuizzes = 0,
    totalAssessments = 0;

  filteredData.forEach((d) => {
    const cat = getCategory(d.Activity_type);
    if (cat === "lessons") totalLessons++;
    else if (cat === "quizzes") totalQuizzes++;
    else if (cat === "assessments") totalAssessments++;
  });

  // Prepare chart data: NOW USING filteredData SO IT RESPECTS THE DROPDOWN
  const chartDataMap = {};
  filteredData.forEach((d) => {
    const gradeLabel = `Grade ${d.Grade}`;
    if (!chartDataMap[gradeLabel]) {
      chartDataMap[gradeLabel] = {
        grade: gradeLabel,
        lessons: 0,
        quizzes: 0,
        assessments: 0,
      };
    }
    const cat = getCategory(d.Activity_type);
    if (cat === "lessons") chartDataMap[gradeLabel].lessons++;
    else if (cat === "quizzes") chartDataMap[gradeLabel].quizzes++;
    else if (cat === "assessments") chartDataMap[gradeLabel].assessments++;
  });

  const chartData = Object.values(chartDataMap).sort((a, b) =>
    a.grade.localeCompare(b.grade, undefined, { numeric: true }),
  );

  return (
    <div className="max-w-7xl mx-auto text-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Teacher Analytics
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Deep dive into individual faculty performance and content
            distribution.
          </p>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
          {/* Teacher Selector */}
          <div className="flex items-center space-x-2 px-2">
            <label className="text-sm font-medium text-gray-500">
              Teacher:
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="bg-gray-50 border-none text-gray-900 text-sm rounded-lg focus:ring-indigo-500 py-1.5 cursor-pointer font-semibold"
            >
              {teachers.map((teacherName) => (
                <option key={teacherName} value={teacherName}>
                  {teacherName}
                </option>
              ))}
            </select>
          </div>

          <div className="w-px bg-gray-200"></div>

          {/* Grade Selector */}
          <div className="flex items-center space-x-2 px-2">
            <label className="text-sm font-medium text-gray-500">Grade:</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-gray-50 border-none text-gray-900 text-sm rounded-lg focus:ring-indigo-500 py-1.5 cursor-pointer font-semibold"
            >
              <option value="All">All Grades</option>
              {availableGrades.map((grade) => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Teacher Specific KPIs - Modularized! */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <KpiCard
          title="Lessons Created"
          value={totalLessons}
          colorClass="border-l-emerald-500"
        />
        <KpiCard
          title="Quizzes Created"
          value={totalQuizzes}
          colorClass="border-l-amber-500"
        />
        <KpiCard
          title="Assessments Created"
          value={totalAssessments}
          colorClass="border-l-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Grade Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Grade-wise Content Distribution
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="grade"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#f9fafb" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
                />
                <Bar
                  dataKey="lessons"
                  name="Lessons"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="quizzes"
                  name="Quizzes"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="assessments"
                  name="Assessments"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Activity Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
            <h3 className="text-lg font-bold text-gray-800">Activity Log</h3>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
              {filteredData.length} Records
            </span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredData.map((activity, index) => {
                  const cat = getCategory(activity.Activity_type);
                  // Color code the pill based on activity type
                  const pillColors = {
                    lessons: "bg-emerald-100 text-emerald-800",
                    quizzes: "bg-amber-100 text-amber-800",
                    assessments: "bg-purple-100 text-purple-800",
                    other: "bg-gray-100 text-gray-800",
                  };

                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                        {new Date(activity.Created_at).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-md ${pillColors[cat]}`}
                        >
                          {activity.Activity_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {activity.Subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                        Grade {activity.Grade}
                      </td>
                    </tr>
                  );
                })}
                {filteredData.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No activities found for this grade.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
