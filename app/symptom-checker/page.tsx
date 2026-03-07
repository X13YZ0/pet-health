'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Step = 'profile' | 'symptoms' | 'details' | 'analyzing' | 'result';

interface PetProfile {
  species: 'dog' | 'cat' | '';
  name: string;
  age: 'puppy' | 'adult' | 'senior' | '';
  weight: 'small' | 'medium' | 'large' | '';
  gender: 'male' | 'female' | 'neutered' | 'spayed' | '';
  vaccine: 'current' | 'overdue' | 'unknown' | '';
}

interface SymptomDetails {
  vomitFreq: '1-2' | '3-5' | 'over5' | '';
  vomitColor: 'normal' | 'yellow' | 'blood' | '';
  diarrheaBlood: boolean | null;
  diarrheaFreq: '1-2' | '3-5' | 'over5' | '';
  breathingRate: 'under40' | '40-60' | 'over60' | '';
  gumColor: 'pink' | 'pale' | 'blue' | '';
  lethargyLevel: 'normal' | 'half' | 'noMove' | '';
  temperature: '38-39' | 'over39.5' | 'under37' | '';
  duration: 'under12h' | '12-24h' | 'over24h' | 'over48h' | '';
  severity: 'mild' | 'moderate' | 'severe' | '';
  newFood: boolean;
  newMedicine: boolean;
  atePoison: boolean;
  contactSick: boolean;
}

interface AnalysisResult {
  risk: 'low' | 'medium' | 'high' | 'emergency';
  score: number;
  maxScore: number;
  treeNodes: TreeNode[];
  reasons: ReasonItem[];
  recommendations: RecommendItem[];
}

interface TreeNode {
  node: string;
  question: string;
  answer: string;
  outcome: string;
  points: number;
}

interface ReasonItem {
  symptom: string;
  finding: string;
  vetContext: string;
  severity: 'info' | 'warn' | 'danger';
}

interface RecommendItem {
  title: string;
  detail: string;
  source: string;
  urgent: boolean;
}

// ─────────────────────────────────────────────
// DECISION TREE ENGINE
// ─────────────────────────────────────────────
function runDecisionTree(
  profile: PetProfile,
  selected: Record<string, boolean>,
  details: SymptomDetails
): AnalysisResult {
  const treeNodes: TreeNode[] = [];
  const reasons: ReasonItem[] = [];
  const recommendations: RecommendItem[] = [];
  let score = 0;

  // ── NODE 1: Emergency Override ──
  treeNodes.push({
    node: 'Node 1',
    question: 'มีอาการฉุกเฉินที่คุกคามชีวิตหรือไม่?',
    answer: selected.seizure ? 'ใช่ — ชัก/หมดสติ' : selected.breathing && details.gumColor === 'blue' ? 'ใช่ — เหงือกฟ้า' : 'ไม่มีอาการฉุกเฉินเร่งด่วน',
    outcome: selected.seizure || (selected.breathing && details.gumColor === 'blue') ? '→ EMERGENCY (ข้ามไปผลทันที)' : '→ ดำเนินต่อ Node 2',
    points: 0,
  });

  if (selected.seizure) {
    reasons.push({
      symptom: 'ชักหรือหมดสติ',
      finding: 'พบอาการชัก ซึ่งบ่งชี้ถึงความผิดปกติในระบบประสาทส่วนกลาง',
      vetContext: 'การชักในสัตว์เลี้ยงอาจเกิดจาก Epilepsy, Hypoglycemia, Toxin ingestion หรือ Brain disorder ทุกกรณีต้องพบสัตวแพทย์ฉุกเฉินทันที (VCA, 2023)',
      severity: 'danger',
    });
    recommendations.push({
      title: 'พาไปสัตวแพทย์ฉุกเฉินทันที',
      detail: 'ห้ามรอดูอาการ ห้ามให้กินอาหารหรือน้ำ ป้องกันไม่ให้ตัวกระทบกับสิ่งแวดล้อมระหว่างชัก',
      source: 'ASPCA Emergency Care Guidelines',
      urgent: true,
    });
    return { risk: 'emergency', score: 20, maxScore: 20, treeNodes, reasons, recommendations };
  }

  if (selected.breathing && details.gumColor === 'blue') {
    reasons.push({
      symptom: 'หายใจลำบาก + เหงือกสีม่วง/ฟ้า',
      finding: 'เหงือกสีม่วงหรือฟ้าบ่งชี้ถึงภาวะ Cyanosis — ออกซิเจนในเลือดต่ำวิกฤต',
      vetContext: 'Cyanosis เป็นภาวะฉุกเฉินระดับสูงสุด อาจเกิดจาก Pleural effusion, Pneumothorax หรือ Heart failure ต้องได้รับออกซิเจนเสริมและการรักษาทันที (Merck Vet Manual)',
      severity: 'danger',
    });
    recommendations.push({
      title: 'ฉุกเฉินสูงสุด — พาไปโรงพยาบาลสัตว์ทันที',
      detail: 'รักษาสัตว์ให้สงบ ไม่ตื่นเต้นหรือออกแรง จัดท่าให้ศีรษะสูงเล็กน้อย เปิดหน้าต่างรถระบายอากาศ',
      source: 'Merck Veterinary Manual — Respiratory Emergencies',
      urgent: true,
    });
    return { risk: 'emergency', score: 20, maxScore: 20, treeNodes, reasons, recommendations };
  }

  // ── NODE 2: Breathing (ไม่ถึง emergency) ──
  if (selected.breathing) {
    const rate = details.breathingRate;
    const pts = rate === 'over60' ? 6 : rate === '40-60' ? 4 : 2;
    score += pts;
    treeNodes.push({
      node: 'Node 2',
      question: 'อัตราการหายใจและสีเหงือกเป็นอย่างไร?',
      answer: `หายใจ ${rate === 'over60' ? '>60 ครั้ง/นาที' : rate === '40-60' ? '40-60 ครั้ง/นาที' : '<40 ครั้ง/นาที'} เหงือก${details.gumColor === 'pale' ? 'ซีด' : 'ชมพู (ปกติ)'}`,
      outcome: `→ +${pts} คะแนน`,
      points: pts,
    });
    reasons.push({
      symptom: 'หายใจลำบาก',
      finding: `อัตราการหายใจ ${rate === 'over60' ? 'เกิน 60 ครั้ง/นาที (สูงกว่าปกติมาก)' : '40-60 ครั้ง/นาที (เร็วกว่าปกติ)'}`,
      vetContext: rate === 'over60'
        ? 'อัตราปกติของสุนัข 15-30 ครั้ง/นาที แมว 20-30 ครั้ง/นาที การหายใจเร็วเกิน 60 ครั้งอาจเกิดจาก Pneumonia, Asthma (แมว), หรือ Congestive Heart Failure (AVMA)'
        : 'อัตราการหายใจสูงกว่าปกติ อาจเกิดจากความเครียด ความเจ็บปวด หรือโรคระบบทางเดินหายใจ (VCA)',
      severity: rate === 'over60' ? 'danger' : 'warn',
    });
  } else {
    treeNodes.push({
      node: 'Node 2', question: 'มีอาการหายใจลำบากหรือไม่?', answer: 'ไม่มี', outcome: '→ ดำเนินต่อ Node 3', points: 0,
    });
  }

  // ── NODE 3: Vomiting ──
  if (selected.vomiting) {
    const color = details.vomitColor;
    const freq = details.vomitFreq;
    const pts = color === 'blood' ? 5 : freq === 'over5' ? 4 : freq === '3-5' ? 3 : 2;
    score += pts;
    treeNodes.push({
      node: 'Node 3',
      question: 'ความถี่และลักษณะของการอาเจียนเป็นอย่างไร?',
      answer: `${freq === 'over5' ? '>5 ครั้ง/วัน' : freq === '3-5' ? '3-5 ครั้ง/วัน' : '1-2 ครั้ง/วัน'} สี${color === 'blood' ? 'มีเลือด' : color === 'yellow' ? 'เหลือง (น้ำดี)' : 'ปกติ'}`,
      outcome: `→ +${pts} คะแนน`,
      points: pts,
    });

    if (color === 'blood') {
      reasons.push({
        symptom: 'อาเจียนมีเลือด (Hematemesis)',
        finding: 'พบเลือดในสิ่งที่อาเจียน บ่งชี้ถึงความผิดปกติในระบบทางเดินอาหาร',
        vetContext: 'Hematemesis อาจเกิดจาก Gastric ulcer, Parvovirus (ลูกสุนัข), การกินสิ่งแปลกปลอม หรือ Hemorrhagic Gastroenteritis (HGE) ต้องพบสัตวแพทย์ทันที (VCA Animal Hospitals)',
        severity: 'danger',
      });
    } else if (color === 'yellow') {
      reasons.push({
        symptom: 'อาเจียนสีเหลือง (น้ำดี)',
        finding: 'อาเจียนเป็นน้ำดีสีเหลือง บ่งชี้ว่ากระเพาะว่างหรืออาหารไม่ผ่านลำไส้',
        vetContext: 'Bilious Vomiting Syndrome พบบ่อยในสุนัขที่อดอาหารนาน มักดีขึ้นเมื่อให้อาหาร แต่ถ้าเกิดบ่อยอาจเกี่ยวข้องกับ Pancreatitis หรือ Liver disease (Merck Vet Manual)',
        severity: freq === 'over5' ? 'danger' : 'warn',
      });
    } else {
      reasons.push({
        symptom: `อาเจียน ${freq === 'over5' ? 'บ่อยมาก (>5 ครั้ง/วัน)' : freq === '3-5' ? 'บ่อย (3-5 ครั้ง/วัน)' : '(1-2 ครั้ง/วัน)'}`,
        finding: freq === 'over5' ? 'อาเจียนถี่มากอาจทำให้ขาดน้ำอย่างรวดเร็ว' : 'อาเจียนระดับปานกลาง ควรเฝ้าระวัง',
        vetContext: freq === 'over5'
          ? 'การอาเจียนมากกว่า 5 ครั้ง/วันเสี่ยงต่อ Dehydration และ Electrolyte imbalance โดยเฉพาะในลูกสัตว์ (ASPCA)'
          : 'อาเจียน 1-3 ครั้งอาจเกิดจากการกินเร็ว เปลี่ยนอาหาร หรือระคายเคืองกระเพาะชั่วคราว (VCA)',
        severity: freq === 'over5' ? 'danger' : freq === '3-5' ? 'warn' : 'info',
      });
    }
  } else {
    treeNodes.push({ node: 'Node 3', question: 'มีอาการอาเจียนหรือไม่?', answer: 'ไม่มี', outcome: '→ ดำเนินต่อ Node 4', points: 0 });
  }

  // ── NODE 4: Diarrhea ──
  if (selected.diarrhea) {
    const pts = details.diarrheaBlood ? 5 : details.diarrheaFreq === 'over5' ? 3 : 2;
    score += pts;
    treeNodes.push({
      node: 'Node 4',
      question: 'ท้องเสียมีเลือดหรือไม่? ถ่ายบ่อยแค่ไหน?',
      answer: `${details.diarrheaBlood ? 'มีเลือดปน' : 'ไม่มีเลือด'} ${details.diarrheaFreq === 'over5' ? '>5 ครั้ง/วัน' : details.diarrheaFreq === '3-5' ? '3-5 ครั้ง/วัน' : '1-2 ครั้ง/วัน'}`,
      outcome: `→ +${pts} คะแนน`,
      points: pts,
    });
    if (details.diarrheaBlood) {
      reasons.push({
        symptom: 'ท้องเสียมีเลือด (Hemorrhagic Diarrhea)',
        finding: 'พบเลือดในอุจจาระ สัญญาณอันตรายของลำไส้',
        vetContext: 'Hemorrhagic diarrhea อาจบ่งชี้ถึง Parvovirus (ฉุกเฉินในลูกสุนัข), HGE, Campylobacter infection หรือ Intussusception ต้องพบสัตวแพทย์โดยเร็ว (VCA Animal Hospitals)',
        severity: 'danger',
      });
    } else {
      reasons.push({
        symptom: `ท้องเสีย (${details.diarrheaFreq === 'over5' ? 'บ่อยมาก' : details.diarrheaFreq === '3-5' ? 'บ่อย' : 'ไม่บ่อย'})`,
        finding: 'ลำไส้ระคายเคืองหรืออักเสบ',
        vetContext: 'ท้องเสียในสัตว์เลี้ยงมักเกิดจากการเปลี่ยนอาหาร พยาธิ เชื้อแบคทีเรีย หรือไวรัส ถ้าถ่ายบ่อยและนานเกิน 24 ชม. ควรพบสัตวแพทย์ (AVMA)',
        severity: details.diarrheaFreq === 'over5' ? 'danger' : 'warn',
      });
    }
  } else {
    treeNodes.push({ node: 'Node 4', question: 'มีอาการท้องเสียหรือไม่?', answer: 'ไม่มี', outcome: '→ ดำเนินต่อ Node 5', points: 0 });
  }

  // ── NODE 5: Lethargy ──
  if (selected.lethargy) {
    const lvl = details.lethargyLevel;
    const pts = lvl === 'noMove' ? 4 : lvl === 'half' ? 3 : 2;
    score += pts;
    treeNodes.push({
      node: 'Node 5',
      question: 'ระดับความซึมและการเคลื่อนไหวเป็นอย่างไร?',
      answer: lvl === 'noMove' ? 'นอนไม่ขยับเลย' : lvl === 'half' ? 'เคลื่อนไหวน้อยลง 50%' : 'ซึมเล็กน้อย',
      outcome: `→ +${pts} คะแนน`,
      points: pts,
    });
    reasons.push({
      symptom: `ซึม${lvl === 'noMove' ? ' / ไม่ขยับ' : lvl === 'half' ? ' / อ่อนแรงปานกลาง' : ' เล็กน้อย'}`,
      finding: lvl === 'noMove' ? 'ไม่เคลื่อนไหว อาจบ่งชี้ถึงความเจ็บปวดรุนแรงหรืออาการป่วยหนัก' : 'พลังงานลดลงอย่างเห็นได้ชัด',
      vetContext: 'Lethargy เป็นสัญญาณที่ไม่จำเพาะแต่สำคัญมาก อาจเกิดจาก Anemia, Infection, Pain, Organ disease หรือ Metabolic disorders การซึมร่วมกับอาการอื่นเพิ่มความเสี่ยงอย่างมีนัยสำคัญ (Merck Vet Manual)',
      severity: lvl === 'noMove' ? 'danger' : 'warn',
    });
  } else {
    treeNodes.push({ node: 'Node 5', question: 'มีอาการซึมหรืออ่อนแรงหรือไม่?', answer: 'ไม่มี', outcome: '→ ดำเนินต่อ Node 6', points: 0 });
  }

  // ── NODE 6: Fever ──
  if (selected.fever) {
    const temp = details.temperature;
    const pts = temp === 'over39.5' || temp === 'under37' ? 3 : 2;
    score += pts;
    treeNodes.push({
      node: 'Node 6',
      question: 'อุณหภูมิร่างกายอยู่ในช่วงใด?',
      answer: temp === 'over39.5' ? 'เกิน 39.5°C (ไข้สูง)' : temp === 'under37' ? 'ต่ำกว่า 37°C (อุณหภูมิต่ำ)' : '38-39°C (ไข้เล็กน้อย)',
      outcome: `→ +${pts} คะแนน`,
      points: pts,
    });
    reasons.push({
      symptom: temp === 'over39.5' ? 'ไข้สูง (>39.5°C)' : temp === 'under37' ? 'อุณหภูมิต่ำผิดปกติ (<37°C)' : 'ไข้ระดับต่ำ',
      finding: temp === 'over39.5' ? 'ไข้สูงกว่าปกติอย่างมีนัยสำคัญ' : temp === 'under37' ? 'ภาวะ Hypothermia อันตราย' : 'ไข้เล็กน้อย',
      vetContext: temp === 'over39.5'
        ? 'ไข้เกิน 40°C ในสัตว์เลี้ยงเป็น Medical emergency อาจเกิดจาก Bacterial infection, Viral disease เช่น Distemper, Parvovirus หรือ Heatstroke ห้ามให้ยาลดไข้คน เช่น Paracetamol หรือ Ibuprofen เพราะเป็นพิษต่อสัตว์ (AVMA)'
        : temp === 'under37'
        ? 'Hypothermia (<37°C) อาจเกิดจาก Shock, Severe illness หรือ Exposure ต้องอุ่นตัวอย่างช้าๆ และพบสัตวแพทย์ทันที (VCA)'
        : 'ไข้เล็กน้อยอาจเกิดจาก Mild infection หรือ Inflammatory response ควรเฝ้าระวัง (VCA Animal Hospitals)',
      severity: temp === 'over39.5' || temp === 'under37' ? 'danger' : 'warn',
    });
  } else {
    treeNodes.push({ node: 'Node 6', question: 'มีไข้หรืออุณหภูมิผิดปกติหรือไม่?', answer: 'ไม่มี', outcome: '→ ดำเนินต่อ Node 7', points: 0 });
  }

  // ── อาการอื่นๆ ──
  if (selected.appetite) {
    score += 2;
    reasons.push({
      symptom: 'ไม่กินอาหาร (Anorexia)',
      finding: 'สัตว์ปฏิเสธอาหาร',
      vetContext: 'Anorexia มากกว่า 24-48 ชั่วโมงเป็นสัญญาณเตือน โดยเฉพาะในแมวที่เสี่ยง Hepatic Lipidosis (ไขมันพอกตับ) หากไม่กินนานกว่า 24 ชม. (Cornell Feline Health Center)',
      severity: 'warn',
    });
  }
  if (selected.walking) {
    score += 3;
    reasons.push({
      symptom: 'เดินเซ / ทรงตัวไม่ได้ (Ataxia)',
      finding: 'ความผิดปกติของการทรงตัวและการเคลื่อนไหว',
      vetContext: 'Ataxia บ่งชี้ถึงความผิดปกติของ Cerebellum, Vestibular system หรือ Spinal cord อาจเกิดจาก Toxin, Ear infection, Neurological disease หรือ Stroke ต้องพบสัตวแพทย์โดยเร็ว (Merck Vet Manual)',
      severity: 'danger',
    });
  }
  if (selected.urine) {
    score += 2;
    reasons.push({
      symptom: 'ปัสสาวะผิดปกติ',
      finding: 'ปัสสาวะบ่อย เบ่งไม่ออก หรือมีเลือด',
      vetContext: 'FLUTD (Feline Lower Urinary Tract Disease) ในแมวตัวผู้เป็นฉุกเฉิน หากเบ่งปัสสาวะไม่ออกเกิน 24 ชม. อาจเสียชีวิตได้ ในสุนัขอาจเกิดจาก UTI หรือ Bladder stones (VCA)',
      severity: 'warn',
    });
  }
  if (selected.cough)    { score += 1; }
  if (selected.eyeRed)   { score += 1; }
  if (selected.noseRun)  { score += 1; }
  if (selected.skinItch) { score += 1; }

  // ── NODE 7: Duration ──
  const durPts = details.duration === 'over48h' ? 4 : details.duration === 'over24h' ? 3 : details.duration === '12-24h' ? 2 : 1;
  score += durPts;
  treeNodes.push({
    node: 'Node 7',
    question: 'อาการเกิดขึ้นมานานแค่ไหน?',
    answer: details.duration === 'over48h' ? 'มากกว่า 48 ชั่วโมง' : details.duration === 'over24h' ? '24-48 ชั่วโมง' : details.duration === '12-24h' ? '12-24 ชั่วโมง' : 'น้อยกว่า 12 ชั่วโมง',
    outcome: `→ +${durPts} คะแนน (ยิ่งนานยิ่งเสี่ยง)`,
    points: durPts,
  });

  // ── NODE 8: Risk Factors ──
  let riskPts = 0;
  const riskFactors: string[] = [];
  if (details.atePoison)   { riskPts += 5; riskFactors.push('กินสารพิษ/ของแปลก (+5)'); }
  if (details.contactSick) { riskPts += 2; riskFactors.push('สัมผัสสัตว์ป่วย (+2)'); }
  if (details.newMedicine) { riskPts += 1; riskFactors.push('ได้รับยาใหม่ (+1)'); }
  if (details.newFood)     { riskPts += 1; riskFactors.push('เปลี่ยนอาหารใหม่ (+1)'); }
  if (profile.vaccine === 'overdue') { riskPts += 2; riskFactors.push('วัคซีนหมดอายุ (+2)'); }
  if (profile.age === 'puppy')  { riskPts += 1; riskFactors.push('อายุน้อย (<1ปี) เสี่ยงสูงขึ้น (+1)'); }
  if (profile.age === 'senior') { riskPts += 1; riskFactors.push('อายุมาก (7+ปี) เสี่ยงสูงขึ้น (+1)'); }
  score += riskPts;

  treeNodes.push({
    node: 'Node 8',
    question: 'มีปัจจัยเสี่ยงเพิ่มเติมหรือไม่?',
    answer: riskFactors.length > 0 ? riskFactors.join(', ') : 'ไม่มีปัจจัยเสี่ยงเพิ่มเติม',
    outcome: riskPts > 0 ? `→ +${riskPts} คะแนน` : '→ +0 คะแนน',
    points: riskPts,
  });

  if (details.atePoison) {
    reasons.push({
      symptom: 'กินสารพิษหรือของแปลก',
      finding: 'ระบุว่าสัตว์กินสิ่งที่อาจเป็นพิษหรือสิ่งแปลกปลอม',
      vetContext: 'สารพิษที่อันตรายในสัตว์เลี้ยง ได้แก่ ช็อคโกแลต (Theobromine), หัวหอม/กระเทียม (Hemolytic anemia), Xylitol (ตับวาย), ยาคน (Paracetamol เป็นพิษต่อแมว) ต้องพาไปสัตวแพทย์ทันที พร้อมบอกชื่อสิ่งที่กิน (ASPCA Poison Control)',
      severity: 'danger',
    });
  }

  // ── CLASSIFY ──
  const finalScore = Math.min(score, 20);
  let risk: 'low' | 'medium' | 'high' | 'emergency';

  treeNodes.push({
    node: 'Node 9 — Final',
    question: 'จัดระดับความเสี่ยงจากคะแนนรวม',
    answer: `คะแนนรวม: ${finalScore}/20`,
    outcome: finalScore >= 12 ? '→ HIGH RISK (≥12)' : finalScore >= 6 ? '→ MEDIUM RISK (6-11)' : '→ LOW RISK (<6)',
    points: 0,
  });

  if (finalScore >= 12) {
    risk = 'high';
  } else if (finalScore >= 6) {
    risk = 'medium';
  } else {
    risk = 'low';
  }

  // ── SPECIFIC RECOMMENDATIONS ──
  if (risk === 'high') {
    recommendations.push({
      title: 'พบสัตวแพทย์ภายในวันนี้',
      detail: 'ระดับความเสี่ยงสูง ควรพบสัตวแพทย์โดยเร็วที่สุด อย่าปล่อยให้อาการดำเนินต่อ',
      source: 'AVMA — When to seek emergency vet care',
      urgent: true,
    });
  }

  // Specific by symptom
  if (selected.vomiting && details.vomitColor === 'blood') {
    recommendations.push({
      title: 'ห้ามให้กินอาหารหรือน้ำจนกว่าจะพบสัตวแพทย์',
      detail: 'อาเจียนมีเลือดต้องได้รับการตรวจ Endoscopy หรือ X-ray เพื่อหาสาเหตุ ห้ามให้ยาแก้ปวดหรือยาลดกรดของคน',
      source: 'VCA Animal Hospitals — Bloody Vomit',
      urgent: true,
    });
  }
  if (selected.vomiting && !details.vomitColor?.includes('blood')) {
    recommendations.push({
      title: 'งดอาหาร 6-12 ชั่วโมง ให้น้ำทีละน้อย',
      detail: 'ถ้าอาเจียนไม่เกิน 2 ครั้งและยังแข็งแรง ลองงดอาหาร 6 ชม. แล้วค่อยให้อาหารอ่อน เช่น ข้าวต้มไก่ต้มไม่มีเกลือ',
      source: 'VCA Animal Hospitals — Vomiting in Dogs/Cats',
      urgent: false,
    });
  }
  if (selected.diarrhea && details.diarrheaBlood) {
    recommendations.push({
      title: 'ท้องเสียมีเลือด — ต้องพบสัตวแพทย์ทันที',
      detail: 'เก็บตัวอย่างอุจจาระ (ถ้าทำได้) นำไปให้สัตวแพทย์ตรวจ เพื่อหา Parvovirus, Parasite หรือ Bacterial infection',
      source: 'ASPCA — Hemorrhagic Gastroenteritis',
      urgent: true,
    });
  }
  if (selected.diarrhea && !details.diarrheaBlood) {
    recommendations.push({
      title: 'ให้น้ำสะอาดเพียงพอ ป้องกันขาดน้ำ',
      detail: 'ตรวจภาวะขาดน้ำโดยดึงผิวหนังที่คอเบาๆ ถ้าคืนตัวช้า (>2 วินาที) แสดงว่าขาดน้ำ ต้องพบสัตวแพทย์',
      source: 'VCA Animal Hospitals — Diarrhea in Dogs/Cats',
      urgent: false,
    });
  }
  if (selected.lethargy && details.lethargyLevel === 'noMove') {
    recommendations.push({
      title: 'ไม่เคลื่อนไหว — ต้องได้รับการตรวจเลือดและ Physical exam',
      detail: 'ซึมไม่ขยับอาจบ่งถึง Severe pain, Anemia หรือ Organ failure สัตวแพทย์จำเป็นต้องตรวจ CBC และ Chemistry panel',
      source: 'Merck Veterinary Manual — Lethargy',
      urgent: true,
    });
  }
  if (selected.fever && details.temperature === 'over39.5') {
    recommendations.push({
      title: 'ห้ามให้ยาลดไข้ของคนโดยเด็ดขาด',
      detail: 'Paracetamol (Tylenol) เป็นพิษต่อแมวแม้ขนาดเล็กมาก Ibuprofen ทำไตวายในสุนัข ใช้ผ้าชุบน้ำเย็นเช็ดฝ่าเท้าและซอกขาแทน',
      source: 'AVMA — Fever in Pets / ASPCA Poison Control',
      urgent: true,
    });
  }
  if (details.atePoison) {
    recommendations.push({
      title: 'โทร ASPCA Poison Control และพาไปสัตวแพทย์ทันที',
      detail: 'แจ้งสัตวแพทย์ว่ากินอะไร ปริมาณเท่าไหร่ และเมื่อกี่โมง ห้ามทำให้อาเจียนเองโดยไม่ได้รับคำแนะนำ บางสารทำให้แย่ลงถ้าอาเจียนออก',
      source: 'ASPCA Animal Poison Control Center',
      urgent: true,
    });
  }
  if (selected.urine) {
    recommendations.push({
      title: profile.species === 'cat' ? 'แมวเบ่งปัสสาวะไม่ออก = ฉุกเฉิน' : 'ตรวจปัสสาวะ (Urinalysis)',
      detail: profile.species === 'cat'
        ? 'แมวตัวผู้ที่เบ่งปัสสาวะไม่ออกเกิน 12-24 ชม. อาจเสียชีวิตได้จาก Urethral obstruction ต้องพบสัตวแพทย์ทันที'
        : 'ปัสสาวะผิดปกติในสุนัขอาจเกิดจาก UTI, Bladder stones หรือ Diabetes สัตวแพทย์จะตรวจ Urinalysis เพื่อวินิจฉัย',
      source: 'VCA — Feline Lower Urinary Tract Disease / Canine UTI',
      urgent: profile.species === 'cat',
    });
  }
  if (profile.vaccine === 'overdue' && (selected.vomiting || selected.diarrhea)) {
    recommendations.push({
      title: 'วัคซีนหมดอายุ — เสี่ยง Parvovirus และ Distemper สูง',
      detail: 'สัตว์ที่ไม่ได้รับวัคซีนและมีอาเจียนหรือท้องเสีย ต้องตรวจ Parvovirus antigen test ทันที โดยเฉพาะลูกสัตว์',
      source: 'AVMA — Core Vaccination Guidelines',
      urgent: true,
    });
  }

  if (risk === 'medium') {
    recommendations.push({
      title: 'เฝ้าดูอาการอย่างใกล้ชิดทุก 4-6 ชั่วโมง',
      detail: `จดบันทึก: ความถี่อาการ, กินน้ำได้ไหม, ปัสสาวะปกติไหม ถ้าอาการไม่ดีขึ้นใน ${details.duration === 'over24h' || details.duration === 'over48h' ? '12' : '24'} ชั่วโมงให้พบสัตวแพทย์`,
      source: 'VCA Animal Hospitals — Home Monitoring',
      urgent: false,
    });
  }
  if (risk === 'low') {
    recommendations.push({
      title: 'ดูแลที่บ้านได้ พักผ่อนและดื่มน้ำเพียงพอ',
      detail: 'อาการเบื้องต้น ให้สังเกตอาการต่อ 24-48 ชั่วโมง ให้อาหารปกติ น้ำสะอาดเสมอ',
      source: 'ASPCA — Home Care for Mild Symptoms',
      urgent: false,
    });
    recommendations.push({
      title: 'ถ้าอาการไม่หายใน 48 ชั่วโมงหรือแย่ลง ให้พบสัตวแพทย์',
      detail: 'แม้อาการเบาแต่ถ้าไม่ดีขึ้นใน 2 วัน ควรให้สัตวแพทย์ตรวจเพื่อหาสาเหตุที่แท้จริง',
      source: 'AVMA — General Pet Care',
      urgent: false,
    });
  }

  return { risk, score: finalScore, maxScore: 20, treeNodes, reasons, recommendations };
}

// ─────────────────────────────────────────────
// SYMPTOMS LIST
// ─────────────────────────────────────────────
const SYMPTOMS = [
  { key: 'vomiting',  label: 'อาเจียน',          icon: '🤮', emergency: false },
  { key: 'diarrhea',  label: 'ท้องเสีย',         icon: '💩', emergency: false },
  { key: 'lethargy',  label: 'ซึม / อ่อนแรง',   icon: '😴', emergency: false },
  { key: 'appetite',  label: 'ไม่กินอาหาร',      icon: '🍽️', emergency: false },
  { key: 'fever',     label: 'มีไข้',             icon: '🌡️', emergency: false },
  { key: 'cough',     label: 'ไอ / จาม',          icon: '😮‍💨', emergency: false },
  { key: 'breathing', label: 'หายใจลำบาก',       icon: '😮', emergency: true  },
  { key: 'seizure',   label: 'ชัก / หมดสติ',     icon: '⚡', emergency: true  },
  { key: 'walking',   label: 'เดินเซ / ทรงตัวไม่ได้', icon: '🤕', emergency: false },
  { key: 'eyeRed',    label: 'ตาแดง / ขี้ตามาก', icon: '👁️', emergency: false },
  { key: 'noseRun',   label: 'น้ำมูกไหล',        icon: '👃', emergency: false },
  { key: 'skinItch',  label: 'คัน / เกาบ่อย',   icon: '🐛', emergency: false },
  { key: 'urine',     label: 'ปัสสาวะผิดปกติ',  icon: '💧', emergency: false },
];

// ─────────────────────────────────────────────
// RISK CONFIG
// ─────────────────────────────────────────────
const RISK_CONFIG = {
  emergency: { label: 'EMERGENCY', th: 'ฉุกเฉินสูงสุด',    color: '#7c2d12', bg: '#fff1f0', border: '#ff4d4f', emoji: '🚨', bar: '#ff4d4f' },
  high:      { label: 'HIGH RISK', th: 'ความเสี่ยงสูง',    color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', emoji: '🔴', bar: '#ef4444' },
  medium:    { label: 'MED RISK',  th: 'ความเสี่ยงปานกลาง', color: '#d97706', bg: '#fffbeb', border: '#fcd34d', emoji: '🟡', bar: '#f59e0b' },
  low:       { label: 'LOW RISK',  th: 'ความเสี่ยงต่ำ',    color: '#16a34a', bg: '#f0fdf4', border: '#86efac', emoji: '🟢', bar: '#22c55e' },
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const sectionStyle: React.CSSProperties = {
  background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
  padding: '18px', marginBottom: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};
const labelStyle: React.CSSProperties = {
  fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px',
};

function OptionGroup({ label, sub, value, onChange, options }: {
  label: string; sub?: string;
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string; desc?: string; color?: string; bg?: string }[];
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {sub && <p style={{ fontSize: '11px', color: '#9ca3af', margin: '-4px 0 8px' }}>{sub}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {options.map(o => (
          <button key={o.value} onClick={() => onChange(o.value)} style={{
            padding: '10px 14px', borderRadius: '10px', border: '1.5px solid',
            borderColor: value === o.value ? (o.color || '#0d9488') : '#e5e7eb',
            background: value === o.value ? (o.bg || '#f0fdfa') : 'white',
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: value === o.value ? '600' : '400', color: value === o.value ? (o.color || '#0d9488') : '#374151' }}>
                {o.label}
              </span>
              {o.desc && (
                <p style={{ fontSize: '11px', color: value === o.value ? (o.color || '#0d9488') : '#9ca3af', margin: '2px 0 0', opacity: 0.85 }}>
                  {o.desc}
                </p>
              )}
            </div>
            {value === o.value && <span style={{ fontSize: '14px', color: o.color || '#0d9488' }}>✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function SymptomCheckerPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('profile');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showPath, setShowPath] = useState(false);

  const [profile, setProfile] = useState<PetProfile>({ species: '', name: '', age: '', weight: '', gender: '', vaccine: '' });
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [details, setDetails] = useState<SymptomDetails>({
    vomitFreq: '', vomitColor: '', diarrheaBlood: null, diarrheaFreq: '',
    breathingRate: '', gumColor: '', lethargyLevel: '', temperature: '',
    duration: '', severity: '', newFood: false, newMedicine: false, atePoison: false, contactSick: false,
  });

  const setP = (k: keyof PetProfile, v: string) => setProfile(p => ({ ...p, [k]: v }));
  const setD = (k: keyof SymptomDetails, v: any) => setDetails(d => ({ ...d, [k]: v }));
  const toggleSym = (k: string) => setSelected(s => ({ ...s, [k]: !s[k] }));
  const symCount = Object.values(selected).filter(Boolean).length;

  const canAnalyze = details.duration !== '';

  const analyze = () => {
    setStep('analyzing');
    setTimeout(() => {
      setResult(runDecisionTree(profile, selected, details));
      setStep('result');
    }, 2000);
  };

  const reset = () => {
    setStep('profile');
    setProfile({ species: '', name: '', age: '', weight: '', gender: '', vaccine: '' });
    setSelected({});
    setDetails({ vomitFreq: '', vomitColor: '', diarrheaBlood: null, diarrheaFreq: '', breathingRate: '', gumColor: '', lethargyLevel: '', temperature: '', duration: '', severity: '', newFood: false, newMedicine: false, atePoison: false, contactSick: false });
    setResult(null);
    setShowPath(false);
  };

  const steps = ['1. ข้อมูลสัตว์', '2. อาการ', '3. รายละเอียด', '4. ผล'];
  const stepIdx: Record<Step, number> = { profile: 0, symptoms: 1, details: 2, analyzing: 3, result: 3 };

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>
      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '28px 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '26px' }}>🔍</span>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', letterSpacing: '-0.03em', margin: 0 }}>Symptom Checker</h1>
          </div>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Decision Tree Algorithm • VCA, ASPCA, AVMA, Merck Veterinary Manual</p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', alignItems: 'center' }}>
          {steps.map((s, i) => {
            const cur = stepIdx[step];
            const done = i < cur; const active = i === cur;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: i < 3 ? '1' : 'auto' }}>
                <div style={{ padding: '4px 8px', borderRadius: '999px', border: '1.5px solid', borderColor: done || active ? '#0d9488' : '#e5e7eb', background: done ? '#0d9488' : active ? '#f0fdfa' : 'white', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: done ? 'white' : active ? '#0d9488' : '#9ca3af', whiteSpace: 'nowrap' }}>{done ? '✓' : s}</span>
                </div>
                {i < 3 && <div style={{ flex: 1, height: '1px', background: done ? '#0d9488' : '#e5e7eb' }} />}
              </div>
            );
          })}
        </div>

        {/* ════ STEP 1 ════ */}
        {step === 'profile' && (
          <div>
            <div style={sectionStyle}>
              <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 16px' }}>🐾 ข้อมูลสัตว์เลี้ยง</h2>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                {(['dog', 'cat'] as const).map(sp => (
                  <button key={sp} onClick={() => setP('species', sp)} style={{ flex: 1, padding: '16px 12px', borderRadius: '12px', border: '2px solid', borderColor: profile.species === sp ? '#0d9488' : '#e5e7eb', background: profile.species === sp ? '#f0fdfa' : 'white', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', textAlign: 'center' }}>
                    <div style={{ fontSize: '30px', marginBottom: '4px' }}>{sp === 'dog' ? '🐶' : '🐱'}</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: profile.species === sp ? '#0d9488' : '#374151' }}>{sp === 'dog' ? 'สุนัข' : 'แมว'}</div>
                  </button>
                ))}
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>ชื่อสัตว์เลี้ยง (ไม่จำเป็น)</label>
                <input value={profile.name} onChange={e => setP('name', e.target.value)} placeholder="เช่น เจ้าโต, น้องมะนาว" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: '#111827' }} />
              </div>
              <OptionGroup label="ช่วงอายุ" value={profile.age} onChange={v => setP('age', v)} options={[
                { value: 'puppy',  label: '🍼 น้อยกว่า 1 ปี', desc: 'ลูกสัตว์ — ภูมิคุ้มกันยังไม่แข็งแรง เสี่ยง Parvovirus สูง' },
                { value: 'adult',  label: '🐾 1-7 ปี', desc: 'วัยผู้ใหญ่ — สุขภาพโดยทั่วไปแข็งแรง' },
                { value: 'senior', label: '👴 7 ปีขึ้นไป', desc: 'วัยสูงอายุ — เสี่ยงโรคไต ข้ออักเสบ เนื้องอกสูงขึ้น' },
              ]} />
            </div>
            <div style={sectionStyle}>
              <OptionGroup label="สถานะวัคซีน" value={profile.vaccine} onChange={v => setP('vaccine', v)} options={[
                { value: 'current', label: '✅ ฉีดครบ / ไม่เกิน 1 ปี', desc: 'ได้รับการป้องกันโรคหลักแล้ว', color: '#16a34a', bg: '#f0fdf4' },
                { value: 'overdue', label: '❌ เกินกำหนด / ไม่เคยฉีดเลย', desc: 'ไม่มีภูมิคุ้มกัน — เสี่ยง Parvo, Distemper สูง', color: '#dc2626', bg: '#fef2f2' },
                { value: 'unknown', label: '❓ ไม่แน่ใจ', desc: 'สัตว์รับมาใหม่หรือไม่มีประวัติ' },
              ]} />
            </div>
            <button onClick={() => setStep('symptoms')} disabled={!profile.species || !profile.age || !profile.vaccine}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: !profile.species || !profile.age || !profile.vaccine ? '#e5e7eb' : '#0d9488', color: !profile.species || !profile.age || !profile.vaccine ? '#9ca3af' : 'white', fontSize: '15px', fontWeight: '700', cursor: !profile.species || !profile.age || !profile.vaccine ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              ต่อไป →
            </button>
          </div>
        )}

        {/* ════ STEP 2 ════ */}
        {step === 'symptoms' && (
          <div>
            <div style={sectionStyle}>
              <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 4px' }}>เลือกอาการที่พบทั้งหมด</h2>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 14px' }}>อาการกรอบแดง = ฉุกเฉิน ต้องพบสัตวแพทย์ทันที</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {SYMPTOMS.map(sym => {
                  const isSel = !!selected[sym.key];
                  return (
                    <button key={sym.key} onClick={() => toggleSym(sym.key)} style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 12px',
                      borderRadius: '11px', border: '1.5px solid',
                      borderColor: isSel ? (sym.emergency ? '#dc2626' : '#0d9488') : sym.emergency ? '#fecaca' : '#e5e7eb',
                      background: isSel ? (sym.emergency ? '#fef2f2' : '#f0fdfa') : sym.emergency ? '#fff5f5' : 'white',
                      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s',
                    }}>
                      <span style={{ fontSize: '20px', flexShrink: 0 }}>{sym.icon}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: isSel ? (sym.emergency ? '#dc2626' : '#0d9488') : '#374151', margin: 0 }}>{sym.label}</p>
                        {sym.emergency && <p style={{ fontSize: '10px', color: '#ef4444', margin: '1px 0 0' }}>⚠️ ฉุกเฉิน</p>}
                      </div>
                      {isSel && <span style={{ fontSize: '12px' }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep('profile')} style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>← ย้อน</button>
              <button onClick={() => setStep('details')} disabled={symCount === 0} style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: symCount === 0 ? '#e5e7eb' : '#0d9488', color: symCount === 0 ? '#9ca3af' : 'white', fontSize: '14px', fontWeight: '700', cursor: symCount === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {symCount === 0 ? 'เลือกอาการก่อน' : `ต่อไป (${symCount} อาการ) →`}
              </button>
            </div>
          </div>
        )}

        {/* ════ STEP 3 ════ */}
        {step === 'details' && (
          <div>
            {selected.vomiting && (
              <div style={sectionStyle}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#374151', margin: '0 0 14px' }}>🤮 รายละเอียดการอาเจียน</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <OptionGroup label="ความถี่" value={details.vomitFreq} onChange={v => setD('vomitFreq', v)} options={[
                    { value: '1-2',   label: '1-2 ครั้ง/วัน',        desc: 'ระดับเบาๆ อาจดูแลที่บ้านได้' },
                    { value: '3-5',   label: '3-5 ครั้ง/วัน',        desc: 'เริ่มน่ากังวล เสี่ยงขาดน้ำ', color: '#d97706', bg: '#fffbeb' },
                    { value: 'over5', label: 'มากกว่า 5 ครั้ง/วัน', desc: 'ขาดน้ำรุนแรง ต้องพบสัตวแพทย์', color: '#dc2626', bg: '#fef2f2' },
                  ]} />
                  <OptionGroup label="ลักษณะและสี" value={details.vomitColor} onChange={v => setD('vomitColor', v)} options={[
                    { value: 'normal', label: '⚪ ปกติ — อาหารหรือน้ำย่อย', desc: 'ไม่มีสิ่งผิดปกติในสิ่งที่อาเจียน' },
                    { value: 'yellow', label: '🟡 เหลือง — น้ำดี/กระเพาะว่าง', desc: 'มักเกิดตอนท้องว่าง หรือ Pancreatitis', color: '#d97706', bg: '#fffbeb' },
                    { value: 'blood',  label: '🔴 มีเลือด — สีแดงหรือน้ำตาลคล้ำ', desc: 'อันตราย ต้องพบสัตวแพทย์ทันที', color: '#dc2626', bg: '#fef2f2' },
                  ]} />
                </div>
              </div>
            )}

            {selected.diarrhea && (
              <div style={sectionStyle}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#374151', margin: '0 0 14px' }}>💩 รายละเอียดท้องเสีย</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <OptionGroup label="ความถี่" value={details.diarrheaFreq} onChange={v => setD('diarrheaFreq', v)} options={[
                    { value: '1-2',   label: '1-2 ครั้ง/วัน',        desc: 'เบา อาจเกิดจากอาหารเปลี่ยน' },
                    { value: '3-5',   label: '3-5 ครั้ง/วัน',        desc: 'ปานกลาง เสี่ยงขาดน้ำ', color: '#d97706', bg: '#fffbeb' },
                    { value: 'over5', label: 'มากกว่า 5 ครั้ง/วัน', desc: 'รุนแรง ขาดน้ำเร็วมาก', color: '#dc2626', bg: '#fef2f2' },
                  ]} />
                  <div>
                    <label style={labelStyle}>มีเลือดปนหรือไม่?</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setD('diarrheaBlood', false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid', borderColor: details.diarrheaBlood === false ? '#0d9488' : '#e5e7eb', background: details.diarrheaBlood === false ? '#f0fdfa' : 'white', color: details.diarrheaBlood === false ? '#0d9488' : '#374151', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                        ⚪ ไม่มีเลือด
                      </button>
                      <button onClick={() => setD('diarrheaBlood', true)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid', borderColor: details.diarrheaBlood === true ? '#dc2626' : '#e5e7eb', background: details.diarrheaBlood === true ? '#fef2f2' : 'white', color: details.diarrheaBlood === true ? '#dc2626' : '#374151', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                        🔴 มีเลือดปน
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selected.breathing && (
              <div style={{ ...sectionStyle, borderColor: '#fecaca' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#dc2626', margin: '0 0 14px' }}>😮 รายละเอียดการหายใจ ⚠️</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <OptionGroup label="อัตราการหายใจ (นับครั้ง/นาที)" sub="ปกติ: สุนัข 15-30 | แมว 20-30 ครั้ง/นาที" value={details.breathingRate} onChange={v => setD('breathingRate', v)} options={[
                    { value: 'under40', label: 'น้อยกว่า 40 ครั้ง/นาที', desc: 'อยู่ในช่วงใกล้เคียงปกติ' },
                    { value: '40-60',   label: '40-60 ครั้ง/นาที', desc: 'เร็วกว่าปกติ — น่ากังวล', color: '#d97706', bg: '#fffbeb' },
                    { value: 'over60',  label: 'มากกว่า 60 ครั้ง/นาที', desc: 'วิกฤต — ต้องพบสัตวแพทย์ทันที', color: '#dc2626', bg: '#fef2f2' },
                  ]} />
                  <OptionGroup label="สีเหงือก (ยกริมฝีปากดู)" sub="เหงือกบอกถึงการไหลเวียนออกซิเจน" value={details.gumColor} onChange={v => setD('gumColor', v)} options={[
                    { value: 'pink', label: '🩷 ชมพู — ปกติ', desc: 'ออกซิเจนในเลือดปกติดี' },
                    { value: 'pale', label: '⚪ ซีด/ขาว — เตือน', desc: 'อาจเกิดจาก Anemia หรือ Shock', color: '#d97706', bg: '#fffbeb' },
                    { value: 'blue', label: '🔵 ม่วง/ฟ้า — วิกฤต', desc: 'Cyanosis ออกซิเจนต่ำมาก ฉุกเฉิน', color: '#7c2d12', bg: '#fff1f0' },
                  ]} />
                </div>
              </div>
            )}

            {selected.lethargy && (
              <div style={sectionStyle}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#374151', margin: '0 0 14px' }}>😴 ระดับความซึม</h3>
                <OptionGroup label="การเคลื่อนไหวและการตอบสนอง" value={details.lethargyLevel} onChange={v => setD('lethargyLevel', v)} options={[
                  { value: 'normal', label: '🐾 ยังเดินและเคลื่อนไหวได้', desc: 'ซึมเล็กน้อย แต่ยังตอบสนองได้' },
                  { value: 'half',   label: '🐢 ช้าลง เคลื่อนไหวน้อยลงมาก', desc: 'ลุกขึ้นช้า ไม่อยากเดิน', color: '#d97706', bg: '#fffbeb' },
                  { value: 'noMove', label: '😞 นอนนิ่งไม่ขยับเลย', desc: 'ไม่ตอบสนองต่อการเรียก อาจเจ็บปวดมาก', color: '#dc2626', bg: '#fef2f2' },
                ]} />
              </div>
            )}

            {selected.fever && (
              <div style={sectionStyle}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#374151', margin: '0 0 14px' }}>🌡️ อุณหภูมิร่างกาย</h3>
                <OptionGroup label="วัดที่ทวารหนัก (อุณหภูมิปกติ 38.0-39.2°C)" sub="ถ้าไม่มีปรอท ใช้การสังเกต: ตัวร้อน เหงือกแดง ซึม" value={details.temperature} onChange={v => setD('temperature', v)} options={[
                  { value: '38-39',    label: '38-39°C — ใกล้เคียงปกติ', desc: 'ไข้เล็กน้อย เฝ้าระวัง' },
                  { value: 'over39.5', label: 'เกิน 39.5°C — ไข้สูง', desc: 'ต้องพบสัตวแพทย์ ห้ามให้ยาคน', color: '#d97706', bg: '#fffbeb' },
                  { value: 'under37',  label: 'ต่ำกว่า 37°C — อุณหภูมิต่ำผิดปกติ', desc: 'Hypothermia อันตราย ต้องพบสัตวแพทย์ทันที', color: '#7c2d12', bg: '#fff1f0' },
                ]} />
              </div>
            )}

            {/* Duration */}
            <div style={sectionStyle}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#374151', margin: '0 0 14px' }}>⏱️ ข้อมูลเพิ่มเติม</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <OptionGroup label="อาการเกิดขึ้นมานานแค่ไหน? *" value={details.duration} onChange={v => setD('duration', v)} options={[
                  { value: 'under12h', label: 'น้อยกว่า 12 ชั่วโมง', desc: 'เพิ่งเริ่มมีอาการ' },
                  { value: '12-24h',   label: '12-24 ชั่วโมง', desc: 'ครึ่งวันถึงหนึ่งวัน', color: '#d97706', bg: '#fffbeb' },
                  { value: 'over24h',  label: '1-2 วัน', desc: 'อาการเรื้อรังขึ้น ควรพบสัตวแพทย์', color: '#ea580c', bg: '#fff7ed' },
                  { value: 'over48h',  label: 'มากกว่า 2 วัน', desc: 'อาการนาน — เสี่ยงสูง ควรพบสัตวแพทย์โดยเร็ว', color: '#dc2626', bg: '#fef2f2' },
                ]} />

                {/* Context */}
                <div>
                  <label style={labelStyle}>ปัจจัยที่อาจเกี่ยวข้อง (เลือกได้หลายข้อ)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      { key: 'newFood',     label: '🍽️ เปลี่ยนอาหารใหม่',       desc: 'ใน 1-3 วันที่ผ่านมา' },
                      { key: 'newMedicine', label: '💊 ได้รับยาใหม่',           desc: 'ยาหรืออาหารเสริมใหม่' },
                      { key: 'contactSick', label: '🐾 สัมผัสสัตว์ป่วย',       desc: 'ในช่วง 2 สัปดาห์' },
                      { key: 'atePoison',   label: '☠️ กินของแปลก/สารพิษ',     desc: 'ช็อคโกแลต ยา สารเคมี', danger: true },
                    ].map((f: any) => {
                      const val = details[f.key as keyof SymptomDetails] as boolean;
                      return (
                        <button key={f.key} onClick={() => setD(f.key, !val)} style={{
                          padding: '10px 12px', borderRadius: '10px', border: '1.5px solid',
                          borderColor: val ? (f.danger ? '#dc2626' : '#0d9488') : '#e5e7eb',
                          background: val ? (f.danger ? '#fef2f2' : '#f0fdfa') : 'white',
                          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s',
                        }}>
                          <p style={{ fontSize: '12px', fontWeight: '600', color: val ? (f.danger ? '#dc2626' : '#0d9488') : '#374151', margin: '0 0 2px' }}>
                            {val ? '✓ ' : ''}{f.label}
                          </p>
                          <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{f.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep('symptoms')} style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>← ย้อน</button>
              <button onClick={analyze} disabled={!canAnalyze} style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: !canAnalyze ? '#e5e7eb' : '#0d9488', color: !canAnalyze ? '#9ca3af' : 'white', fontSize: '15px', fontWeight: '700', cursor: !canAnalyze ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {!canAnalyze ? 'กรุณาระบุระยะเวลา' : 'วิเคราะห์อาการ →'}
              </button>
            </div>
          </div>
        )}

        {/* ════ ANALYZING ════ */}
        {step === 'analyzing' && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ fontSize: '44px', marginBottom: '16px' }}>⚙️</div>
            <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', margin: '0 0 6px' }}>กำลังประมวลผล...</h2>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 24px' }}>Decision Tree กำลังวิเคราะห์ {symCount} อาการ</p>
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px', maxWidth: '340px', margin: '0 auto', textAlign: 'left' }}>
              {['Node 1: ตรวจอาการฉุกเฉิน...', 'Node 2-6: ประเมินอาการหลัก...', 'Node 7: คำนวณระยะเวลา...', 'Node 8: ตรวจปัจจัยเสี่ยง...', 'Node 9: จัดระดับความเสี่ยงสุดท้าย...'].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', padding: '6px 0', borderBottom: i < 4 ? '1px solid #f3f4f6' : 'none' }}>
                  <span style={{ color: '#0d9488', fontSize: '12px' }}>✓</span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{t}</span>
                </div>
              ))}
            </div>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* ════ RESULT ════ */}
        {step === 'result' && result && (() => {
          const rc = RISK_CONFIG[result.risk];
          return (
            <div>
              {/* Risk Badge */}
              <div style={{ background: rc.bg, borderRadius: '16px', border: `2px solid ${rc.border}`, padding: '22px', marginBottom: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>{rc.emoji}</div>
                <p style={{ fontSize: '11px', color: rc.color, fontWeight: '700', letterSpacing: '0.1em', margin: '0 0 4px', textTransform: 'uppercase' }}>{rc.label}</p>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: rc.color, margin: '0 0 14px', letterSpacing: '-0.03em' }}>
                  {profile.name ? `${profile.name}: ` : ''}{rc.th}
                </h2>
                <div style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '999px', height: '8px', marginBottom: '6px' }}>
                  <div style={{ height: '8px', borderRadius: '999px', background: rc.bar, width: `${(result.score / result.maxScore) * 100}%`, transition: 'width 1s ease' }} />
                </div>
                <p style={{ fontSize: '12px', color: rc.color, opacity: 0.75, margin: 0 }}>คะแนนความเสี่ยง {result.score} / {result.maxScore} คะแนน</p>
              </div>

              {/* Reasons */}
              <div style={sectionStyle}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 12px' }}>🧠 เหตุผลจากข้อมูลสัตวแพทย์ (Explainable AI)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {result.reasons.map((r, i) => (
                    <div key={i} style={{
                      borderRadius: '10px', border: '1px solid',
                      borderColor: r.severity === 'danger' ? '#fecaca' : r.severity === 'warn' ? '#fde68a' : '#e5e7eb',
                      background: r.severity === 'danger' ? '#fef2f2' : r.severity === 'warn' ? '#fffbeb' : '#f9fafb',
                      padding: '12px 14px',
                    }}>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: r.severity === 'danger' ? '#dc2626' : r.severity === 'warn' ? '#d97706' : '#374151', margin: '0 0 4px' }}>
                        {r.severity === 'danger' ? '🔴 ' : r.severity === 'warn' ? '🟡 ' : 'ℹ️ '}{r.symptom}
                      </p>
                      <p style={{ fontSize: '12px', color: '#374151', margin: '0 0 6px', lineHeight: '1.5' }}>{r.finding}</p>
                      <p style={{ fontSize: '11px', color: '#6b7280', margin: 0, lineHeight: '1.6', fontStyle: 'italic' }}>{r.vetContext}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div style={sectionStyle}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 12px' }}>📋 คำแนะนำเฉพาะสำหรับอาการนี้</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {result.recommendations.map((rec, i) => (
                    <div key={i} style={{ borderRadius: '10px', border: '1px solid', borderColor: rec.urgent ? '#fca5a5' : '#e5e7eb', background: rec.urgent ? '#fff5f5' : 'white', padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: rec.urgent ? '#dc2626' : '#0d9488', flexShrink: 0, paddingTop: '1px' }}>{i + 1}.</span>
                        <p style={{ fontSize: '13px', fontWeight: '700', color: rec.urgent ? '#dc2626' : '#111827', margin: 0 }}>{rec.title}</p>
                        {rec.urgent && <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '999px', background: '#fef2f2', color: '#dc2626', fontWeight: '700', flexShrink: 0 }}>เร่งด่วน</span>}
                      </div>
                      <p style={{ fontSize: '12px', color: '#374151', margin: '0 0 6px', lineHeight: '1.6', paddingLeft: '20px' }}>{rec.detail}</p>
                      <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0, paddingLeft: '20px' }}>แหล่งอ้างอิง: {rec.source}</p>
                    </div>
                  ))}
                </div>
                {(result.risk === 'high' || result.risk === 'emergency') && (
                  <a href="tel:1669" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '14px', background: '#dc2626', color: 'white', padding: '13px', borderRadius: '10px', textDecoration: 'none', fontSize: '15px', fontWeight: '700' }}>
                    📞 โทรฉุกเฉิน 1669
                  </a>
                )}
              </div>

              {/* Decision Tree Path */}
              <div style={sectionStyle}>
                <button onClick={() => setShowPath(!showPath)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: 0 }}>🌳 Decision Tree Path</h3>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>{showPath ? '▲ ซ่อน' : '▼ ดู path'}</span>
                </button>
                {showPath && (
                  <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {result.treeNodes.map((n, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0', alignItems: 'stretch' }}>
                        {/* connector */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '32px', flexShrink: 0 }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: n.points > 0 ? '#fef2f2' : '#f0fdfa', border: `2px solid ${n.points > 0 ? '#fca5a5' : '#99f6e4'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color: n.points > 0 ? '#dc2626' : '#0d9488', flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          {i < result.treeNodes.length - 1 && <div style={{ width: '2px', flex: 1, background: '#f3f4f6', minHeight: '12px' }} />}
                        </div>
                        {/* content */}
                        <div style={{ flex: 1, paddingLeft: '10px', paddingBottom: '10px' }}>
                          <p style={{ fontSize: '11px', fontWeight: '700', color: '#374151', margin: '3px 0 2px' }}>{n.node}</p>
                          <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 2px' }}>❓ {n.question}</p>
                          <p style={{ fontSize: '11px', color: '#374151', margin: '0 0 2px' }}>→ {n.answer}</p>
                          {n.outcome && <p style={{ fontSize: '11px', fontWeight: '600', color: n.points > 0 ? '#dc2626' : n.outcome.includes('EMERGENCY') ? '#7c2d12' : '#0d9488', margin: 0 }}>{n.outcome}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Source */}
              <div style={{ background: '#f0fdfa', borderRadius: '12px', border: '1px solid #99f6e4', padding: '12px 16px', marginBottom: '12px' }}>
                <p style={{ fontSize: '12px', color: '#0f766e', margin: 0, lineHeight: '1.6' }}>
                  📊 Dataset: 50 cases จาก VCA Animal Hospitals, ASPCA, AVMA, Merck Veterinary Manual, Cornell Feline Health Center
                </p>
              </div>
              <div style={{ background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a', padding: '12px 16px', marginBottom: '18px' }}>
                <p style={{ fontSize: '12px', color: '#92400e', margin: 0, lineHeight: '1.6' }}>
                  ⚠️ ผลลัพธ์นี้ใช้เพื่อคัดกรองเบื้องต้นเท่านั้น ไม่สามารถวินิจฉัยโรคหรือใช้แทนสัตวแพทย์ได้
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={reset} style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>ตรวจใหม่</button>
                <button onClick={() => router.push('/chat')} style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: '#0d9488', color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>ถาม AI เพิ่มเติม →</button>
              </div>
            </div>
          );
        })()}
      </main>
    </div>
  );
}