import AllChannels from "@/components/dashboard/channels/AllChannels";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/i18n/server";
import { api } from "@/server/api/client";
import { Radio } from "lucide-react";

export default async function ChannelsPage() {
  const { t } = await useTranslation();
  const [feeds, readwiseImports] = await Promise.all([
    api.feeds.list(),
    api.readwise.list(),
  ]);

  return (
    <div className="flex flex-col gap-8 rounded-md border bg-background p-4">
      <span className="flex items-center gap-1 text-2xl">
        <Radio className="size-6" />
        {t("common.channels")}
      </span>
      <Separator />
      <AllChannels
        feeds={feeds.feeds}
        readwiseImports={readwiseImports.imports}
      />
    </div>
  );
}
