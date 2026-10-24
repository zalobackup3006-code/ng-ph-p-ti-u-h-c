/*
 * Hoa Dung - May chu cho app Luyen ngu phap Tieu hoc
 * Gom: diem hoc sinh, tai khoan hoc sinh, giao bai theo khoi, trang quan ly cua thay.
 *
 * Cap nhat (giu nguyen link /exec da gan):
 * 1. Mo Google Sheet cua thay -> Tien ich mo rong -> Apps Script.
 * 2. Xoa het code cu, dan toan bo file nay vao, bam Luu.
 * 3. Chon ham "caiDat" -> Chay. Lan dau cap quyen. Ham nay tao cac tab can thiet.
 * 4. Mo tab "Quan tri", o B2 la mat khau quan ly cua thay (tu tao, co the doi).
 * 5. Trien khai -> Quan ly trien khai -> but chi -> Phien ban moi -> Trien khai.
 */

var SH_LOG = 'Dữ liệu nộp bài';
var SH_TONG = 'Tổng hợp';
var SH_CU = 'Chi tiet bai tap';
var SH_TK = 'Tài khoản';
var SH_GIAO = 'Giao bài';
var SH_QT = 'Quản trị';
var KHOI_SO = [1, 2, 3, 4, 5];
var TRANG_THAI_OK = 'Hoạt động';

var COT_LOG = ['Thời gian', 'Họ tên', 'Khối', 'Chủ đề (unit)', 'Mã bài', 'Tên bài', 'Số câu đúng', 'Tổng số câu', 'Điểm (%)', 'Sao'];
var COT_TONG = ['Họ tên', 'Khối', 'Số bài đã làm', 'Số bài hoàn thành 100%', '% bài hoàn thành', 'Điểm TB (%)', 'Điểm TB (thang 10)', 'Lần nộp gần nhất'];
var COT_KHOI = ['Họ tên', 'Khối', 'Chủ đề (unit)', 'Mã bài', 'Tên bài', 'Điểm cao nhất (%)', 'Điểm cao nhất (thang 10)', 'Sao cao nhất', 'Số lần nộp', 'Lần nộp gần nhất'];
var COT_TK = ['Tên đăng nhập', 'Mật khẩu', 'Họ tên', 'Khối', 'Ngày tạo', 'Trạng thái', 'Mã phiên'];
var COT_GIAO = ['Khối', 'Mã chủ đề (unit)', 'Ngày giao'];

var CHU_MK = 'abcdfghjkmnpqrstuvwxyz23456789';
var CHU_SO = '23456789';

/* ---------- khoi ---------- */
// Chi nhan "Khối 1" den "Khối 5". Khoi khac hoac de trong thi khong ghi.
function khoiChuan_(s){
  var m = String(s || '').trim().match(/^Kh\S*\s+([1-5])$/);
  if(!m) return '';
  var n = Number(m[1]);
  return KHOI_SO.indexOf(n) >= 0 ? 'Khối ' + n : '';
}
function tenTabKhoi_(n){ return 'Khối ' + n; }

/* ---------- cai dat lan dau ---------- */
function caiDat(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if(!ss){
    ss = SpreadsheetApp.create('Hoa Dung - Diem luyen ngu phap');
    PropertiesService.getScriptProperties().setProperty('SS_ID', ss.getId());
  }
  ss.setSpreadsheetTimeZone('Asia/Ho_Chi_Minh');

  var logSheet = ss.getSheetByName(SH_LOG);
  if(!logSheet){
    logSheet = ss.getSheets()[0];
    logSheet.setName(SH_LOG);
  }
  veBangDau_(logSheet, COT_LOG);

  veLai_(ss.getSheetByName(SH_TONG) || ss.insertSheet(SH_TONG), COT_TONG);
  KHOI_SO.forEach(function(n){
    var ten = tenTabKhoi_(n);
    veLai_(ss.getSheetByName(ten) || ss.insertSheet(ten), COT_KHOI);
  });

  // tai khoan va giao bai la du lieu that: chi them tieu de, khong xoa
  var tk = ss.getSheetByName(SH_TK) || ss.insertSheet(SH_TK);
  if(!tk.getRange(1, 1).getValue()) veBangDau_(tk, COT_TK);
  var giao = ss.getSheetByName(SH_GIAO) || ss.insertSheet(SH_GIAO);
  if(!giao.getRange(1, 1).getValue()) veBangDau_(giao, COT_GIAO);

  var qt = ss.getSheetByName(SH_QT) || ss.insertSheet(SH_QT);
  qt.getRange(1, 1).setValue('Mật khẩu quản lý (dùng cho trang quản lý của thầy). Thầy có thể đổi ở ô B2.');
  if(!String(qt.getRange(2, 2).getValue() || '').trim()){
    qt.getRange(2, 2).setValue(ngauNhien_(8, CHU_MK));
  }
  qt.getRange(2, 1).setValue('Mật khẩu quản lý');
  qt.setColumnWidth(1, 240);

  var cu = ss.getSheetByName(SH_CU);
  if(cu) ss.deleteSheet(cu);

  capNhatTongHop_(ss);
  Logger.log('Da cai dat xong. Spreadsheet URL: ' + ss.getUrl());
}

function veBangDau_(sheet, cols){
  sheet.getRange(1, 1, 1, cols.length).setValues([cols]);
  sheet.getRange(1, 1, 1, cols.length).setFontWeight('bold').setBackground('#D5ECC4');
  sheet.setFrozenRows(1);
}

// Xoa het du lieu tinh tu log roi dung lai tieu de (chi dung cho tab tong hop va tab khoi)
function veLai_(sheet, cols){
  sheet.clear();
  veBangDau_(sheet, cols);
}

function moSS_(){
  var id = PropertiesService.getScriptProperties().getProperty('SS_ID');
  if(id) return SpreadsheetApp.openById(id);
  return SpreadsheetApp.getActiveSpreadsheet();
}

function ngauNhien_(n, bang){
  var s = '';
  for(var i = 0; i < n; i++) s += bang.charAt(Math.floor(Math.random() * bang.length));
  return s;
}

/* ---------- cong vao ---------- */
function doGet(e){ return route_(e); }
function doPost(e){ return route_(e); }

function route_(e){
  var p = (e && e.parameter) || {};
  if(p.ping) return ContentService.createTextOutput('ok');
  var hd = String(p.hd || '');
  if(!hd) return nhan_(e); // khong co "hd": day la diem bai lam cua hoc sinh

  var out;
  var lock = LockService.getScriptLock();
  try{
    var ss = moSS_();
    if(hd === 'dangnhap'){
      out = dangNhap_(ss, p.user, p.pass);
    } else if(hd === 'baigiao'){
      var k = khoiChuan_(p.khoi);
      out = { ok: !!k, bai: k ? baiCuaKhoi_(ss, k) : [] };
    } else if(hd === 'phien'){
      out = phien_(ss, p.user, p.token);
    } else if(hd === 'adm_kiemtra'){
      out = { ok: coQuyen_(ss, p) };
    } else if(!coQuyen_(ss, p)){
      out = { ok: false, loi: 'Sai mật khẩu quản lý' };
    } else {
      lock.waitLock(20000);
      try{ out = quanTri_(ss, hd, p); } finally { lock.releaseLock(); }
    }
  } catch(err){
    out = { ok: false, loi: String(err) };
  }
  var json = JSON.stringify(out);
  var cb = String(p.cb || '');
  if(cb && /^[A-Za-z_$][\w$]{0,40}$/.test(cb)){
    // JSONP: trinh duyet tren Vercel doc duoc du lieu ma khong bi chan CORS
    return ContentService.createTextOutput(cb + '(' + json + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- nhan diem tu app ---------- */
function nhan_(e){
  var p = (e && e.parameter) || {};
  var ten = String(p.ten || '').trim();
  var khoi = khoiChuan_(p.lop);
  var unit = String(p.unit || '').trim();
  var bai = String(p.bai || '').trim();
  var tieude = String(p.tieude || '').trim();
  var dung = Number(p.dung || 0);
  var tong = Number(p.tong || 0);
  var diem = Number(p.diem || 0);
  var sao = Number(p.sao || 0);

  if(!ten || !khoi || !unit || !bai){
    return HtmlService.createHtmlOutput('<p>Thiếu họ tên, khối hoặc bài học, chưa ghi được.</p>');
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try{
    var ss = moSS_();
    ss.getSheetByName(SH_LOG).appendRow([new Date(), ten, khoi, unit, bai, tieude, dung, tong, diem, sao]);
    capNhatTongHop_(ss);
  } finally {
    lock.releaseLock();
  }

  var html = '<!doctype html><html><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"></head>' +
    '<body style="font-family:sans-serif;text-align:center;padding:40px 16px;">' +
    '<h2>Đã nộp bài</h2>' +
    '<p>' + escHtml_(ten) + ' - ' + escHtml_(khoi) + '</p>' +
    '<p>' + escHtml_(tieude) + ': ' + dung + '/' + tong + ' câu đúng (' + diem + '%)</p>' +
    '<p>Em có thể đóng trang này.</p>' +
    '</body></html>';
  return HtmlService.createHtmlOutput(html);
}

function escHtml_(s){
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ---------- tai khoan hoc sinh ---------- */
function docTaiKhoan_(ss){
  var sh = ss.getSheetByName(SH_TK);
  var last = sh.getLastRow();
  return last >= 2 ? sh.getRange(2, 1, last - 1, COT_TK.length).getValues() : [];
}

function dangNhap_(ss, user, pass){
  user = String(user || '').trim().toLowerCase();
  pass = String(pass || '').trim();
  if(!user || !pass) return { ok: false, loi: 'Thiếu tên đăng nhập hoặc mật khẩu' };
  var rows = docTaiKhoan_(ss);
  for(var i = 0; i < rows.length; i++){
    var r = rows[i];
    if(String(r[0]).trim().toLowerCase() === user && String(r[1]).trim() === pass){
      if(String(r[5]).trim() !== TRANG_THAI_OK) return { ok: false, loi: 'Tài khoản đang bị khoá, hãy báo thầy' };
      var khoi = khoiChuan_(r[3]);
      return { ok: true, user: String(r[0]), ten: String(r[2]), khoi: khoi, token: String(r[6]), bai: khoi ? baiCuaKhoi_(ss, khoi) : [] };
    }
  }
  return { ok: false, loi: 'Sai tên đăng nhập hoặc mật khẩu' };
}

// Kiem tra phien da luu tren may hoc sinh: can dung ma phien (khong can mat khau)
function phien_(ss, user, token){
  var rows = docTaiKhoan_(ss);
  user = String(user || '').trim().toLowerCase();
  token = String(token || '').trim();
  if(!user || !token) return { ok: false, mat: true, loi: 'Thiếu thông tin phiên' };
  for(var i = 0; i < rows.length; i++){
    var r = rows[i];
    if(String(r[0]).trim().toLowerCase() === user){
      if(String(r[6]).trim() !== token) return { ok: false, mat: true, loi: 'Phiên đăng nhập hết hạn' };
      if(String(r[5]).trim() !== TRANG_THAI_OK) return { ok: false, mat: true, loi: 'Tài khoản đang bị khoá, hãy báo thầy' };
      var khoi = khoiChuan_(r[3]);
      return { ok: true, user: String(r[0]), ten: String(r[2]), khoi: khoi, bai: khoi ? baiCuaKhoi_(ss, khoi) : [] };
    }
  }
  return { ok: false, mat: true, loi: 'Tài khoản không còn tồn tại' };
}

// Ten dang nhap goc: ten (khong dau) + chu cai dau cua ho va dem
function tenDangNhapGoc_(ten){
  var s = String(ten).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase().replace(/[^a-z\s]/g, ' ').trim();
  var parts = s.split(/\s+/).filter(Boolean);
  if(!parts.length) return 'hs';
  var givenName = parts[parts.length - 1];
  var initials = parts.slice(0, parts.length - 1).map(function(w){ return w.charAt(0); }).join('');
  return (givenName + initials).substring(0, 14);
}

function taoTaiKhoan_(ss, ds){
  var sh = ss.getSheetByName(SH_TK);
  var dung = {};
  docTaiKhoan_(ss).forEach(function(r){ dung[String(r[0]).trim().toLowerCase()] = true; });
  var ketQua = [], moi = [];
  var ngay = new Date();
  ds.forEach(function(it){
    var ten = String(it.ten || '').trim().replace(/\s+/g, ' ');
    var khoi = khoiChuan_(it.khoi);
    if(!ten || !khoi){ ketQua.push({ loi: 'Thiếu họ tên hoặc khối không hợp lệ', ten: ten, khoi: String(it.khoi || '') }); return; }
    var goc = tenDangNhapGoc_(ten) + khoi.slice(-1);
    var user, lan = 0;
    do { user = goc + ngauNhien_(2, CHU_SO); lan++; } while(dung[user] && lan < 100);
    dung[user] = true;
    var mk = ngauNhien_(6, CHU_MK);
    moi.push([user, mk, ten, khoi, ngay, TRANG_THAI_OK, ngauNhien_(16, CHU_MK + CHU_SO)]);
    ketQua.push({ ok: true, user: user, pass: mk, ten: ten, khoi: khoi });
  });
  if(moi.length){
    sh.getRange(sh.getLastRow() + 1, 1, moi.length, COT_TK.length).setValues(moi);
  }
  return ketQua;
}

function timDongTaiKhoan_(ss, user){
  var sh = ss.getSheetByName(SH_TK);
  var rows = docTaiKhoan_(ss);
  user = String(user || '').trim().toLowerCase();
  for(var i = 0; i < rows.length; i++){
    if(String(rows[i][0]).trim().toLowerCase() === user) return i + 2; // so dong tren sheet
  }
  return 0;
}

/* ---------- giao bai theo khoi ---------- */
function baiCuaKhoi_(ss, khoi){
  var sh = ss.getSheetByName(SH_GIAO);
  var last = sh.getLastRow();
  if(last < 2) return [];
  var rows = sh.getRange(2, 1, last - 1, COT_GIAO.length).getValues();
  return rows.filter(function(r){ return String(r[0]).trim() === khoi; })
    .map(function(r){ return String(r[1]).trim(); }).filter(Boolean);
}

function luuGiao_(ss, khoi, dsBai){
  var sh = ss.getSheetByName(SH_GIAO);
  var last = sh.getLastRow();
  var giuLai = [];
  if(last >= 2){
    giuLai = sh.getRange(2, 1, last - 1, COT_GIAO.length).getValues()
      .filter(function(r){ return String(r[0]).trim() !== '' && String(r[0]).trim() !== khoi; });
    sh.getRange(2, 1, last - 1, COT_GIAO.length).clearContent();
  }
  var ngay = new Date();
  var moi = giuLai.concat(dsBai.map(function(b){ return [khoi, b, ngay]; }));
  if(moi.length) sh.getRange(2, 1, moi.length, COT_GIAO.length).setValues(moi);
}

function tatCaGiao_(ss){
  var out = {};
  KHOI_SO.forEach(function(n){ var k = 'Khối ' + n; out[k] = baiCuaKhoi_(ss, k); });
  return out;
}

/* ---------- quan tri cua thay ---------- */
function coQuyen_(ss, p){
  var mk = String(ss.getSheetByName(SH_QT).getRange(2, 2).getValue() || '').trim();
  return mk !== '' && String(p.pass || '').trim() === mk;
}

function quanTri_(ss, hd, p){
  if(hd === 'adm_ds'){
    var ds = docTaiKhoan_(ss).map(function(r){
      return { user: String(r[0]), pass: String(r[1]), ten: String(r[2]), khoi: String(r[3]), trangThai: String(r[5]) };
    });
    return { ok: true, taiKhoan: ds, giao: tatCaGiao_(ss) };
  }
  if(hd === 'adm_tao'){
    var list = JSON.parse(String(p.ds || '[]'));
    if(!Array.isArray(list) || list.length > 60) return { ok: false, loi: 'Danh sách tối đa 60 em mỗi lần' };
    return { ok: true, ketQua: taoTaiKhoan_(ss, list) };
  }
  if(hd === 'adm_mk'){
    var dong = timDongTaiKhoan_(ss, p.user);
    if(!dong) return { ok: false, loi: 'Không có tài khoản này' };
    var mkMoi = ngauNhien_(6, CHU_MK);
    var shTk = ss.getSheetByName(SH_TK);
    shTk.getRange(dong, 2).setValue(mkMoi);
    shTk.getRange(dong, 7).setValue(ngauNhien_(16, CHU_MK + CHU_SO)); // doi ma phien: may cu phai dang nhap lai
    return { ok: true, pass: mkMoi };
  }
  if(hd === 'adm_khoa'){
    var d2 = timDongTaiKhoan_(ss, p.user);
    if(!d2) return { ok: false, loi: 'Không có tài khoản này' };
    var moKhoa = String(p.mo || '') === '1';
    ss.getSheetByName(SH_TK).getRange(d2, 6).setValue(moKhoa ? TRANG_THAI_OK : 'Khoá');
    return { ok: true };
  }
  if(hd === 'adm_xoa'){
    var d3 = timDongTaiKhoan_(ss, p.user);
    if(!d3) return { ok: false, loi: 'Không có tài khoản này' };
    ss.getSheetByName(SH_TK).deleteRow(d3);
    return { ok: true };
  }
  if(hd === 'adm_giao'){
    var khoi = khoiChuan_(p.khoi);
    if(!khoi) return { ok: false, loi: 'Khối không hợp lệ' };
    var bai = String(p.bai || '').split(',').map(function(s){ return s.trim(); }).filter(Boolean);
    luuGiao_(ss, khoi, bai);
    return { ok: true, khoi: khoi, soBai: bai.length };
  }
  return { ok: false, loi: 'Thao tác không có' };
}

/* ---------- dung lai Tong hop va tab tung khoi tu log ---------- */
function capNhatTongHop_(ss){
  ss = ss || moSS_();
  var logSheet = ss.getSheetByName(SH_LOG);
  var last = logSheet.getLastRow();
  var rows = last >= 2 ? logSheet.getRange(2, 1, last - 1, COT_LOG.length).getValues() : [];

  var hocSinh = {}; // key: ten|khoi
  var baiMap = {};  // key: ten|khoi|unit|bai
  var demLan = {};

  rows.forEach(function(r){
    var thoiGian = r[0];
    var ten = String(r[1] || '').trim(), khoi = String(r[2] || '').trim();
    var unit = String(r[3] || '').trim(), bai = String(r[4] || '').trim(), tieude = String(r[5] || '').trim();
    var diem = Number(r[8] || 0), sao = Number(r[9] || 0);
    if(!ten || !khoi) return;
    var keyHS = ten.toLowerCase() + '|' + khoi.toLowerCase();
    var keyBai = keyHS + '|' + unit + '|' + bai;

    if(!hocSinh[keyHS]) hocSinh[keyHS] = { ten: ten, khoi: khoi, lanNop: thoiGian };
    if(thoiGian > hocSinh[keyHS].lanNop) hocSinh[keyHS].lanNop = thoiGian;

    demLan[keyBai] = (demLan[keyBai] || 0) + 1;
    if(!baiMap[keyBai] || diem > baiMap[keyBai].diem){
      baiMap[keyBai] = { ten: ten, khoi: khoi, unit: unit, bai: bai, tieude: tieude, diem: diem, sao: sao, lanNop: thoiGian };
    } else if(thoiGian > baiMap[keyBai].lanNop){
      baiMap[keyBai].lanNop = thoiGian;
    }
  });
  Object.keys(baiMap).forEach(function(k){ baiMap[k].soLan = demLan[k] || 1; });

  var tongRows = Object.keys(hocSinh).map(function(keyHS){
    var hs = hocSinh[keyHS];
    var baiCua = Object.keys(baiMap).filter(function(k){ return k.indexOf(keyHS + '|') === 0; }).map(function(k){ return baiMap[k]; });
    var soBai = baiCua.length;
    var soHoanThanh = baiCua.filter(function(b){ return b.diem >= 100; }).length;
    var tyLe = soBai ? Math.round(soHoanThanh / soBai * 1000) / 10 : 0;
    var diemTB = soBai ? Math.round(baiCua.reduce(function(s, b){ return s + b.diem; }, 0) / soBai * 10) / 10 : 0;
    return [hs.ten, hs.khoi, soBai, soHoanThanh, tyLe, diemTB, Math.round(diemTB / 10 * 10) / 10, hs.lanNop];
  });
  tongRows.sort(function(a, b){ return a[1].localeCompare(b[1], 'vi') || a[0].localeCompare(b[0], 'vi'); });
  veLai_(ss.getSheetByName(SH_TONG), COT_TONG);
  if(tongRows.length) ss.getSheetByName(SH_TONG).getRange(2, 1, tongRows.length, COT_TONG.length).setValues(tongRows);

  KHOI_SO.forEach(function(n){
    var ten = tenTabKhoi_(n);
    var sheet = ss.getSheetByName(ten) || ss.insertSheet(ten);
    var ctRows = Object.keys(baiMap).filter(function(k){ return baiMap[k].khoi === ten; }).map(function(k){
      var b = baiMap[k];
      return [b.ten, b.khoi, b.unit, b.bai, b.tieude, b.diem, Math.round(b.diem / 10 * 10) / 10, b.sao, b.soLan, b.lanNop];
    });
    ctRows.sort(function(a, b){ return a[0].localeCompare(b[0], 'vi') || a[2].localeCompare(b[2], 'vi') || a[3].localeCompare(b[3], 'vi'); });
    veLai_(sheet, COT_KHOI);
    if(ctRows.length) sheet.getRange(2, 1, ctRows.length, COT_KHOI.length).setValues(ctRows);
  });
}
