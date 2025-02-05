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
import { getConversations, type Conversation } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Message } from "ai";
import { ThumbsUp, ThumbsDown } from "lucide-react";

function MessageReactionDisplay({
  messageId,
  reactions,
}: {
  messageId: string;
  reactions: { msg_id: string; reaction: "like" | "dislike" }[];
}) {
  console.log({ reactions });
  console.log({ messageId });
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

interface ConversationsTableProps {
  groupId: string;
}

export function ConversationsTable({ groupId }: ConversationsTableProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
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
          <TableHead>Empathy Score</TableHead>
          <TableHead>Sentiment</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Conversation</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {conversations.map((conversation) => (
          <TableRow key={conversation.id}>
            <TableCell>{conversation.user_email}</TableCell>
            <TableCell>{conversation.messages.length}</TableCell>
            <TableCell>
              {conversation.avg_empathy_score?.toFixed(1) || "N/A"}
            </TableCell>
            <TableCell>{conversation.dominant_sentiment || "N/A"}</TableCell>
            <TableCell>
              {new Date(conversation.created_at).toLocaleDateString()}
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
