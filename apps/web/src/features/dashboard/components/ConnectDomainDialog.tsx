"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { DashDialogHeader } from "@/components/dashboard/DashDialogHeader";
import {
  DASH_DIALOG,
  DASH_FIELD,
  DASH_MENU,
} from "@/components/dashboard/menu";
import { LiveGlobe } from "@/components/icons/animated";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DomainProjectOption } from "@/lib/services/domain.service";

interface ConnectDomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: DomainProjectOption[];
}

export function ConnectDomainDialog({
  open,
  onOpenChange,
  projects,
}: ConnectDomainDialogProps) {
  const router = useRouter();
  const [hostname, setHostname] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(() =>
      connectDomain(hostname, projectId)
        .then(() => {
          toast.success(`${hostname} connected`);
          setHostname("");
          onOpenChange(false);
          router.refresh();
        })
        .catch((error: unknown) => {
          toast.error(
            error instanceof Error ? error.message : "Request failed",
          );
        }),
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DASH_DIALOG}>
        <form onSubmit={submit} className="grid gap-6">
          <DashDialogHeader
            description="Add a domain you already own; we'll show the DNS records to set next."
            icon={LiveGlobe}
            title="Connect a domain"
          />
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label className="text-xs" htmlFor="domain-hostname">
                Domain
              </Label>
              <Input
                className={`${DASH_FIELD} font-geist-mono`}
                id="domain-hostname"
                value={hostname}
                onChange={(event) => setHostname(event.target.value)}
                placeholder="example.com"
                autoComplete="off"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className={`${DASH_FIELD} w-full`}>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent className={DASH_MENU}>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              size="sm"
              type="button"
              variant="quiet"
            >
              Cancel
            </Button>
            <Button
              disabled={pending || !projectId}
              size="sm"
              type="submit"
              variant="hero"
            >
              {pending ? "Connecting…" : "Connect domain"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

async function connectDomain(hostname: string, projectId: string) {
  const response = await fetch("/api/domains", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ hostname, projectId }),
  });
  if (!response.ok) {
    const body = (await response.json()) as { error?: { message?: string } };
    throw new Error(body.error?.message ?? "Unable to connect domain");
  }
}
