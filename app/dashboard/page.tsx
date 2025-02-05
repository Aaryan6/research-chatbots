"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmpathyScoreChart } from "./_components/empathy-score-chart";
import { SentimentAnalysisChart } from "./_components/sentiment-analysis-chart";
import { ResponseReactionChart } from "./_components/response-reaction-chart";
import { ConversationsTable } from "./_components/conversations-table";
import { getDashboardStats } from "@/app/actions";
import { chatbotData } from "@/lib/data";

const chatbotGroups = [
  { id: "overall", name: "Overall" },
  ...Object.entries(chatbotData).map(([key, value]) => ({
    id: value.id.toString(),
    name: `Group ${value.id} - ${value.name}`,
  })),
];

export default function DashboardPage() {
  const [selectedGroup, setSelectedGroup] = useState("overall");
  const [stats, setStats] = useState({
    totalConversations: 0,
    avgEmpathyScore: 0,
    positiveSentimentPercentage: 0,
    avgResponseTime: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const dashboardStats = await getDashboardStats(selectedGroup);
      setStats({
        totalConversations: dashboardStats.totalConversations,
        avgEmpathyScore: Number(dashboardStats.avgEmpathyScore),
        positiveSentimentPercentage: dashboardStats.positiveSentimentPercentage,
        avgResponseTime: Number(dashboardStats.avgResponseTime),
      });
    };

    fetchStats();
  }, [selectedGroup]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Chatbot Analytics Dashboard</h1>
        <Select onValueChange={setSelectedGroup} defaultValue={selectedGroup}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a group" />
          </SelectTrigger>
          <SelectContent>
            {chatbotGroups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {stats.totalConversations.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. Empathy Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.avgEmpathyScore}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Positive Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {stats.positiveSentimentPercentage}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Selected Group</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedGroup === "overall" ? (
              <p className="text-lg font-medium">Overall Statistics</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {Object.values(chatbotData).find(
                    (bot) => bot.id.toString() === selectedGroup
                  )?.image && (
                    <img
                      src={
                        Object.values(chatbotData).find(
                          (bot) => bot.id.toString() === selectedGroup
                        )?.image
                      }
                      alt="Chatbot avatar"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <p className="text-lg font-medium">
                    {chatbotGroups.find((g) => g.id === selectedGroup)?.name ||
                      "Unknown Group"}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Initial Message:</p>
                  <p className="italic">
                    {Object.values(chatbotData).find(
                      (bot) => bot.id.toString() === selectedGroup
                    )?.initialMessage || "No initial message set"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Empathy Score Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <EmpathyScoreChart groupId={selectedGroup} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Analysis</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <SentimentAnalysisChart groupId={selectedGroup} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Response Reactions</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponseReactionChart groupId={selectedGroup} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <ConversationsTable groupId={selectedGroup} />
        </CardContent>
      </Card>
    </div>
  );
}
