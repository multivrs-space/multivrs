"use client";

import type { ReactNode } from "react";
import { DASH_FIELD } from "@/components/dashboard/menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MailResources } from "@/features/mail/mail.types";
import { cn } from "@/lib/utils";

const LABEL = "text-[12px] font-medium text-muted-foreground";

/** Native selects get the same recessed well as inputs. */
export const MAIL_SELECT = cn(DASH_FIELD, "w-full border px-3");

export function FormField({
  name,
  placeholder,
  required = true,
  type = "text",
}: {
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className={cn(LABEL, "capitalize")} htmlFor={name}>
        {name.replace(/([A-Z])/g, " $1")}
      </Label>
      <Input
        className={DASH_FIELD}
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </div>
  );
}

export function FormArea({
  name,
  placeholder,
}: {
  name: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className={cn(LABEL, "capitalize")} htmlFor={name}>
        {name}
      </Label>
      <Textarea
        className={cn(DASH_FIELD, "h-auto min-h-36 py-2.5")}
        id={name}
        name={name}
        placeholder={placeholder}
        required
      />
    </div>
  );
}

export function FormChoice({
  name,
  options,
}: {
  name: string;
  options: string[];
}) {
  return (
    <label className="block space-y-1.5">
      <span className={cn(LABEL, "block capitalize")}>{name}</span>
      <select className={cn(MAIL_SELECT, "capitalize")} name={name}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export function AudienceChoice({
  resources,
  optional = false,
}: {
  resources: MailResources;
  optional?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className={cn(LABEL, "block")}>
        Audience{optional ? " (optional)" : ""}
      </span>
      <select className={MAIL_SELECT} name="audienceId" required={!optional}>
        <option value="">{optional ? "No audience" : "Select audience"}</option>
        {resources.audiences.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ComposeField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className={LABEL}>{label}</Label>
      {children}
    </div>
  );
}
