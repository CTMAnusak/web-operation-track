import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../layouts/MobileLayout';
import { routePaths } from '../routes/routePaths';
import customers from '../mock/customers.json';
import '../assets/css/pages/search.css';

const HISTORY_KEY = 'searchHistory';

/* ---- Icons (Heroicons v2 outline) ---- */
function IconBack() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
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

function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18 18 6M6 6l12 12" />
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

/* ---- Helpers ---- */
function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory(hn) {
  const prev = getHistory().filter((h) => h !== hn);
  const next = [hn, ...prev].slice(0, 10);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

function removeHistory(hn) {
  const next = getHistory().filter((h) => h !== hn);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

/* ---- CustomerSearchPage ---- */
function CustomerSearchPage() {
  const navigate = useNavigate();
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
    navigate(routePaths.dashboard, {
      state: { selectedCustomer: customer },
    });
  }

  function handleSelectHistory(hn) {
    setQuery(hn);
    inputRef.current?.focus();
  }

  function handleRemoveHistory(e, hn) {
    e.stopPropagation();
    removeHistory(hn);
    setHistory(getHistory());
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

  return (
    <MobileLayout>
      <div className="search-page">
        {/* Top bar */}
        <div className="search-page__topbar">
          <button
            className="search-page__back-btn"
            aria-label="ย้อนกลับ"
            onClick={() => navigate(-1)}
          >
            <IconBack />
          </button>

          <div className="search-page__input-wrap">
            <input
              ref={inputRef}
              className="search-page__input"
              type="text"
              placeholder="ค้นหาข้อมูลลูกค้า ใน V Track"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="search-page__list">
          {!isTyping &&
            history.map((hn) => {
              const histCustomer = customers.find((c) => c.hn === hn);
              return (
                <button
                  key={hn}
                  className="search-page__item"
                  onClick={() => handleFillFromHistory(hn)}
                >
                  <span className="search-page__item-icon">
                    <IconClock />
                  </span>
                  {histCustomer ? (
                    <span className="search-page__item-label-wrap">
                      <span className="search-page__item-label">{histCustomer.name}</span>
                      <span className="search-page__item-sublabel">HN {hn}</span>
                    </span>
                  ) : (
                    <span className="search-page__item-label">{hn}</span>
                  )}
                  <span
                    className="search-page__item-action"
                    role="button"
                    tabIndex={0}
                    aria-label="ลบประวัติ"
                    onClick={(e) => handleRemoveHistory(e, hn)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRemoveHistory(e, hn);
                    }}
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
                className="search-page__item"
                onClick={() => handleSelectResult(customer)}
              >
                <span className="search-page__item-icon">
                  <IconSearch />
                </span>
                <span className="search-page__item-label-wrap">
                  <span className="search-page__item-label">{customer.name}</span>
                  <span className="search-page__item-sublabel">HN {customer.hn}</span>
                </span>
                <span className="search-page__item-action">
                  <IconArrowUpLeft />
                </span>
              </button>
            ))}
        </div>
      </div>
    </MobileLayout>
  );
}

export default CustomerSearchPage;
