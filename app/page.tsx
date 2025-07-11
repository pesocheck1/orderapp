"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Header from "@/_components/Header";
import { formatPrice } from "@/utils/formatPrice";

const MENU_API_URL = "https://wv1vrthq06.microcms.io/api/v1/menu";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  comment?: string;
  image?: {
    url: string;
    width: number;
    height: number;
  };
};

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<MenuItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch(MENU_API_URL, {
      headers: { "X-API-KEY": process.env.NEXT_PUBLIC_MICROCMS_API_KEY || "" },
    })
      .then((res) => res.json())
      .then((data) => {
        const normalized = data.contents.map((item: any) => ({
          ...item,
          price: Number(item.price),
        }));
        normalized.sort((a: MenuItem, b: MenuItem) => b.price - a.price);
        setMenu(normalized);
      });

    const saved = localStorage.getItem("cart");
    if (saved) {
      const savedCart = JSON.parse(saved).map((item: any) => ({
        ...item,
        price: Number(item.price),
      }));
      setCart(savedCart);
    }
  }, []);

  const addOneToCart = (item: MenuItem) => {
    const updated = [...cart, item];
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // Удаление одного экземпляра товара из корзины
  const removeOneFromCart = (id: string) => {
    const indexToRemove = cart.findIndex((item) => item.id === id);
    if (indexToRemove === -1) return;
    const updated = [...cart];
    updated.splice(indexToRemove, 1);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  // Группируем корзину по id с подсчётом количества
  const groupedCart = cart.reduce((acc, item) => {
    if (acc[item.id]) {
      acc[item.id].quantity += 1;
    } else {
      acc[item.id] = { ...item, quantity: 1 };
    }
    return acc;
  }, {} as Record<string, MenuItem & { quantity: number }>);

  const groupedItems = Object.values(groupedCart);

  // Общая сумма с учётом количества
  const total = groupedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      <Header />
      <div className={styles.container}>
        <main className={styles.menuList}>
          <h1 className={styles.title}>メニュー一覧</h1>
          <ul className={styles.list}>
            {menu.map((item) => (
              <li key={item.id} className={styles.item}>
                <div className={styles.cardWrapper}>
                  {item.image && (
                    <Image
                      src={item.image.url}
                      alt={item.name}
                      width={100}
                      height={100}
                      className={styles.menuImage}
                    />
                  )}
                  <div className={styles.cardContent}>
                    <p className={styles.name}>{item.name}</p>
                    {item.comment && (
                      <p className={styles.comment}>{item.comment}</p>
                    )}
                    <div className={styles.priceAndButton}>
                      <span className={styles.price}>
                        {formatPrice(item.price)}円
                      </span>
                      <button
                        className={styles.addButton}
                        onClick={() => router.push(`/confirm/${item.id}`)}
                      >
                        追加
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </main>
        <aside className={styles.cart}>
          <h2 className={styles.cartTitle}>注文状況</h2>
          {groupedItems.length === 0 ? (
            <p className={styles.empty}>まだ商品はありません。</p>
          ) : (
            <>
              {groupedItems.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  {item.image && (
                    <Image
                      src={item.image.url}
                      alt={item.name}
                      width={60}
                      height={40}
                      className={styles.cartImage}
                    />
                  )}
                  <div className={styles.cartNamePrice}>
                    <div className={styles.cartTopRow}>
                      <span className={styles.cartName}>{item.name}</span>
                    </div>
                    <div className={styles.priceQtyLine}>
                      <span className={styles.cartPrice}>
                        {formatPrice(item.price * item.quantity)}円
                      </span>
                      <span className={styles.quantityBlock}>
                        <button
                          onClick={() => removeOneFromCart(item.id)}
                          className={styles.qtyButton}
                          aria-label="マイナス"
                        >
                          －
                        </button>
                        <span className={styles.quantityText}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addOneToCart(item)}
                          className={styles.qtyButton}
                          aria-label="プラス"
                        >
                          ＋
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div className={styles.totalSum}>
                合計: {formatPrice(total)}円
              </div>
              <div className={styles.totalWithTax}>
                税込価格: {formatPrice(Math.floor(total * 1.1))}円
              </div>
            </>
          )}
          <Link href="/cart" className={styles.checkoutButton}>
            注文確認へ進む
          </Link>
        </aside>
      </div>
    </>
  );
}
