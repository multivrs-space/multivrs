"use client";

import { useRef, useState } from "react";

/**
 * The email's own HTML in a sandboxed frame (no scripts), grown to fit its
 * content as images and fonts load.
 */
export function MailEmailFrame({
  document,
  title,
}: {
  document: string;
  title: string;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(300);

  function fit() {
    const doc = frame.current?.contentDocument;
    if (!doc?.body) return;
    const measure = () => {
      const measured = Math.max(
        doc.body.scrollHeight,
        doc.documentElement.scrollHeight,
        doc.body.offsetHeight,
      );
      if (measured > 40)
        setHeight((previous) =>
          Math.abs(previous - (measured + 24)) > 4 ? measured + 24 : previous,
        );
    };
    measure();
    for (const image of doc.querySelectorAll("img")) {
      if (!image.complete) {
        image.addEventListener("load", measure, { once: true });
        image.addEventListener("error", measure, { once: true });
      }
    }
    new ResizeObserver(measure).observe(doc.body);
  }

  return (
    <iframe
      className="block w-full border-0 bg-white"
      onLoad={fit}
      ref={frame}
      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
      scrolling="no"
      srcDoc={document}
      style={{ height, minHeight: 160 }}
      title={title}
    />
  );
}
