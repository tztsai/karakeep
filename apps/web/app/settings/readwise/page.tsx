import ReadwiseSettings from "@/components/settings/ReadwiseSettings";
import { BookOpen } from "lucide-react";

export default function ReadwiseSettingsPage() {
  return (
    <div className="rounded-md border bg-background p-4">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg font-medium">
            <BookOpen size={20} />
            Readwise Integration
          </span>
        </div>
        <ReadwiseSettings />
      </div>
    </div>
  );
}
