import { notFound } from 'next/navigation';
import { BidGameView } from '~/components/bid/bid-game-view';

export default async function BidGamePage({ params }: { params: Promise<{ bidGameId: string }> }) {
  const { bidGameId } = await params;
  const id = Number(bidGameId);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <BidGameView bidGameId={id} />;
}
