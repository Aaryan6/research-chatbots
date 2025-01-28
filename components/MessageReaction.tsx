'use client';

import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { saveMessageReaction, ReactionType } from '@/app/actions';
import { Tooltip } from '@/components/ui/tooltip';
import supabase from '@/lib/db';

interface MessageReactionProps {
  messageId: string;
  chatId: string;
}

export function MessageReaction({ messageId, chatId }: MessageReactionProps) {
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing reaction when component mounts
  useEffect(() => {
    async function loadExistingReaction() {
      try {
        const { data: reaction } = await supabase
          .from("message_reactions")
          .select('reaction_type')
          .eq('message_id', messageId)
          .eq('chat_id', chatId)
          .single();

        if (reaction) {
          setSelectedReaction(reaction.reaction_type as ReactionType);
        }
      } catch (error) {
        console.error('Error loading reaction:', error);
      }
    }

    loadExistingReaction();
  }, [messageId, chatId]);

  const handleReaction = async (type: ReactionType) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await saveMessageReaction({
        messageId,
        chatId,
        reactionType: type
      });

      console.log('Reaction result:', result); // Debug log

      if (result.success) {
        // If we deleted the reaction
        if (result.action === 'deleted') {
          setSelectedReaction(null);
        } else {
          // If we inserted or updated
          setSelectedReaction(type);
        }
      } else {
        console.error('Failed to save reaction:', result.error);
      }
    } catch (error) {
      console.error('Error saving reaction:', error);
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
            handleReaction('like');
          }}
          className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors relative z-20 ${
            selectedReaction === 'like' ? 'text-green-500 bg-green-50' : 'text-gray-500'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={isLoading}
          aria-label="Like this response"
          title="Like this response"
        >
          <ThumbsUp className="w-4 h-4" />
        </button>
      </Tooltip>

      <Tooltip content="Not Helpful">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReaction('dislike');
          }}
          className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors relative z-20 ${
            selectedReaction === 'dislike' ? 'text-red-500 bg-red-50' : 'text-gray-500'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={isLoading}
          aria-label="Dislike this response"
          title="Dislike this response"
        >
          <ThumbsDown className="w-4 h-4" />
        </button>
      </Tooltip>
    </div>
  );
} 