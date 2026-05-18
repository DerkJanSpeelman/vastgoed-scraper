"use client";

import { useState } from "react";
import styles from "./ExpandableDescription.module.css";

const PREVIEW_LENGTH = 400;

interface ExpandableDescriptionProps {
  text: string;
}

export function ExpandableDescription({ text }: ExpandableDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= PREVIEW_LENGTH) {
    return <p className={styles.text}>{text}</p>;
  }

  return (
    <div>
      <div className={`${styles.textWrap} ${expanded ? styles.expanded : ""}`}>
        <p className={styles.text}>
          {expanded ? text : `${text.slice(0, PREVIEW_LENGTH)}…`}
        </p>
      </div>
      <button
        className={styles.toggle}
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        {expanded ? "Lees minder" : "Lees meer"}
      </button>
    </div>
  );
}
