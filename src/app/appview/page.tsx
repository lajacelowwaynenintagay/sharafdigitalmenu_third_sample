import { Suspense } from "react";

import { AppViewClient } from "@/components/appview-client";

export default function AppViewPage() {
  return (
    <Suspense
      fallback={
        <main className="smart-detail-page">
          <div className="detail-shell">
            <div className="empty-state">Loading item...</div>
          </div>
        </main>
      }
    >
      <AppViewClient />
    </Suspense>
  );
}
