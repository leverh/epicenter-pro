'use client';

import styles from './Header.module.css';

interface HeaderProps {
  /** Total earthquakes currently being tracked (unfiltered) */
  totalCount: number;
  /** Timestamp of the last data refresh */
  lastUpdate: Date;
}

export default function Header({ totalCount, lastUpdate }: HeaderProps) {
  const timeStr = lastUpdate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className={styles.header}>
      <svg
        className={styles.waveBg}
        viewBox="0 0 1400 130"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <polyline
          className={styles.wavePrimary}
          fill="none"
          points="
            0,65 40,65 55,65 65,20 75,110 85,30 95,95 105,50 115,65 160,65
            200,65 215,65 225,30 235,100 245,40 255,90 265,58 275,65 320,65
            360,65 375,65 385,25 395,105 405,35 415,95 425,52 435,65 480,65
            520,65 535,65 545,28 555,102 565,38 575,92 585,55 595,65 640,65
            700,65 740,65 755,65 765,20 775,110 785,30 795,95 805,50 815,65
            860,65 900,65 915,65 925,30 935,100 945,40 955,90 965,58 975,65
            1020,65 1060,65 1075,65 1085,25 1095,105 1105,35 1115,95 1125,52
            1135,65 1180,65 1220,65 1235,65 1245,28 1255,102 1265,38 1275,92
            1285,55 1295,65 1340,65 1400,65
          "
        />
        <polyline
          className={styles.waveSecondary}
          fill="none"
          points="
            0,80 60,80 80,80 95,55 105,100 115,65 140,80 200,80
            250,80 270,80 285,58 295,98 305,68 330,80 390,80
            440,80 455,80 470,60 480,96 490,70 510,80 570,80
            620,80 640,80 655,62 665,94 675,74 700,80 760,80
            810,80 830,80 845,55 855,100 865,65 890,80 950,80
            1000,80 1020,80 1035,58 1045,98 1055,68 1080,80 1140,80
            1190,80 1210,80 1225,60 1235,96 1245,70 1270,80 1330,80
            1380,80 1400,80
          "
        />
      </svg>

      <div className={styles.wordmark}>
        <svg
          className={styles.logoIcon}
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="2.5" fill="currentColor" />
          {/* Cardinal tick marks */}
          <line x1="20" y1="2"  x2="20" y2="7"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="33" x2="20" y2="38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="2"  y1="20" x2="7"  y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="33" y1="20" x2="38" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>

        <div className={styles.titleText}>
          <span className={styles.titleEpicenter}>Epicenter</span>
          <span className={styles.titleHub}>Hub</span>
        </div>
      </div>

      <p className={styles.subtitle}>
        Visualizing real-time seismic activity worldwide
      </p>

      <div className={styles.statusBar} role="status" aria-live="polite">
        <span className={styles.liveDot} aria-hidden="true">
          <span className={styles.liveDotCore} />
          <span className={styles.liveDotRing} />
        </span>

        <span className={styles.statusCount}>{totalCount.toLocaleString()}</span>
        <span>earthquakes tracked</span>

        <span className={styles.statusDivider} aria-hidden="true">·</span>

        <span className={styles.statusTime} suppressHydrationWarning>
          Updated {timeStr}
        </span>
      </div>
    </header>
  );
}