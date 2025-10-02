'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminTabs({ onTabChange }) {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'drafts' ? 'drafts' : 'published');

  // อัปเดต parent ทุกครั้งที่ activeTab เปลี่ยน
  useEffect(() => {
    onTabChange(activeTab);
  }, [activeTab, onTabChange]);

  return (
    <div className="mb-4 flex gap-4 text-sm font-medium">
      <button
        onClick={() => setActiveTab('published')}
        className={`pb-1 cursor-pointer ${
          activeTab === 'published'
            ? 'border-b-2 border-purple-600 text-purple-600 font-medium'
            : 'text-gray-500 hover:text-black'
        }`}
      >
        เผยแพร่แล้ว
      </button>
      <button
        onClick={() => setActiveTab('drafts')}
        className={`pb-1 cursor-pointer ${
          activeTab === 'drafts'
            ? 'border-b-2 border-purple-600 text-purple-600 font-medium'
            : 'text-gray-500 hover:text-black'
        }`}
      >
        ฉบับร่าง
      </button>
    </div>
  );
}
