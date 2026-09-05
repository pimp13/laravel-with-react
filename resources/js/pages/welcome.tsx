import { Head, Link } from "@inertiajs/react";

export default function Welcome() {
    fetch("/api/v1/users")
        .then((r) => r.json())
        .then((d) => console.log(d))
        .catch((e) => console.log("Err =>", e));
    return (
        <>
            <Head title="Welcome" />
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-[335px] flex-col-reverse lg:max-w-4xl lg:flex-row">
                        <div className="text-stone-50">Hello</div>
                        <Link className="text-stone-50" href="/panel">Panel Page</Link>

                        <div>
                            <input
                                type="text"
                                id="name"
                                className="border border-white/50 rounded-md px-10 py-1"
                            />
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
