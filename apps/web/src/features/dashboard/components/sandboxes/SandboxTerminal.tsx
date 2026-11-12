"use client";

import { useEffect, useRef, useState } from "react";

export interface TerminalEntry {
  id: string;
  command: string;
  output: string;
}

/** A transcript of commands and output with a prompt at the bottom. */
export function SandboxTerminal({
  history,
  onRun,
  running,
}: {
  history: TerminalEntry[];
  onRun: (command: string) => void;
  running: boolean;
}) {
  const [command, setCommand] = useState("pwd && ls -la");
  const end = useRef<HTMLDivElement>(null);

  // Keep the newest output in view as commands complete.
  useEffect(() => {
    if (history.length) end.current?.scrollIntoView({ block: "nearest" });
  }, [history]);

  return (
    <div className="surface-inset m-2 max-h-[60vh] min-h-72 overflow-auto rounded-tile p-4 font-geist-mono text-[12px] leading-5">
      {history.length ? null : (
        <p className="text-muted-foreground">
          Ready. Type a command and press Enter.
        </p>
      )}
      {history.map((entry) => (
        <div className="mb-3" key={entry.id}>
          <p className="text-foreground">
            <span className="select-none text-primary">$ </span>
            {entry.command}
          </p>
          {entry.output ? (
            <pre className="mt-1 whitespace-pre-wrap break-words text-foreground/75">
              {entry.output}
            </pre>
          ) : null}
        </div>
      ))}
      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (command.trim()) onRun(command.trim());
        }}
      >
        <span className="select-none text-primary">$</span>
        <input
          aria-label="Shell command"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-foreground caret-primary outline-none placeholder:text-muted-foreground/50"
          disabled={running}
          onChange={(event) => setCommand(event.target.value)}
          placeholder="Type a command"
          spellCheck={false}
          value={command}
        />
        {running ? (
          <span className="text-muted-foreground">running…</span>
        ) : null}
      </form>
      <div ref={end} />
    </div>
  );
}
