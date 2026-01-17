'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { novelService } from '@/lib/services';
import type { Novel } from '@/lib/types';

export default function NovelsPage() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredNovels = novels.filter(novel =>
    novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (novel.description && novel.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">小说列表</h1>
            <p className="text-muted-foreground">探索共创的精彩故事</p>
          </div>
          <Link href="/novels/new">
            <Button className="gap-2 shadow-lg hover:shadow-xl transition-all">
              <Plus className="h-4 w-4" />
              创建小说
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="搜索小说标题或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base border-2 focus:border-primary transition-colors"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              加载中...
            </div>
          </div>
        ) : filteredNovels.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="text-center py-20">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? '没有找到匹配的小说' : '暂无小说'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? '尝试使用其他关键词搜索' : '来创建第一个故事吧！'}
              </p>
              {!searchQuery && (
                <Link href="/novels/new">
                  <Button>创建小说</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              找到 {filteredNovels.length} 本小说
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNovels.map((novel) => (
                <Link key={novel.id} href={`/novels/${novel.id}`}>
                  <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer h-full border-2 hover:border-primary/50 overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    <CardHeader>
                      <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors text-xl">
                        {novel.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                        {novel.description || '暂无描述'}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          创建于 {new Date(novel.created_at).toLocaleDateString('zh-CN')}
                        </span>
                        <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          阅读
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
