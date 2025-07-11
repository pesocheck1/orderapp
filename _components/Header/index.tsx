import React, { useState } from "react";
import styles from "./index.module.css";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link href="/" className={styles.logo}>
          <Image
            src="/images/cupcake.png"
            alt="кекс"
            className={styles.berryIcon}
            width={60}
            height={60}
          />
          <h1 className={styles.title}>Sweet Cupcake Shop</h1>
        </Link>
      </div>
      <div className={styles.right}>
        <button
          className={styles.burger}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="メニューを開く"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
          <Link href="/" className={styles.navLink}>
            メニュー
          </Link>
          <a href="#about" className={styles.navLink}>
            私たちについて
          </a>
          <a href="#contact" className={styles.navLink}>
            お問い合わせ
          </a>
        </nav>
      </div>
    </header>
  );
}
