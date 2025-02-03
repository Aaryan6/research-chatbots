"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useState, useEffect } from "react";
import { addReaction, ReactionType } from "@/app/actions";
import { Tooltip } from "@/components/ui/tooltip";

type Reaction = {
  msg_id: string;
  reaction: string;
};

interface MessageReactionProps {
  messageId: string;
  chatId: string;
  reactions: Reaction[];
  onReactionUpdate: (reactions: Reaction[]) => void;
}

export function MessageReaction({
  messageId,
  chatId,
  reactions,
  onReactionUpdate,
}: MessageReactionProps) {
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Update selected reaction when reactions prop changes
  useEffect(() => {
    const existingReaction = reactions.find((r) => r.msg_id === messageId);
    setSelectedReaction(
      existingReaction ? (existingReaction.reaction as ReactionType) : null
    );
  }, [reactions, messageId]);

  const handleReaction = async (type: ReactionType) => {
    if (isLoading) return;

    // Optimistically update the UI
    setSelectedReaction(type);
    const previousReaction = selectedReaction;
    const optimisticReactions = reactions.filter((r) => r.msg_id !== messageId);
    optimisticReactions.push({ msg_id: messageId, reaction: type });
    onReactionUpdate(optimisticReactions);

    setIsLoading(true);
    try {
      const result = await addReaction({
        messageId,
        chatId,
        reactionType: type,
      });

      if (!result.success) {
        // Revert optimistic update on failure
        setSelectedReaction(previousReaction);
        const revertedReactions = reactions.filter(
          (r) => r.msg_id !== messageId
        );
        if (previousReaction) {
          revertedReactions.push({
            msg_id: messageId,
            reaction: previousReaction,
          });
        }
        onReactionUpdate(revertedReactions);
        console.error("Failed to save reaction:", result.error);
      }
    } catch (error) {
      // Revert optimistic update on error
      setSelectedReaction(previousReaction);
      const revertedReactions = reactions.filter((r) => r.msg_id !== messageId);
      if (previousReaction) {
        revertedReactions.push({
          msg_id: messageId,
          reaction: previousReaction,
        });
      }
      onReactionUpdate(revertedReactions);
      console.error("Error saving reaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2 relative z-20">
      <Tooltip content="Helpful">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReaction("like");
          }}
          className={`p-1.5 rounded-full transition-colors relative z-20 ${
            selectedReaction === "like"
              ? "text-green-500 bg-green-50 hover:bg-green-100"
              : "text-gray-500 hover:bg-gray-100"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          disabled={isLoading}
          aria-label="Like this response"
          title="Like this response"
        >
          <ThumbsUp
            className={`w-4 h-4 ${
              selectedReaction === "like" ? "fill-green-500" : ""
            }`}
          />
        </button>
      </Tooltip>

      <Tooltip content="Not Helpful">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReaction("dislike");
          }}
          className={`p-1.5 rounded-full transition-colors relative z-20 ${
            selectedReaction === "dislike"
              ? "text-red-500 bg-red-50 hover:bg-red-100"
              : "text-gray-500 hover:bg-gray-100"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          disabled={isLoading}
          aria-label="Dislike this response"
          title="Dislike this response"
        >
          <ThumbsDown
            className={`w-4 h-4 ${
              selectedReaction === "dislike" ? "fill-red-500" : ""
            }`}
          />
        </button>
      </Tooltip>
    </div>
  );
}
