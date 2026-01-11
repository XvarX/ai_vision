'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Users, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { novelService } from '@/lib/services';
import type { Novel } from '@/lib/types';

export default function HomePage() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNovels();
  }, []);

  const loadNovels = async () => {
    try {
      const data = await novelService.getNovels();
      setNovels(data);
    } catch (error) {
      console.error('Failed to load novels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">AI Vision</h1>
          <p className="text-xl mb-8 text-blue-100">
            类似 GitHub 的协作小说平台 - 群策群力，共创精彩故事
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/novels">
              <Button className="bg-white text-blue-600 hover:bg-gray-100">
                浏览小说
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                加入我们
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <BookOpen className="h-10 w-10 text-blue-600 mb-4" />
              <CardTitle>主线创作</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                作者创建主线故事，构建世界观和核心情节
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <GitBranch className="h-10 w-10 text-purple-600 mb-4" />
              <CardTitle>分支协作</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                读者可以 fork 章节，创作配角故事、平行宇宙或背景补充
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-green-600 mb-4" />
              <CardTitle>合并审核</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                提交 Merge Request，优秀作品可被作者认可为正史
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Novels */}
        <div>
          <h2 className="text-2xl font-bold mb-6">最新小说</h2>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">加载中...</div>
          ) : novels.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无小说，来创建第一个吧！
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {novels.map((novel) => (
                <Link key={novel.id} href={`/novels/${novel.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{novel.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                        {novel.description || '暂无描述'}
                      </p>
                      <p className="text-sm text-gray-500 mt-4">
                        {new Date(novel.created_at).toLocaleDateString('zh-CN')}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
