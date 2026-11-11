/**
 * Standard placeholder for unbuilt routes (Prompt 2, section 4).
 * Use it for every sub-function page that has no active logic yet.
 */
export function TBDPlaceholder({ featureName }: { featureName: string }) {
  return (
    <div className="p-8 text-center text-muted-foreground border rounded-lg">
      <p className="text-lg font-medium">{featureName}</p>
      <p className="text-sm mt-1">This feature is under development.</p>
    </div>
  );
}
