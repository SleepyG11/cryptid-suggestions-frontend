'use client';

import useSWR, { SWRConfiguration } from 'swr';
import { getPublicTextFormat, getPublicTextFormats } from './actions';
import { handleAction } from '@/lib/common/actionResponse';

export function usePublicTextFormats(
    short?: boolean,
    swrOptions?: SWRConfiguration
) {
    return useSWR(
        `/glossary/text-formats/public?short=${short}`,
        () => handleAction(getPublicTextFormats({ short })),
        {
            fallbackData: [],
            ...swrOptions,
        }
    );
}

export function usePublicTextFormat(
    key: string,
    swrOptions?: SWRConfiguration
) {
    return useSWR(
        `/glossary/text-formats/public/${key}`,
        () => handleAction(getPublicTextFormat(key)),
        {
            ...swrOptions,
        }
    );
}

export function useMechanicKeywords(swrOptions?: SWRConfiguration) {
    return useSWR(
        '/glossary/text-formats/all',
        () => handleAction(getPublicTextFormats()),
        {
            fallbackData: [],
            ...swrOptions,
        }
    );
}

export function useMechanicKeyword(key: string, swrOptions?: SWRConfiguration) {
    return useSWR(
        `/glossary/text-formats/all/${key}`,
        () => handleAction(getPublicTextFormat(key)),
        {
            ...swrOptions,
        }
    );
}
