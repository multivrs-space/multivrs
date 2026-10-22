import { defineField, defineType } from "sanity";
import { CodeBlockIcon } from "@sanity/icons/CodeBlock";

export const languageType = defineType({
  name: "language",
  title: "Languages & Frameworks",
  type: "document",
  icon: CodeBlockIcon,
  fields: [
    defineField({
      name: "name",
      title: "Language or Framework Name",
      type: "string",
      description: "e.g. swift-rust, Next.js, Python, Go, Rust, PHP",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "iconImage",
      title: "Custom SVG / Image Asset",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "Upload an SVG or image asset for this language.",
    }),
    defineField({
      name: "iconImageDark",
      title: "Custom SVG / Image Asset (Dark Mode Variant, Optional)",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "Upload an optional dark mode variant of the icon.",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "slug.current",
      media: "iconImage",
    },
  },
});
