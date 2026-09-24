# B2B E-commerce Product Management Dashboard (PoC)

ระบบจัดการข้อมูลหลังบ้าน (Back-office Product Management Dashboard) เพื่อพิสูจน์แนวคิดการแยกส่วนประกอบแบบ Microservices บนสภาพแวดล้อม Kubernetes (K8S)

---

## 🏛️ สถาปัตยกรรมระบบ (Architecture Overview)

ระบบประกอบด้วย 4 เซอร์วิสหลัก และ 2 ส่วนจัดเก็บข้อมูล:

| Service / Component | Layer | Port | Role & Responsibility |
|---|---|---|---|
| **Next.js (Frontend)** | UI & Orchestrator | `3000` | จัดการ UI/UX Admin Dashboard, ดึงข้อมูล และเป็นตัวประสาน Flow ข้ามเซอร์วิส |
| **PD Service** | Backend API | `8001` | ศูนย์กลางการจัดการข้อมูลสินค้า (ชื่อ, ราคา, รายละเอียด, ID หมวดหมู่, URL รูปภาพ) ต่อกับ `product_schema` |
| **CA Service** | Backend API | `8002` | ศูนย์กลางการจัดการข้อมูลหมวดหมู่ (ชื่อ, ลำดับ, สถานะ) ต่อกับ `category_schema` |
| **FileStory Service** | Media Gateway | `8003` | รับไฟล์ภาพผ่าน Multipart/form-data สตรีมเข้า MinIO S3 และส่ง URL กลับ พร้อมลบไฟล์ขยะ |
| **PostgreSQL** | Relational DB | `5432` | แยก Schema: `product_schema` และ `category_schema` อย่างเด็ดขาด |
| **MinIO** | Object Storage | `9000` / `9001` | เก็บไฟล์รูปภาพ Bucket: `b2b-products` (Public Read) โหลดตรงสู่ UI |

---

## 🚀 วิธีการรันระบบ (How to Run)

### วิธีที่ 1: รันแบบ Standalone ในเครื่องทันที (Zero Setup)
คำสั่งนี้จะรัน 3 Microservices (PD: 8001, CA: 8002, FileStory: 8003) และ Next.js Frontend (Port: 3000) พร้อมกัน:

```bash
node scripts/run-local.js
```

หรือเปิดแยก Terminal 4 หน้าต่าง:
- **Terminal 1 (CA Service):** `cd services/category-service && npm start`
- **Terminal 2 (PD Service):** `cd services/product-service && npm start`
- **Terminal 3 (FileStory Service):** `cd services/filestory-service && npm start`
- **Terminal 4 (Frontend):** `cd frontend && npm run dev`

เข้าใช้งานเว็บที่: **http://localhost:3000**

---

### วิธีที่ 2: รันผ่าน Docker Compose (Full Stack with PostgreSQL & MinIO)
เมื่อเปิด Docker Desktop แล้ว รันคำสั่งเดียว:

```bash
docker compose up -d --build
```

- **Frontend:** http://localhost:3000
- **MinIO Web Console:** http://localhost:9001 (User: `minioadmin` / Pass: `minioadminpassword`)
- **PD Service Health:** http://localhost:8001/api/health
- **CA Service Health:** http://localhost:8002/api/health
- **FileStory Health:** http://localhost:8003/api/health

---

### วิธีที่ 3: Deploy ขึ้น Kubernetes (K8S)
มีไฟล์ Manifests เตรียมพร้อมไว้ในโฟลเดอร์ `k8s/`:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/minio.yaml
kubectl apply -f k8s/microservices.yaml
```

---

## 🔄 ลำดับการทำงานของ 4 Core CRUD Operations (Orchestration Flows)

1. **Read / List (เรียกดู):** Next.js เรียก `GET /api/products` (PD) และ `GET /api/categories` (CA) มาผสานจับคู่กัน รูปภาพโหลดตรงจาก MinIO Public URL
2. **Create (เพิ่มสินค้า):** ผู้ใช้กรอกฟอร์มและแนบรูป -> Next.js ส่งรูปไป FileStory บันทึกลง MinIO -> ได้รับ URL -> Next.js ส่งข้อมูลสินค้า + ID หมวดหมู่ + URL ไปยัง PD Service
3. **Update (อัปเดต):** แก้ไขข้อมูลทั่วไปส่งไป PD โดยตรง แต่ถ้าเปลี่ยนรูปใหม่ Next.js ส่งรูปไป FileStory เพื่อรับ URL ใหม่ก่อน และลบรูปเก่าใน MinIO เพื่อไม่ให้ตกค้าง
4. **Delete (ลบออก):** Next.js ส่ง `DELETE` ไปยัง PD และส่งคำสั่งลบไฟล์ภาพใน MinIO ผ่าน FileStory
5. **Data Consistency Guard:** เมื่อผู้ใช้พยายามลบหมวดหมู่ใน CA ระบบจะเช็คกับ PD ก่อนเสมอ หากยังมีสินค้าผูกอยู่ จะระงับการลบทันที
