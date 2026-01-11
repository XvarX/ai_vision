'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { chapterService } from '@/lib/services';

export default function NewChapterPage() {
  const params = useParams();
  const router = useRouter();
  const novelId = parseInt(params.id as string);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [chapterNumber, setChapterNumber] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const chapter = await chapterService.createChapter(novelId, {
        title,
        content,
        chapter_number: chapterNumber,
        branch_type: 'main',
      });
      router.push(`/chapters/${chapter.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || '创建失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">创建新章节</h1>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="chapterNumber" className="block text-sm font-medium mb-2">
                    章节号 *
                  </label>
                  <Input
                    id="chapterNumber"
                    type="number"
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(parseInt(e.target.value))}
                    required
                    min={1}
                  />
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2">
                    章节标题 *
                  </label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="请输入章节标题"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-2">
                  内容 *
                </label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  placeholder="请输入章节内容..."
                  rows={15}
                  className="font-mono"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? '创建中...' : '创建'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
