import { useState } from 'react';
import { PurchaseList } from '@/types';
import Icon from '@/components/ui/icon';

interface Props {
  lists: PurchaseList[];
  preselectedListId?: string | null;
}

export default function ExportScreen({ lists, preselectedListId }: Props) {
  const [selectedListId, setSelectedListId] = useState(preselectedListId || (lists[0]?.id || ''));
  const [format, setFormat] = useState<'text' | 'table' | 'csv'>('text');
  const [copied, setCopied] = useState(false);

  const selectedList = lists.find(l => l.id === selectedListId);

  function generateText(list: PurchaseList): string {
    const lines = [`📋 ${list.title}\n`];
    const unchecked = list.products.filter(p => !p.checked);
    const checked = list.products.filter(p => p.checked);

    if (unchecked.length) {
      lines.push('Нужно купить:');
      unchecked.forEach(p => {
        lines.push(`☐ ${p.name} — ${p.quantity} ${p.unit}${p.price ? ` (${(p.price * p.quantity).toLocaleString('ru-RU')} ₽)` : ''}`);
      });
    }
    if (checked.length) {
      lines.push('\nКуплено:');
      checked.forEach(p => {
        lines.push(`✅ ${p.name} — ${p.quantity} ${p.unit}`);
      });
    }
    const total = list.products.reduce((s, p) => s + (p.price || 0) * p.quantity, 0);
    if (total > 0) lines.push(`\n💰 Итого: ${total.toLocaleString('ru-RU')} ₽`);
    lines.push(`\nСформировано: ${new Date().toLocaleDateString('ru-RU')}`);
    return lines.join('\n');
  }

  function generateTable(list: PurchaseList): string {
    const header = '| № | Товар | Кол-во | Ед. | Цена | Сумма | Статус |';
    const sep = '|---|-------|--------|-----|------|-------|--------|';
    const rows = list.products.map((p, i) =>
      `| ${i + 1} | ${p.name} | ${p.quantity} | ${p.unit} | ${p.price || '—'} | ${p.price ? (p.price * p.quantity).toLocaleString('ru-RU') : '—'} | ${p.checked ? '✅' : '☐'} |`
    );
    const total = list.products.reduce((s, p) => s + (p.price || 0) * p.quantity, 0);
    return [`**${list.title}**\n`, header, sep, ...rows, `\n**Итого: ${total.toLocaleString('ru-RU')} ₽**`].join('\n');
  }

  function generateCSV(list: PurchaseList): string {
    const header = 'Товар,Количество,Единица,Цена за ед.,Сумма,Статус';
    const rows = list.products.map(p =>
      `"${p.name}",${p.quantity},"${p.unit}",${p.price || ''},${p.price ? p.price * p.quantity : ''},"${p.checked ? 'Куплено' : 'Не куплено'}"`
    );
    return [header, ...rows].join('\n');
  }

  function getContent() {
    if (!selectedList) return '';
    if (format === 'text') return generateText(selectedList);
    if (format === 'table') return generateTable(selectedList);
    return generateCSV(selectedList);
  }

  async function handleCopy() {
    const content = getContent();
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = content;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleShare() {
    const content = getContent();
    if (navigator.share) {
      navigator.share({ title: selectedList?.title || 'Список закупок', text: content });
    } else {
      handleCopy();
    }
  }

  const content = getContent();

  return (
    <div className="flex flex-col h-full page-enter">
      <div className="px-5 pt-12 pb-4 border-b border-border">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Поделиться</p>
        <h1 className="text-2xl font-bold">Выгрузка списка</h1>
      </div>

      <div className="content-scroll px-5 pb-10 pt-5">
        {/* Select list */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Список</label>
          <select className="app-input" value={selectedListId} onChange={e => setSelectedListId(e.target.value)}>
            {lists.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </div>

        {/* Format */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Формат</label>
          <div className="flex gap-2">
            {[
              { key: 'text', label: 'Текст', icon: 'MessageSquare' },
              { key: 'table', label: 'Таблица', icon: 'Table' },
              { key: 'csv', label: 'CSV', icon: 'FileSpreadsheet' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFormat(f.key as typeof format)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                  format === f.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}
              >
                <Icon name={f.icon} fallback="File" size={16} />
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        {selectedList && (
          <div className="mb-5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Предпросмотр</label>
            <div className="bg-white rounded-2xl border border-border p-4">
              <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed overflow-hidden" style={{ maxHeight: 220 }}>
                {content}
              </pre>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleShare}
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Icon name="Share2" size={18} />
            Отправить в мессенджер
          </button>
          <button
            onClick={handleCopy}
            className={`w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              copied ? 'bg-accent text-accent-foreground' : 'bg-secondary text-foreground'
            }`}
          >
            <Icon name={copied ? 'Check' : 'Copy'} size={18} />
            {copied ? 'Скопировано!' : 'Скопировать текст'}
          </button>
        </div>

        {/* Share apps */}
        <div className="mt-5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-3">Быстрая отправка</label>
          <div className="grid grid-cols-4 gap-3">
            {[
              { name: 'WhatsApp', color: '#25D366', icon: '💬' },
              { name: 'Telegram', color: '#0088cc', icon: '✈️' },
              { name: 'Email', color: '#EA4335', icon: '📧' },
              { name: 'Ещё', color: '#6B7280', icon: '⋯' },
            ].map(app => (
              <button
                key={app.name}
                onClick={handleShare}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: app.color + '15', border: `1.5px solid ${app.color}25` }}>
                  {app.icon}
                </div>
                <span className="text-xs text-muted-foreground">{app.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}