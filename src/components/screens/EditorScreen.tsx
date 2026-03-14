import { useState } from 'react';
import { PurchaseList, Product } from '@/types';
import Icon from '@/components/ui/icon';

interface Props {
  list: PurchaseList;
  onBack: () => void;
  onToggleProduct: (productId: string) => void;
  onUpdateProduct: (productId: string, updates: Partial<Product>) => void;
  onDeleteProduct: (productId: string) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateList: (updates: Partial<PurchaseList>) => void;
  onExport: () => void;
  onReminder: () => void;
}

const UNITS = ['шт', 'кг', 'л', 'упак', 'пачка', 'рул', 'компл', 'м'];

export default function EditorScreen({ list, onBack, onToggleProduct, onUpdateProduct, onDeleteProduct, onAddProduct, onUpdateList, onExport, onReminder }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editQty, setEditQty] = useState('');
  const [editUnit, setEditUnit] = useState('шт');
  const [editPrice, setEditPrice] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [newUnit, setNewUnit] = useState('шт');
  const [newPrice, setNewPrice] = useState('');
  const [editTitle, setEditTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(list.title);

  const checked = list.products.filter(p => p.checked);
  const unchecked = list.products.filter(p => !p.checked);
  const total = list.products.reduce((s, p) => s + (p.price || 0) * p.quantity, 0);
  const progress = list.products.length ? Math.round(checked.length / list.products.length * 100) : 0;

  function startEdit(p: Product) {
    setEditingId(p.id);
    setEditName(p.name);
    setEditQty(String(p.quantity));
    setEditUnit(p.unit);
    setEditPrice(p.price ? String(p.price) : '');
  }

  function saveEdit() {
    if (!editingId) return;
    onUpdateProduct(editingId, {
      name: editName,
      quantity: parseFloat(editQty) || 1,
      unit: editUnit,
      price: editPrice ? parseFloat(editPrice) : undefined
    });
    setEditingId(null);
  }

  function handleAddNew() {
    if (!newName.trim()) return;
    onAddProduct({
      name: newName.trim(),
      quantity: parseFloat(newQty) || 1,
      unit: newUnit,
      price: newPrice ? parseFloat(newPrice) : undefined,
      checked: false
    });
    setNewName('');
    setNewQty('1');
    setNewPrice('');
    setAddingNew(false);
  }

  function markAllDone() {
    list.products.forEach(p => { if (!p.checked) onToggleProduct(p.id); });
  }

  return (
    <div className="flex flex-col h-full page-enter">
      {/* Header */}
      <div className="px-5 pt-12 pb-3 border-b border-border bg-background">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
            <Icon name="ChevronLeft" size={20} />
          </button>
          <div className="flex-1 min-w-0">
            {editTitle ? (
              <input
                className="app-input text-base font-bold"
                value={titleVal}
                onChange={e => setTitleVal(e.target.value)}
                onBlur={() => { onUpdateList({ title: titleVal }); setEditTitle(false); }}
                autoFocus
              />
            ) : (
              <button onClick={() => setEditTitle(true)} className="text-left w-full group">
                <p className="text-xs text-muted-foreground">Список закупок</p>
                <div className="flex items-center gap-1">
                  <h1 className="text-lg font-bold truncate">{list.title}</h1>
                  <Icon name="Pencil" size={13} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onReminder} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
              <Icon name="Bell" size={16} className={list.reminder ? 'text-primary' : 'text-muted-foreground'} />
            </button>
            <button onClick={onExport} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
              <Icon name="Share2" size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1 progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-semibold text-primary">{checked.length}/{list.products.length}</span>
          {total > 0 && (
            <span className="text-sm font-bold text-foreground">{total.toLocaleString('ru-RU')} ₽</span>
          )}
        </div>
      </div>

      <div className="content-scroll px-5 pb-28 pt-4">
        {/* Status selector */}
        <div className="flex gap-2 mb-4">
          {(['active', 'done', 'archive'] as const).map(s => (
            <button
              key={s}
              onClick={() => onUpdateList({ status: s })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                list.status === s
                  ? s === 'done' ? 'badge-done' : s === 'archive' ? 'badge-archive' : 'badge-active'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {s === 'active' ? 'Активен' : s === 'done' ? 'Завершён' : 'Архив'}
            </button>
          ))}
          {unchecked.length > 0 && (
            <button
              onClick={markAllDone}
              className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium text-primary bg-primary/10"
            >
              Отметить все
            </button>
          )}
        </div>

        {/* Unchecked products */}
        {unchecked.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Нужно купить ({unchecked.length})
            </p>
            <div className="flex flex-col gap-2">
              {unchecked.map(p => (
                <ProductRow
                  key={p.id}
                  product={p}
                  editing={editingId === p.id}
                  editName={editName} editQty={editQty} editUnit={editUnit} editPrice={editPrice}
                  onEditName={setEditName} onEditQty={setEditQty} onEditUnit={setEditUnit} onEditPrice={setEditPrice}
                  onToggle={() => onToggleProduct(p.id)}
                  onStartEdit={() => startEdit(p)}
                  onSaveEdit={saveEdit}
                  onCancelEdit={() => setEditingId(null)}
                  onDelete={() => onDeleteProduct(p.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Checked products */}
        {checked.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Куплено ({checked.length})
            </p>
            <div className="flex flex-col gap-2 opacity-60">
              {checked.map(p => (
                <ProductRow
                  key={p.id}
                  product={p}
                  editing={editingId === p.id}
                  editName={editName} editQty={editQty} editUnit={editUnit} editPrice={editPrice}
                  onEditName={setEditName} onEditQty={setEditQty} onEditUnit={setEditUnit} onEditPrice={setEditPrice}
                  onToggle={() => onToggleProduct(p.id)}
                  onStartEdit={() => startEdit(p)}
                  onSaveEdit={saveEdit}
                  onCancelEdit={() => setEditingId(null)}
                  onDelete={() => onDeleteProduct(p.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Add new product */}
        {addingNew ? (
          <div className="bg-white rounded-2xl border border-border p-4">
            <input
              className="app-input mb-3"
              placeholder="Название товара"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 mb-3">
              <input className="app-input flex-1 text-center" type="number" placeholder="Кол-во" value={newQty} onChange={e => setNewQty(e.target.value)} />
              <select className="app-input flex-1" value={newUnit} onChange={e => setNewUnit(e.target.value)}>
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
              <input className="app-input flex-1" type="number" placeholder="Цена ₽" value={newPrice} onChange={e => setNewPrice(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddNew} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">Добавить</button>
              <button onClick={() => setAddingNew(false)} className="px-4 py-2.5 bg-secondary rounded-xl text-sm">Отмена</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingNew(true)}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-muted-foreground text-sm font-medium flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors"
          >
            <Icon name="Plus" size={16} />
            Добавить товар
          </button>
        )}
      </div>
    </div>
  );
}

interface ProductRowProps {
  product: Product;
  editing: boolean;
  editName: string; editQty: string; editUnit: string; editPrice: string;
  onEditName: (v: string) => void; onEditQty: (v: string) => void; onEditUnit: (v: string) => void; onEditPrice: (v: string) => void;
  onToggle: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}

const UNITS = ['шт', 'кг', 'л', 'упак', 'пачка', 'рул', 'компл', 'м'];

function ProductRow({ product, editing, editName, editQty, editUnit, editPrice, onEditName, onEditQty, onEditUnit, onEditPrice, onToggle, onStartEdit, onSaveEdit, onCancelEdit, onDelete }: ProductRowProps) {
  if (editing) {
    return (
      <div className="bg-white rounded-xl border-2 border-primary p-3">
        <input className="app-input mb-2" value={editName} onChange={e => onEditName(e.target.value)} autoFocus />
        <div className="flex gap-2 mb-2">
          <input className="app-input flex-1 text-center" type="number" value={editQty} onChange={e => onEditQty(e.target.value)} />
          <select className="app-input flex-1" value={editUnit} onChange={e => onEditUnit(e.target.value)}>
            {UNITS.map(u => <option key={u}>{u}</option>)}
          </select>
          <input className="app-input flex-1" type="number" placeholder="Цена ₽" value={editPrice} onChange={e => onEditPrice(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button onClick={onSaveEdit} className="flex-1 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">Сохранить</button>
          <button onClick={onCancelEdit} className="px-3 py-2 bg-secondary rounded-xl text-sm">Отмена</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border px-4 py-3 flex items-center gap-3">
      <button
        onClick={onToggle}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
          product.checked
            ? 'border-transparent bg-accent'
            : 'border-border hover:border-primary'
        }`}
      >
        {product.checked && <Icon name="Check" size={12} className="text-accent-foreground" />}
      </button>
      <div className="flex-1 min-w-0" onClick={onStartEdit}>
        <p className={`text-sm font-medium truncate ${product.checked ? 'line-through text-muted-foreground' : ''}`}>
          {product.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {product.quantity} {product.unit}
          {product.price ? ` · ${(product.price * product.quantity).toLocaleString('ru-RU')} ₽` : ''}
        </p>
      </div>
      <button onClick={onDelete} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors shrink-0">
        <Icon name="Trash2" size={14} />
      </button>
    </div>
  );
}
