"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { saveUserInfo } from "@/app/actions";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type FormData = {
  name: string;
  email: string;
  group: number;
};

export default function UserForm({ 
  predefinedGroup, 
  hideGroupSelect = false 
}: { 
  predefinedGroup?: number;
  hideGroupSelect?: boolean;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    group: predefinedGroup || 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "group") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic validation
    if (!formData.name || !formData.email) {
      setError("Name and email are required");
      setIsLoading(false);
      return;
    }

    try {
      const result = await saveUserInfo(formData);

      if (result.success) {
        // Refresh the page to show the chat
        router.refresh();
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Please fill in the following details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {!hideGroupSelect && (
            <div className="space-y-2">
              <Label htmlFor="group">Group</Label>
              <Select
                value={formData.group.toString()}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, group: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Groups</SelectLabel>
                    <SelectItem value="1">Group 1</SelectItem>
                    <SelectItem value="2">Group 2</SelectItem>
                    <SelectItem value="3">Group 3</SelectItem>
                    <SelectItem value="4">Group 4</SelectItem>
                    <SelectItem value="5">Group 5</SelectItem>
                    <SelectItem value="6">Group 6</SelectItem>
                    <SelectItem value="7">Group 7</SelectItem>
                    <SelectItem value="8">Group 8</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
