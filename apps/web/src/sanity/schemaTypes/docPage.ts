import { defineArrayMember, defineField, defineType } from "sanity";

export const docPageType = defineType({
  name: "docPage",
  title: "Documentation Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Document Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug Path",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      description: "e.g. cli, swift-rust, anycast-cdn, vrs-pay-ui",
    }),
    defineField({
      name: "category",
      title: "Category / Section",
      type: "reference",
      to: [{ type: "docCategory" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "parent",
      title: "Parent Section / Page",
      type: "reference",
      to: [{ type: "docPage" }],
      description: "Optional parent page if this is a sub-page in the sidebar (e.g. under Functions or Sandbox).",
    }),
    defineField({
      name: "summary",
      title: "Summary / Subtitle",
      type: "text",
      rows: 2,
      description: "A punchy 1-2 sentence description shown in page headers and cards.",
    }),
    defineField({
      name: "badge",
      title: "Status Badge",
      type: "string",
      options: {
        list: [
          { title: "Flagship", value: "Flagship" },
          { title: "New", value: "New" },
          { title: "Beta", value: "Beta" },
          { title: "Coming soon", value: "Coming soon" },
          { title: "Popular", value: "Popular" },
        ],
      },
    }),
    defineField({
      name: "order",
      title: "Display Order in Sidebar",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon Name",
      type: "string",
      description: "Lucide icon name (e.g. terminal, mail, globe, shield, cpu, zap, package)",
    }),
    defineField({
      name: "body",
      title: "Documentation Body Content",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Heading 4", value: "h4" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Code", value: "code" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ["http", "https", "mailto", "tel"],
                        allowRelative: true,
                      }),
                  },
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          type: "object",
          name: "codeBlock",
          title: "Code Snippet",
          fields: [
            {
              name: "filename",
              title: "Filename or Title",
              type: "string",
              description: "e.g. Terminal, main.rs, multivrs.config.ts",
            },
            {
              name: "language",
              title: "Language",
              type: "string",
              options: {
                list: [
                  { title: "TypeScript / TSX", value: "tsx" },
                  { title: "Rust", value: "rust" },
                  { title: "Bash / Terminal", value: "bash" },
                  { title: "JavaScript", value: "javascript" },
                  { title: "JSON", value: "json" },
                  { title: "TOML", value: "toml" },
                  { title: "HTML / CSS", value: "html" },
                ],
              },
              initialValue: "tsx",
            },
            {
              name: "code",
              title: "Code",
              type: "text",
              rows: 10,
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              title: "filename",
              subtitle: "language",
            },
            prepare({ title, subtitle }) {
              return {
                title: title || "Code Snippet",
                subtitle: subtitle || "text",
              };
            },
          },
        }),
        defineArrayMember({
          type: "object",
          name: "callout",
          title: "Callout Alert",
          fields: [
            {
              name: "tone",
              title: "Alert Tone",
              type: "string",
              options: {
                list: [
                  { title: "Tip (Purple/Green)", value: "tip" },
                  { title: "Note (Blue)", value: "note" },
                  { title: "Warning (Amber)", value: "warning" },
                  { title: "Important / Caution (Rose)", value: "caution" },
                ],
              },
              initialValue: "tip",
            },
            {
              name: "title",
              title: "Alert Title",
              type: "string",
            },
            {
              name: "message",
              title: "Message",
              type: "text",
              rows: 3,
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              title: "title",
              subtitle: "tone",
            },
            prepare({ title, subtitle }) {
              return {
                title: title || "Alert Callout",
                subtitle: `Tone: ${subtitle}`,
              };
            },
          },
        }),
        defineArrayMember({
          type: "object",
          name: "quickstartEmbed",
          title: "Quickstart Code Tabs",
          fields: [
            {
              name: "title",
              title: "Section Heading (Optional)",
              type: "string",
              description: "Optional heading displayed above the switcher (e.g. Quickstart)",
            },
            {
              name: "packageName",
              title: "Package Name for Install Switcher",
              type: "string",
              initialValue: "@multivrs/mail",
              description: "e.g. @multivrs/mail, multivrs, @multivrs/client",
            },
          ],
          preview: {
            select: {
              title: "title",
              packageName: "packageName",
            },
            prepare({ title, packageName }) {
              return {
                title: title || "Quickstart Code Tabs",
                subtitle: `Package: ${packageName || "@multivrs/mail"}`,
              };
            },
          },
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category.title",
      badge: "badge",
    },
    prepare({ title, subtitle, badge }) {
      return {
        title,
        subtitle: `${subtitle || "Uncategorized"} ${badge ? `[${badge}]` : ""}`,
      };
    },
  },
});
