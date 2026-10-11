"use client";

import { useEffect, useState } from "react";
import { getHealth } from "@/api/client";
import { Button } from "@/components/ui/button";

export function HealthBadge() {
  const [status, setStatus] = useState<string>("...");

  useEffect(() => {
    getHealth()
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="flex items-center gap-3">
      <span data-testid="health-status">API: {status}</span>
      <Button variant="outline" onClick={() => setStatus("...")}>
        Reintentar
      </Button>
    </div>
  );
}
