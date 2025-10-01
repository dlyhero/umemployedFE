import InterviewDetailPage from '@/components/interviews/InterviewDetailPage';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InterviewDetail({ params }: PageProps) {
  const { id } = await params;
  return <InterviewDetailPage interviewId={id} />;
}