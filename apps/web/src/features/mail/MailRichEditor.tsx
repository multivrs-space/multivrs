"use client";

import { useEffect, useRef } from "react";
import {
  LiveBold,
  LiveImagePlus,
  LiveItalic,
  LiveLink,
  LiveUnderline,
} from "@/components/icons/animated";
import { Button } from "@/components/ui/button";

function editorCommand(command: string, value?: string) {
  document.execCommand(command, false, value);
}

function sanitizedEditorDocument(value: string): Document {
  const parsed = new DOMParser().parseFromString(value, "text/html");
  for (const unsafe of parsed.querySelectorAll("script, style, iframe, object"))
    unsafe.remove();
  for (const element of parsed.querySelectorAll("*")) {
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.startsWith("on") || attribute.name === "style")
        element.removeAttribute(attribute.name);
    }
    if (element instanceof HTMLAnchorElement) {
      const protocol = new URL(element.href, window.location.origin).protocol;
      if (!["http:", "https:", "mailto:"].includes(protocol))
        element.removeAttribute("href");
      element.rel = "noopener noreferrer";
    }
    if (
      element instanceof HTMLImageElement &&
      !element.src.startsWith("data:image/") &&
      !element.src.startsWith("https://")
    )
      element.remove();
  }
  return parsed;
}

export function MailRichEditor({ initialHtml = "" }: { initialHtml?: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);

  function syncHtml() {
    if (hiddenRef.current)
      hiddenRef.current.value = editorRef.current?.innerHTML ?? "";
  }

  useEffect(() => {
    const parsed = sanitizedEditorDocument(initialHtml);
    const safeHtml = parsed.body.innerHTML;
    editorRef.current?.replaceChildren(
      ...Array.from(parsed.body.childNodes, (node) =>
        document.importNode(node, true),
      ),
    );
    if (hiddenRef.current) hiddenRef.current.value = safeHtml;
  }, [initialHtml]);

  function addLink() {
    const href = window.prompt("Paste a link URL");
    if (!href) return;
    const url = new URL(href, window.location.origin);
    if (!["http:", "https:", "mailto:"].includes(url.protocol)) return;
    editorCommand("createLink", url.toString());
  }

  function addInlineImage(file?: File) {
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string")
        editorCommand("insertImage", reader.result);
      syncHtml();
    });
    reader.readAsDataURL(file);
  }

  const tools = [
    { label: "Bold", icon: LiveBold, run: () => editorCommand("bold") },
    { label: "Italic", icon: LiveItalic, run: () => editorCommand("italic") },
    {
      label: "Underline",
      icon: LiveUnderline,
      run: () => editorCommand("underline"),
    },
    { label: "Insert link", icon: LiveLink, run: addLink },
  ];

  return (
    <div className="surface-inset overflow-hidden rounded-tile focus-within:ring-2 focus-within:ring-ring/40">
      <div className="flex items-center gap-0.5 border-b border-hairline p-1">
        {tools.map((tool) => (
          <Button
            aria-label={tool.label}
            key={tool.label}
            onMouseDown={(event) => {
              event.preventDefault();
              tool.run();
              queueMicrotask(syncHtml);
            }}
            className="size-8 rounded-full"
            data-icon-trigger
            size="icon-sm"
            title={tool.label}
            type="button"
            variant="quiet"
          >
            <tool.icon className="size-3.5" strokeWidth={2} />
          </Button>
        ))}
        <label
          className="grid size-8 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          data-icon-trigger
          title="Insert inline image"
        >
          <LiveImagePlus className="size-3.5" strokeWidth={2} />
          <span className="sr-only">Insert inline image</span>
          <input
            accept="image/*"
            className="sr-only"
            onChange={(event) => addInlineImage(event.target.files?.[0])}
            type="file"
          />
        </label>
      </div>
      {/* biome-ignore lint/a11y/useSemanticElements: contentEditable is required for rich-text authoring. */}
      <div
        className="min-h-56 px-4 py-3 text-[14px] leading-6 text-foreground/90 outline-hidden [&_a]:text-primary [&_a]:underline [&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-lg"
        contentEditable
        aria-label="Message body"
        onBlur={syncHtml}
        onInput={syncHtml}
        ref={editorRef}
        role="textbox"
        suppressContentEditableWarning
        tabIndex={0}
      />
      <input
        defaultValue={initialHtml}
        name="html"
        ref={hiddenRef}
        type="hidden"
      />
    </div>
  );
}
