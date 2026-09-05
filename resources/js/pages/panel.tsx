import { Head } from "@inertiajs/react";
import { SubmitEvent } from "react";

interface LaravelResponseForTest {
    message?: string;
    errors?: any;
    success?: boolean;
    data?: any;
}

export default function Panel() {
    const handleCreateUser = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Hello WOORLD");
    };

    return (
        <>
            <Head title="Panel" />
            <div>
                <div>Hello world</div>

                <form
                    onSubmit={(e) => handleCreateUser(e)}
                    className="bg-stone-50 flex flex-col gap-4 w-50 mt-10 container mx-5"
                >
                    <input className="border" placeholder="name" />
                    <input className="border" placeholder="email" />
                    <input className="border" placeholder="password" />

                    <button className="border bg-stone-100 rounded">
                        Submit
                    </button>
                </form>
            </div>
        </>
    );
}
