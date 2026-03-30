import { useEffect, useRef, useState } from 'react';
import customers from '../mock/customers.json';

function IconSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function IconBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function IconArrowUpLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 9 6.196 6.196M15 9H9v6" />
    </svg>
  );
}

const HISTORY_KEY = 'searchHistory';

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveHistory(hn) {
  const prev = getHistory().filter((h) => h !== hn);
  const next = [hn, ...prev].slice(0, 10);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

function removeHistory(hn) {
  const next = getHistory().filter((h) => h !== hn);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export function SearchOverlay({ onClose, onSelect }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState(getHistory);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const q = query.trim().toLowerCase();
  const results = q
    ? customers.filter((c) =>
        c.hn.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
      )
    : [];

  const isTyping = query.trim().length > 0;

  function handleSelectResult(customer) {
    saveHistory(customer.hn);
    onSelect(customer);
  }

  function handleFillFromHistory(hn) {
    const found = customers.find((c) => c.hn === hn);
    if (found) {
      handleSelectResult(found);
    } else {
      setQuery(hn);
      inputRef.current?.focus();
    }
  }

  function handleRemoveHistory(e, itemHn) {
    e.stopPropagation();
    removeHistory(itemHn);
    setHistory(getHistory());
  }

  return (
    <div className="search-overlay-container">
      <div className="search-overlay">
      <div className="search-overlay__topbar">
        <button
          className="search-overlay__back-btn"
          aria-label="ย้อนกลับ"
          onClick={onClose}
        >
          <IconBack />
        </button>
        <div className="search-overlay__input-wrap">
          <input
            ref={inputRef}
            className="search-overlay__input"
            type="text"
            placeholder="ค้นหาข้อมูลลูกค้า ใน V Track"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="search-overlay__list">
        {!isTyping &&
          history.map((itemHn) => {
            const histCustomer = customers.find((c) => c.hn === itemHn);
            return (
              <button
                key={itemHn}
                className="search-overlay__item"
                onClick={() => handleFillFromHistory(itemHn)}
              >
                <span className="search-overlay__item-icon"><IconClock /></span>
                {histCustomer ? (
                  <span className="search-overlay__item-label-wrap">
                    <span className="search-overlay__item-label">{histCustomer.name}</span>
                    <span className="search-overlay__item-sublabel">HN {itemHn}</span>
                  </span>
                ) : (
                  <span className="search-overlay__item-label">{itemHn}</span>
                )}
                <span
                  className="search-overlay__item-action"
                  role="button"
                  tabIndex={0}
                  aria-label="ลบประวัติ"
                  onClick={(e) => handleRemoveHistory(e, itemHn)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRemoveHistory(e, itemHn); }}
                >
                  <IconClose />
                </span>
              </button>
            );
          })}

        {isTyping &&
          results.map((customer) => (
            <button
              key={customer.hn}
              className="search-overlay__item"
              onClick={() => handleSelectResult(customer)}
            >
              <span className="search-overlay__item-icon"><IconSearch /></span>
              <span className="search-overlay__item-label-wrap">
                <span className="search-overlay__item-label">{customer.name}</span>
                <span className="search-overlay__item-sublabel">HN {customer.hn}</span>
              </span>
              <span className="search-overlay__item-action"><IconArrowUpLeft /></span>
            </button>
          ))}
      </div>
    </div>
    </div>
    
  );
}

export function QRScannerOverlay({ onClose, onScan }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [cameraError, setCameraError] = useState('');

  function releaseCamera() {
    const stream = streamRef.current;
    streamRef.current = null;
    const el = videoRef.current;
    if (el) {
      el.srcObject = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        if (!cancelled) setCameraError('ไม่สามารถเข้าถึงกล้องได้');
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      releaseCamera();
    };
  }, []);

  useEffect(() => {
    if (!scanning) {
      releaseCamera();
    }
  }, [scanning]);

  useEffect(() => {
    if (!scanning) return;
    const timer = setTimeout(() => {
      setScanning(false);
      const mockHN = '62173489';
      const customer = customers.find(c => c.hn === mockHN);
      if (customer) {
        setTimeout(() => {
          onScan(customer);
        }, 500);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [scanning, onScan]);

  return (
    <div className="qr-scanner-fullscreen-overlay-container">
      <div className="qr-scanner-fullscreen-overlay">
      <div className="qr-modal">
        <div className="qr-modal__topnav">
          <button type="button" className="opd-detail__back-btn" onClick={onClose}>
            <IconBack />
            <span>กลับหน้าหลัก</span>
          </button>
        </div>
        <div className="qr-modal__body">
          <h2 className="qr-modal__title">ค้นหาผู้ร่วมทำหัตถการ</h2>
          <div className="qr-modal__frame">
            <div className="qr-corner qr-corner--tl" />
            <div className="qr-corner qr-corner--tr" />
            <div className="qr-corner qr-corner--bl" />
            <div className="qr-corner qr-corner--br" />
            {scanning ? (
              <div className="qr-modal__placeholder">
                <video ref={videoRef} className="qr-modal__video" autoPlay playsInline muted />
                <div className="qr-modal__scan-line" />
                {cameraError && <div className="qr-modal__camera-error">{cameraError}</div>}
              </div>
            ) : (
              <div className="qr-modal__found">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#3F8CFF" strokeWidth="2">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                <p>พบผู้ใช้แล้ว</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
    
  );
}
