"use client";

import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import Header from "@/_components/Header";
import { useRouter } from "next/navigation";

export default function ThanksPage() {
  const params = useSearchParams();
  const orderNumber = params.get("order");
  const router = useRouter();

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>🎉 ご注文ありがとうございます！</h1>
          <p className={styles.message}>
            ご注文番号: <span className={styles.order}>{orderNumber}</span>
          </p>
          <p className={styles.details}>
            スタッフが準備を始めますので、しばらくお待ちください。
          </p>
          <button className={styles.back} onClick={() => router.push("/")}>
            メニューに戻る
          </button>
        </div>
      </div>
    </>
  );
}
