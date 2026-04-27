import { Suspense } from "react";
import { SmartMenuPage } from "@/components/smart-menu-page";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SmartMenuPage />
    </Suspense>
  );
}
