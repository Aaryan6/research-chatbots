"use client";

import { useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { saveFeedback } from "@/app/actions";
import { Card, CardHeader, CardContent } from "./ui/card";

interface FeedbackFormProps {
  chatId: string;
  onComplete: () => void;
}

export function FeedbackForm({ chatId, onComplete }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await saveFeedback({
        chatId,
        rating: rating,
      });
      onComplete();
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full h-full md:w-[400px] md:h-[600px] rounded-none overflow-hidden md:rounded-3xl border-0 shadow-2xl bg-white">
      <CardHeader className="border-b px-6 py-4 bg-gradient-to-r from-gray-900 to-gray-800">
        <h2 className="text-xl font-semibold text-white">
          How was your experience?
        </h2>
        <p className="text-gray-300 text-sm">Your feedback helps us improve</p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-lg font-medium text-gray-700">
              Rate your chat experience
            </label>
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
          </div>

          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium
                     disabled:bg-gray-300 disabled:cursor-not-allowed
                     hover:bg-blue-700 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
