import type { Auth } from "@/types/auth";

declare module "react" {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module "@inertiajs/core" {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }

    export interface APILayout<T = unknown> {
        data?: T;
        success?: boolean;
        errors?: any;
        message?: string;
    }
}

export declare global {
    export type APILayout<T = any> = {
        ok: boolean;
        statusCode: number;
        message?: string;
        data?: T;
    };

    export type ErrorResponse = {
        message: string;
        error?: string;
        statusCode?: number;
    };
}
