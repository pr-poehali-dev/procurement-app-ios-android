import { useState } from 'react';
import { PurchaseList } from '@/types';
import Icon from '@/components/ui/icon';

interface Props {
  lists: PurchaseList[];
  onOpenList: (id: string) => void;
  onCreateList: () => void;
  onDeleteList: (id: string) => void;
  onArchiveList: (id: string) => void;
}

export default function HomeScreen({ lists, onOpenList, onCreateList, onDeleteList, onArchiveList }: Props) {
  const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');
  const [swipedId, setSwipedId] = useState<string | null>(null);

  const activeLists = lists.filter(l => l.status !== 'archive');
  const archiveLists = lists.filter(l => l.status === 'archive');
  const shown = activeTab === 'active' ? activeLists : archiveLists;

  function getProgress(list: PurchaseList) {
    if (!list.products.length) return 0;
    return Math.round((list.products.filter(p => p.checked).length / list.products.length) * 100);
  }

  function getTotalSum(list: PurchaseList) {
    return list.products.reduce((sum, p) => sum + (p.price || 0) * p.quantity, 0);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  }

  return (
    <div className="flex flex-col h-full page-enter">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">Закупки</p>
            <h1 className="text-2xl font-bold text-foreground">Мои списки</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">ЗП</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-white rounded-2xl p-3 border border-border">
            <p className="text-2xl font-bold text-primary">{activeLists.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Активных</p>
          </div>
          <div className="flex-1 bg-white rounded-2xl p-3 border border-border">
            <p className="text-2xl font-bold text-foreground">
              {activeLists.reduce((s, l) => s + l.products.filter(p => !p.checked).length, 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Позиций</p>
          </div>
          <div className="flex-1 bg-white rounded-2xl p-3 border border-border">
            <p className="text-2xl font-bold" style={{ color: 'hsl(155 50% 40%)' }}>
              {lists.filter(l => l.status === 'done').length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Завершено</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-3">
        <div className="flex bg-secondary rounded-xl p-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'active'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            Активные ({activeLists.length})
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'archive'
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            Архив ({archiveLists.length})
          </button>
        </div>
      </div>

      {/* Lists */}
      <div className="content-scroll px-5 pb-28">
        {shown.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16 text-center">
            <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mb-4">
              <Icon name="ClipboardList" size={36} className="text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground mb-1">
              {activeTab === 'active' ? 'Нет активных списков' : 'Архив пуст'}
            </p>
            <p className="text-sm text-muted-foreground">
              {activeTab === 'active' ? 'Нажмите + чтобы создать первый список закупок' : 'Завершённые списки появятся здесь'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {shown.map(list => {
              const progress = getProgress(list);
              const total = getTotalSum(list);
              const isOpen = swipedId === list.id;

              return (
                <div key={list.id} className="relative overflow-hidden rounded-2xl">
                  {/* Swipe actions bg */}
                  <div className="absolute inset-y-0 right-0 flex">
                    <button
                      onClick={() => { onArchiveList(list.id); setSwipedId(null); }}
                      className="w-16 flex items-center justify-center"
                      style={{ background: 'hsl(215 15% 55%)' }}
                    >
                      <Icon name="Archive" size={18} className="text-white" />
                    </button>
                    <button
                      onClick={() => { onDeleteList(list.id); setSwipedId(null); }}
                      className="w-16 flex items-center justify-center rounded-r-2xl"
                      style={{ background: 'hsl(0 75% 55%)' }}
                    >
                      <Icon name="Trash2" size={18} className="text-white" />
                    </button>
                  </div>

                  {/* Card */}
                  <div
                    className={`list-card bg-white border border-border rounded-2xl p-4 cursor-pointer relative z-10 transition-transform ${isOpen ? '-translate-x-32' : 'translate-x-0'}`}
                    onClick={() => isOpen ? setSwipedId(null) : onOpenList(list.id)}
                    onContextMenu={e => { e.preventDefault(); setSwipedId(isOpen ? null : list.id); }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-base truncate pr-2">{list.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(list.updatedAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {list.reminder && (
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon name="Bell" size={12} className="text-primary" />
                          </div>
                        )}
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          list.status === 'done' ? 'badge-done' :
                          list.status === 'archive' ? 'badge-archive' :
                          'badge-active'
                        }`}>
                          {list.status === 'done' ? 'Готов' : list.status === 'archive' ? 'Архив' : 'Активен'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground w-8 text-right">{progress}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Icon name="Package" size={13} />
                        <span className="text-xs">{list.products.filter(p => p.checked).length}/{list.products.length} позиций</span>
                      </div>
                      {total > 0 && (
                        <span className="text-sm font-semibold text-foreground">
                          {total.toLocaleString('ru-RU')} ₽
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={onCreateList}
        className="fab absolute bottom-24 right-5 w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center z-20"
      >
        <Icon name="Plus" size={26} />
      </button>
    </div>
  );
}
