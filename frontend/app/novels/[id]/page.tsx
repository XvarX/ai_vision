'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, GitBranch, Edit, BookOpen } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 text-muted-foreground">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          加载中...
        </div>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">小说不存在</h3>
          <p className="text-muted-foreground mb-6">该小说可能已被删除</p>
          <Button onClick={() => router.back()}>返回</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2 hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
        </div>

        <Card className="mb-8 border-2 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          <CardHeader className="pb-6">
            <CardTitle className="text-4xl font-bold">{novel.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-lg">
              {novel.description || '暂无描述'}
            </p>
            <div className="flex items-center gap-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                创建于 {new Date(novel.created_at).toLocaleDateString('zh-CN')}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {chapters.length} 个章节
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-1">主线章节</h2>
            <p className="text-muted-foreground text-sm">故事的官方主线剧情</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/novels/${novel.id}/merge-requests`}>
              <Button variant="outline" className="gap-2">
                <GitBranch className="h-4 w-4" />
                分支提交
              </Button>
            </Link>
            <Link href={`/novels/${novel.id}/merged`}>
              <Button variant="outline" className="gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                已接纳分支
              </Button>
            </Link>
            <Link href={`/novels/${novel.id}/chapters/new`}>
              <Button className="gap-2 shadow-lg hover:shadow-xl transition-all">
                <Plus className="h-4 w-4" />
                添加章节
              </Button>
            </Link>
          </div>
        </div>

        {chapters.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="text-center py-20">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">暂无章节</h3>
              <p className="text-muted-foreground mb-6">来创建第一个章节吧！</p>
              <Link href={`/novels/${novel.id}/chapters/new`}>
                <Button>创建章节</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {chapters.map((chapter) => (
              <Link key={chapter.id} href={`/chapters/${chapter.id}`}>
                <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                            {chapter.chapter_number}
                          </span>
                          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                            {chapter.title}
                          </h3>
                        </div>
                        <p className="text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                          {chapter.content}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {chapter.author_username}
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(chapter.created_at).toLocaleDateString('zh-CN')}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GitBranch className="h-4 w-4" />
                        Fork
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
