import { defineField, defineType } from "sanity";
import { ComponentIcon } from "@sanity/icons/Component";

export const mailQuickstartType = defineType({
  name: "mailQuickstart",
  title: "Mail Quickstarts",
  type: "document",
  icon: ComponentIcon,
  fields: [
    defineField({
      name: "language",
      title: "Language / Framework",
      type: "reference",
      to: [{ type: "language" }],
      description: "Select the shared language/framework (supplies the uploaded SVG icon and name).",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title / Display Name",
      type: "string",
      description: "e.g. swift-rust, Next.js, Python, Go, PHP, Express, Laravel",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Flagship", value: "flagship" },
          { title: "Full-Stack Framework", value: "framework" },
          { title: "Edge Runtime", value: "edge" },
          { title: "Backend Language", value: "language" },
          { title: "Protocol / CLI", value: "tool" },
        ],
      },
      initialValue: "language",
    }),
    defineField({
      name: "summary",
      title: "Short Description",
      type: "string",
      description: "e.g. Send emails using Python via Multivrs Mail REST API",
    }),
    defineField({
      name: "installCommand",
      title: "Installation Command",
      type: "string",
      description: "e.g. bun add @multivrs/mail or pip install requests",
    }),
    defineField({
      name: "filename",
      title: "Code Filename",
      type: "string",
      description: "e.g. app/send-email.ts, main.go, send.py",
    }),
    defineField({
      name: "codeLanguage",
      title: "Snippet Language Syntax",
      type: "string",
      options: {
        list: [
          { title: "TypeScript / TSX", value: "tsx" },
          { title: "JavaScript", value: "javascript" },
          { title: "Python", value: "python" },
          { title: "PHP", value: "php" },
          { title: "Go", value: "go" },
          { title: "Rust", value: "rust" },
          { title: "Java", value: "java" },
          { title: "Ruby", value: "ruby" },
          { title: "C# / .NET", value: "csharp" },
          { title: "Bash / CLI", value: "bash" },
        ],
      },
      initialValue: "tsx",
    }),
    defineField({
      name: "codeSnippet",
      title: "Quickstart Code Snippet",
      type: "text",
      rows: 14,
      description: "A complete, copy-paste ready sending example.",
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
      langName: "language.name",
      category: "category",
      media: "language.iconImage",
    },
    prepare({ title, langName, category, media }) {
      return {
        title: title || langName || "Untitled Example",
        subtitle: category,
        media,
      };
    },
  },
});
