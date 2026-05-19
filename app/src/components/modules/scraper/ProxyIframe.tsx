'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ProxyIframe.module.css';

export interface EvaluateRequest {
  fieldKey: string;
  selector: string;
  selectorType: string;
  attribute: string;
  scopeSelector?: string;
}

interface Props {
  url: string | null;
  activeFieldKey: string | null;
  onElementSelected: (fieldKey: string, selector: string) => void;
  evaluateRequests?: EvaluateRequest[] | null;
  onSelectorResult?: (fieldKey: string, values: string[], count: number) => void;
}

export function ProxyIframe({ url, activeFieldKey, onElementSelected, evaluateRequests, onSelectorResult }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => { setIframeLoaded(false); }, [url]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!e.data) return;
      if (e.origin !== window.location.origin) return;

      if (e.data.type === 'element-selected') {
        if (typeof e.data.fieldKey !== 'string' || typeof e.data.selector !== 'string') return;
        onElementSelected(e.data.fieldKey, e.data.selector);
        return;
      }

      if (e.data.type === 'selector-result') {
        if (typeof e.data.fieldKey !== 'string') return;
        const values = Array.isArray(e.data.values) ? e.data.values.map(String) : [];
        onSelectorResult?.(e.data.fieldKey, values, Number(e.data.count ?? 0));
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onElementSelected, onSelectorResult]);

  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    if (activeFieldKey) {
      iframeRef.current.contentWindow.postMessage({ type: 'enable-targeting', fieldKey: activeFieldKey }, '*');
    } else {
      iframeRef.current.contentWindow.postMessage({ type: 'disable-targeting' }, '*');
    }
  }, [activeFieldKey]);

  useEffect(() => {
    if (!evaluateRequests?.length || !iframeRef.current?.contentWindow || !iframeLoaded) return;
    for (const req of evaluateRequests) {
      iframeRef.current.contentWindow.postMessage({ type: 'evaluate-selector', ...req }, '*');
    }
  }, [evaluateRequests, iframeLoaded]);

  if (!url) {
    return (
      <div className={styles.root}>
        <div className={styles.placeholder}>Voer een URL in om de pagina te bekijken</div>
      </div>
    );
  }

  const proxyUrl = `/api/admin/proxy?url=${encodeURIComponent(url)}`;

  return (
    <div className={styles.root}>
      {!iframeLoaded && (
        <div className={styles.skeleton}>
          <div className={styles.skeletonBar} style={{ width: '60%' }} />
          <div className={styles.skeletonBar} style={{ width: '40%' }} />
          <div className={styles.skeletonBlock} />
          <div className={styles.skeletonBar} style={{ width: '75%' }} />
          <div className={styles.skeletonBar} style={{ width: '50%' }} />
          <div className={styles.skeletonBlock} />
          <div className={styles.skeletonBar} style={{ width: '65%' }} />
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={proxyUrl}
        className={`${styles.iframe}${activeFieldKey ? ` ${styles.targeting}` : ''}${!iframeLoaded ? ` ${styles.iframeHidden}` : ''}`}
        sandbox="allow-scripts allow-same-origin"
        title="Pagina preview"
        onLoad={() => setIframeLoaded(true)}
      />
    </div>
  );
}
