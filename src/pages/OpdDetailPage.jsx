import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import MobileLayout from '../layouts/MobileLayout';
import { getBranchName, getDoctorNickname, getUsersByIds, getRoleName, getBranchFullName } from '../mock/dataHelpers';
import { getCurrentDate, getCurrentDateTime } from '../config/mockDateTime';
import ProfileModal from '../components/ProfileModal';
import customers from '../mock/customers.json';
import dbData from '../../db.json';
import logoImg from '../assets/images/logo-vtrack.png';
import avatarImg from '../assets/images/avatar-user.png';
import iconCatMachine from '../assets/icons/icon-cat-machine.png';
import iconCatInject from '../assets/icons/icon-cat-inject.png';
import iconCatWellness from '../assets/icons/icon-cat-wellness.png';
import iconCatLaser from '../assets/icons/icon-cat-laser.png';
import '../assets/css/pages/OpdDetailPage.css';

/* ─────────────────────────────────────────
   Data from db.json
───────────────────────────────────────── */
const MACHINE_TYPES = dbData.machineTypes;
const PROC_CATEGORIES = dbData.procedureCategories;
const INJECT_TYPES = dbData.injectTypes;
const INJECT_BODY_ZONES = dbData.injectBodyZones;
const WELLNESS_TYPES = dbData.wellnessTypes;
const LASER_TYPES = dbData.laserTypes;
const LASER_SUBTYPES = dbData.laserSubtypes || [];
const LASER_PROCEDURES = dbData.laserProcedures || [];
const LASER_SETTING_KEYS = dbData.laserSettingKeys || [];

/* Body zones/positions for machine procedures (z1–z3) */
const MACHINE_BODY_ZONES = dbData.bodyZones.filter(z =>
  ['z1', 'z2', 'z3'].includes(z.id)
);
const MACHINE_BODY_POSITIONS = dbData.bodyPositions.filter(p =>
  ['p1','p2','p3','p4','p5','p6'].includes(p.id)
);

/* Body zones/positions for inject procedures (z4–z10) */
const INJECT_ZONES_ALL = dbData.bodyZones.filter(z =>
  ['z4','z5','z6','z7','z8','z9','z10'].includes(z.id)
);
const INJECT_POSITIONS_ALL = dbData.bodyPositions.filter(p =>
  ['p7','p8','p9','p10','p11'].includes(p.id)
);

/* Body zones/positions for laser procedures */
const LASER_BODY_ZONES = dbData.bodyZones.filter(z =>
  ['z1', 'z2', 'z3'].includes(z.id)
);
const LASER_BODY_POSITIONS = dbData.laserBodyPositions || [];

const MACHINE_SETTING_KEYS = dbData.machineSettingMap.reduce((acc, ms) => {
  const key = dbData.settingKeys.find(k => k.id === ms.settingKeyId);
  if (!key) return acc;
  if (!acc[ms.machineId]) acc[ms.machineId] = [];
  acc[ms.machineId].push({ key: key.key, unit: key.unit });
  return acc;
}, {});

/* User list from db.json */
const ALL_USERS = dbData.users.map(u => ({
  id: u.id,
  username: u.username,
  fullName: u.fullName,
  nickname: u.nickname,
  role: (() => {
    if (u.roleId === 'r1') return 'แพทย์';
    if (u.roleId === 'r2') return 'พยาบาล';
    if (u.roleId === 'r3') return 'ผู้ช่วยแพทย์';
    return 'เจ้าหน้าที่';
  })(),
}));

function findUserByUsername(username) {
  return ALL_USERS.find(u => u.username === username) || null;
}

/* ─────────────────────────────────────────
   Icon Components
───────────────────────────────────────── */
function IconBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

function IconUserSmall() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
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

function IconPlus() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function IconQR() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5ZM6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

/* Category icons — PNG assets */
const CAT_ICON_MAP = {
  machine: iconCatMachine,
  inject: iconCatInject,
  wellness: iconCatWellness,
  laser: iconCatLaser,
};

function CatIcon({ iconKey }) {
  const src = CAT_ICON_MAP[iconKey];
  return <img src={src} alt={iconKey} className="cat-icon-img" />;
}

/* ─────────────────────────────────────────
   Helper
───────────────────────────────────────── */
function statusModifier(status) {
  if (status === 'เสร็จสิ้น') return 'done';
  if (status === 'กำลังทำ') return 'in-progress';
  return 'pending';
}

function calcProcedureDuration(proc) {
  if (!proc.startTime || !proc.endTime) return null;
  const parse = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const mins = parse(proc.endTime) - parse(proc.startTime);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}.${String(m).padStart(2, '0')} ชม.`;
  if (h > 0) return `${h} ชม.`;
  return `${m} นาที`;
}

/* roles ที่สามารถลบการ์ดหัตถการได้: r2=พยาบาล, r3=ผู้ช่วยแพทย์, r4=นักกายภาพบำบัด */
const DELETABLE_ROLE_IDS = ['r2', 'r3', 'r4'];

function canDeleteProcCard(proc, currentUserRoleId) {
  if (!DELETABLE_ROLE_IDS.includes(currentUserRoleId)) return false;
  if (proc.status === 'เสร็จสิ้น') return false;
  return true;
}

function isCardOlderThanOneDay(proc) {
  const createdAt = proc.createdAt ? new Date(proc.createdAt) : null;
  if (!createdAt) return false;
  const now = getCurrentDateTime();
  return (now - createdAt) > 24 * 60 * 60 * 1000;
}

/* ─────────────────────────────────────────
   Confirm Dialog
───────────────────────────────────────── */
function ConfirmDialog({ title, desc, onCancel, onConfirm }) {
  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <div className="confirm-dialog__title">{title}</div>
        <div className="confirm-dialog__desc">{desc}</div>
        <div className="confirm-dialog__actions">
          <button className="confirm-dialog__cancel" onClick={onCancel}>ย้อนกลับ</button>
          <button className="confirm-dialog__confirm" onClick={onConfirm}>ยืนยัน</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   QR Scanner Modal
───────────────────────────────────────── */
function QRScannerModal({ onClose, onScan }) {
  const [scanning, setScanning] = useState(true);
  const [cameraError, setCameraError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (!mounted) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraReady(true);
      } catch (err) {
        setCameraError('ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตการใช้งานกล้อง');
      }
    }
    initCamera();
    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!cameraReady || !scanning) return;
    const t = setTimeout(() => {
      setScanning(false);
      onScan('OPDX32434');
    }, 2000);
    return () => clearTimeout(t);
  }, [cameraReady, scanning, onScan]);

  return (
    <div className="qr-modal">
      <div className="qr-modal__topnav">
        <button className="opd-detail__back-btn" onClick={onClose}>
          <IconBack />
          <span>กลับหน้าหัตถการ</span>
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
  );
}

/* ─────────────────────────────────────────
   Body Zone Step 1 Modal
───────────────────────────────────────── */
function BodyZoneModal({ selectedZoneIds, zones, onClose, onNext }) {
  const [selected, setSelected] = useState(selectedZoneIds || []);
  const zoneList = zones || MACHINE_BODY_ZONES;

  function toggleZone(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="inner-modal-overlay">
      <div className="inner-modal">
        <div className="inner-modal__header">
          <span className="inner-modal__step">(1/2) เลือกโซนร่างกาย</span>
          <button className="inner-modal__close" onClick={onClose}><IconClose /></button>
        </div>
        <div className="inner-modal__body">
          {zoneList.map(z => (
            <label key={z.id} className={`zone-item ${selected.includes(z.id) ? 'zone-item--selected' : ''}`}>
              <span>{z.name}</span>
              <input
                type="checkbox"
                checked={selected.includes(z.id)}
                onChange={() => toggleZone(z.id)}
                className="zone-item__checkbox"
              />
            </label>
          ))}
        </div>
        <button
          className="btn-primary"
          onClick={() => onNext(selected)}
          disabled={selected.length === 0}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Body Position Step 2 Modal
───────────────────────────────────────── */
function BodyPositionModal({ selectedZoneIds, selectedPositionIds, positions, zones, onBack, onSave }) {
  const [selected, setSelected] = useState(selectedPositionIds || []);
  const allPositions = positions || MACHINE_BODY_POSITIONS;
  const allZones = zones || MACHINE_BODY_ZONES;

  const filteredZones = allZones.filter(
    (z) => selectedZoneIds.includes(z.id) && allPositions.some((p) => p.zoneId === z.id)
  );

  function togglePos(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="inner-modal-overlay">
      <div className="inner-modal">
        <div className="inner-modal__header">
          <span className="inner-modal__step">(2/2) เลือกตำแหน่งร่างกาย</span>
          <button className="inner-modal__close" onClick={onBack}><IconClose /></button>
        </div>
        <div className="inner-modal__body">
          {filteredZones.map(z => {
            const zonePositions = allPositions.filter(p => p.zoneId === z.id);
            return (
              <div key={z.id} className="position-zone-group">
                <div className="position-zone-group__title">{z.name}</div>
                <div className="position-zone-group__items">
                  {zonePositions.map(p => (
                    <label key={p.id} className="position-item">
                      <span>{p.name}</span>
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={() => togglePos(p.id)}
                        className="zone-item__checkbox"
                      />
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="inner-modal__actions">
          <button className="btn-outline" onClick={onBack}>ย้อนกลับ</button>
          <button
            className="btn-primary"
            onClick={() => onSave(selected)}
            disabled={selected.length === 0}
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Machine Settings Modal
───────────────────────────────────────── */
function MachineSettingsModal({ machineId, savedSettings, onClose, onSave }) {
  const keyDefs = MACHINE_SETTING_KEYS[machineId] || [];
  const [values, setValues] = useState(
    keyDefs.reduce((acc, kd) => ({ ...acc, [kd.key]: savedSettings?.[kd.key] || '' }), {})
  );

  const allFilled = keyDefs.some(kd => values[kd.key] !== '');

  return (
    <div className="inner-modal-overlay">
      <div className="inner-modal">
        <div className="inner-modal__header">
          <span className="inner-modal__step">ระบุการตั้งค่า</span>
          <button className="inner-modal__close" onClick={onClose}><IconClose /></button>
        </div>
        <div className="inner-modal__body">
          {keyDefs.map(kd => (
            <div key={kd.key} className="setting-row">
              <span className="setting-row__label">{kd.key}</span>
              <input
                type="number"
                placeholder={`ระบุจำนวน (${kd.unit})`}
                value={values[kd.key]}
                onChange={e => setValues(prev => ({ ...prev, [kd.key]: e.target.value }))}
                className="setting-row__input"
              />
            </div>
          ))}
        </div>
        <button
          className="btn-primary"
          onClick={() => onSave(values)}
          disabled={!allFilled}
        >
          บันทึก
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Target Weight Modal (Wellness - Slim Pen)
───────────────────────────────────────── */
function TargetWeightModal({ targetWeight, targetDurationMonths, onClose, onSave }) {
  const [weight, setWeight] = useState(targetWeight || '');
  const [duration, setDuration] = useState(targetDurationMonths || '');
  const canSave = weight !== '' && duration !== '';

  return (
    <div className="inner-modal-overlay">
      <div className="inner-modal">
        <div className="inner-modal__header">
          <span className="inner-modal__step">น้ำหนักเป้าหมาย</span>
          <button className="inner-modal__close" onClick={onClose}><IconClose /></button>
        </div>
        <div className="inner-modal__body">
          <div className="proc-popup__field-label">น้ำหนักเป้าหมาย (กก.)</div>
          <input
            type="number"
            className="wellness-input"
            placeholder="ระบุน้ำหนักเป้าหมาย"
            value={weight}
            onChange={e => setWeight(e.target.value)}
          />
          <div className="proc-popup__field-label" style={{ marginTop: 14 }}>ระยะเวลา (เดือน)</div>
          <input
            type="number"
            className="wellness-input"
            placeholder="ระบุระยะเวลา"
            value={duration}
            onChange={e => setDuration(e.target.value)}
          />
        </div>
        <button
          className="btn-primary"
          onClick={() => onSave({ targetWeight: weight, targetDurationMonths: duration })}
          disabled={!canSave}
        >
          บันทึก
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   IV Drip Formula Modal
───────────────────────────────────────── */
function IVDripFormulaModal({ selectedFormula, onClose, onSave }) {
  const [selected, setSelected] = useState(selectedFormula || null);
  const formulas = dbData.ivDripFormulas || [];

  return (
    <div className="inner-modal-overlay">
      <div className="inner-modal">
        <div className="inner-modal__header">
          <span className="inner-modal__step">(1/2) เลือกโซนร่างกาย</span>
          <button className="inner-modal__close" onClick={onClose}><IconClose /></button>
        </div>
        <div className="inner-modal__body">
          {formulas.map(f => (
            <label key={f.id} className={`zone-item ${selected?.id === f.id ? 'zone-item--selected' : ''}`}>
              <span>{f.name}</span>
              <input
                type="checkbox"
                checked={selected?.id === f.id}
                onChange={() => setSelected(f)}
                className="zone-item__checkbox"
              />
            </label>
          ))}
        </div>
        <button
          className="btn-primary"
          onClick={() => onSave(selected)}
          disabled={!selected}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   IV Drip Sub-Formula Modal
───────────────────────────────────────── */
function IVDripSubFormulaModal({ selectedFormulaId, selectedSubFormula, onClose, onSave }) {
  const [selected, setSelected] = useState(selectedSubFormula || null);
  const subFormulas = (dbData.ivDripSubFormulas || []).filter(sf => sf.formulaId === selectedFormulaId);

  return (
    <div className="inner-modal-overlay">
      <div className="inner-modal">
        <div className="inner-modal__header">
          <span className="inner-modal__step">(1/2) เลือกโซนร่างกาย</span>
          <button className="inner-modal__close" onClick={onClose}><IconClose /></button>
        </div>
        <div className="inner-modal__body">
          {subFormulas.map(sf => (
            <label key={sf.id} className={`zone-item ${selected?.id === sf.id ? 'zone-item--selected' : ''}`}>
              <span>{sf.name}</span>
              <input
                type="checkbox"
                checked={selected?.id === sf.id}
                onChange={() => setSelected(sf)}
                className="zone-item__checkbox"
              />
            </label>
          ))}
        </div>
        <button
          className="btn-primary"
          onClick={() => onSave(selected)}
          disabled={!selected}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   IV Drip Volume Modal
───────────────────────────────────────── */
function IVDripVolumeModal({ selectedVolume, onClose, onSave }) {
  const [selected, setSelected] = useState(selectedVolume || null);
  const volumes = dbData.ivDripVolumes || [];

  return (
    <div className="inner-modal-overlay">
      <div className="inner-modal">
        <div className="inner-modal__header">
          <span className="inner-modal__step">(1/2) เลือกโซนร่างกาย</span>
          <button className="inner-modal__close" onClick={onClose}><IconClose /></button>
        </div>
        <div className="inner-modal__body">
          {volumes.map(v => (
            <label key={v.id} className={`zone-item ${selected?.id === v.id ? 'zone-item--selected' : ''}`}>
              <span>{v.label}</span>
              <input
                type="checkbox"
                checked={selected?.id === v.id}
                onChange={() => setSelected(v)}
                className="zone-item__checkbox"
              />
            </label>
          ))}
        </div>
        <button
          className="btn-primary"
          onClick={() => onSave(selected)}
          disabled={!selected}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   IV Drip Flow Rate Modal
───────────────────────────────────────── */
function IVDripFlowRateModal({ selectedRate, onClose, onSave }) {
  const [selected, setSelected] = useState(selectedRate || null);
  const rates = dbData.ivDripRates || [];

  return (
    <div className="inner-modal-overlay">
      <div className="inner-modal">
        <div className="inner-modal__header">
          <span className="inner-modal__step">(1/2) เลือกโซนร่างกาย</span>
          <button className="inner-modal__close" onClick={onClose}><IconClose /></button>
        </div>
        <div className="inner-modal__body">
          {rates.map(r => (
            <label key={r.id} className={`zone-item ${selected?.id === r.id ? 'zone-item--selected' : ''}`}>
              <span>{r.label}</span>
              <input
                type="checkbox"
                checked={selected?.id === r.id}
                onChange={() => setSelected(r)}
                className="zone-item__checkbox"
              />
            </label>
          ))}
        </div>
        <button
          className="btn-primary"
          onClick={() => onSave(selected)}
          disabled={!selected}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Laser Settings Modal (per-position P/F/Shot)
───────────────────────────────────────── */
function LaserSettingsModal({ selectedPositions, savedSettings, onClose, onSave }) {
  const initValues = () => {
    const init = {};
    selectedPositions.forEach(pos => {
      const saved = savedSettings?.find(s => s.positionId === pos.id);
      init[pos.id] = {
        positionId: pos.id,
        positionName: pos.name,
        P: saved?.P || '',
        F: saved?.F || '',
        Shot: saved?.Shot || '',
      };
    });
    return init;
  };

  const [values, setValues] = useState(initValues);

  function updateField(posId, field, val) {
    setValues(prev => ({ ...prev, [posId]: { ...prev[posId], [field]: val } }));
  }

  const allFilled = selectedPositions.every(pos => {
    const v = values[pos.id];
    return v && (v.P !== '' || v.F !== '' || v.Shot !== '');
  });

  function handleSave() {
    const result = selectedPositions.map(pos => values[pos.id]);
    onSave(result);
  }

  return (
    <div className="inner-modal-overlay">
      <div className="inner-modal inner-modal--laser-settings">
        <div className="inner-modal__header">
          <span className="inner-modal__step">ระบุการตั้งค่า</span>
          <button className="inner-modal__close" onClick={onClose}><IconClose /></button>
        </div>
        <div className="inner-modal__body">
          {selectedPositions.map(pos => (
            <div key={pos.id} className="laser-setting-group">
              <div className="laser-setting-group__title">{pos.name}</div>
              <div className="laser-setting-group__fields">
                {LASER_SETTING_KEYS.map(sk => (
                  <div key={sk.id} className="laser-setting-field">
                    <input
                      type="number"
                      placeholder="ระบุ"
                      value={values[pos.id]?.[sk.key] || ''}
                      onChange={e => updateField(pos.id, sk.key, e.target.value)}
                      className="laser-setting-field__input"
                    />
                    <span className="laser-setting-field__unit">{sk.key}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={!allFilled}
        >
          บันทึก
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Procedure Detail Popup (full-page overlay)
───────────────────────────────────────── */
function ProcDetailPopup({ proc, onClose, onSave, onComplete }) {
  const isInject = proc.categoryId === 'cat2';
  const isWellness = proc.categoryId === 'cat3';
  const isLaser = proc.categoryId === 'cat4';
  const isMachine = proc.categoryId === 'cat1';
  const isSlimPen = isWellness && proc.wellnessId === 'w1';
  const isIVDrip = isWellness && proc.wellnessId === 'w2';

  /* Determine which zones/positions to use */
  const availableZones = isInject ? INJECT_ZONES_ALL : isLaser ? LASER_BODY_ZONES : MACHINE_BODY_ZONES;
  const availablePositions = isInject ? INJECT_POSITIONS_ALL : isLaser ? LASER_BODY_POSITIONS : MACHINE_BODY_POSITIONS;

  const [note, setNote] = useState(proc.note || '');
  const [participants, setParticipants] = useState(
    proc.participants && proc.participants.length > 0
      ? proc.participants
      : getUsersByIds(proc.participantIds || [])
  );
  const [showViewMore, setShowViewMore] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);

  /* Confirm dialogs */
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [removeParticipantId, setRemoveParticipantId] = useState(null);

  /* Wellness - Slim Pen fields */
  const [waist, setWaist] = useState(proc.waist || '');
  const [startWeight, setStartWeight] = useState(proc.startWeight || '');
  const [weight, setWeight] = useState(proc.weight || '');
  const [muscle, setMuscle] = useState(proc.muscle || '');
  const [fat, setFat] = useState(proc.fat || '');
  const [targetWeight, setTargetWeight] = useState(proc.targetWeight || '');
  const [targetDurationMonths, setTargetDurationMonths] = useState(proc.targetDurationMonths || '');
  const [showTargetWeightModal, setShowTargetWeightModal] = useState(false);

  /* Wellness - IV Drip fields */
  const [ivFormula, setIVFormula] = useState(proc.ivFormula || null);
  const [ivSubFormula, setIVSubFormula] = useState(proc.ivSubFormula || null);
  const [ivVolume, setIVVolume] = useState(proc.ivVolume || null);
  const [ivFlowRate, setIVFlowRate] = useState(proc.ivFlowRate || null);
  const [showIVFormulaModal, setShowIVFormulaModal] = useState(false);
  const [showIVSubFormulaModal, setShowIVSubFormulaModal] = useState(false);
  const [showIVVolumeModal, setShowIVVolumeModal] = useState(false);
  const [showIVFlowRateModal, setShowIVFlowRateModal] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /* body position sub-modals */
  const [bodyStep, setBodyStep] = useState(null);
  const [selectedZones, setSelectedZones] = useState(proc.selectedZones || []);
  const [selectedPositions, setSelectedPositions] = useState(proc.selectedPositions || []);

  /* settings modal (machine only) */
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(
    proc.settings && typeof proc.settings === 'object' && !Array.isArray(proc.settings)
      ? proc.settings
      : {}
  );

  /* laser settings (per-position) */
  const [laserSettings, setLaserSettings] = useState(proc.laserSettings || []);
  const [showLaserSettings, setShowLaserSettings] = useState(false);

  /* QR scanner */
  const [showQR, setShowQR] = useState(false);

  const visibleParticipants = showViewMore ? participants : participants.slice(0, 2);
  const machineId = proc.machineId;

  function removeParticipant(id) {
    setRemoveParticipantId(id);
  }

  function confirmRemoveParticipant() {
    setParticipants(prev => prev.filter(p => p.id !== removeParticipantId));
    setRemoveParticipantId(null);
  }

  function handleQRScan(username) {
    const user = findUserByUsername(username);
    if (user && !participants.find(p => p.id === user.id)) {
      setParticipants(prev => [...prev, user]);
    }
    setShowQR(false);
  }

  /* body position tag labels */
  const positionTags = availablePositions.filter((p) => selectedPositions.includes(p.id));
  const zoneOnlyTags = availableZones.filter(
    (z) => selectedZones.includes(z.id) && !availablePositions.some((p) => p.zoneId === z.id)
  );

  /* settings tags (machine only) */
  const settingTags = Object.entries(settings)
    .filter(([, v]) => v !== '')
    .map(([k, v]) => {
      const keyDef = (MACHINE_SETTING_KEYS[machineId] || []).find(kd => kd.key === k);
      return `${k} | ${v} ${keyDef?.unit || 'shots'}`;
    });

  /* Wellness target weight progress */
  const targetWeightNum = parseFloat(targetWeight);
  const currentWeightNum = parseFloat(weight);
  const startWeightNum = parseFloat(startWeight);
  const progressPercent = (() => {
    if (isNaN(targetWeightNum) || isNaN(currentWeightNum) || isNaN(startWeightNum)) return 0;
    const totalToLose = startWeightNum - targetWeightNum;
    if (totalToLose <= 0) return 0;
    const lostNow = startWeightNum - currentWeightNum;
    return Math.max(0, Math.min(100, Math.round((lostNow / totalToLose) * 100)));
  })();

  const hasPositions = isWellness ? true : selectedZones.some((zoneId) => {
    const zoneHasPositions = availablePositions.some((p) => p.zoneId === zoneId);
    if (!zoneHasPositions) return true;
    return selectedPositions.some((posId) => {
      const pos = availablePositions.find((p) => p.id === posId);
      return pos?.zoneId === zoneId;
    });
  });
  const hasSettings = isInject || isWellness
    ? true
    : isLaser
      ? laserSettings.length > 0 && laserSettings.every(s => s.P !== '' || s.F !== '' || s.Shot !== '')
      : Object.values(settings).some((v) => String(v).trim() !== '');
  const hasParticipants = participants.length > 0;

  const hasWaist = String(waist).trim() !== '';
  const hasStartWeight = String(startWeight).trim() !== '';
  const hasWeight = String(weight).trim() !== '';
  const hasMuscle = String(muscle).trim() !== '';
  const hasFat = String(fat).trim() !== '';
  const hasTargetWeight = String(targetWeight).trim() !== '';
  const hasTargetDuration = String(targetDurationMonths).trim() !== '';

  const hasIVFormula = ivFormula !== null;
  const hasIVSubFormula = ivSubFormula !== null;
  const hasIVVolume = ivVolume !== null;
  const hasIVFlowRate = ivFlowRate !== null;

  const isWellnessDataFilled = isSlimPen
    ? (hasWaist && hasStartWeight && hasWeight && hasMuscle && hasFat && hasTargetWeight && hasTargetDuration)
    : isIVDrip
      ? (hasIVFormula && hasIVSubFormula && hasIVVolume && hasIVFlowRate)
      : true;

  const isFormValid = hasPositions && hasSettings && hasParticipants && isWellnessDataFilled;

  const showPositionError = saveAttempted && !hasPositions;
  const showSettingsError = saveAttempted && !hasSettings;
  const showParticipantsError = saveAttempted && !hasParticipants;

  function handleSave() {
    setSaveAttempted(true);
    if (!isFormValid) return;

    const hasNote = note.trim() !== '';
    const hasAnyData = hasPositions || hasParticipants || hasNote || (!isInject && !isWellness && hasSettings) || (isWellness && isWellnessDataFilled);

    const nextStatus =
      proc.status === 'เสร็จสิ้น'
        ? 'เสร็จสิ้น'
        : hasAnyData
          ? 'กำลังทำ'
          : 'รอดำเนินการ';

    onSave({
      ...proc,
      note,
      participants,
      selectedZones: isWellness ? [] : selectedZones,
      selectedPositions: isWellness ? [] : selectedPositions,
      settings: isInject || isWellness || isLaser ? {} : settings,
      laserSettings: isLaser ? laserSettings : [],
      ...(isSlimPen && { waist, startWeight, weight, muscle, fat, targetWeight, targetDurationMonths }),
      ...(isIVDrip && { ivFormula, ivSubFormula, ivVolume, ivFlowRate }),
      status: nextStatus,
    });
  }

  if (showQR) {
    return <QRScannerModal onClose={() => setShowQR(false)} onScan={handleQRScan} />;
  }

  return (
    <div className="proc-popup">
      {/* Confirm: เสร็จสิ้นหัตถการ */}
      {showCompleteConfirm && (
        <ConfirmDialog
          title="ยืนยันการเสร็จสิ้นหัตถการ"
          desc="หลังยืนยัน หัตถการจะถูกบันทึกว่าเสร็จสิ้น"
          onCancel={() => setShowCompleteConfirm(false)}
          onConfirm={() => { setShowCompleteConfirm(false); onComplete(proc.id); }}
        />
      )}
      {/* Confirm: ลบผู้ร่วมทำหัตถการ */}
      {removeParticipantId && (
        <ConfirmDialog
          title="ยืนยันการลบผู้ร่วมทำหัตถการ"
          desc="หลังยืนยัน ผู้ร่วมทำหัตถการจะถูกลบออก"
          onCancel={() => setRemoveParticipantId(null)}
          onConfirm={confirmRemoveParticipant}
        />
      )}
      {/* Sub-modals */}
      {bodyStep === 'zone' && !isWellness && (
        <BodyZoneModal
          selectedZoneIds={selectedZones}
          zones={availableZones}
          onClose={() => setBodyStep(null)}
          onNext={(zones) => {
            setSelectedZones(zones);
            setSelectedPositions((prev) =>
              prev.filter((posId) => {
                const pos = availablePositions.find((p) => p.id === posId);
                return pos ? zones.includes(pos.zoneId) : false;
              })
            );
            const hasAnyPositionZone = zones.some((zoneId) =>
              availablePositions.some((p) => p.zoneId === zoneId)
            );
            setBodyStep(hasAnyPositionZone ? 'position' : null);
          }}
        />
      )}
      {bodyStep === 'position' && !isWellness && (
        <BodyPositionModal
          selectedZoneIds={selectedZones}
          selectedPositionIds={selectedPositions}
          positions={availablePositions}
          zones={availableZones}
          onBack={() => setBodyStep('zone')}
          onSave={(positions) => { setSelectedPositions(positions); setBodyStep(null); }}
        />
      )}
      {showSettings && isMachine && (
        <MachineSettingsModal
          machineId={machineId}
          savedSettings={settings}
          onClose={() => setShowSettings(false)}
          onSave={(vals) => { setSettings(vals); setShowSettings(false); }}
        />
      )}
      {showLaserSettings && isLaser && (
        <LaserSettingsModal
          selectedPositions={availablePositions.filter(p => selectedPositions.includes(p.id))}
          savedSettings={laserSettings}
          onClose={() => setShowLaserSettings(false)}
          onSave={(vals) => { setLaserSettings(vals); setShowLaserSettings(false); }}
        />
      )}
      {showTargetWeightModal && isSlimPen && (
        <TargetWeightModal
          targetWeight={targetWeight}
          targetDurationMonths={targetDurationMonths}
          onClose={() => setShowTargetWeightModal(false)}
          onSave={({ targetWeight: tw, targetDurationMonths: td }) => {
            setTargetWeight(tw);
            setTargetDurationMonths(td);
            setShowTargetWeightModal(false);
          }}
        />
      )}
      {showIVFormulaModal && isIVDrip && (
        <IVDripFormulaModal
          selectedFormula={ivFormula}
          onClose={() => setShowIVFormulaModal(false)}
          onSave={(formula) => {
            setIVFormula(formula);
            setIVSubFormula(null);
            setShowIVFormulaModal(false);
          }}
        />
      )}
      {showIVSubFormulaModal && isIVDrip && ivFormula && (
        <IVDripSubFormulaModal
          selectedFormulaId={ivFormula.id}
          selectedSubFormula={ivSubFormula}
          onClose={() => setShowIVSubFormulaModal(false)}
          onSave={(subFormula) => {
            setIVSubFormula(subFormula);
            setShowIVSubFormulaModal(false);
          }}
        />
      )}
      {showIVVolumeModal && isIVDrip && (
        <IVDripVolumeModal
          selectedVolume={ivVolume}
          onClose={() => setShowIVVolumeModal(false)}
          onSave={(volume) => {
            setIVVolume(volume);
            setShowIVVolumeModal(false);
          }}
        />
      )}
      {showIVFlowRateModal && isIVDrip && (
        <IVDripFlowRateModal
          selectedRate={ivFlowRate}
          onClose={() => setShowIVFlowRateModal(false)}
          onSave={(rate) => {
            setIVFlowRate(rate);
            setShowIVFlowRateModal(false);
          }}
        />
      )}

      <div className="proc-popup__nav">
        <button className="opd-detail__back-btn" onClick={onClose}>
          <IconBack />
          <span>กลับหน้ารายละเอียด OPD</span>
        </button>
      </div>

      <h2 className="proc-popup__title">
        {getCategoryLabel(proc)}
        {isLaser && getLaserProcName(proc) && (
          <div className="proc-popup__subtitle">{getLaserProcName(proc)}</div>
        )}
      </h2>

      {/* Detail card */}
      <div className="proc-popup__section">
        <div className="proc-popup__section-title">รายละเอียด</div>

        {/* Wellness - Slim Pen fields */}
        {isSlimPen && (
          <>
            <div className="proc-popup__field-label">รอบเอว (นิ้ว)</div>
            <input
              type="number"
              className={`wellness-input ${saveAttempted && !hasWaist ? 'proc-popup__input--error' : ''}`}
              placeholder="ระบุรอบเอว"
              value={waist}
              onChange={e => setWaist(e.target.value)}
            />
            <div className="proc-popup__field-label" style={{ marginTop: 14 }}>น้ำหนักเริ่มต้น (กก.)</div>
            <input
              type="number"
              className={`wellness-input ${saveAttempted && !hasStartWeight ? 'proc-popup__input--error' : ''}`}
              placeholder="ระบุน้ำหนักเริ่มต้น"
              value={startWeight}
              onChange={e => setStartWeight(e.target.value)}
            />
            <div className="proc-popup__field-label" style={{ marginTop: 14 }}>น้ำหนักปัจจุบัน (กก.)</div>
            <input
              type="number"
              className={`wellness-input ${saveAttempted && !hasWeight ? 'proc-popup__input--error' : ''}`}
              placeholder="ระบุน้ำหนัก"
              value={weight}
              onChange={e => setWeight(e.target.value)}
            />
            <div className="proc-popup__field-label" style={{ marginTop: 14 }}>กล้ามเนื้อ (กก.)</div>
            <input
              type="number"
              className={`wellness-input ${saveAttempted && !hasMuscle ? 'proc-popup__input--error' : ''}`}
              placeholder="ระบุกล้ามเนื้อ"
              value={muscle}
              onChange={e => setMuscle(e.target.value)}
            />
            <div className="proc-popup__field-label" style={{ marginTop: 14 }}>ไขมัน (%)</div>
            <input
              type="number"
              className={`wellness-input ${saveAttempted && !hasFat ? 'proc-popup__input--error' : ''}`}
              placeholder="ระบุไขมัน (%)"
              value={fat}
              onChange={e => setFat(e.target.value)}
            />

            {/* Target Weight Card */}
            <div className={`wellness-target-card ${saveAttempted && (!hasTargetWeight || !hasTargetDuration) ? 'wellness-target-card--error' : ''}`}>
              <div className="wellness-target-card__header">
                <span className="wellness-target-card__title">น้ำหนักเป้าหมาย</span>
                <button
                  className="wellness-target-card__edit-btn"
                  onClick={() => setShowTargetWeightModal(true)}
                  aria-label="แก้ไขน้ำหนักเป้าหมาย"
                >
                  <IconEdit />
                </button>
              </div>
              <div className="wellness-target-card__body">
                <div className="wellness-progress-circle">
                  <svg viewBox="0 0 36 36" className="wellness-progress-circle__svg">
                    <circle className="wellness-progress-circle__bg" cx="18" cy="18" r="15.9" />
                    <circle
                      className="wellness-progress-circle__fill"
                      cx="18" cy="18" r="15.9"
                      strokeDasharray={`${progressPercent} ${100 - progressPercent}`}
                      strokeDashoffset="25"
                    />
                  </svg>
                  <span className="wellness-progress-circle__label">{progressPercent}%</span>
                </div>
                <div className="wellness-target-card__info">
                  <div className="wellness-target-info-row">
                    <span className="wellness-target-info-label">เป้าหมาย</span>
                    <span className="wellness-target-info-value">
                      {targetWeight ? `${targetWeight} กก.` : '- กก.'}
                    </span>
                  </div>
                  <div className="wellness-target-info-row">
                    <span className="wellness-target-info-label">ลดสำเร็จแล้ว</span>
                    <span className="wellness-target-info-value">{progressPercent}%</span>
                  </div>
                  <div className="wellness-target-info-row">
                    <span className="wellness-target-info-label">ระยะเวลา</span>
                    <span className="wellness-target-info-value">
                      {targetDurationMonths ? `${targetDurationMonths} เดือน` : '- เดือน'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Wellness - IV Drip fields */}
        {isIVDrip && (
          <>
            <div className="proc-popup__field-label">สูตร</div>
            <button
              className={`proc-popup__select-btn ${saveAttempted && !hasIVFormula ? 'proc-popup__select-btn--error' : ''}`}
              onClick={() => setShowIVFormulaModal(true)}
            >
              <span>{ivFormula ? ivFormula.name : 'เลือกสูตร'}</span>
              <IconChevronRight />
            </button>

            <div className="proc-popup__field-label" style={{ marginTop: 14 }}>สูตรย่อย</div>
            <button
              className={`proc-popup__select-btn ${saveAttempted && !hasIVSubFormula ? 'proc-popup__select-btn--error' : ''}`}
              onClick={() => ivFormula && setShowIVSubFormulaModal(true)}
              disabled={!ivFormula}
            >
              <span>{ivSubFormula ? ivSubFormula.name : 'เลือกสูตรย่อย'}</span>
              <IconChevronRight />
            </button>

            <div className="proc-popup__field-label" style={{ marginTop: 14 }}>ปริมาณ</div>
            <button
              className={`proc-popup__select-btn ${saveAttempted && !hasIVVolume ? 'proc-popup__select-btn--error' : ''}`}
              onClick={() => setShowIVVolumeModal(true)}
            >
              <span>{ivVolume ? ivVolume.label : 'เลือกปริมาณ'}</span>
              <IconChevronRight />
            </button>

            <div className="proc-popup__field-label" style={{ marginTop: 14 }}>อัตราการไหล</div>
            <button
              className={`proc-popup__select-btn ${saveAttempted && !hasIVFlowRate ? 'proc-popup__select-btn--error' : ''}`}
              onClick={() => setShowIVFlowRateModal(true)}
            >
              <span>{ivFlowRate ? ivFlowRate.label : 'เลือกอัตราการไหล'}</span>
              <IconChevronRight />
            </button>
          </>
        )}

        {/* Body position — machine/inject/laser only */}
        {!isWellness && (
          <>
            <div className="proc-popup__field-label">ตำแหน่งร่างกาย</div>
            <button
              className={`proc-popup__select-btn ${showPositionError ? 'proc-popup__select-btn--error' : ''}`}
              onClick={() => setBodyStep('zone')}
            >
              <span>เลือกตำแหน่งร่างกาย</span>
              <IconChevronRight />
            </button>
            {positionTags.length > 0 && (
              <div className="proc-popup__tags">
                {positionTags.map(p => (
                  <span key={p.id} className="proc-popup__tag">
                    {p.name}
                    <button
                      className="proc-popup__tag-remove"
                      onClick={() => {
                        const remain = selectedPositions.filter((x) => x !== p.id);
                        setSelectedPositions(remain);
                        setSelectedZones((prevZones) => {
                          const remainZoneIds = new Set(
                            remain
                              .map((id) => availablePositions.find((bp) => bp.id === id)?.zoneId)
                              .filter(Boolean)
                          );
                          return prevZones.filter((zid) => remainZoneIds.has(zid));
                        });
                      }}
                    >×</button>
                  </span>
                ))}
              </div>
            )}
            {zoneOnlyTags.length > 0 && (
              <div className="proc-popup__tags">
                {zoneOnlyTags.map((z) => (
                  <span key={z.id} className="proc-popup__tag">
                    {z.name}
                    <button
                      className="proc-popup__tag-remove"
                      onClick={() => setSelectedZones((prev) => prev.filter((x) => x !== z.id))}
                    >×</button>
                  </span>
                ))}
              </div>
            )}
          </>
        )}

        {/* Settings — machine only */}
        {isMachine && (
          <>
            <div className="proc-popup__field-label" style={{ marginTop: 14 }}>การตั้งค่า</div>
            <button
              className={`proc-popup__select-btn ${showSettingsError ? 'proc-popup__select-btn--error' : ''}`}
              onClick={() => setShowSettings(true)}
            >
              <span>ระบุการตั้งค่า</span>
              <IconChevronRight />
            </button>
            {settingTags.length > 0 && (
              <div className="proc-popup__tags">
                {settingTags.map((tag, i) => (
                  <span key={i} className="proc-popup__tag">
                    {tag}
                    <button
                      className="proc-popup__tag-remove"
                      onClick={() => {
                        const key = tag.split(' | ')[0];
                        setSettings(prev => ({ ...prev, [key]: '' }));
                      }}
                    >×</button>
                  </span>
                ))}
              </div>
            )}
          </>
        )}

        {/* Settings — laser only */}
        {isLaser && selectedPositions.length > 0 && (
          <>
            <div className="proc-popup__field-label" style={{ marginTop: 14 }}>การตั้งค่า</div>
            <button
              className={`proc-popup__select-btn ${showSettingsError ? 'proc-popup__select-btn--error' : ''}`}
              onClick={() => setShowLaserSettings(true)}
            >
              <span>ระบุการตั้งค่า</span>
              <IconChevronRight />
            </button>
            {laserSettings.length > 0 && (
              <div className="proc-popup__tags">
                {laserSettings.filter(s => s.P || s.F || s.Shot).map((s, i) => (
                  <span key={i} className="proc-popup__tag">
                    {s.positionName} {s.P ? `${s.P} P` : ''}{s.F ? ` | ${s.F} F` : ''}{s.Shot ? ` | ${s.Shot} Shot` : ''}
                    <button
                      className="proc-popup__tag-remove"
                      onClick={() => setLaserSettings(prev => prev.filter((_, idx) => idx !== i))}
                    >×</button>
                  </span>
                ))}
              </div>
            )}
          </>
        )}

        {/* Note */}
        <div className="proc-popup__field-label" style={{ marginTop: 14 }}>รายละเอียดเพิ่มเติม</div>
        <textarea
          className="proc-popup__textarea"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="กรอกรายละเอียดเพิ่มเติม (ถ้ามี)"
          rows={3}
        />

        <button className="btn-primary" style={{ marginTop: 14 }} onClick={handleSave}>บันทึก</button>
      </div>

      {/* Participants */}
      <div className={`proc-popup__section ${showParticipantsError ? 'proc-popup__section--error' : ''}`}>
        <div className="proc-popup__participants-header">
          <span className="proc-popup__section-title">ผู้ร่วมทำหัตถการ</span>
          <button className="proc-popup__add-participant" onClick={() => setShowQR(true)}>
            <IconPlus />
          </button>
        </div>
        {participants.length > 0 && (
          <div className="proc-popup__participant-list">
            {visibleParticipants.map(u => (
              <div key={u.id} className="participant-item">
                <img src={avatarImg} alt={u.nickname} className="participant-item__avatar" />
                <div className="participant-item__info">
                  <div className="participant-item__name">{u.fullName} ({u.nickname})</div>
                  <div className="participant-item__role">{u.role}</div>
                </div>
                <button
                  className="participant-item__remove"
                  onClick={() => removeParticipant(u.id)}
                >
                  <IconClose />
                </button>
              </div>
            ))}
            {participants.length > 2 && (
              <button
                className="proc-popup__view-more"
                onClick={() => setShowViewMore(v => !v)}
              >
                {showViewMore ? 'ซ่อน ▲' : 'View more ▾'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Time */}
      <div className="proc-popup__section proc-popup__time-section">
        <div className="proc-popup__time-header">
          <span className="proc-popup__section-title">เวลาทำหัตถการ</span>
          <span className="proc-popup__time-badge">กำลังทำ</span>
        </div>
        <div className="proc-popup__time-row">
          <IconClock />
          <span className="proc-popup__time-text">
            0 ชม. 1 นาที
            <span className="proc-popup__time-hint">&nbsp;(ปกติ {proc.estimatedHours || 2} ชม.)</span>
          </span>
        </div>
        <div className="proc-popup__time-sub">เริ่ม {proc.startTime} น. ถึง xx:xx น.</div>
        <button className="btn-complete" onClick={() => setShowCompleteConfirm(true)}>
          เสร็จสิ้นหัตถการ
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Bottom Sheet: Select Category
───────────────────────────────────────── */
function CategoryBottomSheet({ onClose, onSelect }) {
  const [visible, setVisible] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  function handleNext() {
    if (selectedCat) {
      onSelect(selectedCat);
    }
  }

  return (
    <div className={`bottom-sheet-overlay ${visible ? 'bottom-sheet-overlay--visible' : ''}`}
      onClick={handleClose}>
      <div
        className={`bottom-sheet ${visible ? 'bottom-sheet--visible' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="bottom-sheet__handle" />
        <h3 className="bottom-sheet__title">เลือกหมวดหมู่</h3>
        <div className="bottom-sheet__list">
          {PROC_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`bottom-sheet__item ${selectedCat?.id === cat.id ? 'bottom-sheet__item--selected' : ''}`}
              onClick={() => setSelectedCat(cat)}
            >
              <span className="bottom-sheet__item-icon">
                <CatIcon iconKey={cat.iconKey} />
              </span>
              <span className="bottom-sheet__item-label">{cat.name}</span>
            </button>
          ))}
        </div>
        <button
          className="btn-primary"
          onClick={handleNext}
          disabled={!selectedCat}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Bottom Sheet: Select Machine (no animation)
───────────────────────────────────────── */
function MachineBottomSheet({ onClose, onAdd }) {
  const [selectedMachine, setSelectedMachine] = useState(null);

  function handleAdd() {
    if (selectedMachine) onAdd(selectedMachine);
  }

  return (
    <div className="bottom-sheet-overlay bottom-sheet-overlay--visible" onClick={onClose}>
      <div className="bottom-sheet bottom-sheet--visible" onClick={e => e.stopPropagation()}>
        <div className="bottom-sheet__handle" />
        <h3 className="bottom-sheet__title">เลือกหัตถการ</h3>
        <div className="bottom-sheet__machine-list">
          {MACHINE_TYPES.map(m => (
            <label key={m.id} className={`machine-item ${selectedMachine?.id === m.id ? 'machine-item--selected' : ''}`}>
              <span className="machine-item__radio">
                <span className={`radio-dot ${selectedMachine?.id === m.id ? 'radio-dot--active' : ''}`} />
              </span>
              <span className="machine-item__name">{m.name}</span>
              <input
                type="radio"
                name="machine"
                value={m.id}
                checked={selectedMachine?.id === m.id}
                onChange={() => setSelectedMachine(m)}
                style={{ display: 'none' }}
              />
            </label>
          ))}
        </div>
        <div className="bottom-sheet__actions">
          <button className="btn-outline" onClick={onClose}>ย้อนกลับ</button>
          <button className="btn-primary" onClick={handleAdd} disabled={!selectedMachine}>
            เพิ่มรายการ
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Bottom Sheet: Select Inject Type
───────────────────────────────────────── */
function InjectBottomSheet({ onClose, onAdd }) {
  const [selectedInject, setSelectedInject] = useState(null);

  function handleAdd() {
    if (selectedInject) onAdd(selectedInject);
  }

  return (
    <div className="bottom-sheet-overlay bottom-sheet-overlay--visible" onClick={onClose}>
      <div className="bottom-sheet bottom-sheet--visible" onClick={e => e.stopPropagation()}>
        <div className="bottom-sheet__handle" />
        <h3 className="bottom-sheet__title">เลือกหัตถการ</h3>
        <div className="bottom-sheet__machine-list">
          {INJECT_TYPES.map(inj => (
            <label key={inj.id} className={`machine-item ${selectedInject?.id === inj.id ? 'machine-item--selected' : ''}`}>
              <span className="machine-item__radio">
                <span className={`radio-dot ${selectedInject?.id === inj.id ? 'radio-dot--active' : ''}`} />
              </span>
              <span className="machine-item__name">{inj.name}</span>
              <input
                type="radio"
                name="inject"
                value={inj.id}
                checked={selectedInject?.id === inj.id}
                onChange={() => setSelectedInject(inj)}
                style={{ display: 'none' }}
              />
            </label>
          ))}
        </div>
        <div className="bottom-sheet__actions">
          <button className="btn-outline" onClick={onClose}>ย้อนกลับ</button>
          <button className="btn-primary" onClick={handleAdd} disabled={!selectedInject}>
            เพิ่มรายการ
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Bottom Sheet: Select Wellness Type
───────────────────────────────────────── */
function WellnessBottomSheet({ onClose, onAdd }) {
  const [selectedWellness, setSelectedWellness] = useState(null);

  function handleAdd() {
    if (selectedWellness) onAdd(selectedWellness);
  }

  return (
    <div className="bottom-sheet-overlay bottom-sheet-overlay--visible" onClick={onClose}>
      <div className="bottom-sheet bottom-sheet--visible" onClick={e => e.stopPropagation()}>
        <div className="bottom-sheet__handle" />
        <h3 className="bottom-sheet__title">เลือกหัตถการ</h3>
        <div className="bottom-sheet__machine-list">
          {WELLNESS_TYPES.map(w => (
            <label key={w.id} className={`machine-item ${selectedWellness?.id === w.id ? 'machine-item--selected' : ''}`}>
              <span className="machine-item__radio">
                <span className={`radio-dot ${selectedWellness?.id === w.id ? 'radio-dot--active' : ''}`} />
              </span>
              <span className="machine-item__name">{w.name}</span>
              <input
                type="radio"
                name="wellness"
                value={w.id}
                checked={selectedWellness?.id === w.id}
                onChange={() => setSelectedWellness(w)}
                style={{ display: 'none' }}
              />
            </label>
          ))}
        </div>
        <div className="bottom-sheet__actions">
          <button className="btn-outline" onClick={onClose}>ย้อนกลับ</button>
          <button className="btn-primary" onClick={handleAdd} disabled={!selectedWellness}>
            เพิ่มรายการ
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Bottom Sheet: Select Laser (2-step: subtype → procedure)
───────────────────────────────────────── */
function LaserBottomSheet({ onClose, onAdd }) {
  const [step, setStep] = useState('subtype');
  const [selectedSubtype, setSelectedSubtype] = useState(null);
  const [selectedProc, setSelectedProc] = useState(null);

  const availableProcs = LASER_PROCEDURES.filter(p => p.laserSubtypeId === selectedSubtype?.id);

  function handleSubtypeNext() {
    if (selectedSubtype) {
      setSelectedProc(null);
      setStep('procedure');
    }
  }

  function handleAdd() {
    if (selectedProc && selectedSubtype) {
      onAdd({ subtype: selectedSubtype, procedure: selectedProc });
    }
  }

  return (
    <div className="bottom-sheet-overlay bottom-sheet-overlay--visible" onClick={onClose}>
      <div className="bottom-sheet bottom-sheet--visible" onClick={e => e.stopPropagation()}>
        <div className="bottom-sheet__handle" />

        {step === 'subtype' && (
          <>
            <h3 className="bottom-sheet__title">เลือกรูปแบบหัตถการ</h3>
            <div className="bottom-sheet__machine-list">
              {LASER_SUBTYPES.map(sub => (
                <label key={sub.id} className={`machine-item ${selectedSubtype?.id === sub.id ? 'machine-item--selected' : ''}`}>
                  <span className="machine-item__radio">
                    <span className={`radio-dot ${selectedSubtype?.id === sub.id ? 'radio-dot--active' : ''}`} />
                  </span>
                  <span className="machine-item__name">{sub.name}</span>
                  <input
                    type="radio"
                    name="laserSubtype"
                    value={sub.id}
                    checked={selectedSubtype?.id === sub.id}
                    onChange={() => setSelectedSubtype(sub)}
                    style={{ display: 'none' }}
                  />
                </label>
              ))}
            </div>
            <button
              className="btn-primary"
              onClick={handleSubtypeNext}
              disabled={!selectedSubtype}
            >
              ถัดไป
            </button>
          </>
        )}

        {step === 'procedure' && (
          <>
            <h3 className="bottom-sheet__title">เลือกหัตถการ</h3>
            <div className="bottom-sheet__machine-list bottom-sheet__machine-list--scrollable">
              {availableProcs.map(lp => (
                <label key={lp.id} className={`machine-item ${selectedProc?.id === lp.id ? 'machine-item--selected' : ''}`}>
                  <span className="machine-item__radio">
                    <span className={`radio-dot ${selectedProc?.id === lp.id ? 'radio-dot--active' : ''}`} />
                  </span>
                  <span className="machine-item__name">{lp.name}</span>
                  <input
                    type="radio"
                    name="laserProc"
                    value={lp.id}
                    checked={selectedProc?.id === lp.id}
                    onChange={() => setSelectedProc(lp)}
                    style={{ display: 'none' }}
                  />
                </label>
              ))}
            </div>
            <div className="bottom-sheet__actions">
              <button className="btn-outline" onClick={() => setStep('subtype')}>ย้อนกลับ</button>
              <button className="btn-primary" onClick={handleAdd} disabled={!selectedProc}>
                เพิ่มหัตถการ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Procedure Card
───────────────────────────────────────── */
function getCategoryLabel(proc) {
  const cat = PROC_CATEGORIES.find(c => c.id === proc.categoryId);
  const catName = cat ? cat.name : `หัตถการ${proc.type || ''}`;
  let itemName = '';
  if (proc.categoryId === 'cat4') {
    const subtypeName = proc.laserSubtypeName || '';
    itemName = subtypeName;
  } else {
    itemName = proc.machineName || proc.injectName || proc.wellnessName || proc.laserName || proc.name || '';
  }
  return `${catName} - ${itemName}`;
}

function getLaserProcName(proc) {
  return proc.laserProcName || proc.laserName || proc.name || '';
}

function getSettingLabel(proc) {
  if (proc.categoryId === 'cat4' && proc.laserSettings && proc.laserSettings.length > 0) {
    return proc.laserSettings
      .filter(s => s.P || s.F || s.Shot)
      .map(s => `${s.positionName} ${s.P ? s.P + ' P' : ''}${s.F ? ' | ' + s.F + ' F' : ''}${s.Shot ? ' | ' + s.Shot + ' Shot' : ''}`.trim())
      .join(', ');
  }
  if (proc.settings && typeof proc.settings === 'object' && !Array.isArray(proc.settings)) {
    const entries = Object.entries(proc.settings).filter(([, v]) => String(v).trim() !== '');
    if (entries.length > 0) return entries.map(([k, v]) => `${k} | ${v} shots`).join(', ');
  }
  return proc.settingsLabel || null;
}

function ProcedureCard({ proc, onDelete, onClick, canDeleteCard }) {
  const modifier = statusModifier(proc.status);
  const isWellness = proc.categoryId === 'cat3';
  const isSlimPen = isWellness && proc.wellnessId === 'w1';
  const isIVDrip = isWellness && proc.wellnessId === 'w2';
  const participants = proc.participants && proc.participants.length > 0
    ? proc.participants
    : getUsersByIds(proc.participantIds || []);

  const allPositions = proc.categoryId === 'cat2'
    ? INJECT_POSITIONS_ALL
    : proc.categoryId === 'cat4'
      ? LASER_BODY_POSITIONS
      : MACHINE_BODY_POSITIONS;
  const positionLabel = proc.selectedPositions && proc.selectedPositions.length > 0
    ? allPositions.filter(p => proc.selectedPositions.includes(p.id))
        .map(p => p.name).join(', ')
    : proc.position || null;

  /* Wellness - Slim Pen labels */
  const wellnessGoalLabel = proc.targetWeight
    ? `${proc.targetWeight} กก. ระยะเวลา ${proc.targetDurationMonths || '-'} เดือน`
    : '-';

  const wellnessBodyLabel = (() => {
    const parts = [];
    if (proc.startWeight) parts.push(`เริ่มต้น ${proc.startWeight} กก.`);
    if (proc.waist) parts.push(`รอบเอว ${proc.waist} นิ้ว`);
    if (proc.weight) parts.push(`น้ำหนัก ${proc.weight} กก.`);
    if (proc.muscle) parts.push(`กล้ามเนื้อ ${proc.muscle} กก.`);
    if (proc.fat) parts.push(`ไขมัน ${proc.fat}%`);
    return parts.length > 0 ? parts.join(', ') : '-';
  })();

  /* Wellness - IV Drip labels */
  const ivDripFormulaLabel = proc.ivFormula?.name || '-';
  const ivDripDetailsLabel = (() => {
    const parts = [];
    if (proc.ivSubFormula?.name) parts.push(proc.ivSubFormula.name);
    if (proc.ivVolume?.label) parts.push(proc.ivVolume.label);
    if (proc.ivFlowRate?.label) parts.push(proc.ivFlowRate.label);
    return parts.length > 0 ? parts.join(', ') : '-';
  })();

  const settingLabel = getSettingLabel(proc);
  const durationLabel = calcProcedureDuration(proc);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div
      className={`proc-card proc-card--${modifier}`}
      onClick={() => onClick(proc)}
      style={{ cursor: 'pointer' }}
    >
      {showDeleteConfirm && (
        <ConfirmDialog
          title="ยืนยันการลบหัตถการ"
          desc="หลังยืนยัน หัตถการจะถูกลบออกจาก OPD"
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => { setShowDeleteConfirm(false); onDelete(proc.id); }}
        />
      )}
      <div className="proc-card__header">
        <div className="proc-card__title-wrap">
          <div className="proc-card__title">
            {getCategoryLabel(proc)}
          </div>
          {proc.categoryId === 'cat4' && getLaserProcName(proc) && (
            <div className="proc-card__subtitle">{getLaserProcName(proc)}</div>
          )}
        </div>
        {canDeleteCard && (
          <button
            className="proc-card__close-btn"
            aria-label="ลบ"
            onClick={e => { e.stopPropagation(); setShowDeleteConfirm(true); }}
          >
            <IconClose />
          </button>
        )}
      </div>

      <div className="proc-card__body">
        <div className="proc-card__col">
          {isSlimPen ? (
            <>
              <div className="proc-card__field-label">เป้าหมาย</div>
              <div className="proc-card__field-value">
                {wellnessGoalLabel.length > 24 ? wellnessGoalLabel.slice(0, 24) + '…' : wellnessGoalLabel}
              </div>
              <div className="proc-card__field-label" style={{ marginTop: 8 }}>องค์ประกอบร่างกาย</div>
              <div className="proc-card__field-value proc-card__field-value--small">
                {wellnessBodyLabel.length > 30 ? wellnessBodyLabel.slice(0, 30) + '…' : wellnessBodyLabel}
              </div>
            </>
          ) : isIVDrip ? (
            <>
              <div className="proc-card__field-label">สูตร</div>
              <div className="proc-card__field-value">
                {ivDripFormulaLabel.length > 24 ? ivDripFormulaLabel.slice(0, 24) + '…' : ivDripFormulaLabel}
              </div>
              <div className="proc-card__field-label" style={{ marginTop: 8 }}>รายละเอียด</div>
              <div className="proc-card__field-value proc-card__field-value--small">
                {ivDripDetailsLabel.length > 30 ? ivDripDetailsLabel.slice(0, 30) + '…' : ivDripDetailsLabel}
              </div>
            </>
          ) : (
            <>
              <div className="proc-card__field-label">ตำแหน่ง</div>
              <div className="proc-card__field-value">
                {positionLabel
                  ? positionLabel.length > 20 ? positionLabel.slice(0, 20) + '…' : positionLabel
                  : '-'}
              </div>
              {settingLabel && (
                <>
                  <div className="proc-card__field-label" style={{ marginTop: 8 }}>การตั้งค่า</div>
                  <div className="proc-card__field-value proc-card__field-value--small">{settingLabel}</div>
                </>
              )}
            </>
          )}
        </div>

        <div className="proc-card__col proc-card__col--right">
          <div className="proc-card__field-label">ผู้ร่วมทำ</div>
          <div className="proc-card__participants">
            {participants.map((u) => (
              <div key={u.id} className="proc-card__participant-avatar" title={u.fullName}>
                <img src={avatarImg} alt={u.nickname} />
              </div>
            ))}
            {participants.length === 0 && (
              <div className="proc-card__participant-avatar proc-card__participant-avatar--empty">
                <IconUser />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="proc-card__footer">
        <div className="proc-card__time-row">
          <span className="proc-card__time-start">เริ่ม {proc.startTime} น.</span>
          <span className="proc-card__time-sep"><IconClock /></span>
          <span className="proc-card__time-duration">{durationLabel ?? '- ชม.'}</span>
        </div>
        <div className={`proc-card__status-badge proc-card__status-badge--${modifier}`}>
          {proc.status}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
function OpdDetailPage() {
  const navigate = useNavigate();
  const { hn } = useParams();
  const location = useLocation();

  const customer = location.state?.customer || customers.find((c) => c.hn === hn);
  const returnState = location.state?.returnState;

  /* ดึง roleId ของผู้ใช้ที่ login อยู่ */
  const currentUser = (() => {
    try {
      const stored = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  })();
  const currentUserRoleId = currentUser?.roleId || null;

  /* procedure list state */
  const [procedures, setProcedures] = useState(
    (customer?.procedures || []).map(p => ({ ...p, status: p.status || 'รอดำเนินการ' }))
  );

  /* UI state */
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [showMachineSheet, setShowMachineSheet] = useState(false);
  const [showInjectSheet, setShowInjectSheet] = useState(false);
  const [showWellnessSheet, setShowWellnessSheet] = useState(false);
  const [showLaserSheet, setShowLaserSheet] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [activeProcId, setActiveProcId] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const activeProcData = procedures.find(p => p.id === activeProcId);

  /* auto complete: in-progress card older than estimatedHours */
  useEffect(() => {
    const checkAndAutoComplete = () => {
      const now = getCurrentDateTime().getTime();
      setProcedures((prev) => {
        let changed = false;
        const next = prev.map((p) => {
          if (p.status !== 'กำลังทำ' || !p.createdAt) return p;
          const createdAtMs = new Date(p.createdAt).getTime();
          const estimateHours = Number(p.estimatedHours || 2);
          const dueMs = createdAtMs + estimateHours * 60 * 60 * 1000;
          if (now < dueMs) return p;

          changed = true;
          const endDateObj = new Date(dueMs);
          const hh = String(endDateObj.getHours()).padStart(2, '0');
          const mm = String(endDateObj.getMinutes()).padStart(2, '0');
          return {
            ...p,
            status: 'เสร็จสิ้น',
            endDate: endDateObj.toISOString(),
            endTime: `${hh}:${mm}`,
          };
        });
        return changed ? next : prev;
      });
    };

    checkAndAutoComplete();
    const timer = setInterval(checkAndAutoComplete, 30000);
    return () => clearInterval(timer);
  }, []);

  function handleBack() {
    navigate('/dashboard', { state: returnState ? { returnState } : undefined });
  }

  function handleAvatarClick() {
    setProfileOpen(true);
  }

  function handleProfileClose() {
    setProfileOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem('currentUser');
    navigate('/');
  }

  function handleFABClick() {
    setShowCategorySheet(true);
  }

  function handleCategorySelect(cat) {
    setSelectedCat(cat);
    setShowCategorySheet(false);
    if (cat.id === 'cat1') {
      setShowMachineSheet(true);
    } else if (cat.id === 'cat2') {
      setShowInjectSheet(true);
    } else if (cat.id === 'cat3') {
      setShowWellnessSheet(true);
    } else if (cat.id === 'cat4') {
      setShowLaserSheet(true);
    }
  }

  function handleAddMachine(machine) {
    const now = getCurrentDateTime();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');

    const newProc = {
      id: `proc_${now.getTime()}`,
      categoryId: 'cat1',
      machineId: machine.id,
      machineName: machine.name,
      status: 'รอดำเนินการ',
      startTime: `${hh}:${mm}`,
      endTime: null,
      note: '',
      participants: [],
      selectedZones: [],
      selectedPositions: [],
      settings: {},
      createdAt: now.toISOString(),
    };
    setProcedures(prev => [...prev, newProc]);
    setShowMachineSheet(false);
  }

  function handleAddInject(injectType) {
    const now = getCurrentDateTime();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');

    const newProc = {
      id: `proc_${now.getTime()}`,
      categoryId: 'cat2',
      injectId: injectType.id,
      injectName: injectType.name,
      status: 'รอดำเนินการ',
      startTime: `${hh}:${mm}`,
      endTime: null,
      note: '',
      participants: [],
      selectedZones: [],
      selectedPositions: [],
      settings: {},
      createdAt: now.toISOString(),
    };
    setProcedures(prev => [...prev, newProc]);
    setShowInjectSheet(false);
  }

  function handleAddWellness(wellnessType) {
    const now = getCurrentDateTime();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');

    const baseProc = {
      id: `proc_${now.getTime()}`,
      categoryId: 'cat3',
      wellnessId: wellnessType.id,
      wellnessName: wellnessType.name,
      status: 'รอดำเนินการ',
      startTime: `${hh}:${mm}`,
      endTime: null,
      note: '',
      participants: [],
      createdAt: now.toISOString(),
    };

    const newProc = wellnessType.id === 'w1' 
      ? {
          ...baseProc,
          waist: '',
          startWeight: '',
          weight: '',
          muscle: '',
          fat: '',
          targetWeight: '',
          targetDurationMonths: '',
        }
      : {
          ...baseProc,
          ivFormula: null,
          ivSubFormula: null,
          ivVolume: null,
          ivFlowRate: null,
        };

    setProcedures(prev => [...prev, newProc]);
    setShowWellnessSheet(false);
  }

  function handleAddLaser({ subtype, procedure }) {
    const now = getCurrentDateTime();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');

    const newProc = {
      id: `proc_${now.getTime()}`,
      categoryId: 'cat4',
      laserSubtypeId: subtype.id,
      laserSubtypeName: subtype.name,
      laserProcId: procedure.id,
      laserProcName: procedure.name,
      status: 'รอดำเนินการ',
      startTime: `${hh}:${mm}`,
      endTime: null,
      note: '',
      participants: [],
      selectedZones: [],
      selectedPositions: [],
      laserSettings: [],
      createdAt: now.toISOString(),
    };
    setProcedures(prev => [...prev, newProc]);
    setShowLaserSheet(false);
  }

  function handleDeleteProc(id) {
    setProcedures(prev => prev.filter(p => p.id !== id));
  }

  function handleOpenProc(proc) {
    /* การ์ดเสร็จสิ้นที่สร้างมาเกิน 1 วัน → ไม่สามารถแก้ไขได้ */
    if (proc.status === 'เสร็จสิ้น' && isCardOlderThanOneDay(proc)) return;
    setActiveProcId(proc.id);
  }

  function handleProcSave(updated) {
    setProcedures(prev => prev.map(p => p.id === updated.id ? updated : p));
    setActiveProcId(null);
  }

  function handleProcComplete(id) {
    const now = getCurrentDateTime();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    setProcedures(prev => prev.map(p =>
      p.id === id
        ? { ...p, status: 'เสร็จสิ้น', endTime: `${hh}:${mm}`, endDate: now.toISOString() }
        : p
    ));
    setActiveProcId(null);
  }

  if (!customer) {
    return (
      <MobileLayout>
        <div style={{ padding: 24, textAlign: 'center', color: '#888' }}>ไม่พบข้อมูล OPD</div>
      </MobileLayout>
    );
  }

  /* if viewing proc detail, show full-page popup */
  if (activeProcData) {
    return (
      <MobileLayout>
        <ProcDetailPopup
          proc={activeProcData}
          onClose={() => setActiveProcId(null)}
          onSave={handleProcSave}
          onComplete={handleProcComplete}
        />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="opd-detail">
        {/* Top App Bar */}
        <header className="opd-detail__topbar">
          <div className="opd-detail__topbar-logo">
            <img src={logoImg} alt="V Track" className="opd-detail__topbar-logo-img" />
          </div>
          <div className="opd-detail__topbar-actions">
            <button className="opd-detail__topbar-icon-btn" aria-label="ค้นหา">
              <IconSearch />
            </button>
            <button className="opd-detail__topbar-icon-btn" aria-label="QR Code">
              <IconQR />
            </button>
            <button 
              className={`opd-detail__topbar-avatar${!currentUser?.avatarUrl ? ' opd-detail__topbar-avatar--no-image' : ''}`}
              onClick={handleAvatarClick}
              aria-label="โปรไฟล์"
            >
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="โปรไฟล์ผู้ใช้" />
              ) : (
                <IconUserSmall />
              )}
            </button>
          </div>
        </header>

        {/* Back Button */}
        <div className="opd-detail__nav">
          <button
            className="opd-detail__back-btn"
            onClick={handleBack}
            aria-label="ย้อนกลับ"
          >
            <IconBack />
            <span>กลับหน้าสรุปรายงาน</span>
          </button>
        </div>

        <main className="opd-detail__body">
          <h1 className="opd-detail__title">รายละเอียด OPD</h1>

          {/* Info Card */}
          <div className="opd-detail__info-card">
            <div className="opd-detail__info-top">
              <div className="opd-detail__avatar">
                <IconUser />
              </div>
              <div className="opd-detail__info">
                <div className="opd-detail__hn-row">เลขที่ {customer.hn}</div>
                <div className="opd-detail__name">{customer.name}</div>
                <div className="opd-detail__sub">{customer.subLabel}</div>
              </div>
              <div className="opd-detail__branch-col">
                <span className="opd-detail__branch-label">สาขา {getBranchName(customer.branchId)}</span>
                <span className="opd-detail__doctor-label">{getDoctorNickname(customer.doctorId)}</span>
              </div>
            </div>

            <div className="opd-detail__info-mid">
              <div>
                <div className="opd-detail__field-label">วันที่</div>
                <div className="opd-detail__field-value">{customer.appointmentDate}</div>
              </div>
              <div>
                <div className="opd-detail__field-label">นัดหมาย</div>
                <div className="opd-detail__field-value">{customer.appointmentTime} น.</div>
              </div>
              <div>
                <div className="opd-detail__field-label">ผู้ร่วมทำ</div>
                <div className="opd-detail__field-avatars">
                  {getUsersByIds(customer.collaboratorIds || []).map((u) => (
                    <div key={u.id} className="opd-detail__participant-avatar" title={u.fullName}>
                      <img src={avatarImg} alt={u.nickname} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Procedures Section */}
          <h2 className="opd-detail__section-title">รายการหัตถการ</h2>

          <div className="opd-detail__proc-list">
            {[...procedures]
              .sort((a, b) => {
                const statusOrder = { 'รอดำเนินการ': 0, 'กำลังทำ': 1, 'เสร็จสิ้น': 2 };
                const sDiff = (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0);
                if (sDiff !== 0) return sDiff;
                const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return bCreated - aCreated;
              })
              .map((proc) => {
                const canDeleteCard = canDeleteProcCard(proc, currentUserRoleId);
                return (
                  <ProcedureCard
                    key={proc.id}
                    proc={proc}
                    onDelete={handleDeleteProc}
                    onClick={handleOpenProc}
                    canDeleteCard={canDeleteCard}
                  />
                );
              })}
          </div>
        </main>

        {/* FAB */}
        <button
          className="opd-detail__fab"
          aria-label="เพิ่มหัตถการ"
          onClick={handleFABClick}
        >
          <IconPlus />
        </button>

        {/* Category Bottom Sheet */}
        {showCategorySheet && (
          <CategoryBottomSheet
            onClose={() => setShowCategorySheet(false)}
            onSelect={handleCategorySelect}
          />
        )}

        {/* Machine Bottom Sheet */}
        {showMachineSheet && (
          <MachineBottomSheet
            onClose={() => setShowMachineSheet(false)}
            onAdd={handleAddMachine}
          />
        )}

        {/* Inject Bottom Sheet */}
        {showInjectSheet && (
          <InjectBottomSheet
            onClose={() => setShowInjectSheet(false)}
            onAdd={handleAddInject}
          />
        )}

        {/* Wellness Bottom Sheet */}
        {showWellnessSheet && (
          <WellnessBottomSheet
            onClose={() => setShowWellnessSheet(false)}
            onAdd={handleAddWellness}
          />
        )}

        {/* Laser Bottom Sheet */}
        {showLaserSheet && (
          <LaserBottomSheet
            onClose={() => setShowLaserSheet(false)}
            onAdd={handleAddLaser}
          />
        )}

        {/* Profile Modal */}
        {profileOpen && (
          <ProfileModal
            user={{
              fullName: currentUser?.fullName || '',
              nickname: currentUser?.nickname || '',
              role: currentUser?.role || getRoleName(currentUser?.roleId),
              branchName: currentUser?.branch 
                ? `สาขา${getBranchFullName(currentUser.branchId)} (${getBranchName(currentUser.branchId)})`
                : `สาขา${getBranchFullName(currentUser?.branchId)} (${getBranchName(currentUser?.branchId)})`
            }}
            avatarUrl={currentUser?.avatarUrl}
            onClose={handleProfileClose}
            onLogout={handleLogout}
          />
        )}
      </div>
    </MobileLayout>
  );
}

export default OpdDetailPage;
