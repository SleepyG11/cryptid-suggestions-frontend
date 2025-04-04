'use client';

import useSWR, { SWRConfiguration } from 'swr';
import { getPublicMechanicKeyword, getPublicMechanicKeywords } from './actions';
import { handleAction } from '@/lib/common/actionResponse';

export function usePublicMechanicKeywords(
    short?: boolean,
    swrOptions?: SWRConfiguration
) {
    return useSWR(
        `/glossary/mechanic-keywords/public?short=${short}`,
        () => handleAction(getPublicMechanicKeywords({ short })),
        {
            fallbackData: [],
            ...swrOptions,
        }
    );
}

export function usePublicMechanicKeyword(
    key: string,
    swrOptions?: SWRConfiguration
) {
    return useSWR(
        `/glossary/mechanic-keywords/public/${key}`,
        () => handleAction(getPublicMechanicKeyword(key)),
        {
            ...swrOptions,
        }
    );
}

export function useMechanicKeywords(swrOptions?: SWRConfiguration) {
    return useSWR(
        '/glossary/mechanic-keywords/all',
        () => handleAction(getPublicMechanicKeywords()),
        {
            fallbackData: [],
            ...swrOptions,
        }
    );
}

export function useMechanicKeyword(key: string, swrOptions?: SWRConfiguration) {
    return useSWR(
        `/glossary/mechanic-keywords/all/${key}`,
        () => handleAction(getPublicMechanicKeyword(key)),
        {
            ...swrOptions,
        }
    );
}
