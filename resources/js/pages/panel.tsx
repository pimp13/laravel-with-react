import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";

interface LaravelResponseForTest {
    message?: string;
    errors?: any;
    success?: boolean;
    data?: any;
}

export default function Panel() {
    const [response, setResponse] = useState<LaravelResponseForTest | null>(
        null,
    );

    useEffect(() => {
        fetch("/api/v1/users", {
            headers: {
                "content-type": "application/json",
            },
            method: "get",
            // body: JSON.stringify({
            //     email: "pouya@gmail.com",
            //     name: "pouya",
            //     password: "A1234a1234",
            // }),
        })
            .then((d) => d.json())
            .then((d) => setResponse(d))
            .catch(console.error);
    }, []);

    if (!response) return <p>Loading...</p>;

    return (
        <>
            <Head title="Panel" />
            <div>
                {response?.message && (
                    <p className="text-neutral-700">{response.message}</p>
                )}

                {response?.errors && (
                    <ul>
                        <li>
                            <p>{response?.errors?.email}</p>
                        </li>
                        <li>
                            <p>{response?.errors?.name}</p>
                        </li>
                        <li>
                            <p>{response?.errors?.password}</p>
                        </li>
                    </ul>
                )}
            </div>
        </>
    );
}
