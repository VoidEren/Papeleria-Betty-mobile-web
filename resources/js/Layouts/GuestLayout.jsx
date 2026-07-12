import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-white pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-16 w-16 fill-current text-black transition-transform duration-300 hover:scale-105" />
                </Link>
            </div>

            <div className="mt-8 w-full px-6 py-4 sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
