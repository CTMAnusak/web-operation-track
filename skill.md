# สรุประบบ web-operation-track (V Track)

เอกสารนี้สรุปภาพรวมแอปพลิเคชันติดตามหัตถการ OPD สำหรับมือถือ โดยอิงจากโครงสร้างโค้ดและข้อมูล mock ในรีโปนี้

---

## วัตถุประสงค์

แบรนด์ **V Track** — ระบบช่วยให้ผู้ใช้งานคลินิก/สาขาเข้าสู่ระบบ ดูสรุปรายงานและรายการ OPD กรองตามวันที่ สาขา แพทย์ และผู้ร่วมทำหัตถการ ค้นหาลูกค้าด้วย HN/ชื่อ เปิดรายละเอียดเคสเพื่อดูและจัดการหัตถการหลายประเภท (เครื่อง ฉีด Wellness Laser)

---

## เทคโนโลยีหลัก

| รายการ | รายละเอียด |
|--------|-------------|
| Runtime | React 19 |
| Build / Dev | Vite 8 |
| Routing | `react-router-dom` v7 (`BrowserRouter`) |
| สไตล์ | Tailwind CSS v4 (`@tailwindcss/vite`) + CSS แยกตามหน้าใน `src/assets/css/` |
| ภาษา | JavaScript (`.jsx`) |

สคริปต์: `npm run dev` (พัฒนา), `npm run build`, `npm run preview`, `npm run lint`

---

## โครงสร้างโฟลเดอร์สำคัญ

```
src/
  App.jsx              → ห่อด้วย AppRouter เท่านั้น
  main.jsx             → mount + global.css
  routes/              → AppRouter.jsx, routePaths.js
  pages/               → หน้าหลักของแอป
  layouts/             → MobileLayout (กรอบมือถือ)
  components/          → ปุ่ม/อินพุต/โมดัลที่ใช้ร่วม
  services/            → authService
  mock/                → JSON + helper สำหรับข้อมูลจำลอง
  config/              → เวลาไทย + mock วันที่
  assets/              → รูป, css
db.json                → ผู้ใช้ + master data หัตถการ (โหลดผ่าน fetch ตอน login; import ใน bundle สำหรับบาง helper)
```

---

## เส้นทาง (Routing)

กำหนดใน `src/routes/routePaths.js`:

| Path | หน้า |
|------|------|
| `/` | Login |
| `/dashboard` | Dashboard (สรุปรายงาน + รายการ OPD) |
| `/search` | ค้นหาลูกค้า (เต็มหน้า) |
| `/opd/:hn` | รายละเอียด OPD ของ HN |

เส้นทางอื่น → redirect ไป `/`

**หมายเหตุ:** มีการตรวจ `localStorage.currentUser` เฉพาะบน **Dashboard** เท่านั้น หน้า `/search` และ `/opd/:hn` ไม่บังคับล็อกอินในโค้ดปัจจุบัน

---

## การยืนยันตัวตน (Mock)

- `authService.login` ดึง `/db.json` แล้วเทียบ `username` / `password` กับอาร์เรย์ `users`
- สำเร็จ → เก็บ `currentUser` (JSON) ใน **localStorage** พร้อมข้อมูล `branch`, `role` ที่ resolve จาก `branches.json` / `roles.json`
- ตัวเลือก Remember me → เก็บ `rememberedUser` (username) ใน localStorage
- ออกจากระบบ → ลบ `currentUser`

---

## ข้อมูลและแหล่งที่มา

1. **`src/mock/customers.json`**  
   รายการลูกค้า/เคส OPD จำลอง: HN, ชื่อ, สาขา, แพทย์, วันนัด, ผู้ร่วมงาน (`collaboratorIds`), และ **`procedures`** แต่ละรายการ (สถานะ, เวลา, โซน/ตำแหน่ง, ผู้ร่วมหัตถการ ฯลฯ)

2. **`db.json`**  
   - `users`: บัญชี mock สำหรับ login  
   - Master: หมวดหัตถการ, เครื่อง, โซนร่างกาย, ตำแหน่ง, ประเภทฉีด/Wellness/Laser, สูตร IV, ปริมาณ/อัตราหยด, แมปการตั้งค่าเครื่อง ฯลฯ  
   - `opdRecords`, `procedures`, `procedureParticipants` ในไฟล์นี้เป็นอาร์เรย์ว่าง (ยังไม่ผูก backend จริง)

3. **`src/mock/dataHelpers.js`**  
   แมป `branchId` / `roleId` / `userId`, ดึงรายชื่อแพทย์และผู้เข้าร่วม, คำนวณระยะเวลารวมของหัตถการ (อิง `db.json` ผ่าน import)

4. **`src/mock/procedureEffectiveStatus.js`**  
   กฎ “หัตถการกำลังทำ” ที่เกิน `estimatedHours` (ค่าเริ่มต้น 2 ชม.) จะถือว่า **เสร็จอัตโนมัติ** สำหรับการแสดงผลและเมตริก — ให้สอดคล้องกับ `useEffect` บน `OpdDetailPage`

5. **`src/config/thailandTime.js`**  
   จัดรูปแบบวันที่/เวลา timezone ไทย, เปรียบเทียบวันปฏิทินกรุงเทพ

6. **`src/config/mockDateTime.js`**  
   ตั้ง `MOCK_DATE_TIME` ได้เพื่อทดสอบ “วันนี้” คงที่; ถ้าเป็น `null` ใช้เวลาจริงของเครื่อง

---

## หน้าจอหลัก

### Login (`LoginPage.jsx`)

ฟอร์ม Sign In, เรียก `authService`, แสดง error ภาษาไทย, นำทางไป dashboard เมื่อสำเร็จ

### Dashboard (`DashboardPage.jsx`)

- ต้องมี `currentUser` ไม่งั้นส่งกลับหน้า login  
- หัวข้อ **สรุปรายงาน**: การ์ดสรุปจากรายการที่กรองแล้ว  
- **DatePickerCard**: แสดงช่วงวันที่ (อิง filter + เวลาไทย / mock date)  
- **รายการ OPD**: การ์ดแต่ละเคส → กดเข้า `/opd/:hn` พร้อม `state` (customer, returnState สำหรับย้อนกลับ)  
- Overlay: ค้นหา (HN/ชื่อ + ประวัติใน localStorage key `searchHistory`), สแกน QR (เปิดกล้องจริงแต่ผลลัพธ์ตอนนี้เป็น mock HN คงที่), โปรไฟล์ + ออกจากระบบ  
- **FilterModal**: วันที่เริ่ม–สิ้น, สาขา, แพทย์, ผู้ร่วมทำหัตถการ

### Customer Search (`CustomerSearchPage.jsx`)

ค้นหาแบบเต็มหน้า (logic เดียวกับ overlay บางส่วน); เลือกลูกค้าแล้วไป dashboard พร้อม `selectedCustomer` ใน `location.state`

### OPD Detail (`OpdDetailPage.jsx`)

- โหลด customer จาก `location.state.customer` หรือค้นจาก `customers.json` ด้วย `hn` จาก URL  
- แสดงรายการหัตถการเป็นการ์ด; แตะเปิด **ProcDetailPopup** แก้ไข/บันทึก/จบหัตถการ (ตาม role มีข้อจำกัดการลบการ์ด)  
- FAB เลือกหมวด → bottom sheet เพิ่มหัตถการ: เครื่อง / ฉีด / Wellness / Laser พร้อมโมดัลย่อย (โซน, ตำแหน่ง, การตั้งค่าเครื่อง, น้ำหนัก Slim pen, สูตร IV Drip ฯลฯ)  
- Auto-complete หัตถการ “กำลังทำ” ตาม `procedureEffectiveStatus` + interval 30 วินาที  
- โปรไฟล์ / logout; ปุ่มย้อนกลับส่งกลับ dashboard พร้อมคืน `returnState` ถ้ามี

---

## คอมโพเนนต์และเลย์เอาต์ที่ใช้ร่วม

- **MobileLayout**: จำกัดความกว้างแบบมือถือ  
- **AppButton, AppInput, AppCheckbox**: UI พื้นฐานหน้า login  
- **FilterModal, ProfileModal, DatePickerScreen**: ใช้บน dashboard / รายละเอียดตามบริบท

---

## สถานะการเชื่อมต่อ Backend

ปัจจุบันเป็น **frontend + ข้อมูลจำลอง**: ไม่มี API จริงสำหรับ CRUD OPD; การเปลี่ยนแปลงหัตถการอยู่ใน state ของ React เท่านั้น และจะหายเมื่อรีเฟรช (ยกเว้นข้อมูลที่อ่านจาก JSON ต้นฉบับ)

---

## ไฟล์อ้างอิงด่วน

| ไฟล์ | บทบาท |
|------|--------|
| `src/routes/AppRouter.jsx` | ประกาศ Route ทั้งหมด |
| `src/services/authService.js` | Login กับ `db.json` |
| `src/pages/DashboardPage.jsx` | หลักของรายงานและลิสต์ OPD |
| `src/pages/OpdDetailPage.jsx` | จัดการหัตถการแบบละเอียด |
| `db.json` | ผู้ใช้ + master หัตถการ |
| `src/mock/customers.json` | เคสลูกค้า + procedures ตัวอย่าง |

---

*อัปเดตตามสภาพรีโป ณ วันที่จัดทำเอกสารนี้ — หากมีการเพิ่ม API หรือย้ายข้อมูลออกจาก mock ควรปรับส่วน “สถานะการเชื่อมต่อ Backend” ให้สอดคล้อง*
