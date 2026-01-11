'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, GitBranch, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { novelService, chapterService } from '@/lib/services';
import type { Novel, Chapter } from '@/lib/types';

export default function NovelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const novelId = parseInt(params.id as string);

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [novelId]);

  const loadData = async () => {
    try {
      const [novelData, chaptersData] = await Promise.all([
        novelService.getNovel(novelId),
        chapterService.getMainChapters(novelId),
      ]);
      setNovel(novelData);
      setChapters(chaptersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500">小说不存在</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">{novel.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {novel.description || '暂无描述'}
            </p>
            <p className="text-sm text-gray-500 mt-4">
              创建于 {new Date(novel.created_at).toLocaleDateString('zh-CN')}
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">主线章节</h2>
          <div className="flex gap-2">
            <Link href={`/novels/${novel.id}/merge-requests`}>
              <Button variant="outline">
                分支提交
              </Button>
            </Link>
            <Link href={`/novels/${novel.id}/merged`}>
              <Button variant="outline">
                已接纳分支
              </Button>
            </Link>
            <Link href={`/novels/${novel.id}/chapters/new`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                添加章节
              </Button>
            </Link>
          </div>
        </div>

        {chapters.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-gray-500">
              暂无章节，来创建第一个吧！
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {chapters.map((chapter) => (
              <Link key={chapter.id} href={`/chapters/${chapter.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          第{chapter.chapter_number}章 - {chapter.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                          {chapter.content}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          作者：{chapter.author_username} · {' '}
                          {new Date(chapter.created_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <GitBranch className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
