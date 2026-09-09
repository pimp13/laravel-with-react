import AppLayout from "@/layouts/AppLayout";
import React from "react";

export default function AuthPage() {
    return <div>Hello this is auth page</div>;
}

AuthPage.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
