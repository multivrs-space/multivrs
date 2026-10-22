import { defineField, defineType } from "sanity";

export const docCategoryType = defineType({
  name: "docCategory",
  title: "Documentation Category",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Category Title",
      type: "string",
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
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      initialValue: 0,
      validation: (Rule) =>
        Rule.required().custom(async (order, context) => {
          if (typeof order !== "number") return true;
          const { getClient, document } = context;
          const client = getClient({ apiVersion: "2024-01-01" });
          const id = document?._id?.replace(/^drafts\./, "");
          const count = await client.fetch<number>(
            `count(*[_type == "docCategory" && !(_id in [$id, "drafts." + $id]) && order == $order])`,
            { id, order },
          );
          return count > 0
            ? `Display order ${order} is already in use by another category.`
            : true;
        }),
    }),
    defineField({
      name: "icon",
      title: "Lucide Icon Name",
      type: "string",
      description: "e.g. rocket, terminal, shield, mail, cpu, zap, globe, box",
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
      subtitle: "slug.current",
    },
  },
});
