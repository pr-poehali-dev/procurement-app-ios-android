import { useState } from 'react';
import { Screen } from '@/types';
import { useProcurementStore } from '@/store/useProcurementStore';
import HomeScreen from '@/components/screens/HomeScreen';
import CreateScreen from '@/components/screens/CreateScreen';
import EditorScreen from '@/components/screens/EditorScreen';
import RemindersScreen from '@/components/screens/RemindersScreen';
import ExportScreen from '@/components/screens/ExportScreen';
import SettingsScreen from '@/components/screens/SettingsScreen';
import Icon from '@/components/ui/icon';
import { Product } from '@/types';

const APP_ICON = 'https://cdn.poehali.dev/projects/8e0e8e44-874b-4e2e-8135-5b103e03c2e5/files/d40692ee-d9e6-4135-96db-9d212d5563c5.jpg';

export default function Index() {
  const [screen, setScreen] = useState<Screen>('home');
  const [exportListId, setExportListId] = useState<string | null>(null);
  const [reminderListId, setReminderListId] = useState<string | null>(null);

  const store = useProcurementStore();

  function openList(id: string) {
    store.setCurrentListId(id);
    setScreen('editor');
  }

  function goCreate() {
    setScreen('create');
  }

  function handleCreateSave(title: string, products: Omit<Product, 'id'>[]) {
    const newList = store.createList(title);
    products.forEach(p => store.addProduct(newList.id, p));
    store.setCurrentListId(newList.id);
    setScreen('editor');
  }

  function handleArchive(id: string) {
    const list = store.lists.find(l => l.id === id);
    store.updateList(id, { status: list?.status === 'archive' ? 'active' : 'archive' });
  }

  function openExport(listId?: string) {
    setExportListId(listId || null);
    setScreen('export');
  }

  function openReminder(listId?: string) {
    setReminderListId(listId || null);
    setScreen('reminders');
  }

  const navItems = [
    { id: 'home', icon: 'LayoutGrid', label: 'Списки' },
    { id: 'reminders', icon: 'Bell', label: 'Напоминания' },
    { id: 'export', icon: 'Share2', label: 'Выгрузка' },
    { id: 'settings', icon: 'Settings', label: 'Настройки' },
  ] as const;

  const showNav = ['home', 'reminders', 'export', 'settings'].includes(screen);

  return (
    <div className="min-h-dvh bg-slate-200 flex items-center justify-center p-4">
      <div className="mobile-shell shadow-2xl rounded-3xl overflow-hidden border border-white/50" style={{ boxShadow: '0 30px 90px rgba(0,0,0,0.18)' }}>
        <div className="flex-1 overflow-hidden relative">
          {screen === 'home' && (
            <HomeScreen
              lists={store.lists}
              onOpenList={openList}
              onCreateList={goCreate}
              onDeleteList={store.deleteList}
              onArchiveList={handleArchive}
            />
          )}

          {screen === 'create' && (
            <CreateScreen
              onSave={handleCreateSave}
              onCancel={() => setScreen('home')}
            />
          )}

          {screen === 'editor' && store.currentList && (
            <EditorScreen
              list={store.currentList}
              onBack={() => setScreen('home')}
              onToggleProduct={id => store.toggleProduct(store.currentListId!, id)}
              onUpdateProduct={(id, updates) => store.updateProduct(store.currentListId!, id, updates)}
              onDeleteProduct={id => store.deleteProduct(store.currentListId!, id)}
              onAddProduct={p => store.addProduct(store.currentListId!, p)}
              onUpdateList={updates => store.updateList(store.currentListId!, updates)}
              onExport={() => openExport(store.currentListId!)}
              onReminder={() => openReminder(store.currentListId!)}
            />
          )}

          {screen === 'reminders' && (
            <RemindersScreen
              lists={store.lists}
              onSetReminder={(listId, date, time, label, enabled) =>
                store.setReminder(listId, { date, time, label, enabled })
              }
              onRemoveReminder={store.removeReminder}
              preselectedListId={reminderListId}
            />
          )}

          {screen === 'export' && (
            <ExportScreen
              lists={store.lists}
              preselectedListId={exportListId}
            />
          )}

          {screen === 'settings' && (
            <SettingsScreen appIcon={APP_ICON} />
          )}
        </div>

        {showNav && (
          <div className="shrink-0 bg-white border-t border-border">
            <div className="flex items-center px-2 pt-2 pb-4">
              {navItems.map(item => {
                const active = screen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setScreen(item.id as Screen)}
                    className={`bottom-nav-item flex-1 flex flex-col items-center gap-1 py-1 rounded-xl transition-all ${active ? 'active' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-primary/10' : ''}`}>
                      <Icon
                        name={item.icon}
                        size={20}
                        className={active ? 'text-primary' : 'text-muted-foreground'}
                      />
                    </div>
                    <span className={`text-[10px] font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
