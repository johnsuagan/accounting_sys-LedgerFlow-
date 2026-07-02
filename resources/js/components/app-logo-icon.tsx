import { SVGAttributes } from 'react';

/** Ledger / journal icon — LedgerFlow brand mark */
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M5 3h13a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm1 2v16h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H6Z" />
            <path d="M8 8h10v1.5H8V8Zm0 3.5h8V13H8v-1.5Zm0 3.5h10V16H8v-1.5Zm0 3.5h6V19H8v-1.5Z" />
        </svg>
    );
}
