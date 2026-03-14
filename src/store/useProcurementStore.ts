import { useState, useEffect } from 'react';
import { PurchaseList, Product, Reminder } from '@/types';

const STORAGE_KEY = 'procurement_lists';
const REMINDERS_KEY = 'procurement_reminders';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function loadLists(): PurchaseList[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getSampleData();
  } catch {
    return getSampleData();
  }
}

function getSampleData(): PurchaseList[] {
  return [
    {
      id: generateId(),
      title: 'Офисные принадлежности',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'active',
      products: [
        { id: generateId(), name: 'Бумага А4', quantity: 5, unit: 'пачка', price: 450, checked: true },
        { id: generateId(), name: 'Ручки шариковые', quantity: 20, unit: 'шт', price: 25, checked: true },
        { id: generateId(), name: 'Степлер', quantity: 2, unit: 'шт', price: 380, checked: false },
        { id: generateId(), name: 'Скрепки', quantity: 3, unit: 'упак', price: 60, checked: false },
      ]
    },
    {
      id: generateId(),
      title: 'Хозяйственные товары',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'done',
      products: [
        { id: generateId(), name: 'Мыло жидкое', quantity: 10, unit: 'шт', price: 120, checked: true },
        { id: generateId(), name: 'Туалетная бумага', quantity: 20, unit: 'рул', price: 45, checked: true },
        { id: generateId(), name: 'Мешки для мусора', quantity: 5, unit: 'упак', price: 180, checked: true },
      ]
    }
  ];
}

export function useProcurementStore() {
  const [lists, setLists] = useState<PurchaseList[]>(loadLists);
  const [currentListId, setCurrentListId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  }, [lists]);

  const currentList = lists.find(l => l.id === currentListId) || null;

  function createList(title: string): PurchaseList {
    const newList: PurchaseList = {
      id: generateId(),
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      products: []
    };
    setLists(prev => [newList, ...prev]);
    setCurrentListId(newList.id);
    return newList;
  }

  function updateList(id: string, updates: Partial<PurchaseList>) {
    setLists(prev => prev.map(l =>
      l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
    ));
  }

  function deleteList(id: string) {
    setLists(prev => prev.filter(l => l.id !== id));
    if (currentListId === id) setCurrentListId(null);
  }

  function addProduct(listId: string, product: Omit<Product, 'id'>) {
    const newProduct: Product = { ...product, id: generateId() };
    setLists(prev => prev.map(l =>
      l.id === listId
        ? { ...l, products: [...l.products, newProduct], updatedAt: new Date().toISOString() }
        : l
    ));
    return newProduct;
  }

  function updateProduct(listId: string, productId: string, updates: Partial<Product>) {
    setLists(prev => prev.map(l =>
      l.id === listId
        ? {
            ...l,
            updatedAt: new Date().toISOString(),
            products: l.products.map(p => p.id === productId ? { ...p, ...updates } : p)
          }
        : l
    ));
  }

  function deleteProduct(listId: string, productId: string) {
    setLists(prev => prev.map(l =>
      l.id === listId
        ? { ...l, products: l.products.filter(p => p.id !== productId), updatedAt: new Date().toISOString() }
        : l
    ));
  }

  function toggleProduct(listId: string, productId: string) {
    setLists(prev => prev.map(l =>
      l.id === listId
        ? {
            ...l,
            updatedAt: new Date().toISOString(),
            products: l.products.map(p =>
              p.id === productId ? { ...p, checked: !p.checked } : p
            )
          }
        : l
    ));
  }

  function setReminder(listId: string, reminder: Omit<Reminder, 'id' | 'listId'>) {
    const newReminder: Reminder = { ...reminder, id: generateId(), listId };
    setLists(prev => prev.map(l =>
      l.id === listId ? { ...l, reminder: newReminder } : l
    ));
  }

  function removeReminder(listId: string) {
    setLists(prev => prev.map(l =>
      l.id === listId ? { ...l, reminder: undefined } : l
    ));
  }

  return {
    lists,
    currentList,
    currentListId,
    setCurrentListId,
    createList,
    updateList,
    deleteList,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProduct,
    setReminder,
    removeReminder,
  };
}
