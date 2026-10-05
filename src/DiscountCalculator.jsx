import { useState } from "react";
import "./DiscountCalculator.css";

const CATEGORIES = [
    { id: "electronics", label: "Электроника", discount: 5 },
    { id: "clothing", label: "Одежда", discount: 15 },
    { id: "groceries", label: "Продукты", discount: 10 },
    { id: "books", label: "Книги", discount: 20 },
    { id: "other", label: "Другое", discount: 0 },
];
const VAT_RATE = 0.22;

function DiscountCalculator() {
    const [items, setItems] = useState([{ id: Date.now(), price: "", category: "electronics", customDiscount: 0 }]);
    const [promo, setPromo] = useState("");
    const [useVat, setUseVat] = useState(true);
    const [history, setHistory] = useState([]);
    const [calculatedData, setCalculatedData] = useState(null);
    const [error, setError] = useState("");

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), price: "", category: "electronics", customDiscount: 0 }]);
        setCalculatedData(null);
    };

    const handleItemChange = (id, field, value) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
        setCalculatedData(null);
        setError("");
    };

    const handleRemoveItem = (id) => {
        const newItems = items.filter(item => item.id !== id);
        setItems(newItems.length ? newItems : [{ id: Date.now(), price: "", category: "electronics", customDiscount: 0 }]);
        setCalculatedData(null);
    };

    const handleCalculate = () => {
        let hasError = false;
        let basePrice = 0;
        let totalDiscount = 0;

        items.forEach(item => {
            const numPrice = parseFloat(item.price);
            if (!item.price.trim() || isNaN(numPrice) || numPrice <= 0) {
                hasError = true;
            } else {
                basePrice += numPrice;
                const categoryMatch = CATEGORIES.find(c => c.id === item.category);
                const catDiscount = categoryMatch ? categoryMatch.discount : 0;
                const activeDiscount = item.customDiscount > 0 ? item.customDiscount : catDiscount;
                totalDiscount += numPrice * (activeDiscount / 100);
            }
        });

        if (hasError) {
            setError("Проверьте корректность цен (должны быть положительными числами)");
            setCalculatedData(null);
            return;
        }

        const priceAfterItemDiscounts = basePrice - totalDiscount;
        const isPromoValid = promo.trim().toUpperCase() === "KIOLAVV10";
        const promoDiscountAmount = isPromoValid ? priceAfterItemDiscounts * 0.10 : 0;
        const priceBeforeVat = priceAfterItemDiscounts - promoDiscountAmount;
        const vatAmount = useVat ? priceBeforeVat * VAT_RATE : 0;
        const totalToPay = priceBeforeVat + vatAmount;

        const result = {
            basePrice,
            totalDiscount,
            isPromoValid,
            promoDiscountAmount,
            priceBeforeVat,
            vatAmount,
            totalToPay,
            timestamp: new Date().toLocaleTimeString()
        };

        setCalculatedData(result);
        setError("");
        setHistory(prev => [result, ...prev].slice(0, 5));
    };

    const formatRub = (val) => val.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="calculator-wrapper" style={{ maxWidth: "600px" }}>
            <h2 className="calculator-title">Продвинутый калькулятор скидок</h2>

            {items.map((item, index) => (
                <div key={item.id} style={{ border: "1px solid #eee", padding: "12px", marginBottom: "12px", borderRadius: "8px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", marginBottom: "10px" }}>
                        <div className="field" style={{ margin: 0, flex: 1 }}>
                            <label className="field__label">Цена товара (₽)</label>
                            <input
                                type="text"
                                className="field__input"
                                value={item.price}
                                onChange={(e) => handleItemChange(item.id, "price", e.target.value)}
                                placeholder="1000"
                            />
                        </div>
                        <div className="field" style={{ margin: 0, flex: 1 }}>
                            <label className="field__label">Категория</label>
                            <select
                                className="field__input field__select"
                                value={item.category}
                                onChange={(e) => handleItemChange(item.id, "category", e.target.value)}
                            >
                                {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label} ({cat.discount}%)</option>)}
                            </select>
                        </div>
                        <button type="button" className="btn btn--secondary" style={{ flex: "0 0 auto", padding: "10px" }} onClick={() => handleRemoveItem(item.id)}>✕</button>
                    </div>
                    <div className="field" style={{ margin: 0 }}>
                        <label className="field__label">Кастомная скидка (перекрывает категорию): {item.customDiscount}%</label>
                        <input
                            type="range" min="0" max="50"
                            value={item.customDiscount}
                            onChange={(e) => handleItemChange(item.id, "customDiscount", parseInt(e.target.value))}
                        />
                    </div>
                </div>
            ))}

            <button type="button" className="btn btn--secondary" onClick={handleAddItem} style={{ marginBottom: "20px", width: "100%" }}>+ Добавить товар</button>

            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <div className="field" style={{ flex: 1, margin: 0 }}>
                    <label className="field__label">Промокод</label>
                    <input type="text" className="field__input" value={promo} onChange={(e) => { setPromo(e.target.value); setCalculatedData(null); }} placeholder="KIOLAVV10" />
                </div>
                <div className="field" style={{ flex: 1, margin: 0, justifyContent: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input type="checkbox" checked={useVat} onChange={(e) => { setUseVat(e.target.checked); setCalculatedData(null); }} />
                        Учитывать НДС (22%)
                    </label>
                </div>
            </div>

            {error && <div className="field__error" style={{ marginBottom: "15px", textAlign: "center" }}>{error}</div>}

            <div className="actions">
                <button type="button" className="btn btn--primary" onClick={handleCalculate}>Рассчитать</button>
            </div>

            {calculatedData && (
                <div className="results">
                    <h3 className="results__title">Результат текущего расчёта</h3>
                    <table className="results__table">
                        <tbody>
                            <tr><td>Исходная сумма</td><td className="results__value">{formatRub(calculatedData.basePrice)} ₽</td></tr>
                            <tr><td>Скидка по товарам</td><td className="results__value results__value--discount">−{formatRub(calculatedData.totalDiscount)} ₽</td></tr>
                            {calculatedData.isPromoValid && <tr><td>Скидка по промокоду (10%)</td><td className="results__value results__value--discount">−{formatRub(calculatedData.promoDiscountAmount)} ₽</td></tr>}
                            <tr><td>Цена после всех скидок</td><td className="results__value">{formatRub(calculatedData.priceBeforeVat)} ₽</td></tr>
                            <tr><td>НДС (22%)</td><td className="results__value">{calculatedData.vatAmount > 0 ? `+${formatRub(calculatedData.vatAmount)} ₽` : "0,00 ₽"}</td></tr>
                            <tr className="results__row--total"><td>Итого к оплате</td><td className="results__value">{formatRub(calculatedData.totalToPay)} ₽</td></tr>
                        </tbody>
                    </table>
                </div>
            )}

            {history.length > 0 && (
                <div className="results" style={{ marginTop: "20px" }}>
                    <h3 className="results__title">История расчётов (последние 5)</h3>
                    <ul style={{ paddingLeft: "20px", fontSize: "14px", color: "#555" }}>
                        {history.map((h, i) => (
                            <li key={i}>{h.timestamp} — Итог: <strong>{formatRub(h.totalToPay)} ₽</strong> (Без скидок: {formatRub(h.basePrice)} ₽)</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default DiscountCalculator;