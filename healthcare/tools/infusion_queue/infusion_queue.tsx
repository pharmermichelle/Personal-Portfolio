import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// ----------------------------
// Types & Stages
// ----------------------------
const STAGES = [
  { id: "awaiting_auth", label: "Awaiting Authorization" },
  { id: "verifying_labs", label: "Verifying Labs/Dose" },
  { id: "ready_to_compound", label: "Ready to Compound" },
  { id: "compounding", label: "Compounding" },
  { id: "waiting_pickup", label: "Waiting for Pickup" },
  { id: "in_chair_ready", label: "In Chair – Ready" },
  { id: "infusing", label: "Infusing" },
  { id: "complete", label: "Complete" },
] as const;

const STAGE_IDX: Record<string, number> = STAGES.reduce(
  (acc, s, i) => ({ ...acc, [s.id]: i }),
  {}
);

type StageId = (typeof STAGES)[number]["id"];

type Patient = {
  token: string;
  nurse: string | null;
  chair: number | null;
  stat: boolean;
  stage: StageId;
  createdAt: number;
  smsLog: string[];
};

// ----------------------------
// Sample Patients
// ----------------------------
const SAMPLE_PATIENTS: Patient[] = [
  {
    token: "A72-914",
    nurse: "Nurse Kelly",
    chair: null,
    stat: false,
    stage: "awaiting_auth",
    createdAt: Date.now() - 20 * 60000,
    smsLog: [],
  },
  {
    token: "B10-553",
    nurse: "Nurse Jordan",
    chair: 7,
    stat: true,
    stage: "verifying_labs",
    createdAt: Date.now() - 15 * 60000,
    smsLog: [],
  },
  {
    token: "Q32-004",
    nurse: null,
    chair: null,
    stat: false,
    stage: "ready_to_compound",
    createdAt: Date.now() - 10 * 60000,
    smsLog: [],
  },
];

// ----------------------------
// Main Component
// ----------------------------
export default function SmartInfusionQueueDemo() {
  const [patients, setPatients] = useState<Patient[]>(SAMPLE_PATIENTS);
  const [statusFilter, setStatusFilter] = useState<StageId | "all">("all");
  const [showStatOnly, setShowStatOnly] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      if (showStatOnly && !p.stat) return false;
      if (statusFilter !== "all" && p.stage !== statusFilter) return false;
      if (search && !p.token.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [patients, statusFilter, showStatOnly, search]);

  function advanceStage(p: Patient) {
    const i = STAGE_IDX[p.stage];
    if (i < STAGES.length - 1) {
      const next = STAGES[i + 1].id as StageId;
      setPatients((curr) =>
        curr.map((x) =>
          x.token === p.token
            ? {
                ...x,
                stage: next,
                smsLog: [...x.smsLog, `Update: ${STAGES[i + 1].label}`],
              }
            : x
        )
      );
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Smart Infusion Queue (Demo)</h1>

      <Card className="mb-4">
        <CardContent className="flex gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="stat-only"
              checked={showStatOnly}
              onCheckedChange={setShowStatOnly}
            />
            <Label htmlFor="stat-only">Show STAT only</Label>
          </div>
          <div>
            <Label>Status Filter</Label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border p-1 rounded"
            >
              <option value="all">All</option>
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <Label>Search Token</Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. A72"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff">Staff Dashboard</TabsTrigger>
          <TabsTrigger value="patient">Patient View</TabsTrigger>
        </TabsList>

        <TabsContent
          value="staff"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
        >
          {filtered.map((p) => (
            <Card key={p.token}>
              <CardHeader>
                <CardTitle>
                  Ticket {p.token}{" "}
                  {p.stat && <Badge variant="destructive">STAT</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">
                  Stage: {STAGES[STAGE_IDX[p.stage]].label}
                </p>
                <Button onClick={() => advanceStage(p)}>Advance</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="patient" className="mt-4">
          {patients.map((p) => (
            <Card key={p.token} className="mb-3">
              <CardHeader>
                <CardTitle>Ticket {p.token}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Current stage: {STAGES[STAGE_IDX[p.stage]].label}</p>
                <Progress
                  value={(STAGE_IDX[p.stage] / (STAGES.length - 1)) * 100}
                />
                <div className="mt-2 text-sm text-slate-600">
                  Messages:{" "}
                  {p.smsLog.length === 0 ? "None yet" : p.smsLog.join(", ")}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
