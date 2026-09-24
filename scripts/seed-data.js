/**
 * Seed Additional 2 Categories and 10 Products into Live Services
 * B2B E-commerce Product Management PoC
 */

const CA_URL = 'http://localhost:8002';
const PD_URL = 'http://localhost:8001';

const newCategories = [
  {
    name: 'Cybersecurity & Network Defense',
    sort_order: 5,
    status: 'ACTIVE'
  },
  {
    name: 'AI & Data Analytics Platform',
    sort_order: 6,
    status: 'ACTIVE'
  }
];

const newProducts = [
  {
    name: 'Next-Gen AI Edge Accelerator',
    price: 3200.00,
    sku: 'EP-AI-101',
    description: 'High-performance TPU accelerator board for real-time edge computer vision inference.',
    categoryName: 'AI & Data Analytics Platform',
    image_url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'Zero-Trust Enterprise Firewall Gateway',
    price: 6800.00,
    sku: 'EP-SEC-202',
    description: 'Hardware security appliance featuring deep packet inspection and automated intrusion prevention.',
    categoryName: 'Cybersecurity & Network Defense',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'Industrial SCADA Monitoring Controller',
    price: 1450.00,
    sku: 'EP-IOT-303',
    description: 'DIN-rail mountable PLC and telemetry controller for automated factory machinery.',
    categoryName: 'Hardware & IoT',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'Smart Automated Forklift Fleet Manager',
    price: 19500.00,
    sku: 'EP-LOG-404',
    description: 'Centralized telemetry hub for autonomous guided vehicles and warehouse logistics robotics.',
    categoryName: 'Supply Chain & Logistics',
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'Distributed Cloud Kubernetes Engine Box',
    price: 9800.00,
    sku: 'EP-CLD-505',
    description: 'Plug-and-play bare metal Kubernetes cluster appliance with built-in zero-downtime failover.',
    categoryName: 'Cloud Solutions',
    image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'Automated Threat Detection & SIEM Software',
    price: 12400.00,
    sku: 'EP-SEC-606',
    description: 'Enterprise SIEM security platform with machine learning-driven anomaly detection.',
    categoryName: 'Cybersecurity & Network Defense',
    image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'B2B Multi-Vendor Billing & Invoicing Engine',
    price: 5200.00,
    sku: 'EP-ERP-707',
    description: 'Automated recurring billing, tax calculation, and multi-currency settlement gateway.',
    categoryName: 'Enterprise Software',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'IoT Environmental Air & Gas Sensor Node',
    price: 490.00,
    sku: 'EP-IOT-808',
    description: 'Industrial hazardous gas and particulate matter monitor with LoRaWAN wireless connectivity.',
    categoryName: 'Hardware & IoT',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'High-Speed Cold Storage Archive Appliance',
    price: 15300.00,
    sku: 'EP-CLD-909',
    description: 'Petabyte-scale on-premise object storage appliance compatible with S3 API protocol.',
    categoryName: 'Cloud Solutions',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'Real-Time GPS Fleet Telematics Tracker',
    price: 280.00,
    sku: 'EP-LOG-010',
    description: 'Ruggedized 4G LTE vehicle tracking unit with OBD-II diagnostic telemetry sensors.',
    categoryName: 'Supply Chain & Logistics',
    image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&auto=format&fit=crop&q=80'
  }
];

async function seedData() {
  console.log('=====================================================');
  console.log('🌱 Seeding 2 New Categories and 10 New Products');
  console.log('=====================================================\n');

  try {
    // 1. Create 2 Categories in CA Service
    console.log('[Step 1] Adding 2 New Categories to CA Service...');
    const categoryMap = new Map();

    // Fetch existing categories first
    const existingCats = await fetch(`${CA_URL}/api/categories`).then(r => r.json());
    existingCats.forEach(c => categoryMap.set(c.name, c.id));

    for (const cat of newCategories) {
      if (!categoryMap.has(cat.name)) {
        const res = await fetch(`${CA_URL}/api/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cat)
        });
        const created = await res.json();
        categoryMap.set(created.name, created.id);
        console.log(`  ✅ Added Category: "${created.name}" (ID: ${created.id})`);
      } else {
        console.log(`  ℹ️ Category already exists: "${cat.name}"`);
      }
    }

    // Refresh categories map
    const allCats = await fetch(`${CA_URL}/api/categories`).then(r => r.json());
    allCats.forEach(c => categoryMap.set(c.name, c.id));

    // 2. Create 10 Products in PD Service
    console.log('\n[Step 2] Adding 10 New Products to PD Service...');
    let count = 1;
    for (const prod of newProducts) {
      const categoryId = categoryMap.get(prod.categoryName) || allCats[0].id;
      const payload = {
        name: prod.name,
        price: prod.price,
        sku: prod.sku,
        description: prod.description,
        category_id: categoryId,
        image_url: prod.image_url
      };

      const res = await fetch(`${PD_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const created = await res.json();
      console.log(`  ✅ [${count}/10] Added: "${created.name}" | SKU: ${created.sku} | $${created.price} | Cat: ${prod.categoryName}`);
      count++;
    }

    console.log('\n=====================================================');
    console.log('🎉 Seeding Completed Successfully!');
    console.log('=====================================================');
  } catch (error) {
    console.error('❌ Seeding Error:', error.message);
  }
}

seedData();
