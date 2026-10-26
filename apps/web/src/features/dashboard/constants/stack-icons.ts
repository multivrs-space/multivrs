import type { FrameworkId } from "@multivrs/config";

/** An icon in /public/icons; `dark` is the white variant for dark surfaces. */
export interface StackIcon {
  light: string;
  dark?: string;
}

const icon = (light: string, dark?: string): StackIcon => ({
  light: `/icons/${light}.svg`,
  ...(dark ? { dark: `/icons/${dark}.svg` } : {}),
});

/** Frameworks without a bundled logo fall back to the repository language. */
export const FRAMEWORK_ICONS: Partial<Record<FrameworkId, StackIcon>> = {
  go: icon("golang", "golang_dark"),
  hono: icon("hono"),
  nextjs: icon("nextjs_icon_dark"),
  node: icon("nodejs"),
  python: icon("python"),
  ruby: icon("ruby"),
  "swift-rust": icon("swift-rust"),
};

/** Keyed by GitHub's `language` value. */
export const LANGUAGE_ICONS: Record<string, StackIcon> = {
  "C#": icon("dotnet"),
  Elixir: icon("elixir"),
  Go: icon("golang", "golang_dark"),
  Java: icon("java"),
  JavaScript: icon("javascript"),
  PHP: icon("php", "php_dark"),
  Python: icon("python"),
  Ruby: icon("ruby"),
  Rust: icon("rust", "rust_dark"),
  TypeScript: icon("typescript"),
};
