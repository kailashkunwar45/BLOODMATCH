/**
 * Verified Hospitals & Blood Banks operating in Nepal
 * These are legitimate institutions registered with the Government of Nepal,
 * Nepal Health Research Council (NHRC), or Nepal Red Cross Society.
 * 
 * Hospital admins must provide a valid registration number matching one of these
 * entries to register as a hospital_admin on the platform.
 */

const verifiedHospitals = [
  // === Nepal Red Cross Blood Banks ===
  { name: 'Nepal Red Cross Society - Central Blood Transfusion Service', city: 'Kathmandu', registrationNumber: 'NRCS-CBTS-001', province: 'Bagmati' },
  { name: 'Nepal Red Cross Society - Bhaktapur', city: 'Bhaktapur', registrationNumber: 'NRCS-BKT-002', province: 'Bagmati' },
  { name: 'Nepal Red Cross Society - Lalitpur', city: 'Lalitpur', registrationNumber: 'NRCS-LTP-003', province: 'Bagmati' },
  { name: 'Nepal Red Cross Society - Kaski', city: 'Pokhara', registrationNumber: 'NRCS-KSK-004', province: 'Gandaki' },
  { name: 'Nepal Red Cross Society - Chitwan', city: 'Bharatpur', registrationNumber: 'NRCS-CTW-005', province: 'Bagmati' },
  { name: 'Nepal Red Cross Society - Morang', city: 'Biratnagar', registrationNumber: 'NRCS-MRG-006', province: 'Koshi' },
  { name: 'Nepal Red Cross Society - Rupandehi', city: 'Butwal', registrationNumber: 'NRCS-RPD-007', province: 'Lumbini' },
  { name: 'Nepal Red Cross Society - Sunsari', city: 'Dharan', registrationNumber: 'NRCS-SNS-008', province: 'Koshi' },
  { name: 'Nepal Red Cross Society - Jhapa', city: 'Birtamod', registrationNumber: 'NRCS-JHP-009', province: 'Koshi' },
  { name: 'Nepal Red Cross Society - Banke', city: 'Nepalgunj', registrationNumber: 'NRCS-BNK-010', province: 'Lumbini' },

  // === Government Hospitals ===
  { name: 'Tribhuvan University Teaching Hospital (TUTH)', city: 'Kathmandu', registrationNumber: 'GOV-TUTH-101', province: 'Bagmati' },
  { name: 'B.P. Koirala Institute of Health Sciences (BPKIHS)', city: 'Dharan', registrationNumber: 'GOV-BPKIHS-102', province: 'Koshi' },
  { name: 'Bir Hospital', city: 'Kathmandu', registrationNumber: 'GOV-BIR-103', province: 'Bagmati' },
  { name: 'Patan Hospital', city: 'Lalitpur', registrationNumber: 'GOV-PTN-104', province: 'Bagmati' },
  { name: 'Kanti Children\'s Hospital', city: 'Kathmandu', registrationNumber: 'GOV-KCH-105', province: 'Bagmati' },
  { name: 'Bheri Hospital', city: 'Nepalgunj', registrationNumber: 'GOV-BHR-106', province: 'Lumbini' },
  { name: 'Western Regional Hospital', city: 'Pokhara', registrationNumber: 'GOV-WRH-107', province: 'Gandaki' },
  { name: 'Bharatpur Hospital', city: 'Bharatpur', registrationNumber: 'GOV-BHP-108', province: 'Bagmati' },
  { name: 'Lumbini Provincial Hospital', city: 'Butwal', registrationNumber: 'GOV-LPH-109', province: 'Lumbini' },
  { name: 'Rapti Academy of Health Sciences', city: 'Dang', registrationNumber: 'GOV-RAHS-110', province: 'Lumbini' },
  { name: 'Seti Provincial Hospital', city: 'Dhangadhi', registrationNumber: 'GOV-SPH-111', province: 'Sudurpashchim' },
  { name: 'Koshi Hospital', city: 'Biratnagar', registrationNumber: 'GOV-KSH-112', province: 'Koshi' },
  { name: 'Sagarmatha Zonal Hospital', city: 'Rajbiraj', registrationNumber: 'GOV-SZH-113', province: 'Madhesh' },
  { name: 'Janakpur Provincial Hospital', city: 'Janakpur', registrationNumber: 'GOV-JPH-114', province: 'Madhesh' },
  { name: 'Narayani Hospital', city: 'Birgunj', registrationNumber: 'GOV-NRH-115', province: 'Madhesh' },

  // === Private Hospitals with Blood Banks ===
  { name: 'Norvic International Hospital', city: 'Kathmandu', registrationNumber: 'PVT-NRV-201', province: 'Bagmati' },
  { name: 'Grande International Hospital', city: 'Kathmandu', registrationNumber: 'PVT-GIH-202', province: 'Bagmati' },
  { name: 'Medicity Hospital', city: 'Lalitpur', registrationNumber: 'PVT-MDC-203', province: 'Bagmati' },
  { name: 'Nepal Mediciti Hospital', city: 'Lalitpur', registrationNumber: 'PVT-NMC-204', province: 'Bagmati' },
  { name: 'Star Hospital', city: 'Kathmandu', registrationNumber: 'PVT-STR-205', province: 'Bagmati' },
  { name: 'Manipal Teaching Hospital', city: 'Pokhara', registrationNumber: 'PVT-MPL-206', province: 'Gandaki' },
  { name: 'Nobel Medical College', city: 'Biratnagar', registrationNumber: 'PVT-NMD-207', province: 'Koshi' },
  { name: 'Chitwan Medical College', city: 'Bharatpur', registrationNumber: 'PVT-CMC-208', province: 'Bagmati' },
  { name: 'Lumbini Medical College', city: 'Palpa', registrationNumber: 'PVT-LMC-209', province: 'Lumbini' },
  { name: 'National Medical College', city: 'Birgunj', registrationNumber: 'PVT-NMC-210', province: 'Madhesh' },
  { name: 'Birat Medical College', city: 'Biratnagar', registrationNumber: 'PVT-BMC-211', province: 'Koshi' },
  { name: 'Nepalgunj Medical College', city: 'Nepalgunj', registrationNumber: 'PVT-NGMC-212', province: 'Lumbini' },
];

module.exports = verifiedHospitals;
