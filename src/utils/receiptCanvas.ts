import { Student } from '../types';

/**
 * Utility to generate an ultra-professional official receipt image on an HTML5 Canvas.
 * Returns a high-definition PNG Data URL or Blob.
 */
export async function generateProfessionalReceipt(
  student: Student,
  scheduleText?: string
): Promise<{ dataUrl: string; blob: Blob }> {
  const canvas = document.createElement('canvas');
  // High-DPI canvas (1000 x 1420 px)
  canvas.width = 1000;
  canvas.height = 1420;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  const effectiveSchedule =
    scheduleText ||
    student.courseSchedule ||
    'الأحد والأربعاء - الساعة 8:00 مساءً (بث مباشر عبر المنصة)';

  // 1. Draw Canvas Outer Background
  ctx.fillStyle = '#070c16';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Draw Main Receipt Card Box (940 x 1360, centered)
  const cardX = 30;
  const cardY = 30;
  const cardW = 940;
  const cardH = 1360;
  const radius = 24;

  // Background gradient for the receipt
  const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
  cardGrad.addColorStop(0, '#0d1728');
  cardGrad.addColorStop(0.5, '#0b1322');
  cardGrad.addColorStop(1, '#070e1a');

  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = cardGrad;
  ctx.fill();

  // Dual borders (outer navy + inner emerald glow)
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#1e385c';
  ctx.stroke();

  // Inner subtle border
  drawRoundedRect(ctx, cardX + 8, cardY + 8, cardW - 16, cardH - 16, radius - 4);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
  ctx.stroke();
  ctx.restore();

  // 3. Subtle Chemistry Lattice Watermark in background
  ctx.save();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
  ctx.lineWidth = 1.5;
  for (let x = 80; x < cardW; x += 120) {
    for (let y = 100; y < cardH; y += 120) {
      drawHexagon(ctx, x, y, 35);
    }
  }
  ctx.restore();

  // 4. Header Bar: Emerald / Gold Gradient accent
  ctx.save();
  const headerAccentGrad = ctx.createLinearGradient(cardX + 40, cardY + 20, cardX + cardW - 40, cardY + 20);
  headerAccentGrad.addColorStop(0, '#10b981');
  headerAccentGrad.addColorStop(0.5, '#3b82f6');
  headerAccentGrad.addColorStop(1, '#d97706');
  ctx.fillStyle = headerAccentGrad;
  drawRoundedRect(ctx, cardX + 40, cardY + 24, cardW - 80, 5, 2);
  ctx.fill();
  ctx.restore();

  // 5. Center Title & Branding
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';

  // Center Name
  ctx.font = 'bold 36px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('منظومة الأستاذ أشرف السقا', 500, 95);

  // Subtitle
  ctx.font = 'bold 18px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('خبير مادة الكيمياء للثانوية العامة واللغات • المنصة التعليمية الذكية', 500, 130);

  // Official Badge Pill
  ctx.save();
  const badgeText = 'إيصال سداد وتفعيل اشتراك رسمي معتمد';
  const badgeW = 440;
  const badgeH = 38;
  const badgeX = (canvas.width - badgeW) / 2;
  const badgeY = 150;
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 19);
  ctx.fillStyle = '#064e3b';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#10b981';
  ctx.stroke();

  ctx.font = 'bold 16px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#6ee7b7';
  ctx.fillText(`✓  ${badgeText}`, 500, badgeY + 25);
  ctx.restore();

  // Receipt Number & Date
  const receiptNumber = `REC-2025-${student.code.replace(/\D/g, '').slice(-5) || Math.floor(10000 + Math.random() * 90000)}`;
  const issueDate = student.createdAt || new Date().toISOString().replace('T', ' ').slice(0, 16);

  ctx.font = '14px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`رقم الإيصال: ${receiptNumber}   |   تاريخ وتوقيت الإصدار: ${issueDate}`, 500, 220);

  // Divider line
  ctx.strokeStyle = '#1a2f4c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(70, 240);
  ctx.lineTo(930, 240);
  ctx.stroke();

  // 6. Student & Course Information Box
  const infoBoxY = 260;
  const infoBoxH = 390;
  ctx.save();
  drawRoundedRect(ctx, 65, infoBoxY, 870, infoBoxH, 18);
  ctx.fillStyle = '#0f1c30';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#1d385c';
  ctx.stroke();

  // Section Header inside Box
  ctx.textAlign = 'right';
  ctx.font = 'bold 18px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#60a5fa';
  ctx.fillText('📌  بيانات الطالب والاشتراك الأكاديمي', 900, infoBoxY + 38);

  // Field: Student Name
  drawInfoRow(ctx, 'اسم الطالب:', student.name, 900, infoBoxY + 80, '#ffffff', true);

  // Field: Academic Grade
  drawInfoRow(ctx, 'الصف الدراسي:', student.grade, 900, infoBoxY + 125, '#cbd5e1');

  // Field: Enrolled Course
  drawInfoRow(ctx, 'اسم الكورس / المقرر:', student.course, 900, infoBoxY + 170, '#93c5fd', true);

  // Field: Attendance Mode
  drawInfoRow(ctx, 'نظام الحضور والتدريس:', student.attendanceMode, 900, infoBoxY + 215, '#cbd5e1');

  // 7. Course Schedule Highlight Box (Crucial user request!)
  const schedBoxY = infoBoxY + 245;
  const schedBoxH = 115;
  drawRoundedRect(ctx, 85, schedBoxY, 830, schedBoxH, 14);
  ctx.fillStyle = '#261b0c';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#d97706';
  ctx.stroke();

  ctx.textAlign = 'right';
  ctx.font = 'bold 16px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('📅  مواعيد الحصص والمحاضرات (الجدول الرسمي المعتمد):', 890, schedBoxY + 36);

  ctx.font = 'bold 18px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#fef08a';
  ctx.fillText(effectiveSchedule, 890, schedBoxY + 75);

  ctx.font = '13px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#d97706';
  ctx.fillText('• يرجى التواجد على المنصة قبل موعد البث بـ 10 دقائق وتجهيز كشكول الملاحظات', 890, schedBoxY + 100);
  ctx.restore();

  // 8. Financial & Activation Box
  const finBoxY = 670;
  const finBoxH = 290;
  ctx.save();
  drawRoundedRect(ctx, 65, finBoxY, 870, finBoxH, 18);
  ctx.fillStyle = '#0a1d18';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#059669';
  ctx.stroke();

  // Section Header inside Financial Box
  ctx.textAlign = 'right';
  ctx.font = 'bold 18px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#34d399';
  ctx.fillText('💳  تفاصيل السداد وكود التفعيل الفوري', 900, finBoxY + 38);

  const isInstallment = student.paymentType === 'installment';
  const isPendingInstallment = isInstallment && student.installmentStatus === 'pending_installment';
  const remAmount =
    student.remainingAmount ??
    (student.totalCourseFee ? Math.max(0, student.totalCourseFee - student.amountPaid) : 0);

  // Left side: Large Amount Badge
  const amountBoxX = 90;
  const amountBoxY = finBoxY + 65;
  const amountBoxW = 340;
  const amountBoxH = 185;
  drawRoundedRect(ctx, amountBoxX, amountBoxY, amountBoxW, amountBoxH, 16);
  ctx.fillStyle = isPendingInstallment ? '#2a1a05' : '#062d23';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = isPendingInstallment ? '#f59e0b' : '#10b981';
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = '15px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = isPendingInstallment ? '#fde68a' : '#a7f3d0';
  ctx.fillText(
    isPendingInstallment ? 'المبلغ المسدد (قسط أول)' : 'المبلغ المدفوع بالكامل',
    amountBoxX + amountBoxW / 2,
    amountBoxY + 35
  );

  ctx.font = 'bold 44px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = isPendingInstallment ? '#fbbf24' : '#34d399';
  ctx.fillText(`${student.amountPaid} ج.م`, amountBoxX + amountBoxW / 2, amountBoxY + 90);

  // Paid Status Pill
  drawRoundedRect(ctx, amountBoxX + 25, amountBoxY + 120, amountBoxW - 50, 36, 18);
  ctx.fillStyle = isPendingInstallment ? '#d97706' : '#059669';
  ctx.fill();
  ctx.font = 'bold 14px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(
    isPendingInstallment ? `متبقي قسط: ${remAmount} ج.م` : '✓  تم التحصيل وتأكيد الاشتراك',
    amountBoxX + amountBoxW / 2,
    amountBoxY + 144
  );

  // Right side: Payment details and Activation Code
  ctx.textAlign = 'right';
  drawInfoRow(ctx, 'طريقة السداد:', student.paymentMethod, 900, finBoxY + 70, '#ffffff');
  if (isInstallment) {
    const fee = student.totalCourseFee || student.amountPaid + remAmount;
    drawInfoRow(
      ctx,
      'نظام الاشتراك:',
      isPendingInstallment ? `تقسيط (إجمالي ${fee} ج.م)` : `تقسيط (مسدد بالكامل)`,
      900,
      finBoxY + 105,
      '#fde68a',
      true
    );
    drawInfoRow(ctx, 'واتساب ولي الأمر:', student.parentWhatsapp, 900, finBoxY + 140, '#ffffff');
    drawInfoRow(
      ctx,
      'المسؤول عن التأكيد:',
      student.confirmedBy || 'أك. محمود عزت',
      900,
      finBoxY + 175,
      '#ffffff'
    );
  } else {
    drawInfoRow(ctx, 'واتساب ولي الأمر:', student.parentWhatsapp, 900, finBoxY + 115, '#ffffff');
    drawInfoRow(
      ctx,
      'الموظف المسؤول عن التأكيد:',
      student.confirmedBy || 'أك. محمود عزت',
      900,
      finBoxY + 160,
      '#ffffff'
    );
  }

  // Student Activation Code Box
  const codeBoxY = finBoxY + 200;
  drawRoundedRect(ctx, 470, codeBoxY, 430, 65, 12);
  ctx.fillStyle = '#0c1a2d';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#2563eb';
  ctx.stroke();

  ctx.font = 'bold 13px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#93c5fd';
  ctx.fillText('كود التفعيل الخاص بالطالب:', 880, codeBoxY + 28);

  ctx.font = 'bold 24px monospace, "Courier New"';
  ctx.fillStyle = '#60a5fa';
  ctx.fillText(student.code, 880, codeBoxY + 54);
  ctx.restore();

  // 9. QR Code & Official Seal Section
  const qrSectionY = 985;
  const qrSectionH = 260;
  ctx.save();
  drawRoundedRect(ctx, 65, qrSectionY, 870, qrSectionH, 18);
  ctx.fillStyle = '#0d1728';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#1e385c';
  ctx.stroke();

  // Draw Official Stamp Seal (Right Side)
  drawOfficialStamp(ctx, 750, qrSectionY + 130, 95);

  // Middle Text: Official Declaration
  ctx.textAlign = 'right';
  ctx.font = 'bold 18px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('منظومة الامتياز في الكيمياء للثانوية العامة', 610, qrSectionY + 65);

  ctx.font = '14px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('• يعتبر هذا الإيصال وثيقة إلكترونية رسمية مؤكدة لتفعيل الحساب.', 610, qrSectionY + 105);
  ctx.fillText('• يتيح كود التفعيل للطالب حضور الحصص، الامتحانات الدورية، وبنك الأسئلة.', 610, qrSectionY + 135);
  ctx.fillText('• الدعم الفني والمساعدة متوفر على مدار 24 ساعة عبر الواتساب.', 610, qrSectionY + 165);

  ctx.font = 'bold 15px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#10b981';
  ctx.fillText('توقيع واعتماد المنظومة: أ. أشرف السقا', 610, qrSectionY + 215);

  // Left Side: Scannable Activation Box & QR Emulation
  const qrBoxX = 90;
  const qrBoxY = qrSectionY + 25;
  const qrBoxW = 210;
  const qrBoxH = 210;
  drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, 16);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Draw High-Contrast QR Code Graphic Pattern inside box
  drawQrRepresentation(ctx, qrBoxX + 15, qrBoxY + 15, 180, student.code);

  ctx.restore();

  // 10. Footer Section
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = 'bold 15px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('المنصة الرسمية: https://el-saqqa-chem.online  •  الواتساب: 01029847561', 500, 1290);

  ctx.font = '12px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('حقوق الطبع والنشر محفوظة © 2025 سنتر ومنظومة الأستاذ أشرف السقا - جميع الحقوق محفوظة', 500, 1320);

  // Barcode representation at very bottom
  drawBarcodeGraphic(ctx, 300, 1335, 400, 20);
  ctx.restore();

  // Export DataURL and Blob
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to generate image blob'));
      },
      'image/png',
      1.0
    );
  });

  return { dataUrl, blob };
}

/** Helper: Rounded Rectangle */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Helper: Hexagon for watermark */
function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const hx = x + r * Math.cos(angle);
    const hy = y + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.stroke();
}

/** Helper: Info Row Label & Value */
function drawInfoRow(
  ctx: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
  valColor: string = '#ffffff',
  isBold: boolean = false
) {
  ctx.textAlign = 'right';
  ctx.font = '15px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(label, x, y);

  ctx.font = `${isBold ? 'bold' : 'normal'} 16px "Segoe UI", Tahoma, Arial, sans-serif`;
  ctx.fillStyle = valColor;
  ctx.fillText(value, x - 220, y);
}

/** Helper: Draw Authentic Official Stamp / Seal */
function drawOfficialStamp(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number
) {
  ctx.save();
  // Stamp tilt
  ctx.translate(cx, cy);
  ctx.rotate(-0.08);

  // Outer ring
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#10b981';
  ctx.stroke();

  // Dotted inner ring
  ctx.beginPath();
  ctx.arc(0, 0, r - 8, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = '#34d399';
  ctx.stroke();
  ctx.setLineDash([]);

  // Center solid circle
  ctx.beginPath();
  ctx.arc(0, 0, r - 16, 0, Math.PI * 2);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#059669';
  ctx.fillStyle = 'rgba(6, 78, 59, 0.4)';
  ctx.fill();
  ctx.stroke();

  // Stamp Texts
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';

  ctx.font = 'bold 12px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#6ee7b7';
  ctx.fillText('منظومة الكيمياء المعتمدة', 0, -50);

  ctx.font = 'bold 16px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('أ. أشرف السقا', 0, -10);

  ctx.font = 'bold 13px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#34d399';
  ctx.fillText('✓ معتمد ومسجل', 0, 20);

  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = '#a7f3d0';
  ctx.fillText('OFFICIAL CERTIFIED', 0, 48);

  ctx.restore();
}

/** Helper: Draw Crisp QR Code Representation on Canvas */
function drawQrRepresentation(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  code: string
) {
  ctx.save();
  ctx.fillStyle = '#0f172a';
  const margin = 10;
  const innerSize = size - margin * 2;
  const cells = 25;
  const cellSize = innerSize / cells;

  // Corner Position Markers
  drawCornerFinder(ctx, x + margin, y + margin, cellSize * 7);
  drawCornerFinder(ctx, x + margin + cellSize * 18, y + margin, cellSize * 7);
  drawCornerFinder(ctx, x + margin, y + margin + cellSize * 18, cellSize * 7);

  // Deterministic seed based on code string
  let seed = 0;
  for (let i = 0; i < code.length; i++) {
    seed = (seed * 31 + code.charCodeAt(i)) % 10000;
  }

  // Data modules
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      // Skip corner finders
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c >= 17) ||
        (r >= 17 && c < 8)
      ) {
        continue;
      }
      seed = (seed * 16807) % 2147483647;
      if (seed % 2 === 0) {
        ctx.fillRect(
          x + margin + c * cellSize,
          y + margin + r * cellSize,
          cellSize - 0.3,
          cellSize - 0.3
        );
      }
    }
  }

  // Center WhatsApp/Chemistry logo
  const logoSize = cellSize * 5;
  const logoX = x + margin + cellSize * 10;
  const logoY = y + margin + cellSize * 10;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4);
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🧪', logoX + logoSize / 2, logoY + logoSize / 2 + 4);

  ctx.restore();
}

function drawCornerFinder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + size * 0.14, y + size * 0.14, size * 0.72, size * 0.72);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x + size * 0.28, y + size * 0.28, size * 0.44, size * 0.44);
}

/** Helper: Barcode graphic */
function drawBarcodeGraphic(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  ctx.fillStyle = '#475569';
  let curX = x;
  let s = 12345;
  while (curX < x + w) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const barW = (s % 4) + 1;
    const gap = (s % 3) + 1;
    ctx.fillRect(curX, y, barW, h);
    curX += barW + gap;
  }
  ctx.restore();
}
