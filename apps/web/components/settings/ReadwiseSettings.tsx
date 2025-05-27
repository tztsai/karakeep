"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/trpc";
import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";

export default function ReadwiseSettings() {
  const { toast } = useToast();
  const [showToken, setShowToken] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Get current user data
  const { data: user, refetch: refetchUser } = api.users.whoami.useQuery();

  // Get readwise imports status
  const { data: readwiseData, refetch: refetchReadwise } =
    api.readwise.list.useQuery();

  // Mutations
  const updateTokenMutation = api.users.updateReadwiseToken.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Readwise token updated successfully",
      });
      refetchUser();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = api.readwise.testConnection.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Connection to Readwise API successful!",
      });
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const triggerSyncMutation = api.readwise.triggerSync.useMutation({
    onSuccess: () => {
      toast({
        title: "Sync Started",
        description:
          "Readwise sync has been queued. Check back in a few minutes.",
      });
      refetchReadwise();
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [tokenInput, setTokenInput] = useState(user?.readwiseToken ?? "");

  const handleSaveToken = async () => {
    if (!tokenInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid token",
        variant: "destructive",
      });
      return;
    }

    updateTokenMutation.mutate({ token: tokenInput.trim() });
  };

  const handleRemoveToken = async () => {
    updateTokenMutation.mutate({ token: null });
    setTokenInput("");
  };

  const handleTestConnection = async () => {
    if (!user?.readwiseToken) {
      toast({
        title: "Error",
        description: "Please save a token first",
        variant: "destructive",
      });
      return;
    }

    setIsTestingConnection(true);
    try {
      await testConnectionMutation.mutateAsync();
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleTriggerSync = async () => {
    if (!user?.readwiseToken) {
      toast({
        title: "Error",
        description: "Please configure your Readwise token first",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    try {
      await triggerSyncMutation.mutateAsync();
    } finally {
      setIsSyncing(false);
    }
  };

  const hasToken = !!user?.readwiseToken;
  const hasChanges = tokenInput !== (user?.readwiseToken ?? "");

  return (
    <div className="space-y-6">
      {/* API Token Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>API Token</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="readwise-token">Readwise Access Token</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="readwise-token"
                  type={showToken ? "text" : "password"}
                  placeholder="Enter your Readwise access token"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Get your access token from{" "}
              <a
                href="https://readwise.io/access_token"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:underline"
              >
                Readwise settings
                <ExternalLink className="size-3" />
              </a>
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSaveToken}
              disabled={!hasChanges || updateTokenMutation.isPending}
            >
              {updateTokenMutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              {hasToken ? "Update Token" : "Save Token"}
            </Button>

            {hasToken && (
              <>
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Test Connection
                </Button>

                <Button
                  variant="outline"
                  onClick={handleRemoveToken}
                  disabled={updateTokenMutation.isPending}
                >
                  <Trash2 className="mr-2 size-4" />
                  Remove
                </Button>
              </>
            )}
          </div>

          {hasToken && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="size-4 text-green-500" />
              <span className="text-green-700">Token configured</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Status & Controls */}
      {hasToken && (
        <Card>
          <CardHeader>
            <CardTitle>Sync Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {readwiseData?.imports && readwiseData.imports.length > 0 ? (
              <div className="space-y-3">
                {readwiseData.imports.map((importItem) => (
                  <div
                    key={importItem.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <div className="font-medium capitalize">
                        {importItem.type}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {importItem.itemCount} items imported
                      </div>
                      {importItem.lastFetchedAt && (
                        <div className="text-xs text-muted-foreground">
                          Last synced:{" "}
                          {new Date(importItem.lastFetchedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {importItem.lastFetchedStatus === "success" && (
                        <CheckCircle className="size-4 text-green-500" />
                      )}
                      {importItem.lastFetchedStatus === "failure" && (
                        <AlertCircle className="size-4 text-red-500" />
                      )}
                      {importItem.lastFetchedStatus === "pending" && (
                        <Loader2 className="size-4 animate-spin text-blue-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                <RefreshCw className="mx-auto mb-4 size-12 opacity-50" />
                <p>No sync history yet. Trigger your first sync below.</p>
              </div>
            )}

            <Separator />

            <div className="flex gap-2">
              <Button onClick={handleTriggerSync} disabled={isSyncing}>
                {isSyncing && <Loader2 className="mr-2 size-4 animate-spin" />}
                <RefreshCw className="mr-2 size-4" />
                Sync Now
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                Automatic sync runs every hour. Manual sync will import new
                highlights and books from your Readwise account.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help & Information */}
      <Card>
        <CardHeader>
          <CardTitle>About Readwise Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Connect your Readwise account to automatically import your
            highlights and books into Karakeep.
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>
              Books are imported as text bookmarks with source information
            </li>
            <li>
              Highlights are imported as Karakeep highlights linked to their
              source books
            </li>
            <li>
              Only new items are imported on each sync to avoid duplicates
            </li>
            <li>Sync runs automatically every hour when enabled</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
