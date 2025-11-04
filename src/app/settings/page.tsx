"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function Settings() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your account and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Settings feature coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
export default Settings;
