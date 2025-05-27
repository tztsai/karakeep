"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/i18n/client";
import {
  BookOpen,
  CheckCircle,
  CircleDashed,
  ExternalLink,
  Rss,
  Settings,
  XCircle,
} from "lucide-react";

import type { ZFeed } from "@karakeep/shared/types/feeds";

interface ReadwiseImport {
  id: string;
  type: string;
  lastFetchedAt: Date | null;
  lastFetchedStatus: "pending" | "failure" | "success" | null;
  itemCount: number;
  enabled: boolean;
  createdAt: Date;
}

interface AllChannelsProps {
  feeds: ZFeed[];
  readwiseImports: ReadwiseImport[];
}

function FeedCard({ feed }: { feed: ZFeed }) {
  const getStatusIcon = () => {
    switch (feed.lastFetchedStatus) {
      case "success":
        return <CheckCircle className="size-4 text-green-500" />;
      case "failure":
        return <XCircle className="size-4 text-red-500" />;
      default:
        return <CircleDashed className="size-4 text-gray-500" />;
    }
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rss className="size-5" />
            <Link
              href={`/dashboard/feeds/${feed.id}`}
              className="hover:underline"
            >
              {feed.name}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Link href={`/settings/feeds`}>
              <Button variant="ghost" size="sm">
                <Settings className="size-4" />
              </Button>
            </Link>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ExternalLink className="size-3" />
            <span className="truncate">{feed.url}</span>
          </div>
          {feed.lastFetchedAt && (
            <div className="text-xs text-muted-foreground">
              Last fetched: {feed.lastFetchedAt.toLocaleString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ReadwiseCard({ readwiseImport }: { readwiseImport: ReadwiseImport }) {
  const getStatusIcon = () => {
    switch (readwiseImport.lastFetchedStatus) {
      case "success":
        return <CheckCircle className="size-4 text-green-500" />;
      case "failure":
        return <XCircle className="size-4 text-red-500" />;
      default:
        return <CircleDashed className="size-4 text-gray-500" />;
    }
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5" />
            <span>Readwise {readwiseImport.type}</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Link href={`/settings/readwise`}>
              <Button variant="ghost" size="sm">
                <Settings className="size-4" />
              </Button>
            </Link>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            {readwiseImport.itemCount} items imported
          </div>
          {readwiseImport.lastFetchedAt && (
            <div className="text-xs text-muted-foreground">
              Last synced: {readwiseImport.lastFetchedAt.toLocaleString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AllChannels({
  feeds,
  readwiseImports,
}: AllChannelsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* RSS Feeds Section */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Rss className="size-5" />
          RSS Feeds
        </h3>
        {feeds.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <Rss className="mx-auto mb-4 size-12 opacity-50" />
                <p className="mb-4">No RSS feeds configured yet.</p>
                <Link href="/settings/feeds">
                  <Button>{t("settings.feeds.add_a_subscription")}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {feeds.map((feed) => (
              <FeedCard key={feed.id} feed={feed} />
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Readwise Section */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <BookOpen className="size-5" />
          Readwise Imports
        </h3>
        {readwiseImports.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <BookOpen className="mx-auto mb-4 size-12 opacity-50" />
                <p className="mb-4">No Readwise imports configured yet.</p>
                <Link href="/settings/readwise">
                  <Button>Configure Readwise</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {readwiseImports.map((readwiseImport) => (
              <ReadwiseCard
                key={readwiseImport.id}
                readwiseImport={readwiseImport}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
