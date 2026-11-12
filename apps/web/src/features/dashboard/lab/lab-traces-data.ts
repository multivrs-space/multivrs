import { LAB_NOW } from "@/features/dashboard/lab/lab-observe-data";
import type { Trace } from "@/features/dashboard/types/trace.types";

/* Synthetic Observe data for tuning designs in the lab only. Product pages
   never render made-up numbers. */

const ago = (minutes: number) =>
  new Date(LAB_NOW - minutes * 60_000).toISOString();

export const LAB_TRACES: Trace[] = [
  {
    id: "t1",
    name: "POST /api/checkout",
    at: ago(3),
    durationMs: 1_240,
    status: 200,
    spans: [
      {
        id: "a",
        parentId: null,
        name: "POST /api/checkout",
        service: "edge",
        kind: "http",
        startMs: 0,
        durationMs: 1_240,
      },
      {
        id: "b",
        parentId: "a",
        name: "checkout handler",
        service: "storefront",
        kind: "function",
        startMs: 18,
        durationMs: 1_190,
      },
      {
        id: "c",
        parentId: "b",
        name: "session lookup",
        service: "kv",
        kind: "cache",
        startMs: 24,
        durationMs: 9,
      },
      {
        id: "d",
        parentId: "b",
        name: "SELECT cart_items",
        service: "postgres",
        kind: "db",
        startMs: 40,
        durationMs: 142,
      },
      {
        id: "e",
        parentId: "b",
        name: "POST payments.example/charge",
        service: "payments",
        kind: "external",
        startMs: 190,
        durationMs: 880,
      },
      {
        id: "f",
        parentId: "b",
        name: "INSERT orders",
        service: "postgres",
        kind: "db",
        startMs: 1_080,
        durationMs: 96,
      },
    ],
  },
  {
    id: "t2",
    name: "GET /api/cart",
    at: ago(7),
    durationMs: 640,
    status: 500,
    spans: [
      {
        id: "a",
        parentId: null,
        name: "GET /api/cart",
        service: "edge",
        kind: "http",
        startMs: 0,
        durationMs: 640,
      },
      {
        id: "b",
        parentId: "a",
        name: "cart handler",
        service: "storefront",
        kind: "function",
        startMs: 12,
        durationMs: 610,
        error: true,
      },
      {
        id: "c",
        parentId: "b",
        name: "SELECT cart_items",
        service: "postgres",
        kind: "db",
        startMs: 20,
        durationMs: 560,
      },
    ],
  },
  {
    id: "t3",
    name: "GET /pricing",
    at: ago(9),
    durationMs: 96,
    status: 200,
    spans: [
      {
        id: "a",
        parentId: null,
        name: "GET /pricing",
        service: "edge",
        kind: "http",
        startMs: 0,
        durationMs: 96,
      },
      {
        id: "b",
        parentId: "a",
        name: "render /pricing",
        service: "storefront",
        kind: "function",
        startMs: 6,
        durationMs: 74,
      },
    ],
  },
];
