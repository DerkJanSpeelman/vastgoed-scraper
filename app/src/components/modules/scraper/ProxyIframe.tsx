'use client';

import { useEffect, useRef } from 'react';
import styles from './ProxyIframe.module.css';

interface Props {
  url: string | null;
  activeFieldKey: string | null;
  onElementSelected: (fieldKey: string, selector: string) => void;
}

export function ProxyIframe({ url, activeFieldKey, onElementSelected }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!e.data || e.data.type !== 'element-selected') return;
      onElementSelected(e.data.fieldKey, e.data.selector);
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onElementSelected]);

  useEffect(() => {
    if (!activeFieldKey || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      { type: 'enable-targeting', fieldKey: activeFieldKey },
      '*',
    );
  }, [activeFieldKey]);

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
      <iframe
        ref={iframeRef}
        src={proxyUrl}
        className={`${styles.iframe}${activeFieldKey ? ` ${styles.targeting}` : ''}`}
        sandbox="allow-scripts allow-same-origin"
        title="Pagina preview"
      />
    </div>
  );
}
