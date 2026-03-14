import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface Props {
  appIcon: string;
}

export default function SettingsScreen({ appIcon }: Props) {
  const [notifications, setNotifications] = useState(true);
  const [autoArchive, setAutoArchive] = useState(false);
  const [showPrices, setShowPrices] = useState(true);
  const [currency, setCurrency] = useState('RUB');

  function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
      <div
        className="toggle-track cursor-pointer"
        style={{ background: value ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}
        onClick={() => onChange(!value)}
      >
        <div className="toggle-thumb" style={{ transform: value ? 'translateX(20px)' : 'none' }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full page-enter">
      <div className="px-5 pt-12 pb-4 border-b border-border">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Профиль</p>
        <h1 className="text-2xl font-bold">Настройки</h1>
      </div>

      <div className="content-scroll px-5 pb-10 pt-5">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-border p-4 mb-5 flex items-center gap-4">
          <img
            src={appIcon}
            alt="App icon"
            className="w-16 h-16 rounded-2xl object-cover border border-border"
          />
          <div>
            <p className="font-bold text-base">ЗакупПро</p>
            <p className="text-sm text-muted-foreground">Управление закупками</p>
            <p className="text-xs text-primary mt-1 font-medium">Версия 1.0</p>
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Уведомления</p>
          <div className="bg-white rounded-2xl border border-border divide-y divide-border">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon name="Bell" size={15} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Напоминания</p>
                  <p className="text-xs text-muted-foreground">Push-уведомления</p>
                </div>
              </div>
              <Toggle value={notifications} onChange={setNotifications} />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Icon name="Archive" size={15} style={{ color: 'hsl(155 50% 40%)' }} />
                </div>
                <div>
                  <p className="text-sm font-medium">Автоархив</p>
                  <p className="text-xs text-muted-foreground">Завершённые → архив</p>
                </div>
              </div>
              <Toggle value={autoArchive} onChange={setAutoArchive} />
            </div>
          </div>
        </div>

        {/* Display */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Отображение</p>
          <div className="bg-white rounded-2xl border border-border divide-y divide-border">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <Icon name="BadgeRussianRuble" size={15} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Показывать цены</p>
              </div>
              <Toggle value={showPrices} onChange={setShowPrices} />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <Icon name="Globe" size={15} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Валюта</p>
              </div>
              <select
                className="text-sm font-medium bg-secondary px-3 py-1.5 rounded-lg border-none outline-none"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
              >
                <option value="RUB">₽ Рубль</option>
                <option value="USD">$ Доллар</option>
                <option value="EUR">€ Евро</option>
                <option value="KZT">₸ Тенге</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Данные</p>
          <div className="bg-white rounded-2xl border border-border divide-y divide-border">
            <button className="flex items-center gap-3 px-4 py-3.5 w-full text-left">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <Icon name="Download" size={15} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-medium flex-1">Экспорт всех данных</p>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </button>
            <button className="flex items-center gap-3 px-4 py-3.5 w-full text-left">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Icon name="Trash2" size={15} className="text-destructive" />
              </div>
              <p className="text-sm font-medium text-destructive flex-1">Очистить архив</p>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* About */}
        <div className="bg-secondary/50 rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground">ЗакупПро v1.0 · Управление закупками на предприятии</p>
          <p className="text-xs text-muted-foreground mt-1">Все данные хранятся локально на устройстве</p>
        </div>
      </div>
    </div>
  );
}
