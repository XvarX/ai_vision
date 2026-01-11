'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { novelService, mergeRequestService } from '@/lib/services';
import type { Novel, MergeRequest } from '@/lib/types';

export default function MergeRequestsPage() {
  const params = useParams();
  const router = useRouter();
  const novelId = parseInt(params.id as string);

  const [novel, setNovel] = useState<Novel | null>(null);
  const [mergeRequests, setMergeRequests] = useState<MergeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [novelId]);

  const loadData = async () => {
    try {
      const [novelData, mrs] = await Promise.all([
        novelService.getNovel(novelId),
        mergeRequestService.getMergeRequests(novelId),
      ]);
      setNovel(novelData);
      setMergeRequests(mrs);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (mrId: number) => {
    try {
      await mergeRequestService.approveMergeRequest(mrId);
      alert('已接纳该分支！');
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.detail || '操作失败');
    }
  };

  const handleReject = async (mrId: number) => {
    const comment = prompt('请输入拒绝理由（可选）:');
    try {
      await mergeRequestService.rejectMergeRequest(mrId, comment || undefined);
      alert('已拒绝该分支');
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.detail || '操作失败');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">待审核</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">已接纳</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">已拒绝</span>;
      default:
        return null;
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
            <CardTitle className="text-2xl">{novel.title} - 分支提交</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              审核读者提交的分支章节
            </p>
          </CardContent>
        </Card>

        {mergeRequests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-gray-500">
              暂无分支提交
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {mergeRequests.map((mr) => (
              <Card key={mr.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(mr.status)}
                        <h3 className="text-lg font-semibold">
                          {mr.from_chapter_title || `章节 #${mr.from_chapter_id}`}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        提交者：{mr.requester_username || `用户 #${mr.requested_by}`} · {' '}
                        {new Date(mr.created_at).toLocaleDateString('zh-CN')}
                      </p>
                      {mr.review_comment && (
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          说明：{mr.review_comment}
                        </p>
                      )}
                      {mr.status === 'rejected' && mr.review_comment && (
                        <p className="text-red-600 dark:text-red-400 text-sm">
                          拒绝理由：{mr.review_comment}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {mr.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleApprove(mr.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          接纳
                        </Button>
                        <Button
                          onClick={() => handleReject(mr.id)}
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          拒绝
                        </Button>
                        <Link href={`/chapters/${mr.from_chapter_id}`}>
                          <Button variant="outline">
                            查看章节
                          </Button>
                        </Link>
                      </>
                    )}
                    {mr.status !== 'pending' && (
                      <Link href={`/chapters/${mr.from_chapter_id}`}>
                        <Button variant="outline">
                          查看章节
                        </Button>
                      </Link>
                    )}
                  </div>

                  {mr.reviewed_at && (
                    <p className="text-sm text-gray-500 mt-4">
                      审核时间：{new Date(mr.reviewed_at).toLocaleDateString('zh-CN')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
