/**
 * Remote content in received mail is how senders track opens: a pixel or a
 * CSS background fetched the moment the message renders. These helpers
 * defuse every remote fetch in already-sanitised email HTML, keeping data:
 * and resolved cid: images, until the reader chooses to load them.
 */

const REMOTE = /^\s*(?:https?:)?\/\//i;
const REMOTE_ANYWHERE = /(?:https?:)?\/\//i;
const QUOTE = `(?:["']|&quot;|&#x27;|&#39;)?`;

export interface BlockedContent {
  html: string;
  /** How many remote fetches were stopped; 0 means nothing was hidden. */
  blocked: number;
}

export function blockRemoteContent(html: string): BlockedContent {
  let blocked = 0;
  const stop = () => {
    blocked += 1;
  };

  // Attributes that fetch on render. srcset lists several URLs.
  let out = html.replace(
    /\s(src|srcset|background|poster)\s*=\s*(["'])(.*?)\2/gi,
    (match, name: string, quote: string, value: string) => {
      const remote =
        name.toLowerCase() === "srcset"
          ? REMOTE_ANYWHERE.test(value)
          : REMOTE.test(value);
      if (!remote) return match;
      stop();
      return ` data-blocked-${name.toLowerCase()}=${quote}${value}${quote}`;
    },
  );

  // SVG <use>/<image> pull in remote documents through href.
  out = out.replace(/<(use|image|feimage)\b[^>]*>/gi, (tag) =>
    tag.replace(
      /\s((?:xlink:)?href)\s*=\s*(["'])(.*?)\2/gi,
      (match, name: string, quote: string, value: string) => {
        if (!REMOTE.test(value)) return match;
        stop();
        return ` data-blocked-${name.toLowerCase().replace(":", "-")}=${quote}${value}${quote}`;
      },
    ),
  );

  // CSS: url(...) in style attributes and <style>, and @import.
  out = out.replace(
    new RegExp(`url\\(\\s*${QUOTE}\\s*(?:https?:)?\\/\\/[^)]*\\)`, "gi"),
    () => {
      stop();
      return "none";
    },
  );
  out = out.replace(
    new RegExp(`@import\\s+${QUOTE}\\s*(?:https?:)?\\/\\/[^;]*;?`, "gi"),
    () => {
      stop();
      return "";
    },
  );

  return { html: out, blocked };
}
