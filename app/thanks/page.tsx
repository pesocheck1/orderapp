import { Suspense } from "react";
import ThanksClient from "./ThanksClient";

export default function ThanksPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <ThanksClient />
    </Suspense>
  );
}
