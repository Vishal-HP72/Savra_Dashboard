import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function WeeklyChart() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all', 'lessons', 'quizzes', 'assessments'

  // Dynamic colors matching your KPI tiles
  const getChartColor = () => {
    switch (filter) {
      case "lessons":
        return "#10b981"; // Emerald
      case "quizzes":
        return "#f59e0b"; // Amber
      case "assessments":
        return "#8b5cf6"; // Purple
      default:
        return "#4f46e5"; // Indigo (All)
    }
  };

  const chartColor = getChartColor();

  
  useEffect(() => {
    // Pass the filter as a query parameter to Flask
    axios.get(`${API_BASE_URL}/weekly?type=${filter}`).then((res) => {
      const formattedData = res.data.map((d) => {
        const parts = d._id.split("-");
        let weekLabel = d._id;

        if (parts.length === 2) {
          const year = parseInt(parts[0], 10);
          const weekOfYear = parseInt(parts[1], 10);

          // Calculate an approximate date for this week number
          const date = new Date(year, 0, 1 + (weekOfYear - 1) * 7);

          // Get the short month name (e.g., "Feb", "Mar")
          const month = date.toLocaleString("default", { month: "short" });

          // Calculate which week of the month it is (1, 2, 3, 4, etc.)
          const weekOfMonth = Math.ceil(date.getDate() / 7);

          weekLabel = `Wk ${weekOfMonth} ${month}`; // Example: "Wk 2 Feb"
        }

        return {
          week: weekLabel,
          fullDate: d._id,
          Activities: d.count,
        };
      });
      setData(formattedData);
    });
  }, [filter]); // Re-run this effect whenever the filter changes

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-xl font-extrabold" style={{ color: chartColor }}>
            {payload[0].value}{" "}
            <span className="text-sm font-medium text-gray-500">
              {filter === "all" ? "activities" : filter}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Chart Filters */}
      <div className="flex space-x-2 mb-6 bg-gray-50 p-1 rounded-lg border border-gray-100 w-fit">
        {["all", "lessons", "quizzes", "assessments"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filter === type
                ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            // Increased top margin so labels don't get cut off
            margin={{ top: 30, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorDynamic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />

            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 500 }}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#e5e7eb",
                strokeWidth: 2,
                strokeDasharray: "4 4",
              }}
            />

            <Area
              type="monotone"
              dataKey="Activities"
              stroke={chartColor}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorDynamic)"
              // This label prop adds the numbers above the chart points
              label={{
                position: "top",
                fill: chartColor,
                fontSize: 14,
                fontWeight: 600,
                dy: -5,
              }}
              activeDot={{
                r: 6,
                strokeWidth: 0,
                fill: chartColor,
                style: {
                  filter: `drop-shadow(0px 2px 4px ${chartColor}80)`,
                },
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
