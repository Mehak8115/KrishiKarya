export const PRODUCE = [
  { id:'p1',  name:{en:'Wheat',hi:'गेहूं'}, icon:'wheat', category:'grain', farmer:'Ramesh Kumar', location:'Haryana', grade:'A', price:28, unit:'per_kg', days:2 },
  { id:'p2',  name:{en:'Carrot',hi:'गाजर'}, icon:'carrot', category:'vegetable', farmer:'Sunita Devi', location:'Punjab', grade:'A', price:35, unit:'per_kg', days:1 },
  { id:'p3',  name:{en:'Tomato',hi:'टमाटर'}, icon:'tomato', category:'vegetable', farmer:'Vijay Patil', location:'Maharashtra', grade:'B', price:22, unit:'per_kg', days:3 },
  { id:'p4',  name:{en:'Alphonso Mango',hi:'अल्फांसो आम'}, icon:'mango', category:'fruit', farmer:'Suresh Naik', location:'Ratnagiri', grade:'A', price:280, unit:'per_dozen', days:4 },
  { id:'p5',  name:{en:'Red Onion',hi:'लाल प्याज़'}, icon:'onion', category:'vegetable', farmer:'Ganesh More', location:'Nashik', grade:'A', price:18, unit:'per_kg', days:1 },
  { id:'p6',  name:{en:'Potato',hi:'आलू'}, icon:'potato', category:'vegetable', farmer:'Harpreet Singh', location:'Uttar Pradesh', grade:'B', price:15, unit:'per_kg', days:5 },
  { id:'p7',  name:{en:'Green Chili',hi:'हरी मिर्च'}, icon:'chili', category:'spice', farmer:'Meena Reddy', location:'Andhra Pradesh', grade:'A', price:60, unit:'per_kg', days:2 },
  { id:'p8',  name:{en:'Black Grapes',hi:'काले अंगूर'}, icon:'grapes', category:'fruit', farmer:'Priya Jadhav', location:'Sangli', grade:'A', price:90, unit:'per_kg', days:3 },
  { id:'p9',  name:{en:'Banana',hi:'केला'}, icon:'banana', category:'fruit', farmer:'Anand Pillai', location:'Tamil Nadu', grade:'B', price:40, unit:'per_dozen', days:2 },
  { id:'p10', name:{en:'Cauliflower',hi:'फूलगोभी'}, icon:'cauliflower', category:'vegetable', farmer:'Kiran Yadav', location:'Bihar', grade:'A', price:30, unit:'per_kg', days:1 },
  { id:'p11', name:{en:'Basmati Rice',hi:'बासमती चावल'}, icon:'wheat', category:'grain', farmer:'Baldev Singh', location:'Punjab', grade:'A', price:85, unit:'per_kg', days:6 },
  { id:'p12', name:{en:'Spinach',hi:'पालक'}, icon:'leaf', category:'vegetable', farmer:'Lata Sharma', location:'Rajasthan', grade:'A', price:25, unit:'per_kg', days:1 },
  { id:'p13', name:{en:'Turmeric',hi:'हल्दी'}, icon:'chili', category:'spice', farmer:'Ravi Kumar', location:'Karnataka', grade:'A', price:120, unit:'per_kg', days:7 },
  { id:'p14', name:{en:'Pomegranate',hi:'अनार'}, icon:'grapes', category:'fruit', farmer:'Ahmed Khan', location:'Solapur', grade:'B', price:110, unit:'per_kg', days:4 },
];

export const CATEGORIES = [
  { v:'all', en:'All categories', hi:'सभी श्रेणियाँ' },
  { v:'vegetable', en:'Vegetables', hi:'सब्ज़ियाँ' },
  { v:'fruit', en:'Fruits', hi:'फल' },
  { v:'grain', en:'Grains', hi:'अनाज' },
  { v:'spice', en:'Spices', hi:'मसाले' },
];

export const LOCATIONS = [
  'Haryana','Punjab','Maharashtra','Ratnagiri','Nashik',
  'Uttar Pradesh','Andhra Pradesh','Sangli','Tamil Nadu',
  'Bihar','Rajasthan','Karnataka','Solapur'
];

/* ---- Mock AI analysis ---- */
const DISEASE_RESULTS = [
  { status:'Healthy', issue:'None detected', severity:'None', confidence:94, badge:'good', badgeLabel:'Healthy',
    rec:'Crop looks healthy. Continue normal care and monitor weekly.' },
  { status:'Early Blight', issue:'Alternaria solani', severity:'Mild', confidence:88, badge:'warn', badgeLabel:'Warning',
    rec:'Apply copper-based fungicide. Remove affected leaves. Improve air circulation.' },
  { status:'Late Blight', issue:'Phytophthora infestans', severity:'Moderate', confidence:91, badge:'bad', badgeLabel:'Alert',
    rec:'Urgent: apply systemic fungicide. Isolate affected plants. Reduce irrigation.' },
];
const RIPENESS_RESULTS = [
  { stage:'Pre-ripe', window:'5–7 days', sugar:'8–10 Brix', confidence:87, badge:'warn', badgeLabel:'Pre-ripe',
    rec:'Harvest in 5–7 days for optimal sweetness and shelf life.' },
  { stage:'Ripe', window:'Harvest now', sugar:'14–16 Brix', confidence:95, badge:'good', badgeLabel:'Peak Ripe',
    rec:'Optimal window. Harvest now for peak flavour and retail grade.' },
  { stage:'Over-ripe', window:'Immediate action', sugar:'18+ Brix', confidence:82, badge:'bad', badgeLabel:'Over-ripe',
    rec:'Process immediately for juice/pulp. Not suitable for fresh retail.' },
];
const QUALITY_RESULTS = [
  { grade:'A', size:'Uniform (85%+)', surface:'Excellent — no blemishes', price:'₹35–42 /kg', confidence:93, badge:'good', badgeLabel:'Grade A',
    rec:'Premium grade. Suitable for organised retail and export chains.' },
  { grade:'B', size:'Moderate (65–84%)', surface:'Minor blemishes (<10%)', price:'₹22–28 /kg', confidence:89, badge:'warn', badgeLabel:'Grade B',
    rec:'Mid-market grade. Suitable for local retail. Minor cosmetic sorting recommended.' },
  { grade:'C', size:'Non-uniform (<65%)', surface:'Visible defects (>10%)', price:'₹12–18 /kg', confidence:85, badge:'bad', badgeLabel:'Grade C',
    rec:'Processing grade only. Not suitable for fresh retail display.' },
];

function pseudoRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function runAnalysis(tool, seed) {
  const idx = pseudoRandom(String(seed)) % 3;
  if (tool === 'disease') return { type: 'disease', ...DISEASE_RESULTS[idx] };
  if (tool === 'ripeness') return { type: 'ripeness', ...RIPENESS_RESULTS[idx] };
  return { type: 'quality', ...QUALITY_RESULTS[idx] };
}
