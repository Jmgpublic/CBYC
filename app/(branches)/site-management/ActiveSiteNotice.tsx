import Link from "next/link";

/** Shown atop filtered Site Management pages so staff know the scope and how to change it. */
export function ActiveSiteNotice({ siteName }: { siteName: string | null }) {
  return (
    <p className="text-sm text-muted-foreground">
      {siteName ? (
        <>
          Showing <span className="font-medium text-foreground">{siteName}</span>.{" "}
        </>
      ) : (
        <>Showing all sites. </>
      )}
      <Link href="/site-management" className="underline underline-offset-2 hover:text-foreground">
        Change site
      </Link>
    </p>
  );
}
