'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, getDocs,
  deleteDoc, doc, orderBy, query, serverTimestamp
} from 'firebase/firestore';

interface Post {
  id: string;
  content: string;
  authorEmail: string;
  petType: string;
  createdAt: any;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [petType, setPetType] = useState('dog');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[];
    setPosts(data);
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    setLoading(true);
    await addDoc(collection(db, 'posts'), {
      content,
      petType,
      authorEmail: user?.email,
      authorInitial: user?.email?.charAt(0).toUpperCase(),
      createdAt: serverTimestamp(),
    });
    setContent('');
    await fetchPosts();
    setLoading(false);
  };

  const handleDelete = async (postId: string) => {
    await deleteDoc(doc(db, 'posts', postId));
    await fetchPosts();
  };

  const filteredPosts = filter === 'all'
    ? posts
    : posts.filter(p => p.petType === filter);

  const timeAgo = (timestamp: any) => {
    if (!timestamp) return 'เมื่อกี้';
    const seconds = Math.floor((Date.now() - timestamp.toDate()) / 1000);
    if (seconds < 60) return 'เมื่อกี้';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} นาทีที่แล้ว`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(seconds / 86400)} วันที่แล้ว`;
  };

  if (!user) return null;

  return (
    <div className="bg-gray-50 min-h-screen">

      <main className="max-w-4xl mx-auto px-6 py-8">

        {/* Create Post */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">📝 แชร์ประสบการณ์</h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="แบ่งปันประสบการณ์หรือถามคำถามเกี่ยวกับสัตว์เลี้ยง..."
            className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-teal-500 min-h-[100px]"
            rows={3}
          />
          <div className="flex items-center justify-between mt-3">
            <select
              value={petType}
              onChange={(e) => setPetType(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
            >
              <option value="dog">🐶 สุนัข</option>
              <option value="cat">🐱 แมว</option>
              <option value="other">🐾 อื่นๆ</option>
            </select>
            <button
              onClick={handlePost}
              disabled={loading || !content.trim()}
              className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition"
            >
              {loading ? 'กำลังโพสต์...' : 'โพสต์'}
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {[
            { value: 'all', label: '🐾 ทั้งหมด' },
            { value: 'dog', label: '🐶 สุนัข' },
            { value: 'cat', label: '🐱 แมว' },
            { value: 'other', label: '🌿 อื่นๆ' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === f.value
                  ? 'bg-teal-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {filteredPosts.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">🐾</p>
              <p>ยังไม่มีโพสต์ เป็นคนแรกที่แชร์ประสบการณ์!</p>
            </div>
          )}
          {filteredPosts.map(post => (
            <article key={post.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 fade-in">
              <div className="flex gap-3">
                <div className="user-avatar flex-shrink-0">
                  {post.authorEmail?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-gray-900 text-sm">{post.authorEmail}</span>
                      <span className="text-gray-400 text-xs ml-2">· {timeAgo(post.createdAt)}</span>
                    </div>
                    <span className="text-sm">
                      {post.petType === 'dog' ? '🐶' : post.petType === 'cat' ? '🐱' : '🐾'}
                    </span>
                  </div>
                  <p className="text-gray-800 text-sm leading-relaxed">{post.content}</p>
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                    <button className="flex items-center gap-1 text-gray-400 hover:text-teal-600 text-sm transition">
                      ❤️ ถูกใจ
                    </button>
                    <button className="flex items-center gap-1 text-gray-400 hover:text-blue-500 text-sm transition">
                      💬 ความคิดเห็น
                    </button>
                    {post.authorEmail === user.email && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="ml-auto text-red-400 hover:text-red-600 text-sm transition"
                      >
                        🗑️ ลบ
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

      </main>
    </div>
  );
}