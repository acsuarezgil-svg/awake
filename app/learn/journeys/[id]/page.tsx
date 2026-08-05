import JourneyOverview from "./JourneyOverview";

export default async function JourneyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JourneyOverview id={id} />;
}
