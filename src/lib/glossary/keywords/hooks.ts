'use client';

import useSWR, { SWRConfiguration } from 'swr';
import { getPublicKeyword, getPublicKeywords } from './actions';
import { handleAction } from '@/lib/common/actionResponse';

export function usePublicKeywords(
    short?: boolean,
    swrOptions?: SWRConfiguration
) {
    return useSWR(
        `/glossary/keywords/public?short=${short}`,
        () => handleAction(getPublicKeywords({ short })),
        {
            fallbackData: [],
            ...swrOptions,
        }
    );
}

export function usePublicKeyword(key: string, swrOptions?: SWRConfiguration) {
    return useSWR(
        `/glossary/keywords/public/${key}`,
        () => handleAction(getPublicKeyword(key)),
        {
            ...swrOptions,
        }
    );
}

export function useKeywords(swrOptions?: SWRConfiguration) {
    return useSWR(
        '/glossary/keywords/all',
        () => handleAction(getPublicKeywords()),
        {
            fallbackData: [],
            ...swrOptions,
        }
    );
}

export function useKeyword(key: string, swrOptions?: SWRConfiguration) {
    return useSWR(
        `/glossary/keywords/all/${key}`,
        () => handleAction(getPublicKeyword(key)),
        {
            ...swrOptions,
        }
    );
}
