import { Model } from "@nozbe/watermelondb";
import { date, field, readonly } from "@nozbe/watermelondb/decorators";

export default class ImportedFile extends Model {
  static table = "imported_files";

  @field("source_uri") sourceUri!: string;
  @readonly @date("import_timestamp") importTimestamp!: Date;

  // It's good practice for sourceUri to be unique.
  // This isn't enforced by WatermelonDB at the model level directly but should be handled by:
  // 1. The schema (though WatermelonDB schema doesn't have a `unique` constraint in `tableSchema` columns).
  // 2. Application logic (e.g., check before creating).
}
