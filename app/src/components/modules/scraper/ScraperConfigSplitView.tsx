'use client';

import { useState, useCallback } from 'react';
import { ScraperConfigForm } from './ScraperConfigForm';
import { ProxyIframe } from './ProxyIframe';
import type { GetScraperConfigsDto } from '@/lib/modules/scraper/application/queries/get-scraper-configs/get-scraper-configs.dto';
import styles from './ScraperConfigSplitView.module.css';

interface Props {
  agencyId: number;
  agencyDomain: string | null;
  type: 'overview' | 'detail';
  existing: GetScraperConfigsDto | null;
}

export function ScraperConfigSplitView({ agencyId, agencyDomain, type, existing }: Props) {
  const [activeTargetField, setActiveTargetField] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [liveUriPath, setLiveUriPath] = useState<string>(existing?.uriPath ?? '');
  const [liveExampleUrl, setLiveExampleUrl] = useState<string>(
    (existing?.config as Record<string, unknown>)?.example_url as string ?? '',
  );

  const previewUrl = type === 'overview'
    ? (agencyDomain && liveUriPath ? `${agencyDomain}${liveUriPath}` : null)
    : (liveExampleUrl || null);

  const handleElementSelected = useCallback((fieldKey: string, selector: string) => {
    setFieldValues(prev => ({ ...prev, [fieldKey]: selector }));
    setActiveTargetField(null);
  }, []);

  const handleTargetRequest = useCallback((fieldKey: string) => {
    setActiveTargetField(prev => prev === fieldKey ? null : fieldKey);
  }, []);

  return (
    <div className={styles.splitView}>
      <div className={styles.left}>
        <ScraperConfigForm
          agencyId={agencyId}
          agencyDomain={agencyDomain}
          type={type}
          existing={existing}
          activeTargetField={activeTargetField}
          onTargetRequest={handleTargetRequest}
          injectedFieldValues={fieldValues}
          onUriPathChange={setLiveUriPath}
          onExampleUrlChange={setLiveExampleUrl}
        />
      </div>
      <div className={styles.right}>
        <ProxyIframe
          url={typeof previewUrl === 'string' && previewUrl ? previewUrl : null}
          activeFieldKey={activeTargetField}
          onElementSelected={handleElementSelected}
        />
      </div>
    </div>
  );
}
