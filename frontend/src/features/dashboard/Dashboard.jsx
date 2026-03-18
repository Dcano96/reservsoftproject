"use client"

import { useState, useEffect, useRef } from "react"
import { useHistory, useLocation } from "react-router-dom"
import axios from "axios"
import jwtDecode from "jwt-decode"
import Swal from "sweetalert2"
import Chart from "chart.js/auto"
import {
  X, LogOut, ChevronLeft, ChevronRight, Menu, BarChart2, Users, User,
  Building, Sofa, Calendar, CreditCard, Percent, Hotel, Shield, ChevronDown,
  Bell, Search, TrendingUp, Home, AlertCircle, ArrowUpRight,
} from "lucide-react"

import Sidebar from "./Sidebar"
import Content from "./Content"
import UsuariosList from "../usuarios/UsuariosList"
import RolesList from "../roles/RolesList"
import DescuentosList from "../descuentos/DescuentosList"
import ReservasList from "../reservas/ReservasList"
import ApartamentoList from "../apartamentos/ApartamentoList"
import TipoApartamentoList from "../tipoApartamentos/TipoApartamentoList"
import MobiliarioList from "../mobiliarios/MobiliarioList"
import HospedajeList from "../hospedaje/HospedajeList"
import ClienteList from "../clientes/ClienteList"
import PagosList from "../pagos/PagosList"
import UserProfile from "../usuarios/UserProfile"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STYLES  —  Reservsoft Premium Redesign
   Syne + DM Sans · Deep violet · Vivid accents
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

*,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

:root {
  /* ── Ink scale ── */
  --ink:   #0C0A14;
  --ink2:  #2D2640;
  --ink3:  #6B5E87;
  --ink4:  #B0A5C8;

  /* ── Surfaces ── */
  --mist:    #F4F1FF;
  --mist2:   #EBE5FF;
  --white:   #FFFFFF;
  --surface: rgba(255,255,255,0.68);

  /* ── Brand accents ── */
  --v1: #6C3FFF;
  --v2: #9B6DFF;
  --e1: #FF3B82;
  --t1: #00D4AA;
  --b1: #2563EB;
  --a1: #FF7B2C;
  --y1: #F5C518;

  /* ── Gradients ── */
  --gv: linear-gradient(135deg, #6C3FFF 0%, #C040FF 100%);
  --ge: linear-gradient(135deg, #FF3B82 0%, #FF7B2C 100%);
  --gt: linear-gradient(135deg, #00D4AA 0%, #00A3E0 100%);
  --gb: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);
  --gpage: linear-gradient(160deg, #F0ECFF 0%, #EDE8FF 40%, #F9F4FF 70%, #EEF4FF 100%);

  /* ── Borders ── */
  --b-light: rgba(108,63,255,0.10);
  --b-med:   rgba(108,63,255,0.18);
  --b-heavy: rgba(108,63,255,0.30);

  /* ── Shadows ── */
  --sh-sm:  0 2px 10px  rgba(80,40,200,0.09);
  --sh-md:  0 6px 24px  rgba(80,40,200,0.12);
  --sh-lg:  0 12px 40px rgba(80,40,200,0.15);
  --sh-xl:  0 20px 60px rgba(80,40,200,0.18);
  --sh-card:0 4px 28px  rgba(108,63,255,0.10);

  --r-xs: 8px; --r-sm: 12px; --r-md: 18px; --r-lg: 24px; --r-xl: 32px;

  --sb-w:   260px;
  --sb-col:  64px;
  --hdr-h:   62px;

  --font:  'DM Sans', sans-serif;
  --font-h:'Syne', sans-serif;
  --ease:  cubic-bezier(0.4,0,0.2,1);
}

html, body { height:100%; }

/* ━━━━━━━━━━ ROOT ━━━━━━━━━━ */
.i-root {
  display:flex; height:100vh; overflow:hidden;
  font-family:var(--font); color:var(--ink);
  background:var(--gpage);
  position:relative;
}

/* Animated background blobs */
.i-root::before,
.i-root::after {
  content:'';
  position:fixed; border-radius:50%;
  filter:blur(90px); pointer-events:none; z-index:0;
  animation:blobDrift 16s ease-in-out infinite alternate;
}
.i-root::before {
  width:500px; height:500px;
  background:rgba(108,63,255,0.16);
  top:-140px; left:-100px;
}
.i-root::after {
  width:380px; height:380px;
  background:rgba(255,59,130,0.13);
  bottom:-80px; right:-60px;
  animation-delay:-6s;
}
@keyframes blobDrift {
  0%   { transform:translate(0,0) scale(1); }
  50%  { transform:translate(28px,-18px) scale(1.07); }
  100% { transform:translate(-18px,26px) scale(0.95); }
}

/* ━━━━━━━━━━ SIDEBAR ━━━━━━━━━━ */
.i-sb {
  position:relative; z-index:60;
  width:var(--sb-w); height:100vh; flex-shrink:0;
  display:flex; flex-direction:column;
  background:rgba(255,255,255,0.64);
  backdrop-filter:blur(28px) saturate(200%);
  -webkit-backdrop-filter:blur(28px) saturate(200%);
  border-right:1px solid var(--b-light);
  transition:width 0.34s var(--ease);
  overflow:hidden;
  box-shadow:4px 0 40px rgba(108,63,255,0.06);
}
.i-sb::before {
  content:'';
  position:absolute; top:0; left:0; right:0; height:3px;
  background:var(--gv); z-index:2;
}
.i-sb.col { width:var(--sb-col); }

/* BRAND */
.i-brand {
  display:flex; align-items:center; gap:12px;
  padding:20px 16px 17px; flex-shrink:0;
}
.i-logo {
  width:38px; height:38px; flex-shrink:0; border-radius:12px;
  background:var(--gv);
  display:flex; align-items:center; justify-content:center;
  font-family:var(--font-h); font-weight:800; font-size:17px; color:#fff;
  box-shadow:0 4px 20px rgba(108,63,255,0.50);
  position:relative; overflow:hidden;
  animation:logoBob 5s ease-in-out infinite;
}
.i-logo::after {
  content:'';
  position:absolute; top:-6px; right:-6px;
  width:18px; height:18px; border-radius:50%;
  background:rgba(255,255,255,0.22);
}
@keyframes logoBob {
  0%,100%{ transform:translateY(0) rotate(0deg);   box-shadow:0 4px 20px rgba(108,63,255,0.50); }
  50%    { transform:translateY(-3px) rotate(-2deg); box-shadow:0 8px 28px rgba(192,64,255,0.50); }
}
.i-brand-name {
  font-family:var(--font-h); font-size:18px; font-weight:800;
  color:var(--ink); letter-spacing:-0.5px;
  white-space:nowrap; overflow:hidden;
  transition:opacity 0.2s, width 0.2s;
}
.i-sb.col .i-brand-name { opacity:0; width:0; }

/* TOGGLE */
.i-toggle {
  position:absolute; right:-13px; top:76px;
  width:26px; height:26px; border-radius:50%;
  background:var(--white); border:1.5px solid var(--b-med);
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; color:var(--ink3); z-index:10;
  box-shadow:var(--sh-sm); transition:all 0.2s;
}
.i-toggle:hover { color:var(--v1); border-color:var(--b-heavy); box-shadow:var(--sh-md); transform:scale(1.1); }

/* NAV SCROLL */
.i-nav-scroll { flex:1; overflow-y:auto; overflow-x:hidden; padding:8px 10px; }
.i-nav-scroll::-webkit-scrollbar { width:2px; }
.i-nav-scroll::-webkit-scrollbar-thumb { background:var(--b-light); border-radius:2px; }

/* SECTION LABELS */
.i-section-lbl {
  font-size:9.5px; font-weight:700; letter-spacing:1.5px;
  text-transform:uppercase; color:var(--ink4);
  padding:12px 8px 6px;
  white-space:nowrap; overflow:hidden;
  transition:opacity 0.2s;
}
.i-sb.col .i-section-lbl { opacity:0; }

/* PROCESS GROUP — kept for compatibility with NAV_STRUCTURE */
.i-group { margin-bottom:2px; }
.i-group-hd {
  display:flex; align-items:center; gap:9px;
  padding:7px 9px 5px; border-radius:var(--r-sm);
  cursor:pointer; transition:background 0.15s; user-select:none;
}
.i-group-hd:hover { background:rgba(108,63,255,0.06); }
.i-group-ico {
  width:28px; height:28px; border-radius:8px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center; font-size:13px;
}
.i-group-lbl {
  flex:1; font-size:9.5px; font-weight:700; letter-spacing:1.5px;
  text-transform:uppercase; color:var(--ink4);
  white-space:nowrap; overflow:hidden; transition:opacity 0.2s,width 0.2s;
}
.i-sb.col .i-group-lbl { opacity:0; width:0; }
.i-group-arr { color:var(--ink4); transition:transform 0.22s var(--ease); flex-shrink:0; }
.i-group-arr.open { transform:rotate(90deg); }
.i-sb.col .i-group-arr { display:none; }

/* SUBS */
.i-subs { overflow:hidden; max-height:0; opacity:0; transition:max-height 0.3s var(--ease),opacity 0.25s; }
.i-subs.open { max-height:500px; opacity:1; }
.i-sb.col .i-subs { display:none; }

/* NAV BUTTON */
.i-btn {
  display:flex; align-items:center; gap:10px;
  padding:9px 10px;
  border-radius:var(--r-sm); border:none; background:none;
  color:var(--ink3); font-family:var(--font); font-size:13.5px; font-weight:500;
  width:100%; text-align:left; cursor:pointer;
  transition:all 0.18s; position:relative;
  white-space:nowrap; margin-bottom:1px;
}
.i-btn::before {
  content:''; position:absolute; left:0; top:20%; bottom:20%;
  width:3px; border-radius:0 3px 3px 0;
  background:var(--gv);
  transform:scaleY(0); transform-origin:center;
  transition:transform 0.2s var(--ease);
}
.i-btn:hover { background:rgba(108,63,255,0.07); color:var(--ink); }
.i-btn.on {
  background:linear-gradient(135deg, rgba(108,63,255,0.12), rgba(192,64,255,0.07));
  color:var(--v1); font-weight:600;
}
.i-btn.on::before { transform:scaleY(1); }
.i-btn-ico {
  width:30px; height:30px; flex-shrink:0; border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  background:rgba(108,63,255,0.08);
  transition:background 0.18s;
}
.i-btn.on .i-btn-ico { background:rgba(108,63,255,0.15); color:var(--v1); }
.i-btn:hover .i-btn-ico { background:rgba(108,63,255,0.12); }
.i-btn-ico svg { width:15px; height:15px; }
.i-btn-txt { flex:1; overflow:hidden; transition:opacity 0.2s,width 0.2s; }
.i-sb.col .i-btn-txt { opacity:0; width:0; }
.i-sb.col .i-btn { padding:9px; justify-content:center; }

/* Tooltip on collapsed */
.i-sb.col .i-btn:hover::after {
  content:attr(data-label);
  position:absolute; left:calc(100% + 12px); top:50%; transform:translateY(-50%);
  background:var(--white); border:1px solid var(--b-med);
  color:var(--ink); font-size:12px; font-weight:600;
  padding:5px 12px; border-radius:8px; white-space:nowrap; z-index:300;
  box-shadow:var(--sh-md);
}

/* SIDEBAR FOOTER */
.i-sb-foot { padding:12px 10px; border-top:1px solid var(--b-light); flex-shrink:0; }
.i-user-pill {
  display:flex; align-items:center; gap:10px;
  padding:10px; border-radius:var(--r-md);
  background:rgba(108,63,255,0.06);
  cursor:pointer; transition:all 0.18s;
  border:1px solid transparent; overflow:hidden;
}
.i-user-pill:hover { background:rgba(108,63,255,0.10); border-color:var(--b-light); }
.i-av {
  width:34px; height:34px; border-radius:50%; flex-shrink:0;
  background:var(--gv);
  display:flex; align-items:center; justify-content:center;
  font-size:13px; font-weight:700; color:#fff;
  box-shadow:0 3px 14px rgba(108,63,255,0.42);
}
.i-uname { font-size:13px; font-weight:600; color:var(--ink); white-space:nowrap; }
.i-urole { font-size:11px; color:var(--ink3); white-space:nowrap; margin-top:1px; }
.i-sb.col .i-uname, .i-sb.col .i-urole { display:none; }
.i-sb.col .i-user-pill { padding:8px; justify-content:center; }

/* ━━━━━━━━━━ HEADER ━━━━━━━━━━ */
.i-header {
  height:var(--hdr-h); flex-shrink:0;
  display:flex; align-items:center; justify-content:space-between;
  padding:0 24px;
  background:rgba(255,255,255,0.66);
  backdrop-filter:blur(24px) saturate(180%);
  -webkit-backdrop-filter:blur(24px) saturate(180%);
  border-bottom:1px solid var(--b-light);
  position:relative; z-index:40;
  box-shadow:0 2px 20px rgba(108,63,255,0.05);
}
.i-breadcrumb { display:flex; align-items:center; gap:6px; }
.i-bc-home { font-size:12px; color:var(--ink4); }
.i-bc-sep  { font-size:12px; color:var(--ink4); }
.i-bc-cur  { font-family:var(--font-h); font-size:15px; font-weight:700; color:var(--ink); }

.i-header-l { display:flex; align-items:center; gap:16px; }
.i-header-r { display:flex; align-items:center; gap:8px; }

/* SEARCH */
.i-search {
  display:flex; align-items:center; gap:8px;
  background:rgba(255,255,255,0.82); border:1px solid var(--b-light);
  border-radius:50px; padding:8px 16px;
  min-width:200px; transition:all 0.2s;
  box-shadow:var(--sh-sm);
}
.i-search:focus-within {
  border-color:var(--b-heavy);
  box-shadow:0 0 0 3px rgba(108,63,255,0.10);
  background:var(--white);
}
.i-search input {
  background:none; border:none; outline:none;
  font-family:var(--font); font-size:13px; color:var(--ink); width:100%;
}
.i-search input::placeholder { color:var(--ink4); }
.i-search-kbd {
  font-size:10px; color:var(--ink4);
  background:rgba(108,63,255,0.07); border-radius:5px;
  padding:2px 6px; white-space:nowrap;
}

/* ICON BTN */
.i-ico-btn {
  width:36px; height:36px; border-radius:50%;
  background:rgba(255,255,255,0.82); border:1px solid var(--b-light);
  display:flex; align-items:center; justify-content:center;
  color:var(--ink2); cursor:pointer; transition:all 0.18s; position:relative;
  box-shadow:var(--sh-sm);
}
.i-ico-btn:hover { background:var(--white); border-color:var(--b-med); color:var(--v1); transform:scale(1.06); }
.i-pip {
  position:absolute; top:8px; right:8px;
  width:6px; height:6px; border-radius:50%;
  background:var(--e1); border:1.5px solid var(--white);
  animation:pipPulse 2s ease-in-out infinite;
}
@keyframes pipPulse {
  0%,100%{ box-shadow:0 0 0 0 rgba(255,59,130,0.6); }
  60%    { box-shadow:0 0 0 5px rgba(255,59,130,0); }
}

/* PROFILE CHIP */
.i-prof-btn {
  display:flex; align-items:center; gap:8px;
  background:rgba(255,255,255,0.82); border:1px solid var(--b-light);
  border-radius:50px; padding:4px 12px 4px 4px;
  cursor:pointer; transition:all 0.18s; position:relative;
  box-shadow:var(--sh-sm);
}
.i-prof-btn:hover { background:var(--white); border-color:var(--b-med); box-shadow:var(--sh-md); }
.i-prof-name  { font-size:12.5px; font-weight:600; color:var(--ink); }
.i-chevron    { color:var(--ink4); }

/* DROPDOWN */
.i-drop {
  position:absolute; top:calc(100% + 9px); right:0; width:220px;
  background:rgba(255,255,255,0.96);
  backdrop-filter:blur(24px);
  border:1px solid var(--b-med); border-radius:var(--r-md);
  box-shadow:var(--sh-xl); overflow:hidden; z-index:200;
  animation:dropIn 0.18s var(--ease);
}
@keyframes dropIn { from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)} }
.i-drop::before {
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  background:var(--gv);
}
.i-drop-head { padding:14px 15px 11px; border-bottom:1px solid var(--b-light); }
.i-drop-name { font-size:14px; font-weight:700; color:var(--ink); }
.i-drop-role { font-size:11px; color:var(--ink3); margin-top:2px; }
.i-drop-body { padding:6px; }
.i-drop-item {
  display:flex; align-items:center; gap:9px;
  padding:9px 10px; border-radius:10px;
  color:var(--ink2); font-size:13px; font-weight:600;
  cursor:pointer; border:none; background:none;
  width:100%; font-family:var(--font); text-align:left; transition:all 0.13s;
}
.i-drop-item:hover { background:rgba(108,63,255,0.08); color:var(--v1); }
.i-drop-item.red:hover { background:rgba(255,59,130,0.08); color:var(--e1); }
.i-drop-div { height:1px; background:var(--b-light); margin:4px 0; }

/* MOBILE */
.i-menu-btn {
  display:none; width:38px; height:38px;
  background:rgba(255,255,255,0.82); border:1px solid var(--b-light);
  border-radius:var(--r-sm); align-items:center; justify-content:center;
  cursor:pointer; color:var(--ink2); box-shadow:var(--sh-sm);
}
@media(max-width:768px){
  .i-menu-btn { display:flex; }
  .i-sb { display:none; }
}

/* ━━━━━━━━━━ MAIN / CONTENT ━━━━━━━━━━ */
.i-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; position:relative; z-index:1; }
.i-content { flex:1; overflow-y:auto; padding:24px; }
.i-content::-webkit-scrollbar { width:4px; }
.i-content::-webkit-scrollbar-thumb { background:var(--b-light); border-radius:4px; }

/* ━━━━━━━━━━ DASHBOARD ━━━━━━━━━━ */
.i-dash-hero {
  display:flex; align-items:flex-end; justify-content:space-between;
  margin-bottom:20px; flex-wrap:wrap; gap:14px;
}
.i-dash-h1 {
  font-family:var(--font-h); font-size:26px; font-weight:800; color:var(--ink);
  letter-spacing:-0.7px; line-height:1.1;
}
.i-dash-h1 span {
  background:var(--gv); -webkit-background-clip:text; -webkit-text-fill-color:transparent;
}
.i-dash-sub { font-size:13px; color:var(--ink3); margin-top:5px; }

.i-date-chip {
  display:flex; align-items:center; gap:7px;
  background:rgba(255,255,255,0.70); border:1px solid var(--b-light);
  border-radius:var(--r-sm); padding:8px 14px;
  font-size:12.5px; color:var(--ink2); font-weight:500;
}

/* FILTER TABS */
.i-tabs {
  display:flex; gap:3px;
  background:rgba(255,255,255,0.62); border:1px solid var(--b-light);
  border-radius:50px; padding:3px;
}
.i-tab {
  padding:6px 18px; border-radius:50px; border:none; background:none;
  font-family:var(--font); font-size:12px; font-weight:600;
  color:var(--ink3); cursor:pointer; transition:all 0.2s var(--ease);
}
.i-tab.on {
  background:var(--gv); color:#fff;
  box-shadow:0 4px 16px rgba(108,63,255,0.40);
}

/* ALERT */
.i-alert {
  display:flex; align-items:center; gap:10px;
  background:linear-gradient(135deg, rgba(255,59,130,0.08), rgba(255,123,44,0.06));
  border:1px solid rgba(255,59,130,0.18);
  border-radius:var(--r-sm); padding:10px 16px;
  margin-bottom:18px; font-size:13px; color:#8a1438; font-weight:500;
}

/* ━━━━━━━━━━ KPI GRID ━━━━━━━━━━ */
.i-kpi-grid {
  display:grid; grid-template-columns:repeat(4,1fr);
  gap:14px; margin-bottom:18px;
}
@media(max-width:1100px){.i-kpi-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px) {.i-kpi-grid{grid-template-columns:1fr}}

.i-kpi {
  border-radius:var(--r-lg); padding:20px;
  position:relative; overflow:hidden;
  border:1px solid rgba(255,255,255,0.80);
  animation:cardUp 0.5s cubic-bezier(0.22,0.61,0.36,1) both;
  cursor:pointer; transition:transform 0.22s, box-shadow 0.22s;
}
.i-kpi:hover { transform:translateY(-5px); }
.i-kpi:nth-child(1){animation-delay:.05s}
.i-kpi:nth-child(2){animation-delay:.10s}
.i-kpi:nth-child(3){animation-delay:.15s}
.i-kpi:nth-child(4){animation-delay:.20s}
@keyframes cardUp { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }

/* KPI color variants */
.kpi-violet {
  background:linear-gradient(145deg, rgba(108,63,255,0.11), rgba(192,64,255,0.07));
  box-shadow:0 6px 28px rgba(108,63,255,0.12), inset 0 1px 0 rgba(255,255,255,0.80);
}
.kpi-rose {
  background:linear-gradient(145deg, rgba(255,59,130,0.11), rgba(255,123,44,0.07));
  box-shadow:0 6px 28px rgba(255,59,130,0.12), inset 0 1px 0 rgba(255,255,255,0.80);
}
.kpi-teal {
  background:linear-gradient(145deg, rgba(0,212,170,0.11), rgba(0,163,224,0.07));
  box-shadow:0 6px 28px rgba(0,212,170,0.12), inset 0 1px 0 rgba(255,255,255,0.80);
}
.kpi-blue {
  background:linear-gradient(145deg, rgba(37,99,235,0.11), rgba(124,58,237,0.07));
  box-shadow:0 6px 28px rgba(37,99,235,0.12), inset 0 1px 0 rgba(255,255,255,0.80);
}

/* accent top line per KPI */
.i-kpi::before {
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  border-radius:var(--r-lg) var(--r-lg) 0 0;
}
.kpi-violet::before { background:var(--gv); }
.kpi-rose::before   { background:var(--ge); }
.kpi-teal::before   { background:var(--gt); }
.kpi-blue::before   { background:var(--gb); }

/* orb glow */
.i-kpi-orb {
  position:absolute; top:-45px; right:-45px;
  width:130px; height:130px; border-radius:50%;
  filter:blur(34px); opacity:0.45; pointer-events:none;
  animation:orbFloat 6s ease-in-out infinite;
}
@keyframes orbFloat { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-8px,8px) scale(1.1)} }

.i-kpi-top  { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:14px; }
.i-kpi-ico  {
  width:42px; height:42px; border-radius:13px;
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 4px 16px rgba(0,0,0,0.10);
}
.kpi-violet .i-kpi-ico { background:var(--gv); }
.kpi-rose   .i-kpi-ico { background:var(--ge); }
.kpi-teal   .i-kpi-ico { background:var(--gt); }
.kpi-blue   .i-kpi-ico { background:var(--gb); }
.i-kpi-ico svg { width:20px; height:20px; color:#fff; }

.i-kpi-tag {
  font-size:11px; font-weight:700; padding:4px 9px; border-radius:20px;
  display:flex; align-items:center; gap:3px;
}
.i-kpi-tag.up   { background:rgba(0,212,170,0.14); color:#00917a; }
.i-kpi-tag.down { background:rgba(255,59,130,0.12); color:#cc2060; }
.i-kpi-tag.neu  { background:rgba(108,63,255,0.12); color:#5929d9; }

.i-kpi-val {
  font-family:var(--font-h); font-size:30px; font-weight:800; color:var(--ink);
  letter-spacing:-1px; line-height:1;
}
.i-kpi-val.loading {
  font-size:14px; font-weight:600; color:var(--ink4);
  background:linear-gradient(90deg,rgba(108,63,255,0.08) 25%,rgba(108,63,255,0.18) 50%,rgba(108,63,255,0.08) 75%);
  background-size:200%;
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  animation:shimmer 1.5s infinite;
}
@keyframes shimmer{from{background-position:200% 0}to{background-position:-200% 0}}
.i-kpi-lbl { font-size:12px; color:var(--ink3); margin-top:5px; font-weight:500; }

/* Sparkline */
.i-sparkline {
  display:flex; align-items:flex-end; gap:2px; height:22px; margin-top:12px;
}
.i-spark-bar {
  flex:1; border-radius:2px; min-height:3px; opacity:0.45;
  transition:opacity 0.2s;
}
.i-kpi:hover .i-spark-bar { opacity:0.80; }
.kpi-violet .i-spark-bar { background:var(--v1); }
.kpi-rose   .i-spark-bar { background:var(--e1); }
.kpi-teal   .i-spark-bar { background:var(--t1); }
.kpi-blue   .i-spark-bar { background:var(--b1); }

/* ━━━━━━━━━━ CHARTS GRID ━━━━━━━━━━ */
.i-charts {
  display:grid; grid-template-columns:1.6fr 1fr;
  gap:14px; margin-bottom:14px;
}
@media(max-width:900px){.i-charts{grid-template-columns:1fr}}

.i-charts-2 {
  display:grid; grid-template-columns:repeat(3,1fr); gap:14px;
}
@media(max-width:900px){.i-charts-2{grid-template-columns:1fr}}

/* GLASS CARD */
.i-card {
  background:rgba(255,255,255,0.72);
  backdrop-filter:blur(20px) saturate(180%);
  -webkit-backdrop-filter:blur(20px) saturate(180%);
  border:1px solid rgba(255,255,255,0.80);
  border-radius:var(--r-lg); padding:20px;
  position:relative; overflow:hidden;
  box-shadow:var(--sh-card);
  animation:cardUp 0.5s cubic-bezier(0.22,0.61,0.36,1) 0.25s both;
  transition:box-shadow 0.22s;
}
.i-card:hover { box-shadow:0 8px 40px rgba(108,63,255,0.14); }
.i-card.full  { grid-column:1 / -1; }

/* card accent line */
.i-card::before {
  content:''; position:absolute; top:0; left:0; right:0; height:2.5px;
  border-radius:var(--r-lg) var(--r-lg) 0 0;
}
.i-card.violet::before { background:var(--gv); }
.i-card.rose::before   { background:var(--ge); }
.i-card.teal::before   { background:var(--gt); }
.i-card.blue::before   { background:var(--gb); }

.i-card-hd {
  display:flex; align-items:flex-start; justify-content:space-between;
  margin-bottom:16px; flex-wrap:wrap; gap:8px;
}
.i-card-title { font-family:var(--font-h); font-size:14.5px; font-weight:700; color:var(--ink); }
.i-card-sub   { font-size:11.5px; color:var(--ink3); margin-top:2px; }
.i-badge {
  font-size:11px; font-weight:600; padding:4px 12px; border-radius:20px;
  background:rgba(108,63,255,0.10); color:var(--v1);
  border:1px solid rgba(108,63,255,0.16);
}
.i-legend   { display:flex; gap:12px; flex-wrap:wrap; }
.i-leg      { display:flex; align-items:center; gap:5px; font-size:11.5px; color:var(--ink2); font-weight:500; }
.i-leg-dot  { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

/* Chart canvas wrappers */
.i-chart-wrap         { position:relative; }
.i-chart-wrap.h240    { height:240px; }
.i-chart-wrap.h190    { height:190px; }
.i-chart-wrap.h160    { height:160px; }

/* DONUT */
.i-donut-box { position:relative; height:180px; display:flex; align-items:center; justify-content:center; }
.i-donut-mid { position:absolute; text-align:center; pointer-events:none; }
.i-donut-num { font-family:var(--font-h); font-size:28px; font-weight:800; color:var(--ink); line-height:1; }
.i-donut-lbl { font-size:11px; color:var(--ink3); margin-top:3px; font-weight:500; }

/* STATUS ROWS */
.i-stat-rows { display:flex; flex-direction:column; gap:9px; margin-top:14px; }
.i-stat-row  { display:flex; align-items:center; gap:8px; }
.i-sw { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
.i-sn { flex:1; font-size:12.5px; color:var(--ink2); font-weight:500; }
.i-sv { font-size:13px; font-weight:700; color:var(--ink); }
.i-sp { font-size:11px; color:var(--ink3); min-width:36px; text-align:right; }
.i-prog { height:3px; background:rgba(108,63,255,0.07); border-radius:3px; overflow:hidden; margin-top:3px; }
.i-prog-fill { height:100%; border-radius:3px; transition:width 1.4s cubic-bezier(0.22,0.61,0.36,1); }

/* ACTIVITY LIST */
.i-activity { display:flex; flex-direction:column; gap:1px; }
.i-act-row {
  display:flex; align-items:center; gap:11px;
  padding:10px 0; border-bottom:1px solid rgba(108,63,255,0.06);
  transition:all 0.15s; cursor:pointer; border-radius:8px;
}
.i-act-row:last-child { border-bottom:none; }
.i-act-row:hover { background:rgba(108,63,255,0.04); padding-left:8px; padding-right:8px; margin-left:-8px; margin-right:-8px; }
.i-act-ico {
  width:34px; height:34px; border-radius:10px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
}
.i-act-ico svg { width:15px; height:15px; }
.i-act-details { flex:1; min-width:0; }
.i-act-lbl  { font-size:13px; font-weight:600; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.i-act-time { font-size:11px; color:var(--ink4); margin-top:2px; }
.i-act-badge { font-size:10px; font-weight:700; padding:3px 9px; border-radius:20px; flex-shrink:0; }
.badge-ok   { background:rgba(0,212,170,0.12); color:#00917a; }
.badge-pend { background:rgba(245,197,24,0.15); color:#9e7400; }
.badge-err  { background:rgba(255,59,130,0.10); color:#cc2060; }

/* ━━━━━━━━━━ MOBILE SIDEBAR ━━━━━━━━━━ */
.i-mob-overlay {
  position:fixed; inset:0; background:rgba(50,30,100,0.28);
  backdrop-filter:blur(6px); z-index:80; animation:fIn 0.2s ease;
}
@keyframes fIn{from{opacity:0}to{opacity:1}}
.i-mob-sb {
  position:fixed; top:0; left:0; bottom:0; width:280px;
  background:rgba(255,255,255,0.96);
  backdrop-filter:blur(28px);
  border-right:1px solid var(--b-med);
  z-index:90; display:flex; flex-direction:column;
  transform:translateX(-100%); transition:transform 0.3s var(--ease);
  box-shadow:6px 0 40px rgba(108,63,255,0.16);
}
.i-mob-sb.open { transform:translateX(0); }
.i-mob-hd {
  display:flex; align-items:center; justify-content:space-between;
  padding:18px 15px; border-bottom:1px solid var(--b-light);
}
.i-mob-close {
  width:32px; height:32px; border-radius:9px;
  background:rgba(108,63,255,0.07); border:1px solid var(--b-light);
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; color:var(--ink2); transition:all 0.15s;
}
.i-mob-close:hover { background:rgba(108,63,255,0.13); color:var(--v1); }
.i-mob-body { flex:1; overflow-y:auto; padding:10px 9px; }
.i-mob-foot { padding:10px 9px; border-top:1px solid var(--b-light); }

/* ━━━━━━━━━━ LOADING ━━━━━━━━━━ */
.i-loading {
  position:fixed; inset:0;
  background:var(--gpage);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:26px;
}
.i-load-box {
  display:flex; align-items:center; gap:14px;
  animation:loadBob 2s ease-in-out infinite;
}
@keyframes loadBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.i-load-mark {
  width:52px; height:52px; border-radius:16px;
  background:var(--gv);
  display:flex; align-items:center; justify-content:center;
  font-family:var(--font-h); font-weight:800; font-size:22px; color:#fff;
  box-shadow:0 8px 32px rgba(108,63,255,0.48), 0 0 0 4px rgba(108,63,255,0.15);
}
.i-load-name {
  font-family:var(--font-h); font-size:26px; font-weight:800;
  background:var(--gv); -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  letter-spacing:-0.5px;
}
.i-load-track {
  width:180px; height:3px;
  background:rgba(108,63,255,0.12); border-radius:3px; overflow:hidden;
}
.i-load-bar {
  height:100%; background:var(--gv); border-radius:3px;
  animation:sweep 1.6s ease-in-out infinite;
}
@keyframes sweep{0%{width:0;margin-left:0}55%{width:65%}100%{width:0;margin-left:100%}}

/* ━━━━━━━━━━ PAGE TITLE (header) ━━━━━━━━━━ */
.i-page-title {
  font-family:var(--font-h); font-size:15px; font-weight:700; color:var(--ink);
}
`

/* ─── NAV STRUCTURE ─────────────────────────────────────────────────── */
const NAV_STRUCTURE = [
  {
    id:"gestion", label:"Principal", icon:"📊",
    color:"#6C3FFF", bg:"rgba(108,63,255,0.10)",
    items:[{ id:"dashboard", label:"Dashboard", icon:BarChart2 }],
  },
  {
    id:"personas", label:"Personas", icon:"👥",
    color:"#2563EB", bg:"rgba(37,99,235,0.10)",
    items:[
      { id:"usuarios",  label:"Usuarios",  icon:User   },
      { id:"roles",     label:"Roles",     icon:Shield },
      { id:"clientes",  label:"Clientes",  icon:Users  },
    ],
  },
  {
    id:"propiedad", label:"Propiedad", icon:"🏢",
    color:"#FF7B2C", bg:"rgba(255,123,44,0.10)",
    items:[
      { id:"apartamentos",    label:"Apartamentos",     icon:Building },
      { id:"tipoApartamento", label:"Tipo Apartamento", icon:Home     },
      { id:"mobiliarios",     label:"Mobiliarios",      icon:Sofa     },
    ],
  },
  {
    id:"operacion", label:"Operación", icon:"⚙️",
    color:"#FF3B82", bg:"rgba(255,59,130,0.10)",
    items:[
      { id:"reservas",  label:"Reservas",  icon:Calendar },
      { id:"hospedaje", label:"Hospedaje", icon:Hotel    },
    ],
  },
  {
    id:"financiero", label:"Financiero", icon:"💰",
    color:"#00D4AA", bg:"rgba(0,212,170,0.10)",
    items:[
      { id:"pagos",      label:"Pagos",      icon:CreditCard },
      { id:"descuentos", label:"Descuentos", icon:Percent    },
    ],
  },
]

const MODULE_LABELS = {
  dashboard:"Dashboard", usuarios:"Usuarios", roles:"Roles", clientes:"Clientes",
  apartamentos:"Apartamentos", tipoApartamento:"Tipo Apartamento", mobiliarios:"Mobiliarios",
  reservas:"Reservas", pagos:"Pagos", descuentos:"Descuentos", hospedaje:"Hospedaje", profile:"Mi Perfil",
}

/* ─── SPARKLINE DATA ───────────────────────────────────────────────── */
const SPARK_DATA = {
  reservas:     [55,62,48,70,65,80,74,88,72,90,85,100],
  ingresos:     [40,55,50,72,68,80,77,85,90,88,92,100],
  apartamentos: [30,45,55,40,60,58,65,50,70,66,72,80],
  clientes:     [60,65,70,68,75,80,78,85,82,88,92,100],
}

/* ─── COMPONENT ──────────────────────────────────────────────────────── */
const Dashboard = () => {
  const history  = useHistory()
  const location = useLocation()

  const [userRole,        setUserRole]        = useState("")
  const [userName,        setUserName]        = useState("")
  const [userPermissions, setUserPermissions] = useState([])
  const [isAdmin,         setIsAdmin]         = useState(false)

  const reservasChartRef     = useRef(null)
  const apartamentosChartRef = useRef(null)
  const pagosChartRef        = useRef(null)
  const topAptsChartRef      = useRef(null)
  const chartInstances       = useRef({})

  const [selectedModule, setSelectedModule] = useState(
    () => localStorage.getItem("moduloDashboard") || "dashboard"
  )
  const [timeFilter,       setTimeFilter]       = useState("month")
  const [data,             setData]             = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [open,             setOpen]             = useState(true)
  const [openGroups,       setOpenGroups]       = useState(
    () => NAV_STRUCTURE.reduce((a,g)=>({...a,[g.id]:true}),{})
  )
  const [kpis, setKpis] = useState({
    reservas:null, ingresos:null, apartamentos:null, clientes:null
  })

  /* nav guard */
  useEffect(()=>{
    const cp = history.location.pathname
    const hp = ()=>{ if(localStorage.getItem("token")) history.push(cp) }
    window.addEventListener("popstate",hp)
    history.replace(cp)
    return()=>window.removeEventListener("popstate",hp)
  },[history])

  /* decode JWT */
  useEffect(()=>{
    let m=true
    const token=localStorage.getItem("token")
    if(token){
      try{
        const d=jwtDecode(token)
        if(m){
          const role=d?.usuario?.rol||""; const permisos=d?.usuario?.permisos||[]; const name=d?.usuario?.nombre||"Usuario"
          localStorage.setItem("role",role)
          setUserRole(role.toLowerCase()); setUserName(name)
          setUserPermissions(permisos)
          setIsAdmin(role.toLowerCase()==="administrador"||role.toLowerCase()==="admin")
        }
      }catch(e){
        if(m) Swal.fire({title:"Error de autenticación",text:"Por favor, inicia sesión nuevamente.",icon:"error",confirmButtonColor:"#6C3FFF"}).then(()=>history.push("/login"))
      }
    } else {
      Swal.fire({title:"Sesión no iniciada",text:"Debes iniciar sesión para acceder",icon:"warning",confirmButtonColor:"#6C3FFF"}).then(()=>history.push("/login"))
    }
    return()=>{m=false}
  },[history])

  const allModules = ["dashboard","usuarios","roles","clientes","apartamentos","tipoApartamento","mobiliarios","reservas","pagos","descuentos","hospedaje","profile"]

  const hasModulePermission = (mod, action="leer")=>{
    if(mod==="profile") return true
    if(isAdmin) return true
    if(userPermissions.length>0&&typeof userPermissions[0]==="string") return userPermissions.includes(mod)
    const mp=userPermissions.find(p=>p.modulo===mod)
    if(!mp) return false
    return mp.acciones && mp.acciones[action]
  }

  const visibleModules = allModules.filter(m=>m!=="profile"&&(isAdmin||hasModulePermission(m,"leer")))

  useEffect(()=>{ if(selectedModule) localStorage.setItem("moduloDashboard",selectedModule) },[selectedModule])
  const toggleGroup = (id)=>setOpenGroups(p=>({...p,[id]:!p[id]}))

  /* ── Chart.js shared config ── */
  const getTooltipStyle = () => ({
    backgroundColor:"rgba(255,255,255,0.97)",
    titleColor:"#0C0A14", bodyColor:"#2D2640",
    borderColor:"rgba(108,63,255,0.18)", borderWidth:1,
    padding:12, cornerRadius:12, usePointStyle:true,
  })
  const gridColor = "rgba(108,63,255,0.06)"
  const tickColor = "#6B5E87"

  /* ── render charts ── */
  const renderCharts = (filter) => {
    Object.values(chartInstances.current).forEach(c=>c?.destroy())
    chartInstances.current = {}

    /* — Reservas line chart — */
    if(reservasChartRef.current){
      const ctx = reservasChartRef.current.getContext("2d")
      const g1 = ctx.createLinearGradient(0,0,0,240)
      g1.addColorStop(0,"rgba(108,63,255,0.28)"); g1.addColorStop(1,"rgba(108,63,255,0)")
      const g2 = ctx.createLinearGradient(0,0,0,240)
      g2.addColorStop(0,"rgba(0,212,170,0.22)"); g2.addColorStop(1,"rgba(0,212,170,0)")

      let labels, rd, dd
      if(filter==="day"){
        labels=["00h","04h","08h","12h","16h","20h","24h"]
        rd=[2,1,5,8,6,9,3]; dd=[5,5,10,15,10,20,5]
      } else if(filter==="month"){
        labels=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
        rd=[12,19,15,25,22,30,35,38,28,25,30,35]; dd=[5,10,15,5,10,20,15,10,5,15,10,5]
      } else {
        labels=["2020","2021","2022","2023","2024"]
        rd=[150,220,280,310,350]; dd=[8,12,10,15,18]
      }

      chartInstances.current.reservas = new Chart(ctx, {
        type:"line",
        data:{ labels, datasets:[
          { label:"Reservas", data:rd, backgroundColor:g1, borderColor:"#6C3FFF",
            borderWidth:2.5, tension:0.44, fill:true,
            pointBackgroundColor:"#6C3FFF", pointBorderColor:"#fff",
            pointBorderWidth:2, pointRadius:4, pointHoverRadius:7, yAxisID:"y" },
          { label:"Descuentos %", data:dd, backgroundColor:g2, borderColor:"#00D4AA",
            borderWidth:2.5, tension:0.44, fill:true,
            pointBackgroundColor:"#00D4AA", pointBorderColor:"#fff",
            pointBorderWidth:2, pointRadius:4, pointHoverRadius:7, yAxisID:"y1" },
        ]},
        options:{
          responsive:true, maintainAspectRatio:false,
          interaction:{ mode:"index", intersect:false },
          plugins:{ legend:{ display:false }, tooltip:{ ...getTooltipStyle(),
            callbacks:{ label:(c)=>`${c.dataset.label}: ${c.dataset.yAxisID==="y1"?c.parsed.y+"%":c.parsed.y}` }
          }},
          scales:{
            y:{ beginAtZero:true, grid:{ color:gridColor, drawBorder:false },
                ticks:{ color:tickColor, font:{ size:11 }, padding:8 }, border:{ display:false } },
            y1:{ type:"linear", position:"right", beginAtZero:true, max:filter==="year"?30:35,
                 grid:{ drawOnChartArea:false },
                 ticks:{ color:tickColor, callback:v=>v+"%", font:{ size:11 }, padding:8 }, border:{ display:false } },
            x:{ grid:{ display:false }, ticks:{ color:tickColor, font:{ size:11 }, padding:8 }, border:{ display:false } },
          },
          animation:{ duration:1400, easing:"easeOutCubic" },
        },
      })
    }

    /* — Donut chart — */
    if(apartamentosChartRef.current){
      const ctx = apartamentosChartRef.current.getContext("2d")
      const aptArr = data?.apartamentos&&Array.isArray(data.apartamentos)?data.apartamentos:[]
      const disp = aptArr.length ? aptArr.filter(a=>a.estado==="disponible").length : 15
      const ocup = aptArr.length ? aptArr.filter(a=>a.estado==="ocupado").length    : 8
      const mant = aptArr.length ? aptArr.filter(a=>a.estado==="mantenimiento").length : 3

      chartInstances.current.apartamentos = new Chart(ctx, {
        type:"doughnut",
        data:{ labels:["Disponibles","Ocupados","Mantenimiento"],
          datasets:[{ data:[disp,ocup,mant],
            backgroundColor:["#00D4AA","#6C3FFF","#FF7B2C"],
            borderColor:"#ffffff", borderWidth:5, hoverOffset:12 }]
        },
        options:{
          responsive:true, maintainAspectRatio:false, cutout:"76%",
          plugins:{ legend:{ display:false }, tooltip:{ ...getTooltipStyle(),
            callbacks:{ label:(c)=>{ const t=c.dataset.data.reduce((a,b)=>a+b,0); return `${c.label}: ${c.parsed} (${Math.round(c.parsed/t*100)}%)` }}
          }},
          animation:{ animateRotate:true, animateScale:true, duration:1800, easing:"easeOutCubic" },
        },
      })
    }

    /* — Ingresos bar chart — */
    if(pagosChartRef.current){
      const ctx = pagosChartRef.current.getContext("2d")
      let labels, pd
      if(filter==="day"){
        labels=["00h","04h","08h","12h","16h","20h","24h"]
        pd=[500,800,2500,3800,2200,4500,1800]
      } else if(filter==="month"){
        labels=["Ene","Feb","Mar","Abr","May","Jun"]
        pd=[12500,15000,18000,16500,21000,22500]
      } else {
        labels=["2020","2021","2022","2023","2024"]
        pd=[120000,150000,180000,210000,250000]
      }

      const palette = ["#6C3FFF","#FF3B82","#00D4AA","#2563EB","#FF7B2C","#F5C518"]
      const barGrads = pd.map((_,i) => {
        const g = ctx.createLinearGradient(0,0,0,200)
        const c = palette[i % palette.length]
        g.addColorStop(0, c); g.addColorStop(1, c+"55")
        return g
      })

      chartInstances.current.pagos = new Chart(ctx, {
        type:"bar",
        data:{ labels, datasets:[{ label:"Ingresos", data:pd,
          backgroundColor:barGrads, borderRadius:10, borderSkipped:false,
          barPercentage:0.62, categoryPercentage:0.72 }]
        },
        options:{
          responsive:true, maintainAspectRatio:false,
          plugins:{ legend:{ display:false }, tooltip:{ ...getTooltipStyle(),
            callbacks:{ label:(c)=>`$${c.parsed.y.toLocaleString("es-CO",{minimumFractionDigits:0})}` }
          }},
          scales:{
            y:{ beginAtZero:true, grid:{ color:gridColor, drawBorder:false },
                ticks:{ color:tickColor, callback:v=>"$"+Intl.NumberFormat("es-CO",{notation:"compact"}).format(v), font:{ size:11 }, padding:8 },
                title:{ display:true, text:"Monto ($)", color:tickColor, font:{ weight:"600", size:10 } },
                border:{ display:false } },
            x:{ grid:{ display:false }, ticks:{ color:tickColor, font:{ size:11 }, padding:8 }, border:{ display:false } },
          },
          animation:{ duration:1400, easing:"easeOutQuart" },
        },
      })
    }

    /* — Top Apartamentos horizontal bar — */
    if(topAptsChartRef.current){
      const ctx = topAptsChartRef.current.getContext("2d")
      const hPalette = ["#6C3FFF","#FF3B82","#00D4AA","#2563EB","#FF7B2C"]
      const hGrads = hPalette.map(c => {
        const g = ctx.createLinearGradient(300,0,0,0)
        g.addColorStop(0, c); g.addColorStop(1, c+"44")
        return g
      })

      chartInstances.current.topApts = new Chart(ctx, {
        type:"bar",
        data:{
          labels:["Apto. 8B","Apto. 3A","Apto. 12C","Apto. 5D","Apto. 1A"],
          datasets:[{ label:"Reservas", data:[24,19,17,14,11],
            backgroundColor:hGrads, borderRadius:6, borderSkipped:false,
            barPercentage:0.68, categoryPercentage:0.78 }]
        },
        options:{
          indexAxis:"y",
          responsive:true, maintainAspectRatio:false,
          plugins:{ legend:{ display:false }, tooltip:{ ...getTooltipStyle() }},
          scales:{
            x:{ beginAtZero:true, grid:{ color:gridColor, drawBorder:false }, border:{ display:false }, ticks:{ color:tickColor, font:{ size:11 }, padding:8 } },
            y:{ grid:{ display:false }, border:{ display:false }, ticks:{ color:tickColor, font:{ size:11, weight:"600" }, padding:8 } },
          },
          animation:{ duration:1400 },
        },
      })
    }
  }

  useEffect(()=>{
    if(selectedModule==="dashboard"&&hasModulePermission("dashboard","leer")) renderCharts(timeFilter)
    return()=>Object.values(chartInstances.current).forEach(c=>c?.destroy())
  },[selectedModule,isAdmin,data,timeFilter])

  /* ── fetch ── */
  const fetchModuleData = async(mod)=>{
    if(!hasModulePermission(mod,"leer")) return { error:"Sin permiso" }
    const token = localStorage.getItem("token")
    try{
      const r = await axios.get(`http://localhost:5000/api/${mod}`,{ headers:{ Authorization:`Bearer ${token}` }})
      return r.data
    }catch(e){
      Swal.fire({ title:"Error de carga", text:`No se pudieron cargar los datos de ${mod}`, icon:"error", confirmButtonColor:"#6C3FFF" })
      return { error:e.response?.data||"Error al cargar datos" }
    }
  }

  const fetchAllModulesData = async()=>{
    if(!isAdmin) return { error:"Sin permiso" }
    const token = localStorage.getItem("token"); const dd={}
    try{
      await Promise.all(["reservas","apartamentos","pagos"].map(async mod=>{
        try{ const r=await axios.get(`http://localhost:5000/api/${mod}`,{ headers:{ Authorization:`Bearer ${token}` }}); dd[mod]=r.data }
        catch(e){ dd[mod]={ error:e.response?.data||"Error" } }
      }))
      setData(dd)
      const resArr=Array.isArray(dd.reservas)?dd.reservas:[]
      const aptArr=Array.isArray(dd.apartamentos)?dd.apartamentos:[]
      const pagArr=Array.isArray(dd.pagos)?dd.pagos:[]
      const resAct=resArr.filter(r=>r.estado==="activa"||r.estado==="confirmada").length
      const aptOc=aptArr.filter(a=>a.estado==="ocupado").length
      const aptTo=aptArr.length
      const now=new Date(); const mo=now.getMonth(); const yr=now.getFullYear()
      const ing=pagArr.filter(p=>{ const d=new Date(p.fecha||p.createdAt); return d.getMonth()===mo&&d.getFullYear()===yr })
        .reduce((s,p)=>s+(parseFloat(p.monto)||0),0)
      setKpis(pv=>({...pv,
        reservas:    resAct||"—",
        ingresos:    ing?"$"+Intl.NumberFormat("es-CO",{notation:"compact"}).format(ing):"—",
        apartamentos:aptTo?`${aptOc}/${aptTo}`:"—",
      }))
      try{ const rc=await axios.get("http://localhost:5000/api/clientes",{ headers:{ Authorization:`Bearer ${token}` }}); setKpis(pv=>({...pv,clientes:Array.isArray(rc.data)?rc.data.length:"—"})) }catch(_){}
    }catch(e){
      Swal.fire({ title:"Error de carga", text:"No se pudieron cargar los datos del dashboard", icon:"error", confirmButtonColor:"#6C3FFF" })
      setData({ error:"Error al cargar datos" })
    }
  }

  const fetchData = async(mod)=>{
    if(!hasModulePermission(mod,"leer")){ setData({ error:"Sin permiso" }); return }
    if(mod==="dashboard") await fetchAllModulesData()
    else { const d=await fetchModuleData(mod); setData(d) }
  }

  const handleModuleClick = (mod)=>{
    if(!hasModulePermission(mod,"leer")) return
    setSelectedModule(mod); fetchData(mod); setIsMobileMenuOpen(false)
  }

  useEffect(()=>{
    let m=true
    const load=async()=>{
      if(userRole&&selectedModule&&selectedModule!=="no-access"&&selectedModule!=="profile"){
        if(hasModulePermission(selectedModule,"leer")){
          if(selectedModule==="dashboard") await fetchAllModulesData()
          else { try{ const d=await fetchModuleData(selectedModule); if(m)setData(d) }catch(e){ if(m)setData({ error:"Error" }) } }
        } else { if(m)setData({ error:"Sin permiso" }) }
      }
    }
    load(); return()=>{ m=false }
  },[userRole,selectedModule])

  const handleLogout = ()=>{
    Swal.fire({ title:"¿Cerrar sesión?", text:"¿Estás seguro que deseas salir?", icon:"question",
      showCancelButton:true, confirmButtonColor:"#6C3FFF", cancelButtonColor:"#6B5E87",
      confirmButtonText:"Sí, cerrar sesión", cancelButtonText:"Cancelar" })
      .then(r=>{
        if(r.isConfirmed){
          localStorage.removeItem("token"); localStorage.removeItem("role"); history.push("/")
          Swal.fire({ title:"¡Hasta pronto!", text:"Has cerrado sesión correctamente", icon:"success", confirmButtonColor:"#6C3FFF", timer:2000, timerProgressBar:true, showConfirmButton:false })
        }
      })
  }

  const toggleProfileModal = ()=>setShowProfileModal(!showProfileModal)
  const goToProfile = ()=>{ setSelectedModule("profile"); setShowProfileModal(false) }

  /* loading */
  if(!userRole) return(
    <div style={{ height:"100vh", background:"var(--gpage)" }}>
      <style>{CSS}</style>
      <div className="i-loading">
        <div className="i-load-box">
          <div className="i-load-mark">R</div>
          <div className="i-load-name">Reservsoft</div>
        </div>
        <div className="i-load-track"><div className="i-load-bar"/></div>
      </div>
    </div>
  )

  /* apt totals for donut */
  const aptArr  = data?.apartamentos&&Array.isArray(data.apartamentos)?data.apartamentos:[]
  const aptDisp = aptArr.length ? aptArr.filter(a=>a.estado==="disponible").length   : 15
  const aptOcup = aptArr.length ? aptArr.filter(a=>a.estado==="ocupado").length      : 8
  const aptMant = aptArr.length ? aptArr.filter(a=>a.estado==="mantenimiento").length: 3
  const aptTotal= aptArr.length || 26

  /* Sparkline builder helper */
  const Sparkline = ({ sparkKey, className }) => {
    const vals = SPARK_DATA[sparkKey] || []
    const max  = Math.max(...vals)
    return (
      <div className="i-sparkline">
        {vals.map((v,i)=>(
          <div key={i} className="i-spark-bar" style={{ height:`${Math.round(v/max*100)}%` }}/>
        ))}
      </div>
    )
  }

  /* KPI config */
  const kpiCards = [
    { label:"Reservas Activas",      val:kpis.reservas,      sparkKey:"reservas",     variant:"kpi-violet", ico:Calendar,   tag:"↑ 12%",   tagCls:"up"   },
    { label:"Ingresos del Mes",      val:kpis.ingresos,      sparkKey:"ingresos",     variant:"kpi-rose",   ico:TrendingUp, tag:"↑ 8.4%",  tagCls:"up"   },
    { label:"Aptos. Ocupados",       val:kpis.apartamentos,  sparkKey:"apartamentos", variant:"kpi-teal",   ico:Building,   tag:"→ Estable",tagCls:"neu"  },
    { label:"Clientes Registrados",  val:kpis.clientes,      sparkKey:"clientes",     variant:"kpi-blue",   ico:Users,      tag:"↑ 5 nuevos",tagCls:"up" },
  ]

  /* ─── DASHBOARD RENDER ─── */
  const renderDashboard = ()=>(
    <div>
      {/* Header row */}
      <div className="i-dash-hero">
        <div>
          <div className="i-dash-h1">Hola, <span>{userName||userRole}</span> 👋</div>
          <div className="i-dash-sub">Aquí tienes el resumen de tu negocio</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" }}>
          <div className="i-date-chip">
            <Calendar size={13}/>
            {new Date().toLocaleDateString("es-CO",{ weekday:"short", day:"numeric", month:"short", year:"numeric" })}
          </div>
          <div className="i-tabs">
            {[["day","Hoy"],["month","Mes"],["year","Año"]].map(([v,l])=>(
              <button key={v} className={`i-tab ${timeFilter===v?"on":""}`} onClick={()=>setTimeFilter(v)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Alert */}
      <div className="i-alert">
        <AlertCircle size={16}/> <strong>3 reservas</strong>&nbsp;pendientes de confirmación requieren tu atención
      </div>

      {/* KPI Grid */}
      <div className="i-kpi-grid">
        {kpiCards.map((k,i)=>{
          const Icon = k.ico
          return (
            <div className={`i-kpi ${k.variant}`} key={i}>
              <div className="i-kpi-orb" style={{ background: k.variant==="kpi-violet"?"#6C3FFF":k.variant==="kpi-rose"?"#FF3B82":k.variant==="kpi-teal"?"#00D4AA":"#2563EB" }}/>
              <div className="i-kpi-top">
                <div className="i-kpi-ico"><Icon size={20}/></div>
                <div className={`i-kpi-tag ${k.tagCls}`}>{k.tag}</div>
              </div>
              <div className={`i-kpi-val ${k.val==null?"loading":""}`}>
                {k.val!=null ? k.val : "Cargando…"}
              </div>
              <div className="i-kpi-lbl">{k.label}</div>
              <Sparkline sparkKey={k.sparkKey}/>
            </div>
          )
        })}
      </div>

      {/* Charts row 1 */}
      <div className="i-charts">
        {/* Reservas + Descuentos */}
        <div className="i-card violet">
          <div className="i-card-hd">
            <div>
              <div className="i-card-title">Reservas & Descuentos</div>
              <div className="i-card-sub">
                {timeFilter==="day"?"Distribución del día":timeFilter==="month"?"Últimos 12 meses":"Evolución 5 años"}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap" }}>
              <div className="i-legend">
                <div className="i-leg"><div className="i-leg-dot" style={{ background:"#6C3FFF" }}/> Reservas</div>
                <div className="i-leg"><div className="i-leg-dot" style={{ background:"#00D4AA" }}/> Descuentos %</div>
              </div>
              <div className="i-badge">{timeFilter==="day"?"Hoy":timeFilter==="month"?"12M":"5A"}</div>
            </div>
          </div>
          <div className="i-chart-wrap h240"><canvas ref={reservasChartRef}/></div>
        </div>

        {/* Donut */}
        <div className="i-card teal">
          <div className="i-card-hd">
            <div>
              <div className="i-card-title">Estado Apartamentos</div>
              <div className="i-card-sub">Distribución actual</div>
            </div>
            <div className="i-badge" style={{ background:"rgba(0,212,170,0.10)", color:"#007a62", borderColor:"rgba(0,212,170,0.20)" }}>● En vivo</div>
          </div>
          <div className="i-donut-box">
            <canvas ref={apartamentosChartRef} style={{ maxWidth:"170px", maxHeight:"170px" }}/>
            <div className="i-donut-mid">
              <div className="i-donut-num">{aptTotal}</div>
              <div className="i-donut-lbl">total</div>
            </div>
          </div>
          <div className="i-stat-rows">
            {[
              { c:"#00D4AA", grad:"linear-gradient(90deg,#00D4AA,#00A3E0)", n:"Disponibles",   v:aptDisp, pct:aptTotal?Math.round(aptDisp/aptTotal*100):0 },
              { c:"#6C3FFF", grad:"linear-gradient(90deg,#6C3FFF,#C040FF)", n:"Ocupados",      v:aptOcup, pct:aptTotal?Math.round(aptOcup/aptTotal*100):0 },
              { c:"#FF7B2C", grad:"linear-gradient(90deg,#FF7B2C,#F5C518)", n:"Mantenimiento", v:aptMant, pct:aptTotal?Math.round(aptMant/aptTotal*100):0 },
            ].map((s,i)=>(
              <div key={i}>
                <div className="i-stat-row">
                  <div className="i-sw" style={{ background:s.c }}/>
                  <div className="i-sn">{s.n}</div>
                  <div className="i-sv">{s.v}</div>
                  <div className="i-sp">{s.pct}%</div>
                </div>
                <div className="i-prog">
                  <div className="i-prog-fill" style={{ width:`${s.pct}%`, background:s.grad }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="i-charts-2">
        {/* Ingresos bar */}
        <div className="i-card rose">
          <div className="i-card-hd">
            <div>
              <div className="i-card-title">Ingresos</div>
              <div className="i-card-sub">
                {timeFilter==="day"?"Hoy":timeFilter==="month"?"Últimos 6 meses":"Últimos 5 años"}
              </div>
            </div>
            <div className="i-badge" style={{ background:"rgba(255,59,130,0.09)", color:"#cc2060", borderColor:"rgba(255,59,130,0.18)" }}>
              {timeFilter==="day"?"Hoy":timeFilter==="month"?"6M":"5A"}
            </div>
          </div>
          <div className="i-chart-wrap h190"><canvas ref={pagosChartRef}/></div>
        </div>

        {/* Top Apartamentos */}
        <div className="i-card blue">
          <div className="i-card-hd">
            <div>
              <div className="i-card-title">Top Apartamentos</div>
              <div className="i-card-sub">Por nº de reservas</div>
            </div>
          </div>
          <div className="i-chart-wrap h190"><canvas ref={topAptsChartRef}/></div>
        </div>

        {/* Actividad reciente */}
        <div className="i-card violet">
          <div className="i-card-hd">
            <div>
              <div className="i-card-title">Actividad Reciente</div>
              <div className="i-card-sub">Últimas transacciones</div>
            </div>
          </div>
          <div className="i-activity">
            {[
              { ico:<Home size={15}/>,      ibg:"rgba(0,212,170,0.12)",  lbl:"Reserva #1042 — Apto. 8B",   time:"Hace 12 min",  badge:"Pagado",     bc:"badge-ok"   },
              { ico:<Calendar size={15}/>,  ibg:"rgba(245,197,24,0.12)", lbl:"Reserva #1041 — Apto. 3A",   time:"Hace 1h",      badge:"Pendiente",  bc:"badge-pend" },
              { ico:<CreditCard size={15}/>,ibg:"rgba(37,99,235,0.10)",  lbl:"Pago $1,800,000",             time:"Hace 2h",      badge:"Confirmado", bc:"badge-ok"   },
              { ico:<AlertCircle size={15}/>,ibg:"rgba(255,59,130,0.10)",lbl:"Cancelación #1038",           time:"Hace 3h",      badge:"Cancelado",  bc:"badge-err"  },
              { ico:<User size={15}/>,      ibg:"rgba(108,63,255,0.10)", lbl:"Nuevo cliente: Carlos M.",    time:"Hace 4h",      badge:"Activo",     bc:"badge-ok"   },
            ].map((a,i)=>(
              <div className="i-act-row" key={i}>
                <div className="i-act-ico" style={{ background:a.ibg }}>{a.ico}</div>
                <div className="i-act-details">
                  <div className="i-act-lbl">{a.lbl}</div>
                  <div className="i-act-time">{a.time}</div>
                </div>
                <span className={`i-act-badge ${a.bc}`}>{a.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  /* ── MODULE CONTENT ── */
  const noAccess = <div className="i-alert"><AlertCircle size={16}/> No tienes permiso para acceder a este módulo.</div>

  const renderContent = ()=>{
    if(selectedModule==="profile")          return <UserProfile/>
    if(selectedModule==="dashboard")        return hasModulePermission("dashboard","leer") ? renderDashboard() : noAccess
    if(selectedModule==="usuarios")         return hasModulePermission("usuarios","leer")  ? <UsuariosList canCreate={hasModulePermission("usuarios","crear")} canUpdate={hasModulePermission("usuarios","actualizar")} canDelete={hasModulePermission("usuarios","eliminar")}/> : noAccess
    if(selectedModule==="roles")            return hasModulePermission("roles","leer")      ? <RolesList canCreate={hasModulePermission("roles","crear")} canUpdate={hasModulePermission("roles","actualizar")} canDelete={hasModulePermission("roles","eliminar")}/> : noAccess
    if(selectedModule==="descuentos")       return hasModulePermission("descuentos","leer") ? <DescuentosList canCreate={hasModulePermission("descuentos","crear")} canUpdate={hasModulePermission("descuentos","actualizar")} canDelete={hasModulePermission("descuentos","eliminar")}/> : noAccess
    if(selectedModule==="reservas")         return hasModulePermission("reservas","leer")   ? <ReservasList canCreate={hasModulePermission("reservas","crear")} canUpdate={hasModulePermission("reservas","actualizar")} canDelete={hasModulePermission("reservas","eliminar")}/> : noAccess
    if(selectedModule==="apartamentos")     return hasModulePermission("apartamentos","leer")? <ApartamentoList canCreate={hasModulePermission("apartamentos","crear")} canUpdate={hasModulePermission("apartamentos","actualizar")} canDelete={hasModulePermission("apartamentos","eliminar")}/> : noAccess
    if(selectedModule==="tipoApartamento")  return hasModulePermission("tipoApartamento","leer")? <TipoApartamentoList canCreate={hasModulePermission("tipoApartamento","crear")} canUpdate={hasModulePermission("tipoApartamento","actualizar")} canDelete={hasModulePermission("tipoApartamento","eliminar")} onModuleChange={setSelectedModule}/> : noAccess
    if(selectedModule==="mobiliarios")      return hasModulePermission("mobiliarios","leer") ? <MobiliarioList canCreate={hasModulePermission("mobiliarios","crear")} canUpdate={hasModulePermission("mobiliarios","actualizar")} canDelete={hasModulePermission("mobiliarios","eliminar")}/> : noAccess
    if(selectedModule==="hospedaje")        return hasModulePermission("hospedaje","leer")   ? <HospedajeList canCreate={hasModulePermission("hospedaje","crear")} canUpdate={hasModulePermission("hospedaje","actualizar")} canDelete={hasModulePermission("hospedaje","eliminar")}/> : noAccess
    if(selectedModule==="clientes")         return hasModulePermission("clientes","leer")    ? <ClienteList canCreate={hasModulePermission("clientes","crear")} canUpdate={hasModulePermission("clientes","actualizar")} canDelete={hasModulePermission("clientes","eliminar")}/> : noAccess
    if(selectedModule==="pagos")            return hasModulePermission("pagos","leer")       ? <PagosList canCreate={hasModulePermission("pagos","crear")} canUpdate={hasModulePermission("pagos","actualizar")} canDelete={hasModulePermission("pagos","eliminar")}/> : noAccess
    return(
      <Content selectedModule={selectedModule} data={data}
        modules={allModules.filter(m=>m!=="dashboard"&&m!=="profile")}
        onCreate={(mn,ni)=>{ if(!hasModulePermission(mn,"crear")){Swal.fire({title:"Acceso denegado",text:"No tienes permisos para crear",icon:"warning",confirmButtonColor:"#6C3FFF"});return} console.log("Crear",mn,ni) }}
        onUpdate={(mn,id,ui)=>{ if(!hasModulePermission(mn,"actualizar")){Swal.fire({title:"Acceso denegado",text:"No tienes permisos para actualizar",icon:"warning",confirmButtonColor:"#6C3FFF"});return} console.log("Update",mn,id,ui) }}
        onDelete={(mn,id)=>{ if(!hasModulePermission(mn,"eliminar")){Swal.fire({title:"Acceso denegado",text:"No tienes permisos para eliminar",icon:"warning",confirmButtonColor:"#6C3FFF"});return} console.log("Delete",mn,id) }}
        userPermissions={userPermissions} hasModulePermission={hasModulePermission}
      />
    )
  }

  /* ── NAV BUILDER ── */
  const buildNav = (mobile=false) => NAV_STRUCTURE.map(group=>{
    if(!group.items.some(i=>visibleModules.includes(i.id))) return null
    return(
      <div className="i-group" key={group.id}>
        <div className="i-group-hd" onClick={()=>!mobile&&toggleGroup(group.id)}>
          <div className="i-group-ico" style={{ background:group.bg }}>
            <span style={{ fontSize:"13px" }}>{group.icon}</span>
          </div>
          <span className="i-group-lbl" style={{ color:group.color }}>{group.label}</span>
          {!mobile&&(
            <ChevronRight size={11} className={`i-group-arr ${openGroups[group.id]?"open":""}`}/>
          )}
        </div>
        <div className={`i-subs ${mobile||openGroups[group.id]?"open":""}`}>
          {group.items.filter(i=>visibleModules.includes(i.id)).map(item=>{
            const Icon = item.icon
            return(
              <button key={item.id}
                className={`i-btn ${selectedModule===item.id?"on":""}`}
                onClick={()=>handleModuleClick(item.id)}
                data-label={item.label}>
                <span className="i-btn-ico"><Icon size={15}/></span>
                <span className="i-btn-txt">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  })

  return(
    <>
      <style>{CSS}</style>
      <div className="i-root">

        {/* SIDEBAR */}
        <aside className={`i-sb ${open?"":"col"}`}>
          <div className="i-brand">
            <div className="i-logo">R</div>
            <span className="i-brand-name">Reservsoft</span>
          </div>
          <button className="i-toggle" onClick={()=>setOpen(o=>!o)}>
            {open ? <ChevronLeft size={12}/> : <ChevronRight size={12}/>}
          </button>
          <div className="i-nav-scroll">{buildNav()}</div>
          <div className="i-sb-foot">
            <div className="i-user-pill" onClick={goToProfile}>
              <div className="i-av">{userName?.[0]?.toUpperCase()||"U"}</div>
              <div>
                <div className="i-uname">{userName||"Usuario"}</div>
                <div className="i-urole">{userRole}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MOBILE OVERLAY */}
        {isMobileMenuOpen&&<div className="i-mob-overlay" onClick={()=>setIsMobileMenuOpen(false)}/>}
        <div className={`i-mob-sb ${isMobileMenuOpen?"open":""}`}>
          <div className="i-mob-hd">
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <div className="i-logo" style={{ width:32, height:32, fontSize:14, borderRadius:10 }}>R</div>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:"var(--ink)" }}>Reservsoft</span>
            </div>
            <button className="i-mob-close" onClick={()=>setIsMobileMenuOpen(false)}><X size={14}/></button>
          </div>
          <div className="i-mob-body">{buildNav(true)}</div>
          <div className="i-mob-foot">
            <div className="i-user-pill" onClick={goToProfile}>
              <div className="i-av">{userName?.[0]?.toUpperCase()||"U"}</div>
              <div>
                <div className="i-uname">{userName||"Usuario"}</div>
                <div className="i-urole">{userRole}</div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="i-main">
          <header className="i-header">
            <div className="i-header-l">
              <button className="i-menu-btn" onClick={()=>setIsMobileMenuOpen(true)}><Menu size={18}/></button>
              <div className="i-breadcrumb">
                <span className="i-bc-home">Inicio</span>
                <span className="i-bc-sep">/</span>
                <span className="i-bc-cur">{MODULE_LABELS[selectedModule]}</span>
              </div>
            </div>
            <div className="i-header-r">
              <div className="i-search">
                <Search size={13} style={{ color:"var(--ink4)", flexShrink:0 }}/>
                <input placeholder="Buscar…"/>
                <span className="i-search-kbd">⌘K</span>
              </div>
              <button className="i-ico-btn">
                <Bell size={15}/>
                <div className="i-pip"/>
              </button>
              <div style={{ position:"relative" }}>
                <button className="i-prof-btn" onClick={toggleProfileModal}>
                  <div className="i-av" style={{ width:28, height:28, fontSize:11 }}>
                    {userName?.[0]?.toUpperCase()||"U"}
                  </div>
                  <span className="i-prof-name">{userRole}</span>
                  <ChevronDown size={12} className="i-chevron"/>
                </button>
                {showProfileModal&&(
                  <div className="i-drop">
                    <div className="i-drop-head">
                      <div className="i-drop-name">Hola, {userName||userRole}</div>
                      <div className="i-drop-role">{userRole}</div>
                    </div>
                    <div className="i-drop-body">
                      <button className="i-drop-item" onClick={goToProfile}><User size={14}/>Mi Perfil</button>
                      <div className="i-drop-div"/>
                      <button className="i-drop-item red" onClick={handleLogout}><LogOut size={14}/>Cerrar Sesión</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="i-content">
            {renderContent()}
          </main>
        </div>
      </div>
    </>
  )
}

export default Dashboard