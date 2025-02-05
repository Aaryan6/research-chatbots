"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getEmpathyScoresTrend, type EmpathyScoreData } from "@/app/actions";

interface EmpathyScoreChartProps {
  groupId: string;
}

export function EmpathyScoreChart({ groupId }: EmpathyScoreChartProps) {
  const [data, setData] = useState<EmpathyScoreData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const scores = await getEmpathyScoresTrend(groupId);
      setData(scores);
      setLoading(false);
    }
    loadData();
  }, [groupId]);

  if (loading) {
    return <div>Loading empathy scores...</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 10]} />
        <Tooltip />
        <Line type="monotone" dataKey="score" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
