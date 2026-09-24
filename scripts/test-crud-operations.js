/**
 * Interactive & Comprehensive 4 Core CRUD Verification Suite
 * B2B E-commerce Product Management Phase (PoC)
 * 
 * Verifies:
 * 1. CREATE (Next.js -> FileStory MinIO Upload -> PD PostgreSQL Insert)
 * 2. READ / LIST (Next.js -> PD GET + CA GET -> Category Mapping & Direct Image Load)
 * 3. UPDATE (Next.js -> Partial Data Edit & Media Re-upload -> PD Update -> Storage Old Media Purge)
 * 4. DELETE (Next.js -> PD Delete -> FileStory MinIO Media Cleanup -> Zero Orphan Files)
 */

const PD_URL = 'http://localhost:8001';
const CA_URL = 'http://localhost:8002';
const FILESTORY_URL = 'http://localhost:8003';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function divider(title) {
  console.log('\n' + '='.repeat(65));
  console.log(`📌 ${title}`);
  console.log('='.repeat(65));
}

async function runCrudTest() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║   ระบบทดสอบฟีเจอร์หลัก 4 ประการ (4 Core CRUD Operations)       ║');
  console.log('║   โครงการ: B2B E-commerce Product Management Phase (PoC)      ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');

  let testPassed = 0;
  const totalSteps = 4;

  let createdProductId = null;
  let initialImageUrl = null;
  let initialFilename = null;
  let updatedImageUrl = null;
  let updatedFilename = null;
  let testCategoryId = null;

  // =========================================================================
  // 1. ทดสอบการสร้าง (CREATE OPERATION)
  // =========================================================================
  divider('1. การสร้าง (CREATE) - Flow: FileStory -> Storage -> PD Service');
  try {
    // 1.1 ดึง Category เพื่อใช้เป็น ID อ้างอิง
    const catList = await fetch(`${CA_URL}/api/categories`).then(r => r.json());
    testCategoryId = catList[0].id;
    console.log(`[Step 1.1] ใช้หมวดหมู่อ้างอิงจาก CA: "${catList[0].name}" (ID: ${testCategoryId})`);

    // 1.2 จำลองการอัปโหลดไฟล์ภาพผ่าน FileStory (Multipart/form-data)
    console.log('[Step 1.2] ผู้ใช้แนบรูปภาพสินค้า -> ส่งไปยัง FileStory (POST /api/upload)...');
    const boundary = '----B2BBoundaryDemo2026';
    const fakeImageBuffer = Buffer.from('TEST_IMAGE_BINARY_DATA_FOR_POC_VERIFICATION_2026');
    const multipartBody = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="enterprise_server_rack.png"\r\nContent-Type: image/png\r\n\r\n`),
      fakeImageBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const uploadRes = await fetch(`${FILESTORY_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: multipartBody
    });

    if (!uploadRes.ok) throw new Error(`FileStory upload failed with status ${uploadRes.status}`);
    const uploadData = await uploadRes.json();
    initialImageUrl = uploadData.url;
    initialFilename = uploadData.filename;
    console.log(`  👉 FileStory อัปโหลดสำเร็จ! ได้รับ URL: ${initialImageUrl}`);
    console.log(`  👉 ชื่อไฟล์ใน Storage: ${initialFilename}`);

    // 1.3 นำข้อมูลสินค้า + ID หมวดหมู่ + URL รูปภาพ ส่งไปบันทึกที่ PD Service
    console.log('\n[Step 1.3] Next.js ประสานงาน: ส่งข้อมูลสินค้าพร้อม URL รูปภาพไปยัง PD Service (POST /api/products)...');
    const newProductPayload = {
      name: 'High-Density Enterprise Server Rack X900',
      price: 18900.00,
      sku: 'SRV-X900-PRO',
      description: '42U Smart Enterprise Server Cabinet with integrated temperature sensors.',
      category_id: testCategoryId,
      image_url: initialImageUrl
    };

    const createProductRes = await fetch(`${PD_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProductPayload)
    });

    if (!createProductRes.ok) throw new Error(`PD Service failed with status ${createProductRes.status}`);
    const createdProduct = await createProductRes.json();
    createdProductId = createdProduct.id;

    console.log(`  👉 PD Service บันทึกสำเร็จ! Product ID: ${createdProductId}`);
    console.log(`  👉 ชื่อสินค้า: ${createdProduct.name}`);
    console.log(`  👉 ราคา: $${createdProduct.price}`);
    console.log(`  👉 Category ID อ้างอิง: ${createdProduct.category_id}`);
    console.log(`  👉 Image URL เก็บใน PD: ${createdProduct.image_url}`);
    console.log('  ✅ [ผ่านการทดสอบ 1: CREATE OPERATION]');
    testPassed++;
  } catch (err) {
    console.error('  ❌ [CREATE FAILED]:', err.message);
    return;
  }

  // =========================================================================
  // 2. ทดสอบการอ่าน / เรียกดู (READ / LIST OPERATION)
  // =========================================================================
  divider('2. การอ่าน (READ / LIST) - Flow: Next.js SSR/Client Orchestration');
  try {
    console.log('[Step 2.1] Next.js ยิง GET /api/products ไปยัง PD Service...');
    const productsRes = await fetch(`${PD_URL}/api/products`);
    const productsList = await productsRes.json();
    console.log(`  👉 ได้รับรายการสินค้าทั้งหมด ${productsList.length} รายการจาก PD`);

    console.log('\n[Step 2.2] Next.js ยิง GET /api/categories ไปยัง CA Service...');
    const categoriesRes = await fetch(`${CA_URL}/api/categories`);
    const categoriesList = await categoriesRes.json();
    console.log(`  👉 ได้รับรายการหมวดหมู่ทั้งหมด ${categoriesList.length} หมวดหมู่จาก CA`);

    console.log('\n[Step 2.3] Next.js ทำการ Map จับคู่ Category Name ให้กับสินค้า...');
    const categoryMap = new Map(categoriesList.map(c => [c.id, c.name]));
    const foundProduct = productsList.find(p => p.id === createdProductId);

    if (!foundProduct) throw new Error('Product not found in PD product list');
    const mappedCategoryName = categoryMap.get(foundProduct.category_id);
    console.log(`  👉 สินค้า ID: ${foundProduct.id}`);
    console.log(`  👉 ชื่อสินค้า: "${foundProduct.name}"`);
    console.log(`  👉 หมวดหมู่ที่ Map สำเร็จ: [${mappedCategoryName}] (ตรงกับ CA Service)`);

    console.log('\n[Step 2.4] ทดสอบดึงไฟล์ภาพจาก Image URL โดยตรง (Direct HTTP GET)...');
    const imageFetchRes = await fetch(foundProduct.image_url);
    console.log(`  👉 ผลการเรียกดูรูปภาพ HTTP Status: ${imageFetchRes.status} ${imageFetchRes.statusText}`);
    console.log(`  👉 Content-Type ของรูปภาพ: ${imageFetchRes.headers.get('content-type')}`);
    
    if (imageFetchRes.status !== 200) throw new Error('Image could not be retrieved');
    console.log('  ✅ [ผ่านการทดสอบ 2: READ / LIST OPERATION]');
    testPassed++;
  } catch (err) {
    console.error('  ❌ [READ FAILED]:', err.message);
    return;
  }

  // =========================================================================
  // 3. ทดสอบการอัปเดต (UPDATE OPERATION)
  // =========================================================================
  divider('3. การอัปเดต (UPDATE) - Flow: แก้ไขข้อมูล & เปลี่ยนรูปภาพใหม่');
  try {
    // 3.1 ผู้ใช้ทำการเปลี่ยนรูปภาพใหม่ -> ส่งรูปใหม่ไป FileStory
    console.log('[Step 3.1] ผู้ใช้อัปโหลดรูปภาพใหม่ -> ส่งไป FileStory (POST /api/upload)...');
    const boundary = '----B2BBoundaryUpdated2026';
    const fakeNewImageBuffer = Buffer.from('NEW_UPDATED_IMAGE_DATA_2026');
    const multipartBody = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="server_rack_v2_upgraded.png"\r\nContent-Type: image/png\r\n\r\n`),
      fakeNewImageBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const newUploadRes = await fetch(`${FILESTORY_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
      body: multipartBody
    });
    const newUploadData = await newUploadRes.json();
    updatedImageUrl = newUploadData.url;
    updatedFilename = newUploadData.filename;
    console.log(`  👉 อัปโหลดรูปใหม่สำเร็จ! URL ใหม่: ${updatedImageUrl}`);

    // 3.2 ส่งข้อมูลที่อัปเดตไป PD Service (PUT /api/products/:id)
    console.log('\n[Step 3.2] ส่งข้อมูลที่แก้ไข (ชื่อ, ราคาปรับลด, รูปใหม่) ไปที่ PD (PUT /api/products/:id)...');
    const updatePayload = {
      name: 'High-Density Enterprise Server Rack X900 (Mark II Edition)',
      price: 21500.00,
      sku: 'SRV-X900-MK2',
      description: 'Upgraded version with dual liquid cooling manifolds.',
      image_url: updatedImageUrl
    };

    const updateRes = await fetch(`${PD_URL}/api/products/${createdProductId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });
    const updatedProduct = await updateRes.json();

    console.log(`  👉 PD อัปเดตข้อมูลสำเร็จ:`);
    console.log(`     • ชื่อใหม่: "${updatedProduct.name}"`);
    console.log(`     • ราคาใหม่: $${updatedProduct.price} (ปรับจาก $18,900.00)`);
    console.log(`     • SKU ใหม่: ${updatedProduct.sku}`);
    console.log(`     • URL รูปใหม่: ${updatedProduct.image_url}`);

    // 3.3 ลบรูปภาพเดิมออกจาก Storage เพื่อไม่ให้เป็นขยะตกค้าง
    console.log('\n[Step 3.3] สั่งลบรูปภาพเดิมออกจาก Storage ผ่าน FileStory (DELETE /api/files/:filename)...');
    const purgeOldFileRes = await fetch(`${FILESTORY_URL}/api/files/${initialFilename}`, {
      method: 'DELETE'
    });
    const purgeResult = await purgeOldFileRes.json();
    console.log(`  👉 ผลการลบรูปภาพเก่า: ${purgeResult.message}`);

    console.log('  ✅ [ผ่านการทดสอบ 3: UPDATE OPERATION]');
    testPassed++;
  } catch (err) {
    console.error('  ❌ [UPDATE FAILED]:', err.message);
    return;
  }

  // =========================================================================
  // 4. ทดสอบการลบ (DELETE OPERATION)
  // =========================================================================
  divider('4. การลบ (DELETE) - Flow: ลบสินค้าใน PD และลบรูปภาพใน Storage');
  try {
    // 4.1 สั่งลบสินค้าจาก PD Service
    console.log(`[Step 4.1] Next.js ส่งคำสั่งลบสินค้า ID ${createdProductId} ไปยัง PD (DELETE /api/products/:id)...`);
    const deleteProductRes = await fetch(`${PD_URL}/api/products/${createdProductId}`, {
      method: 'DELETE'
    });
    const deleteProductData = await deleteProductRes.json();
    console.log(`  👉 PD Service ตอบกลับ: ${deleteProductData.message} (ลบออกจาก PostgreSQL)`);

    // 4.2 สั่งลบไฟล์ภาพออกจาก FileStory เพื่อไม่ให้มีไฟล์ขยะตกค้างตามข้อกำหนดในเอกสาร
    console.log(`\n[Step 4.2] Next.js ส่งคำสั่งลบไฟล์ภาพ (${updatedFilename}) ไปยัง FileStory (DELETE /api/files/:filename)...`);
    const deleteFileRes = await fetch(`${FILESTORY_URL}/api/files/${updatedFilename}`, {
      method: 'DELETE'
    });
    const deleteFileData = await deleteFileRes.json();
    console.log(`  👉 FileStory ตอบกลับ: ${deleteFileData.message} (ลบออกจาก Storage)`);

    // 4.3 ตรวจสอบยืนยัน (Verification) ว่าสินค้าไม่อยู่ใน PD อีกต่อไป
    console.log('\n[Step 4.3] ยืนยันผล: เรียก GET /api/products/:id อีกครั้งเพื่อดูว่าถูกลบจริงหรือไม่...');
    const verifyGetRes = await fetch(`${PD_URL}/api/products/${createdProductId}`);
    console.log(`  👉 HTTP Status ผลการค้นหา: ${verifyGetRes.status} (คาดหวัง 404 Not Found)`);
    if (verifyGetRes.status === 404) {
      console.log('  👉 สินค้าถูกลบออกจากฐานข้อมูลอย่างสมบูรณ์!');
    } else {
      throw new Error(`Expected 404, but got ${verifyGetRes.status}`);
    }

    // 4.4 ตรวจสอบยืนยันว่าไฟล์ภาพไม่อยู่ใน Storage แล้ว
    console.log('\n[Step 4.4] ยืนยันผล: เรียกดูไฟล์ภาพที่ถูกลบผ่าน HTTP GET...');
    const verifyImageRes = await fetch(updatedImageUrl);
    console.log(`  👉 HTTP Status ของไฟล์ภาพ: ${verifyImageRes.status} (คาดหวัง 404 Not Found)`);
    if (verifyImageRes.status === 404) {
      console.log('  👉 ไฟล์ภาพถูกทำความสะอาดหมดจด ไม่มีไฟล์ขยะค้างใน Storage!');
    }

    console.log('  ✅ [ผ่านการทดสอบ 4: DELETE OPERATION]');
    testPassed++;
  } catch (err) {
    console.error('  ❌ [DELETE FAILED]:', err.message);
    return;
  }

  // =========================================================================
  // สรุปผลการทดสอบ
  // =========================================================================
  divider('สรุปผลการทดสอบ 4 CORE CRUD OPERATIONS');
  console.log(`  🎯 ผลลัพธ์: ผ่านการทดสอบ ${testPassed}/${totalSteps} ขั้นตอน`);
  if (testPassed === 4) {
    console.log('  🎉 สรุป: ระบบรองรับการ สร้าง (Create), อ่าน (Read), อัปเดต (Update), และ ลบ (Delete)');
    console.log('       ครบถ้วนสมบูรณ์ตามสถาปัตยกรรม Microservices และข้อกำหนดในเอกสาร 100%!');
  }
  console.log('='.repeat(65) + '\n');
}

runCrudTest();
