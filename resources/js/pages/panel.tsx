import { Head } from "@inertiajs/react";
import { SubmitEvent, useEffect, useState } from "react";

interface LaravelformResponseForTest {
    message?: string;
    errors?: any;
    success?: boolean;
    data?: any;
}

interface UsersDataFromLaravel {
    success?: boolean;
    message?: string;
    data?: {
        [key: string]: any;
    }[];
}

type CreateNewUserFormData = {
    name: string;
    email: string;
    password: string;
    isActive: boolean;
};

export default function Panel() {
    const [formValues, setFormValues] = useState<CreateNewUserFormData>({
        name: "",
        email: "",
        password: "",
        isActive: true,
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formResponse, setFormResponse] =
        useState<LaravelformResponseForTest>({
            data: {},
            errors: {},
            success: false,
            message: "",
        });
    const [usersData, setUsersData] = useState<UsersDataFromLaravel | null>(
        null,
    );

    useEffect(() => {
        fetch("/api/v1/users")
            .then((r) => r.json())
            .then(setUsersData)
            .catch(console.error);
    }, []);

    const handleCreateUser = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            fetch("/api/v1/users", {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify(formValues),
            })
                .then((d) => d.json())
                .then(setFormResponse);
        } catch (error) {
            console.log("Error in create user", error);
        } finally {
            setFormLoading(false);
        }
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
                    <div>
                        <input
                            className="border"
                            placeholder="name"
                            onChange={(e) =>
                                setFormValues((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                            value={formValues.name}
                        />
                        {formResponse?.errors?.name?.length > 0 && (
                            <p className="text-sm text-rose-500">
                                {formResponse?.errors?.name}
                            </p>
                        )}
                    </div>
                    <div>
                        <input
                            className="border"
                            placeholder="email"
                            onChange={(e) =>
                                setFormValues((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                }))
                            }
                            value={formValues.email}
                        />
                        {formResponse?.errors?.email?.length > 0 && (
                            <p className="text-sm text-rose-500">
                                {formResponse?.errors?.email}
                            </p>
                        )}
                    </div>
                    <div>
                        <input
                            className="border"
                            placeholder="password"
                            onChange={(e) =>
                                setFormValues((prev) => ({
                                    ...prev,
                                    password: e.target.value,
                                }))
                            }
                            value={formValues.password}
                        />
                        {formResponse?.errors?.password?.length > 0 && (
                            <p className="text-sm text-rose-500">
                                {formResponse?.errors?.password}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            onChange={(e) =>
                                setFormValues((prev) => ({
                                    ...prev,
                                    isActive: e.target.checked,
                                }))
                            }
                            checked={formValues.isActive}
                        />
                        <label htmlFor="isActive">is active?</label>
                    </div>

                    <button
                        className="border bg-stone-100 rounded"
                        disabled={formLoading}
                    >
                        {formLoading ? "Sending..." : "Submit"}
                    </button>
                </form>

                <div className="border-t border-stone-400/40 mt-10">
                    {usersData ? (
                        usersData?.data?.map((user) => (
                            <div key={user.id} className="">
                                {user.name}
                            </div>
                        ))
                    ) : (
                        <div>Loading...</div>
                    )}
                </div>
            </div>
        </>
    );
}
