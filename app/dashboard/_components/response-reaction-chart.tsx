"use client";

import { useEffect, useState } from "react";
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
import { getReactionStats, type ReactionData } from "@/app/actions";

interface ResponseReactionChartProps {
  groupId: string;
}

export function ResponseReactionChart({ groupId }: ResponseReactionChartProps) {
  const [data, setData] = useState<ReactionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const reactions = await getReactionStats(groupId);
      setData(reactions);
      setLoading(false);
    }
    loadData();
  }, [groupId]);

  if (loading) {
    return <div>Loading reaction stats...</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}
