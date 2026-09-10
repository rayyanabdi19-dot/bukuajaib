import { Guest, ActivityLog } from '../types';

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'Rp0';
  return 'Rp' + amount.toLocaleString('id-ID');
}

export function parseRupiahInput(value: string): number {
  const clean = value.replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
}

export function getCurrentTimeWIB(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} WIB`;
}

export function exportToCSV(guests: Guest[], filename = 'Buku_Tamu_Budi_Siti.csv'): void {
  const headers = [
    'No',
    'Kode Tamu',
    'Nama Tamu',
    'Relasi / Meja',
    'Pihak (L/P)',
    'Jumlah Orang',
    'Status Amplop',
    'Kode Amplop',
    'Nominal (Rp)',
    'Kotak Box',
    'Souvenir',
    'Waktu Hadir',
    'Petugas Meja',
    'Nomor Meja',
    'No. WhatsApp',
    'Catatan Khusus',
  ];

  const rows = guests.map((g, idx) => [
    idx + 1,
    g.id,
    `"${g.name.replace(/"/g, '""')}"`,
    `"${(g.relation || '').replace(/"/g, '""')}"`,
    g.party === 'laki' ? 'Pihak Laki-laki' : 'Pihak Perempuan',
    g.guestCount,
    g.envelopeStatus === 'counted'
      ? 'Sudah Dihitung'
      : g.envelopeStatus === 'pending'
      ? 'Belum Dihitung'
      : 'Tanpa Amplop',
    g.envelopeCode || '-',
    g.envelopeAmount || 0,
    g.envelopeBox === 'box_male' ? 'Kotak Pria' : g.envelopeBox === 'box_female' ? 'Kotak Wanita' : '-',
    g.souvenirGiven ? 'Sudah Diterima' : 'Belum Diterima',
    g.checkInTime,
    `"${g.officer}"`,
    g.tableNumber || '-',
    g.phone || '-',
    `"${(g.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const exportGuestsToCSV = exportToCSV;

export function printBeritaAcara(
  param1: any,
  param2?: any
): void {
  let guestsList: Guest[] = [];
  if (Array.isArray(param1)) {
    guestsList = param1;
  } else if (Array.isArray(param2)) {
    guestsList = param2;
  } else {
    guestsList = [];
  }

  const maleGuests = guestsList.filter((g) => g.party === 'laki');
  const femaleGuests = guestsList.filter((g) => g.party === 'perempuan');

  const stats = {
    totalGuests: guestsList.length,
    totalPeople: guestsList.reduce((sum, g) => sum + (g.guestCount || 1), 0),
    maleGuests: maleGuests.length,
    malePeople: maleGuests.reduce((sum, g) => sum + (g.guestCount || 1), 0),
    maleCash: maleGuests.reduce((sum, g) => sum + (g.envelopeAmount || 0), 0),
    femaleGuests: femaleGuests.length,
    femalePeople: femaleGuests.reduce((sum, g) => sum + (g.guestCount || 1), 0),
    femaleCash: femaleGuests.reduce((sum, g) => sum + (g.envelopeAmount || 0), 0),
    totalCash: guestsList.reduce((sum, g) => sum + (g.envelopeAmount || 0), 0),
    countedEnvelopes: guestsList.filter((g) => g.hasEnvelope && g.envelopeStatus === 'counted').length,
    pendingEnvelopes: guestsList.filter((g) => g.hasEnvelope && g.envelopeStatus === 'pending').length,
  };
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Berita Acara & Rekapitulasi Buku Tamu Pernikahan</title>
  <style>
    body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.4; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; }
    .header h2 { margin: 5px 0 0 0; font-size: 16px; font-weight: normal; }
    .header p { margin: 4px 0 0 0; font-size: 13px; font-style: italic; }
    .grid { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; }
    .box { border: 1px solid #999; padding: 12px; margin-bottom: 20px; border-radius: 4px; }
    .box h3 { margin-top: 0; font-size: 15px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
    th, td { border: 1px solid #999; padding: 6px 8px; text-align: left; }
    th { background: #f2f2f2; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .signatures { margin-top: 40px; display: flex; justify-content: space-between; page-break-inside: avoid; }
    .sig-col { text-align: center; width: 28%; font-size: 13px; }
    .sig-space { height: 75px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Berita Acara Rekapitulasi Buku Tamu & Kasir Amplop</h1>
    <h2>RESEPSI PERNIKAHAN RESMI: BUDI PRATAMA, S.T. & SITI NURHALIZA, S.E.</h2>
    <p>Gedung Serbaguna Jakarta • Minggu, 20 September 2026 • Dicetak Resmi melalui Sistem Buku Ajaib v.1.0.2</p>
  </div>

  <div class="grid">
    <div>
      <strong>Waktu Verifikasi Akhir:</strong> ${new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })} - Pukul ${new Date().toLocaleTimeString('id-ID')} WIB<br/>
      <strong>Lokasi Meja:</strong> Meja Registrasi Stasiun 1 & 2 Terpadu
    </div>
    <div style="text-align: right;">
      <strong>Status Data:</strong> Terverifikasi (Kunci Berkas Selesai Acara)<br/>
      <strong>Total Undangan Hadir:</strong> ${stats.totalGuests} Tamu (${stats.totalPeople} Fisik Orang)
    </div>
  </div>

  <div class="box">
    <h3>1. Rekapitulasi Akuntabilitas Dana Amplop & Tanda Kasih</h3>
    <table>
      <thead>
        <tr>
          <th>Klasifikasi Pihak</th>
          <th class="text-center">Jumlah Tamu</th>
          <th class="text-center">Fisik Hadir</th>
          <th class="text-center">Amplop Dihitung</th>
          <th class="text-right">Total Nominal Tercatat</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Pihak Keluarga Pengantin Pria (Laki-laki)</strong></td>
          <td class="text-center">${stats.maleGuests} Tamu</td>
          <td class="text-center">${stats.malePeople} Jiwa</td>
          <td class="text-center">${guestsList.filter((g) => g.party === 'laki' && g.envelopeStatus === 'counted').length} Amplop</td>
          <td class="text-right"><strong>${formatRupiah(stats.maleCash)}</strong></td>
        </tr>
        <tr>
          <td><strong>Pihak Keluarga Pengantin Wanita (Perempuan)</strong></td>
          <td class="text-center">${stats.femaleGuests} Tamu</td>
          <td class="text-center">${stats.femalePeople} Jiwa</td>
          <td class="text-center">${guestsList.filter((g) => g.party === 'perempuan' && g.envelopeStatus === 'counted').length} Amplop</td>
          <td class="text-right"><strong>${formatRupiah(stats.femaleCash)}</strong></td>
        </tr>
        <tr style="background: #fafafa; font-size: 14px;">
          <td><strong>TOTAL KESELURUHAN DANA AMPLOP</strong></td>
          <td class="text-center"><strong>${stats.totalGuests} Tamu</strong></td>
          <td class="text-center"><strong>${stats.totalPeople} Jiwa</strong></td>
          <td class="text-center"><strong>${stats.countedEnvelopes} Dihitung (${stats.pendingEnvelopes} Belum)</strong></td>
          <td class="text-right" style="font-size: 16px;"><strong>${formatRupiah(stats.totalCash)}</strong></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="box">
    <h3>2. Sampel 10 Entri Tamu Terakhir Meja Resepsi</h3>
    <table>
      <thead>
        <tr>
          <th class="text-center">No</th>
          <th>Kode</th>
          <th>Nama Tamu & Relasi</th>
          <th>Pihak</th>
          <th class="text-center">Orang</th>
          <th>Status Amplop</th>
          <th class="text-right">Nominal</th>
          <th>Petugas & Waktu</th>
        </tr>
      </thead>
      <tbody>
        ${guestsList
          .slice(0, 10)
          .map(
            (g, i) => `
          <tr>
            <td class="text-center">${i + 1}</td>
            <td><code>${g.id}</code></td>
            <td><strong>${g.name}</strong><br/><small style="color:#555">${g.relation || '-'}</small></td>
            <td>${g.party === 'laki' ? 'Laki-laki' : 'Perempuan'}</td>
            <td class="text-center">${g.guestCount} org</td>
            <td>${g.envelopeStatus === 'counted' ? 'Sudah Dihitung (' + (g.envelopeCode || '') + ')' : g.envelopeStatus === 'pending' ? 'Belum Dihitung' : 'Tanpa Amplop'}</td>
            <td class="text-right">${g.envelopeStatus === 'counted' ? formatRupiah(g.envelopeAmount) : '-'}</td>
            <td><small>${g.checkInTime} • ${g.officer}</small></td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  </div>

  <div class="signatures">
    <div class="sig-col">
      <p>Saksi Keluarga Pengantin Pria,</p>
      <div class="sig-space"></div>
      <p><strong>( .................................................... )</strong><br/>Keluarga Budi Pratama</p>
    </div>
    <div class="sig-col">
      <p>Koordinator Wedding Organizer,</p>
      <div class="sig-space"></div>
      <p><strong>( .................................................... )</strong><br/>Ketua Tim Registrasi</p>
    </div>
    <div class="sig-col">
      <p>Saksi Keluarga Pengantin Wanita,</p>
      <div class="sig-space"></div>
      <p><strong>( .................................................... )</strong><br/>Keluarga Siti Nurhaliza</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>
`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
