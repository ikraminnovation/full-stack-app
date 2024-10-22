"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock } from "lucide-react";
import { SessionProvider } from "next-auth/react";
import { ResetPassword } from "../_components/profile/ResetPassword";

const SettingsPage = () => {
  return (
    <div className="container mx-auto max-w-md py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Reset Password
          </CardTitle>
          <CardDescription>Change your password here.</CardDescription>
        </CardHeader>
        <SessionProvider>
          <ResetPassword />
        </SessionProvider>
      </Card>
    </div>
  );
};

export default SettingsPage;
