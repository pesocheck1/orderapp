"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Header from "@/_components/Header";
import { formatPrice } from "@/utils/formatPrice";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  comment?: string;
  image?: { url: string; width: number; height: number };
};

export default function CartPage() {
  const [cart, setCart] = useState<MenuItem[]>([]);

  const [payment, setPayment] = useState("現金");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");

  const [phoneError, setPhoneError] = useState("");
  const [postalCodeError, setPostalCodeError] = useState("");
  const [addressLine1Error, setAddressLine1Error] = useState("");
  const [addressLine2Error, setAddressLine2Error] = useState("");

  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const clearCart = () => {
    if (confirm("カートを空にしますか？")) {
      setCart([]);
      localStorage.removeItem("cart");
    }
  };

  const validatePhone = (value: string) => {
    if (!value.trim()) return "電話番号を入力してください。";
    if (!/^[0-9]{10,11}$/.test(value))
      return "電話番号は10〜11桁の数字で入力してください。";
    return "";
  };

  const validatePostalCode = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "郵便番号を入力してください。";
    if (!/^\d{3}-\d{4}$/.test(trimmed))
      return "郵便番号は「000-0000」の形式で入力してください。";
    return "";
  };

  const validateAddressLine = (value: string, label: string) => {
    return value.trim() ? "" : `${label}を入力してください。`;
  };

  const handleOrder = () => {
    const pError = validatePostalCode(postalCode);
    const a1Error = validateAddressLine(addressLine1, "住所１");
    const a2Error = validateAddressLine(addressLine2, "住所２");

    setPostalCodeError(pError);
    setAddressLine1Error(a1Error);
    setAddressLine2Error(a2Error);

    if (pError || a1Error || a2Error) return;

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    localStorage.removeItem("cart");
    router.push(`/thanks?order=${orderNumber}`);
  };

  // Группировка товаров по ID
  const groupedCart = cart.reduce((acc, item) => {
    if (acc[item.id]) {
      acc[item.id].quantity += 1;
    } else {
      acc[item.id] = { ...item, quantity: 1 };
    }
    return acc;
  }, {} as Record<string, MenuItem & { quantity: number }>);

  const groupedItems = Object.values(groupedCart);

  const total = groupedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.title}>カート</h1>

        {groupedItems.length === 0 ? (
          <p className={styles.empty}>カートに商品がありません。</p>
        ) : (
          <>
            <ul className={styles.cartList}>
              {groupedItems.map((item) => (
                <li key={item.id} className={styles.cartItem}>
                  {item.image && (
                    <Image
                      src={item.image.url}
                      alt={item.name}
                      width={80}
                      height={60}
                      className={styles.cartImage}
                    />
                  )}
                  <p className={styles.name}>{item.name}</p>
                  <div className={styles.controls}>
                    <button
                      className={styles.qtyButton}
                      onClick={() => {
                        const index = cart.findIndex((c) => c.id === item.id);
                        if (index === -1) return;
                        const updated = [...cart];
                        updated.splice(index, 1);
                        setCart(updated);
                        localStorage.setItem("cart", JSON.stringify(updated));
                      }}
                      aria-label="減らす"
                    >
                      －
                    </button>
                    <span className={styles.quantityText}>{item.quantity}</span>

                    <button
                      className={styles.qtyButton}
                      onClick={() => {
                        const updated = [...cart, item];
                        setCart(updated);
                        localStorage.setItem("cart", JSON.stringify(updated));
                      }}
                      aria-label="増やす"
                    >
                      ＋
                    </button>
                  </div>
                  <p className={styles.price}>
                    {formatPrice(item.price * item.quantity)}円
                  </p>
                </li>
              ))}
            </ul>
            <div className={styles.underline} />

            <div className={styles.summary}>
              <p className={styles.total}>合計: {formatPrice(total)}円</p>
              <p className={styles.totalWithTax}>
                税込価格: {formatPrice(Math.floor(total * 1.1))}円
              </p>

              <label className={styles.label}>
                支払い方法:
                <select
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                  className={styles.select}
                >
                  <option value="現金">現金</option>
                  <option value="クレジットカード">クレジットカード</option>
                  <option value="電子マネー">電子マネー</option>
                </select>
              </label>

              <div className={styles.addressBlock}>
                {/* Телефон */}
                <label className={styles.addressLabel}>
                  電話番号
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPhone(value);
                      setPhoneError(validatePhone(value));
                    }}
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      input.value = input.value.replace(/\D/g, "");
                    }}
                    className={styles.input}
                    placeholder="例：09012345678"
                    required
                  />
                  {phoneError && <p className={styles.error}>{phoneError}</p>}
                </label>

                {/* 郵便番号 */}
                <label className={styles.addressLabel}>
                  郵便番号
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPostalCode(value);
                      setPostalCodeError(validatePostalCode(value));
                    }}
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      input.value = input.value.replace(/[^0-9\-]/g, "");
                    }}
                    className={styles.input}
                    placeholder="例: 900-0015"
                    inputMode="numeric"
                    required
                  />
                  {postalCodeError && (
                    <p className={styles.error}>{postalCodeError}</p>
                  )}
                </label>

                {/* 住所１ */}
                <label className={styles.addressLabel}>
                  住所１（都道府県・市区町村）
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAddressLine1(value);
                      setAddressLine1Error(
                        validateAddressLine(value, "住所１")
                      );
                    }}
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      input.value = input.value.replace(
                        /[^\u3000-\u303F\u3040-\u30FF\u4E00-\u9FAF\uFF10-\uFF19a-zA-Z0-9\- 　]/g,
                        ""
                      );
                    }}
                    className={styles.input}
                    placeholder="例: 沖縄県那覇市久茂地1-2-3"
                    required
                  />
                  {addressLine1Error && (
                    <p className={styles.error}>{addressLine1Error}</p>
                  )}
                </label>

                {/* 住所２ */}
                <label className={styles.addressLabel}>
                  住所２（建物名・部屋番号など）
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAddressLine2(value);
                      setAddressLine2Error(
                        validateAddressLine(value, "住所２")
                      );
                    }}
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      input.value = input.value.replace(
                        /[^\u3000-\u303F\u3040-\u30FF\u4E00-\u9FAF\uFF10-\uFF19a-zA-Z0-9\- 　]/g,
                        ""
                      );
                    }}
                    className={styles.input}
                    placeholder="例: スウィートハイツ101号室"
                    required
                  />
                  {addressLine2Error && (
                    <p className={styles.error}>{addressLine2Error}</p>
                  )}
                </label>
              </div>

              <div className={styles.buttons}>
                <button className={styles.clear} onClick={clearCart}>
                  カートを空にする
                </button>
                <button className={styles.confirm} onClick={handleOrder}>
                  注文を確定する
                </button>
                <button
                  className={styles.back}
                  onClick={() => router.push("/")}
                >
                  メニューに戻る
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
