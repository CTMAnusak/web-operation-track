# Mock DateTime Configuration

## วัตถุประสงค์

ไฟล์ `mockDateTime.js` ใช้สำหรับกำหนดวันที่และเวลาในระบบที่จุดเดียว เพื่อความสะดวกในการทดสอบหรือสาธิต

## วิธีการใช้งาน

### 1. เซ็ตวันที่และเวลาแบบคงที่

แก้ไขไฟล์ `mockDateTime.js` โดย uncomment บรรทัด `MOCK_DATE_TIME`:

```javascript
export const MOCK_DATE_TIME = new Date(2026, 10, 26, 11, 0, 0); // 26/11/2026 เวลา 11:00:00
```

**หมายเหตุ:** เดือนเริ่มต้นที่ 0 (มกราคม = 0, กุมภาพันธ์ = 1, ..., พฤศจิกายน = 10, ธันวาคม = 11)

### 2. ใช้วันที่และเวลาปัจจุบัน

Comment บรรทัด `MOCK_DATE_TIME` และ uncomment บรรทัดถัดไป:

```javascript
// export const MOCK_DATE_TIME = new Date(2026, 10, 26, 11, 0, 0);
export const MOCK_DATE_TIME = null;
```

หรือลบไฟล์ `mockDateTime.js` ออกจากโปรเจคได้เลย แล้วลบการ import ในไฟล์ที่เกี่ยวข้อง

## ไฟล์ที่ใช้งาน

- `src/pages/DashboardPage.jsx`
- `src/pages/OpdDetailPage.jsx`
- `src/components/DatePickerScreen.jsx`

## ฟังก์ชันที่มี

- `getCurrentDateTime()` - ดึงวันที่และเวลาปัจจุบัน (รวมชั่วโมง:นาที:วินาที)
- `getCurrentDate()` - ดึงวันที่ปัจจุบัน (เวลา 00:00:00)
