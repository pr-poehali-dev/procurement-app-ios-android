import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Product } from '@/types';

interface Props {
  onSave: (title: string, products: Omit<Product, 'id'>[]) => void;
  onCancel: () => void;
}

const UNITS = ['шт', 'кг', 'л', 'упак', 'пачка', 'рул', 'компл', 'м'];

export default function CreateScreen({ onSave, onCancel }: Props) {
  const [title, setTitle] = useState('');
  const [products, setProducts] = useState<Omit<Product, 'id'>[]>([]);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('шт');
  const [price, setPrice] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  function addProduct() {
    if (!productName.trim()) return;
    setProducts(prev => [...prev, {
      name: productName.trim(),
      quantity: parseFloat(quantity) || 1,
      unit,
      price: price ? parseFloat(price) : undefined,
      checked: false
    }]);
    setProductName('');
    setQuantity('1');
    setPrice('');
  }

  function removeProduct(index: number) {
    setProducts(prev => prev.filter((_, i) => i !== index));
  }

  function handleImport() {
    const lines = importText.split('\n').filter(l => l.trim());
    const imported: Omit<Product, 'id'>[] = lines.map(line => {
      const parts = line.split(/[\t,;]+/);
      return {
        name: parts[0]?.trim() || line.trim(),
        quantity: parseFloat(parts[1]) || 1,
        unit: parts[2]?.trim() || 'шт',
        price: parts[3] ? parseFloat(parts[3]) : undefined,
        checked: false
      };
    });
    setProducts(prev => [...prev, ...imported]);
    setImportText('');
    setShowImport(false);
  }

  function handleSave() {
    if (!title.trim()) return;
    onSave(title.trim(), products);
  }

  const totalSum = products.reduce((s, p) => s + (p.price || 0) * p.quantity, 0);

  return (
    <div className="flex flex-col h-full page-enter">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3 border-b border-border bg-background">
        <button onClick={onCancel} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <Icon name="ChevronLeft" size={20} />
        </button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground font-medium">Новый список</p>
          <h1 className="text-lg font-bold">Создание закупки</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40"
        >
          Сохранить
        </button>
      </div>

      <div className="content-scroll px-5 pb-6 pt-4">
        {/* Title */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Название списка</label>
          <input
            className="app-input"
            placeholder="Например: Офисные принадлежности"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Add product */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Добавить товар</label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowImport(!showImport)}
                className="flex items-center gap-1 text-xs text-primary font-medium"
              >
                <Icon name="Upload" size={13} />
                Загрузить список
              </button>
              <button
                onClick={() => setShowScanner(!showScanner)}
                className="flex items-center gap-1 text-xs text-primary font-medium ml-2"
              >
                <Icon name="Camera" size={13} />
                Сканер
              </button>
            </div>
          </div>

          {/* Scanner placeholder */}
          {showScanner && (
            <div className="bg-black rounded-2xl mb-3 overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <div className="w-full h-full flex flex-col items-center justify-center text-white">
                <Icon name="Camera" size={48} className="mb-3 opacity-60" />
                <p className="text-sm font-medium opacity-80">Наведите камеру на штрихкод</p>
                <p className="text-xs opacity-50 mt-1">или введите название вручную</p>
                <button
                  onClick={() => {
                    setShowScanner(false);
                    setProductName('Товар со сканера');
                  }}
                  className="mt-4 px-4 py-2 bg-white/20 rounded-xl text-sm"
                >
                  Симулировать сканирование
                </button>
                <button onClick={() => setShowScanner(false)} className="mt-2 text-xs opacity-60 underline">Закрыть</button>
              </div>
            </div>
          )}

          {/* Import text */}
          {showImport && (
            <div className="bg-white rounded-2xl border border-border p-4 mb-3">
              <p className="text-xs text-muted-foreground mb-2">Вставьте список (каждый товар с новой строки):<br/>Формат: название, количество, ед., цена</p>
              <textarea
                className="app-input mb-3"
                style={{ minHeight: 80, resize: 'none' }}
                placeholder={"Бумага А4, 5, пачка, 450\nРучки, 20, шт, 25"}
                value={importText}
                onChange={e => setImportText(e.target.value)}
              />
              <div className="flex gap-2">
                <button onClick={handleImport} className="flex-1 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium">
                  Загрузить
                </button>
                <button onClick={() => setShowImport(false)} className="px-4 py-2 bg-secondary rounded-xl text-sm">
                  Отмена
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-border p-4">
            <input
              className="app-input mb-3"
              placeholder="Название товара"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addProduct()}
            />
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <input
                  className="app-input text-center"
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="Кол-во"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <select
                  className="app-input"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                >
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <input
                  className="app-input"
                  type="number"
                  placeholder="Цена ₽"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={addProduct}
              disabled={!productName.trim()}
              className="w-full py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Icon name="Plus" size={16} />
              Добавить
            </button>
          </div>
        </div>

        {/* Products list */}
        {products.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Товары ({products.length})
              </label>
              {totalSum > 0 && (
                <span className="text-sm font-bold text-foreground">{totalSum.toLocaleString('ru-RU')} ₽</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {products.map((p, i) => (
                <div key={i} className="bg-white rounded-xl border border-border px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Icon name="Package" size={14} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.quantity} {p.unit}{p.price ? ` · ${(p.price * p.quantity).toLocaleString('ru-RU')} ₽` : ''}</p>
                  </div>
                  <button onClick={() => removeProduct(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Icon name="X" size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
