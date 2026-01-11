'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { chapterService, novelService } from '@/lib/services';
import type { Chapter, Novel } from '@/lib/types';

export default function MergedChaptersPage() {
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
        chapterService.getMergedChapters(novelId),
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
            <CardTitle className="text-2xl">{novel.title} - 已接纳的分支章节</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              这些分支章节已被作者接纳为正史的一部分
            </p>
          </CardContent>
        </Card>

        {chapters.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-gray-500">
              暂无已接纳的分支章节
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
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">已接纳</span>
                          <h3 className="text-lg font-semibold">
                            第{chapter.chapter_number}章分支 - {chapter.title}
                          </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                          {chapter.content}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          作者：{chapter.author_username} · {' '}
                          {new Date(chapter.created_at).toLocaleDateString('zh-CN')}
                        </p>
                        {chapter.parent_chapter_title && (
                          <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                            源自：{chapter.parent_chapter_title}
                          </p>
                        )}
                      </div>
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
