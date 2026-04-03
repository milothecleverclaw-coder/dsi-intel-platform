import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const [dialogOpen, setDialogOpen] = useState(true);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-8 py-5">
        <h1 className="text-xl font-semibold">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate and manage investigation reports
        </p>
      </div>

      <div className="space-y-6 p-8">
        <Card>
          <CardHeader>
            <CardTitle>Report Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Form Type</Label>
                <Select defaultValue="tor1">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tor1">ตร.1 — รายงานความก้าวหน้าคดี</SelectItem>
                    <SelectItem value="tor2">ตร.2 — รายงานสรุปคดี</SelectItem>
                    <SelectItem value="spor">ส.ป.อ. — รายงานพิสูจน์หลักฐาน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Case Number</Label>
                <Input placeholder="DSI-2026-SB-042" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Report Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Investigator</Label>
                <Input placeholder="ชื่อ นามสกุล" />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Parties Involved (ผู้เกี่ยวข้อง)</Label>
              <Input placeholder="ชื่อผู้ต้องหา / พยาน" />
            </div>

            <div className="space-y-2">
              <Label>Description (รายละเอียด)</Label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="รายละเอียดเหตุการณ์ ข้อเท็จจริง และหลักฐานที่พบ..."
              />
            </div>

            <div className="space-y-2">
              <Label>Evidence Summary (สรุปหลักฐาน)</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="รายการหลักฐาน วัตถุ และเอกสารที่เกี่ยวข้อง..."
              />
            </div>

            <div className="flex gap-2">
              <Button disabled>Generate Report</Button>
              <Button variant="outline" disabled>
                Save Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🚧 Under Development</DialogTitle>
            <DialogDescription>
              The report builder is currently under development. AI-powered report generation from
              case data will be available soon.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
