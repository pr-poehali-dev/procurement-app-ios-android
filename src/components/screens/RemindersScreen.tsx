import { useState } from 'react';
import { PurchaseList } from '@/types';
import Icon from '@/components/ui/icon';

interface Props {
  lists: PurchaseList[];
  onSetReminder: (listId: string, date: string, time: string, label: string, enabled: boolean) => void;
  onRemoveReminder: (listId: string) => void;
  preselectedListId?: string | null;
}

export default function RemindersScreen({ lists, onSetReminder, onRemoveReminder, preselectedListId }: Props) {
  const [selectedListId, setSelectedListId] = useState(preselectedListId || '');
  const [date, setDate] = useState(getTomorrow());
  const [time, setTime] = useState('09:00');
  const [label, setLabel] = useState('Напоминание о закупке');
  const [saved, setSaved] = useState(false);

  function getTomorrow() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  function handleSave() {
    if (!selectedListId) return;
    onSetReminder(selectedListId, date, time, label, true);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const listsWithReminders = lists.filter(l => l.reminder);
  const activeLists = lists.filter(l => l.status !== 'archive');

  function formatDateTime(date: string, time: string) {
    const d = new Date(`${date}T${time}`);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' }) + ' в ' + time;
  }

  return (
    <div className="flex flex-col h-full page-enter">
      <div className="px-5 pt-12 pb-4 border-b border-border">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Уведомления</p>
        <h1 className="text-2xl font-bold">Напоминания</h1>
      </div>

      <div className="content-scroll px-5 pb-10 pt-5">
        {/* Create reminder */}
        <div className="bg-white rounded-2xl border border-border p-4 mb-5">
          <p className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Icon name="BellPlus" size={16} className="text-primary" />
            Новое напоминание
          </p>

          <div className="mb-3">
            <label className="text-xs font-medium text-muted-foreground block mb-1">Список закупок</label>
            <select
              className="app-input"
              value={selectedListId}
              onChange={e => setSelectedListId(e.target.value)}
            >
              <option value="">Выберите список...</option>
              {activeLists.map(l => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="text-xs font-medium text-muted-foreground block mb-1">Текст напоминания</label>
            <input
              className="app-input"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Напоминание о закупке"
            />
          </div>

          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground block mb-1">Дата</label>
              <input
                className="app-input"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground block mb-1">Время</label>
              <input
                className="app-input"
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Quick time presets */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {[
              { label: '09:00', val: '09:00' },
              { label: '12:00', val: '12:00' },
              { label: '15:00', val: '15:00' },
              { label: '18:00', val: '18:00' },
            ].map(t => (
              <button
                key={t.val}
                onClick={() => setTime(t.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  time === t.val ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={!selectedListId}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
              saved
                ? 'bg-accent text-accent-foreground'
                : 'bg-primary text-primary-foreground disabled:opacity-40'
            }`}
          >
            {saved ? '✓ Напоминание сохранено' : 'Установить напоминание'}
          </button>
        </div>

        {/* Existing reminders */}
        {listsWithReminders.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Установленные ({listsWithReminders.length})
            </p>
            <div className="flex flex-col gap-3">
              {listsWithReminders.map(list => (
                <div key={list.id} className="bg-white rounded-2xl border border-border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{list.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{list.reminder!.label}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Toggle */}
                      <div
                        className="toggle-track"
                        style={{ background: list.reminder!.enabled ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}
                        onClick={() => onSetReminder(list.id, list.reminder!.date, list.reminder!.time, list.reminder!.label, !list.reminder!.enabled)}
                      >
                        <div className="toggle-thumb" style={{ transform: list.reminder!.enabled ? 'translateX(20px)' : 'none' }} />
                      </div>
                      <button
                        onClick={() => onRemoveReminder(list.id)}
                        className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Icon name="X" size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${list.reminder!.enabled ? 'badge-active' : 'badge-archive'}`}>
                      <Icon name="Clock" size={11} />
                      {formatDateTime(list.reminder!.date, list.reminder!.time)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {listsWithReminders.length === 0 && (
          <div className="text-center pt-8">
            <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-3">
              <Icon name="BellOff" size={28} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Нет активных напоминаний</p>
          </div>
        )}
      </div>
    </div>
  );
}
