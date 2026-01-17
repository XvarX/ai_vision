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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0di0yaDJ2MmgtMnptMC0zaDJ2MmgtMnptMC0zaDJ2MmgtMnptLTItMmgydjJoLTJ6bTAtMmgydjJoLTJ6bTAtMmgydjJoLTJ6bS0yLTJoMnYyaC0yem0wLTJoMnYyaC0yem0wLTJoMnYyaC0yem0wLTJoMnYyaC0yem0tMi0yaDJ2MmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48">
          <div className="text-center space-y-10">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-base">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
              </span>
              <span className="font-medium">共同编织无限宇宙</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Vision
              </span>
            </h1>

            <p className="text-2xl md:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
              万物互联，故事永生<br className="hidden md:block" />
              <span className="text-xl md:text-2xl text-gray-400">
                与万千创作者一同构建宏大的多元宇宙，让每个创意都成为永恒
              </span>
            </p>

            <div className="flex justify-center pt-8">
              <Link href="/novels">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-2xl hover:shadow-purple-500/50 transition-all px-16 py-7 text-xl font-semibold rounded-full border border-white/20">
                  开启创造之旅
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
            </div>

            <p className="text-sm text-gray-500">
              加入我们，已有一万名创作者在等待你的灵感
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Features */}
      <div className="relative bg-gradient-to-b from-background to-muted/30 py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              重塑创作边界
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              在这里，每一个故事都是无限多元宇宙的起点
              <br />
              每一次创作都是对永恒的探索
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 mb-24">
            <Card className="group relative overflow-hidden border-2 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-3">创世之力</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  你是造物主，用笔尖划破混沌，构建宏大的世界观与史诗主线。每一个决定都将影响整个宇宙的命运。
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-2 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <GitBranch className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-3">无限分支</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  每个章节都是无限可能性的种子。探索平行宇宙、配角故事、前传后传，让创意在无数时空中绽放。
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-2 hover:border-pink-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-pink-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-3">众神归一</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  万千创作者的智慧在此汇聚。优秀的分支将融入正史，共同铸就永恒的传奇宇宙。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Recent Novels */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-3">正在诞生的宇宙</h2>
            <p className="text-muted-foreground text-lg">探索这些正在成长的多元世界</p>
          </div>
          <Link href="/novels">
            <Button variant="outline" className="gap-2 text-base px-6 py-3 h-auto">
              探索更多
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-32">
            <div className="inline-flex items-center gap-3 text-muted-foreground text-lg">
              <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>正在加载宇宙数据...</span>
            </div>
          </div>
        ) : novels.length === 0 ? (
          <Card className="border-2 border-dashed bg-muted/30">
            <CardContent className="text-center py-32">
              <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 mb-6">
                <BookOpen className="h-12 w-12 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3">等待第一个宇宙的诞生</h3>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                成为创世者，用你的想象力开启第一个多元宇宙
              </p>
              <Link href="/novels/new">
                <Button className="px-8 py-6 text-lg shadow-lg">
                  创造第一个宇宙
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {novels.map((novel) => (
              <Link key={novel.id} href={`/novels/${novel.id}`}>
                <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer h-full border-2 hover:border-purple-500/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="h-1.5 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  <CardHeader className="relative">
                    <CardTitle className="line-clamp-1 group-hover:text-purple-600 transition-colors text-2xl">
                      {novel.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-muted-foreground line-clamp-3 mb-6 leading-relaxed text-base">
                      {novel.description || '暂无描述'}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        创建于 {new Date(novel.created_at).toLocaleDateString('zh-CN')}
                      </span>
                      <span className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-medium">
                        进入宇宙
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
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
