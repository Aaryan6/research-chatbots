"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { getSentimentStats, type SentimentData } from "@/app/actions";

const COLORS = {
  Positive: "#4CAF50",
  Neutral: "#FFC107",
  Negative: "#F44336",
};

interface SentimentAnalysisChartProps {
  groupId: string;
}

export function SentimentAnalysisChart({
  groupId,
}: SentimentAnalysisChartProps) {
  const [data, setData] = useState<SentimentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const stats = await getSentimentStats(groupId);
      setData(stats);
      setLoading(false);
    }
    loadData();
  }, [groupId]);

  if (loading) {
    return <div>Loading sentiment analysis...</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.name as keyof typeof COLORS] || "#8884d8"}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
