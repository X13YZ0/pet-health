'use client';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface Post {
  id: string;
  content: string;
  petType: string;
  createdAt: any;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchMyPosts();
  }, [user]);

  const fetchMyPosts = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'posts'),
        where('authorEmail', '==', user.email),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDelete = async (postId: string) => {
    await deleteDoc(doc(db, 'posts', postId));
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

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
      <main className="max-w-3xl mx-auto px-6 py-8">

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                {user.displayName || user.email?.split('@')[0]}
              </h1>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <p className="text-teal-600 text-sm mt-1">
                🐾 สมาชิก Pet Health
              </p>
            </div>
            <button
              onClick={() => { signOut(auth); router.push('/login'); }}
              className="bg-red-50 text-red-500 border border-red-200 px-4 py-2 rounded-lg text-sm hover:bg-red-100 transition"
            >
              ออกจากระบบ
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-teal-600">{posts.length}</p>
              <p className="text-xs text-gray-500 mt-1">โพสต์ทั้งหมด</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {posts.filter(p => p.petType === 'dog').length}
              </p>
              <p className="text-xs text-gray-500 mt-1">🐶 สุนัข</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">
                {posts.filter(p => p.petType === 'cat').length}
              </p>
              <p className="text-xs text-gray-500 mt-1">🐱 แมว</p>
            </div>
          </div>
        </div>

        {/* My Posts */}
        <div>
          <h2 className="font-bold text-gray-900 mb-4">📝 โพสต์ของฉัน</h2>

          {loading && (
            <div className="text-center py-8 text-gray-400">กำลังโหลด...</div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-4xl mb-3">🐾</p>
              <p className="text-gray-400">ยังไม่มีโพสต์</p>
              <button
                onClick={() => router.push('/community')}
                className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700 transition"
              >
                ไปโพสต์เลย
              </button>
            </div>
          )}

          <div className="space-y-4">
            {posts.map(post => (
              <article key={post.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">
                        {post.petType === 'dog' ? '🐶' : post.petType === 'cat' ? '🐱' : '🐾'}
                      </span>
                      <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed">{post.content}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-400 hover:text-red-600 text-sm flex-shrink-0 transition"
                  >
                    🗑️
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}