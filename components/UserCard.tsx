"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface UserCardProps {
  initialUser: User;
  //   onSave : (user:User)=>void;
}

export default function UserCard({ initialUser }: UserCardProps) {
  const [isEditable, setIsEditable] = useState(false);
  const [formData, setFormData] = useState<User>(initialUser);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof User
  ) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/users/${initialUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
        }), // Changed from 'query' to 'body'
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      const res = await fetch(`/api/users/${initialUser.id}`)

      console.log(res)
    //   setFormData({...res.json})

      setIsEditable(false);
    } catch (error) {
      console.error("Error saving user:", error);
      // Handle error (show toast, etc.)
    }
  };

  const onClickEditable = () => {
    if (isEditable) {
      handleSave();
    }
    setIsEditable(!isEditable);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </div>
          <button
            className="hover:bg-gray-100 p-2 rounded-full"
            onClick={onClickEditable}
          >
            {isEditable ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500"
              >
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            )}
          </button>
        </div>
      </CardHeader>

      {isEditable ? (
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <input
                type="text"
                className="font-medium border rounded px-2 py-1"
                value={formData.name}
                onChange={(e) => handleChange(e, "name")}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <input
                type="email"
                className="font-medium border rounded px-2 py-1"
                value={formData.email}
                onChange={(e) => handleChange(e, "email")}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role:</span>
              <input
                type="text"
                className="font-medium capitalize border rounded px-2 py-1"
                value={formData.role}
                onChange={(e) => handleChange(e, "role")}
              />
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Address:</span>
              <input
                type="text"
                className="font-medium capitalize border rounded px-2 py-1"
                value={formData.address || ""}
                onChange={(e) => handleChange(e, "address")}
              />
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">City:</span>
              <input
                type="text"
                className="font-medium capitalize border rounded px-2 py-1"
                value={formData.city || ""}
                onChange={(e) => handleChange(e, "city")}
              />
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">State:</span>
              <input
                type="text"
                className="font-medium capitalize border rounded px-2 py-1"
                value={formData.state || ""}
                onChange={(e) => handleChange(e, "state")}
              />
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Zip Code:</span>
              <input
                type="text"
                className="font-medium capitalize border rounded px-2 py-1"
                value={formData.zip || ""}
                onChange={(e) => handleChange(e, "zip")}
              />
            </div>
          </div>
        </CardContent>
      ) : (
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{formData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{formData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role:</span>
              <span className="font-medium capitalize">{formData.role}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Address:</span>
              <span className="font-medium capitalize">{formData.address}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">City:</span>
              <span className="font-medium capitalize">{formData.city}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">State:</span>
              <span className="font-medium capitalize">{formData.state}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Zip Code:</span>
              <span className="font-medium capitalize">{formData.zip}</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
