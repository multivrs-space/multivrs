import type { StructureResolver } from "sanity/structure";
import { BillIcon } from "@sanity/icons/Bill";
import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { ComponentIcon } from "@sanity/icons/Component";
import { TagIcon } from "@sanity/icons/Tag";
import { CodeBlockIcon } from "@sanity/icons/CodeBlock";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Languages & Frameworks")
        .icon(CodeBlockIcon)
        .schemaType("language")
        .child(
          S.documentTypeList("language")
            .title("Languages & Frameworks")
            .defaultOrdering([{ field: "name", direction: "asc" }]),
        ),
      S.listItem()
        .title("Mail Quickstarts")
        .icon(ComponentIcon)
        .schemaType("mailQuickstart")
        .child(
          S.documentTypeList("mailQuickstart")
            .title("Mail Quickstarts")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),
      S.divider(),
      S.listItem()
        .title("Documentation Pages")
        .icon(BlockContentIcon)
        .schemaType("docPage")
        .child(
          S.documentTypeList("docPage")
            .title("Documentation Pages")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),
      S.listItem()
        .title("Documentation Categories")
        .icon(TagIcon)
        .schemaType("docCategory")
        .child(
          S.documentTypeList("docCategory")
            .title("Documentation Categories")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),
      S.divider(),
      S.listItem()
        .title("Pricing comparison")
        .icon(BillIcon)
        .child(
          S.document()
            .schemaType("pricingComparison")
            .documentId("pricingComparison"),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) =>
          ![
            "pricingComparison",
            "docPage",
            "docCategory",
            "mailQuickstart",
            "language",
          ].includes(item.getId() || ""),
      ),
    ]);
