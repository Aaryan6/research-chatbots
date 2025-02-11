"use client";

import { useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { saveFeedback } from "@/app/actions";

interface FeedbackFormProps {
  chatId: string;
}

export function RateCard({ chatId }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await saveFeedback({
        chatId: chatId,
        rating: rating,
        feedback_message: feedbackMessage,
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full h-full overflow-hidden border bg-white rounded-xl">
        <h2 className="font-semibold text-white bg-[#1c2533] p-2">
          Thank you for your feedback!
        </h2>
        <div className="p-4 text-center text-gray-600">
          We appreciate your input and will use it to improve our service.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden border bg-white rounded-xl">
      <h2 className="font-semibold text-white bg-[#1c2533] p-2">
        How was your experience?
      </h2>
      <form onSubmit={handleSubmit} className="space-y-2 p-2">
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              {star <= rating ? (
                <StarIcon className="w-10 h-10 text-yellow-400" />
              ) : (
                <StarIconOutline className="w-10 h-10 text-gray-300 hover:text-yellow-400" />
              )}
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          {rating === 0
            ? "Select a rating"
            : rating === 1
            ? "Poor"
            : rating === 2
            ? "Fair"
            : rating === 3
            ? "Good"
            : rating === 4
            ? "Very Good"
            : "Excellent"}
        </p>
        {rating !== 0 && (
          <>
            <textarea
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder="Share your feedback (optional)"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="w-full py-3 px-4 bg-foreground text-white rounded-lg font-medium
                         disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors hover:bg-foreground/80
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
