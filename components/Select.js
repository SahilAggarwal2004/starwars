import Link from "next/link";

export default function Select({ active, values }) {
    return <div className="flex rounded-xl bg-green-100 p-1 w-max mx-auto mb-5">
        <ul className="flex w-full list-none gap-1 sm:w-auto">
            {values.map(({ value, label }) => <li key={value} className="w-full">
                <Link href={`/room?type=${value}`} replace className="w-full cursor-pointer">
                    <div className={`relative flex w-full items-center justify-center gap-1 rounded-lg border py-2 outline-none transition-opacity duration-100 sm:w-auto sm:min-w-[148px] md:gap-2 md:py-2.5 ${active === value ? 'border-black/10 bg-green-500 text-white shadow-[0_1px_7px_0px_rgba(0,0,0,0.06)] hover:!opacity-100' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
                        <span className="truncate text-sm font-medium px-2">{label}</span>
                    </div>
                </Link>
            </li>)}
        </ul>
    </div>
}
