import WorldBackground from "@/app/components/world/WorldBackground";
import WorldGrid from "@/app/components/world/WorldGrid";
import WorldHeader from "@/app/components/world/WorldHeader";

export default function WorldPage() {
  return (
    <WorldBackground>
      <WorldHeader />
      <WorldGrid />
    </WorldBackground>
  );
}