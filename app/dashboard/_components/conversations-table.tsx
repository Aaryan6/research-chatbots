"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getConversations, getConversationErrorAnalysis } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Message } from "ai";
import { ThumbsUp, ThumbsDown, Star as StarIcon } from "lucide-react";
import { Conversations } from "@/lib/types";

function MessageReactionDisplay({
  messageId,
  reactions,
}: {
  messageId: string;
  reactions: { msg_id: string; reaction: "like" | "dislike" }[];
}) {
  const reaction = reactions?.find((r) => r.msg_id === messageId);
  if (!reaction) return null;

  return (
    <div className="flex items-center gap-1 mt-1">
      {reaction.reaction === "like" ? (
        <ThumbsUp className="w-4 h-4 text-green-500 fill-green-500" />
      ) : (
        <ThumbsDown className="w-4 h-4 text-red-500 fill-red-500" />
      )}
    </div>
  );
}

function ConversationDialog({
  messages,
  reactions,
}: {
  messages: Message[];
  reactions: { msg_id: string; reaction: "like" | "dislike" }[];
}) {
  return (
    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Conversation Messages</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.role === "assistant" ? "items-start" : "items-end"
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-[85%] ${
                message.role === "assistant"
                  ? "bg-gray-100 text-gray-900"
                  : "bg-blue-600 text-white"
              }`}
            >
              <div className="text-sm font-semibold mb-1">
                {message.role === "assistant" ? "Assistant" : "User"}
              </div>
              <div>{message.content}</div>
              {message.role === "assistant" && (
                <MessageReactionDisplay
                  messageId={message.id}
                  reactions={reactions}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </DialogContent>
  );
}

function calculateTotalWordCount(messages: Message[]): number {
  return messages.reduce((total, message) => {
    const words = message.content
      .split(/\s+/)
      .filter((word) => word.length > 0);
    return total + words.length;
  }, 0);
}

function calculateTurns(messages: Message[]): number {
  let turns = 0;
  for (let i = 0; i < messages.length - 1; i++) {
    if (messages[i].role === "user" && messages[i + 1].role === "assistant") {
      turns++;
    }
  }
  return turns;
}

function calculateSessionDuration(
  createdAt?: string,
  updatedAt?: string
): string {
  if (!createdAt || !updatedAt) return "N/A";

  const start = new Date(createdAt);
  const end = new Date(updatedAt);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "N/A";

  const durationMs = end.getTime() - start.getTime();
  const seconds = Math.floor((durationMs / 1000) % 60);
  const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
  const hours = Math.floor(durationMs / (1000 * 60 * 60));

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.length > 0 ? parts.join(" ") : "< 1s";
}

function ErrorAnalysisDialog({ conversationId }: { conversationId: string }) {
  const [errorAnalysis, setErrorAnalysis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadErrorAnalysis() {
      const data = await getConversationErrorAnalysis(conversationId);
      setErrorAnalysis(data);
      setLoading(false);
    }
    loadErrorAnalysis();
  }, [conversationId]);

  if (loading) {
    return <div className="text-center p-4">Loading error analysis...</div>;
  }

  return (
    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Conversation Error Analysis</DialogTitle>
      </DialogHeader>
      <div className="space-y-3 text-sm">
        {errorAnalysis.map((analysis, index) => {
          const userMessage = analysis.message[0];
          const assistantMessage = analysis.message[1];

          return (
            <div
              key={index}
              className="border rounded-lg p-2 space-y-2 bg-gray-50"
            >
              <div className="grid grid-cols-[auto,1fr] gap-2">
                <span className="font-semibold text-gray-600 whitespace-nowrap text-xs">
                  User:
                </span>
                <span className="text-gray-800 text-xs">
                  {userMessage?.content}
                </span>
              </div>
              <div className="grid grid-cols-[auto,1fr] gap-2">
                <span className="font-semibold text-gray-600 whitespace-nowrap text-xs">
                  Assistant:
                </span>
                <span className="text-gray-800 text-xs">
                  {assistantMessage?.content}
                </span>
              </div>
              {analysis.error_messages?.map(
                (error: string, errorIndex: number) => (
                  <div
                    key={errorIndex}
                    className="p-1.5 bg-red-50 text-red-700 text-xs rounded border border-red-200"
                  >
                    <span className="font-semibold">
                      Error {errorIndex + 1}:
                    </span>{" "}
                    {error}
                  </div>
                )
              )}
              <div className="text-xs text-gray-500">
                Error Rate: {(analysis.error_rate * 100).toFixed(1)}%
              </div>
            </div>
          );
        })}
        {errorAnalysis.length === 0 && (
          <div className="text-gray-500 text-center p-4">
            No error analysis available for this conversation
          </div>
        )}
      </div>
    </DialogContent>
  );
}

function FeedbackDialog({
  messages,
  reactions,
  feedback_rating,
}: {
  messages: Message[];
  reactions: { msg_id: string; reaction: "like" | "dislike" }[];
  feedback_rating?: number;
}) {
  return (
    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Conversation Feedback</DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        {feedback_rating && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-2">Overall Rating</h3>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`w-6 h-6 ${
                    star <= feedback_rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-gray-600">
                {feedback_rating === 1
                  ? "Poor"
                  : feedback_rating === 2
                  ? "Fair"
                  : feedback_rating === 3
                  ? "Good"
                  : feedback_rating === 4
                  ? "Very Good"
                  : "Excellent"}
              </span>
            </div>
          </div>
        )}

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Message Reactions</h3>
          <div className="space-y-3">
            {messages.map(
              (message) =>
                message.role === "assistant" && (
                  <div
                    key={message.id}
                    className="flex flex-col gap-2 p-2 bg-white rounded border"
                  >
                    <div className="text-sm text-gray-600">
                      {message.content}
                    </div>
                    <MessageReactionDisplay
                      messageId={message.id}
                      reactions={reactions}
                    />
                  </div>
                )
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

interface ConversationsTableProps {
  groupId: string;
}

export function ConversationsTable({ groupId }: ConversationsTableProps) {
  const [conversations, setConversations] = useState<Conversations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getConversations(groupId);
      setConversations(data);
      setLoading(false);
    }
    loadData();
  }, [groupId]);

  if (loading) {
    return <div>Loading conversations...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Messages</TableHead>
          <TableHead>Turns</TableHead>
          <TableHead>Word Count</TableHead>
          <TableHead>Empathy Score</TableHead>
          <TableHead>Error Rate</TableHead>
          <TableHead>Errors</TableHead>
          <TableHead>Sentiment</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Feedback</TableHead>
          <TableHead>Conversation</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {conversations.map((conversation) => (
          <TableRow key={conversation.id}>
            <TableCell>{conversation.user_email}</TableCell>
            <TableCell>{conversation.messages.length}</TableCell>
            <TableCell>{calculateTurns(conversation.messages)}</TableCell>
            <TableCell>
              {calculateTotalWordCount(conversation.messages)}
            </TableCell>
            <TableCell>
              {conversation.avg_empathy_score?.toFixed(1) || "N/A"}
            </TableCell>
            <TableCell>
              {conversation.avg_error_rate
                ? (conversation.avg_error_rate * 100)?.toFixed(1) + "%"
                : "N/A"}
            </TableCell>
            <TableCell>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    View Errors
                  </Button>
                </DialogTrigger>
                <ErrorAnalysisDialog conversationId={conversation.id} />
              </Dialog>
            </TableCell>
            <TableCell>{conversation.dominant_sentiment || "N/A"}</TableCell>
            <TableCell>
              {conversation.created_at
                ? new Date(conversation.created_at).toLocaleDateString()
                : "N/A"}
            </TableCell>
            <TableCell>
              {calculateSessionDuration(
                conversation.created_at,
                conversation.updated_at
              )}
            </TableCell>
            <TableCell>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    View Feedback
                  </Button>
                </DialogTrigger>
                <FeedbackDialog
                  messages={conversation.messages}
                  reactions={conversation.reactions}
                  feedback_rating={conversation.feedback_rating}
                />
              </Dialog>
            </TableCell>
            <TableCell>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    View Messages
                  </Button>
                </DialogTrigger>
                <ConversationDialog
                  messages={conversation.messages}
                  reactions={conversation.reactions}
                />
              </Dialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
