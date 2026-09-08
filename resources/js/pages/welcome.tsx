import { Head, Link } from "@inertiajs/react";

export default function Welcome() {
    fetch("/api/v1/users")
        .then((r) => r.json())
        .then((d) => console.log(d))
        .catch((e) => console.log("Err =>", e));
    return (
        <>
            <Head title="Welcome" />
            <div className="flex items-center gap-6">
                <Link className="text-stone-700" href="/">Home</Link>
                <Link className="text-stone-700" href="/blog">Blog</Link>
                <Link className="text-stone-700" href="/panel">Panel Page</Link>
                <Link className="text-stone-700" href="/panel/create-article">Create Article</Link>
            </div>
        </>
    );
}
