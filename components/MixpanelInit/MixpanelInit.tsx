'use client';

import { useEffect } from 'react';
import { initMixpanel } from '@/lib/mixpanel';

export function MixpanelInit() {
    useEffect(() => {
        initMixpanel();
    }, []);

    return null; // This component doesn't render anything
}