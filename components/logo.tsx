import Link from "next/link";

export default function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="text-xl font-semibold tracking-tight">
      Orça<span className="text-accent">Car</span>
    </Link>
  );
}
