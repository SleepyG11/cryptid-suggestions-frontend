'use client';

import useSWR, { SWRConfiguration } from 'swr';
import { getPublicContentTag, getPublicContentTags } from './actions';
import { handleAction } from '@/lib/common/actionResponse';

export function usePublicContentTags(
    short?: boolean,
    swrOptions?: SWRConfiguration
) {
    return useSWR(
        `/glossary/content-tags/public?short=${short}`,
        () => handleAction(getPublicContentTags({ short })),
        {
            fallbackData: [],
            ...swrOptions,
        }
    );
}

export function usePublicContentTag(
    key: string,
    swrOptions?: SWRConfiguration
) {
    return useSWR(
        `/glossary/content-tags/public/${key}`,
        () => handleAction(getPublicContentTag(key)),
        {
            ...swrOptions,
        }
    );
}

export function useMechanicKeywords(swrOptions?: SWRConfiguration) {
    return useSWR(
        '/glossary/content-tags/all',
        () => handleAction(getPublicContentTags()),
        {
            fallbackData: [],
            ...swrOptions,
        }
    );
}

export function useMechanicKeyword(key: string, swrOptions?: SWRConfiguration) {
    return useSWR(
        `/glossary/content-tags/all/${key}`,
        () => handleAction(getPublicContentTag(key)),
        {
            ...swrOptions,
        }
    );
}
