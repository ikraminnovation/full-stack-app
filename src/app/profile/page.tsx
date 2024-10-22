"use client";

import { SessionProvider } from "next-auth/react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UpdateProfile } from "../_components/profile/UpdateProfile";

export default function UpdateProfilePage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </CardDescription>
        </CardHeader>
        <SessionProvider>
          <UpdateProfile />
        </SessionProvider>
      </Card>
    </div>
  );
}
