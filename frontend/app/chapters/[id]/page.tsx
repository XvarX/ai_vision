'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { chapterService, mergeRequestService, novelService } from '@/lib/services';
import type { Chapter, Novel } from '@/lib/types';

export default function ChapterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = parseInt(params.id as string);

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [novel, setNovel] = useState<Novel | null>(null);
  const [forkChapters, setForkChapters] = useState<Chapter[]>([]);
  const [mergedChapters, setMergedChapters] = useState<Chapter[]>([]);
  const [canSubmit, setCanSubmit] = useState(true);
  const [submitReason, setSubmitReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [chapterId]);

  const loadData = async () => {
    try {
      const chapterData = await chapterService.getChapter(chapterId);
      setChapter(chapterData);

      const novelData = await novelService.getNovel(chapterData.novel_id);
      setNovel(novelData);

      // Check if user can submit this fork chapter
      if (chapterData.branch_type === 'fork') {
        try {
          const submitCheck = await mergeRequestService.canSubmitChapter(chapterId);
          setCanSubmit(submitCheck.can_submit);
          setSubmitReason(submitCheck.reason || '');
        } catch (error) {
          // If error (e.g., not logged in), hide submit button
          setCanSubmit(false);
        }
      }

      // Only load fork chapters for main chapters
      if (chapterData.branch_type === 'main') {
        const forks = await chapterService.getForkChapters(chapterId);
        setForkChapters(forks);

        // Also load merged chapters
        const merged = await chapterService.getMergedChaptersForParent(chapterId);
        setMergedChapters(merged);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFork = async () => {
    if (!chapter) return;

    const title = prompt('请输入新章节标题:', `${chapter.title} (分支)`);
    if (!title) return;

    const content = prompt('请输入新章节内容:', chapter.content);
    if (content === null) return;

    try {
      const newChapter = await chapterService.forkChapter(chapterId, title, content);
      router.push(`/chapters/${newChapter.id}`);
    } catch (error: any) {
      alert(error.response?.data?.detail || '创建分支失败');
    }
  };

  const handleMergeRequest = async () => {
    if (!chapter || !novel) return;

    const comment = prompt('请输入提交说明（可选）:');
    try {
      await mergeRequestService.createMergeRequest(novel.id, {
        from_chapter_id: chapter.id,
        review_comment: comment || undefined,
      });
      alert('分支已提交！');
    } catch (error: any) {
      alert(error.response?.data?.detail || '提交失败');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!chapter || !novel) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500">章节不存在</div>
      </div>
    );
  }

  const isMain = chapter.branch_type === 'main';
  const isFork = chapter.branch_type === 'fork';
  const isMerged = chapter.branch_type === 'merged';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>

          <div className="flex gap-2">
            {isFork && canSubmit && (
              <Button onClick={handleMergeRequest}>
                提交分支
              </Button>
            )}
            {isFork && !canSubmit && submitReason && (
              <Button disabled title={submitReason}>
                {submitReason}
              </Button>
            )}
            <Button onClick={handleFork} variant="outline">
              <GitBranch className="h-4 w-4 mr-2" />
              写分支
            </Button>
            <Link href={`/chapters/${chapter.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </Button>
            </Link>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center gap-2 mb-2">
              {isMain && <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">主线</span>}
              {isFork && <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded">分支</span>}
              {isMerged && <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">已合并</span>}
            </div>
            <h1 className="text-3xl font-bold mb-2">
              第{chapter.chapter_number}章 - {chapter.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              作者：{chapter.author_username} · {' '}
              {new Date(chapter.created_at).toLocaleDateString('zh-CN')}
            </p>
            {chapter.parent_chapter_title && (
              <p className="text-sm text-gray-500 mt-2">
                分支自：{chapter.parent_chapter_title}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
              {chapter.content}
            </div>
          </CardContent>
        </Card>

        {/* Show fork and merged chapters if this is a main chapter */}
        {isMain && (forkChapters.length > 0 || mergedChapters.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Left side: Unmerged fork chapters */}
            {forkChapters.length > 0 && (
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold mb-4">未被接纳的分支章节</h3>
                <div className="space-y-4">
                  {forkChapters.map((fork) => (
                    <Link key={fork.id} href={`/chapters/${fork.id}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded">分支</span>
                                <h4 className="text-lg font-semibold">{fork.title}</h4>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                                {fork.content}
                              </p>
                              <p className="text-sm text-gray-500 mt-2">
                                作者：{fork.author_username} · {' '}
                                {new Date(fork.created_at).toLocaleDateString('zh-CN')}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Right side: Merged chapters */}
            {mergedChapters.length > 0 && (
              <div className="lg:col-span-1">
                <h3 className="text-xl font-bold mb-4">已接纳的分支</h3>
                <div className="space-y-3">
                  {mergedChapters.map((merged) => (
                    <Link key={merged.id} href={`/chapters/${merged.id}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200 dark:border-green-800">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">已接纳</span>
                            <h4 className="text-sm font-semibold line-clamp-1">{merged.title}</h4>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 line-clamp-2 text-sm">
                            {merged.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {merged.author_username}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
