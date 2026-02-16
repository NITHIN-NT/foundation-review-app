export default function Loading() {
    return (
        <div className="flex flex-col gap-8 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-10 w-48 bg-bg-subtle rounded-lg"></div>
                <div className="flex gap-3">
                    <div className="h-10 w-28 bg-bg-subtle rounded-lg"></div>
                    <div className="h-10 w-40 bg-bg-subtle rounded-lg"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-bg-subtle rounded-3xl"></div>
                ))}
            </div>

            <div className="h-12 w-full max-w-md bg-bg-subtle rounded-xl"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-64 bg-bg-subtle rounded-3xl"></div>
                ))}
            </div>
        </div>
    );
}
