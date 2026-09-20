import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Guest, PartyType, EnvelopeStatus } from '../types';
import { formatRupiah } from '../utils/formatters';
import { 
  BookOpen, 
  Mail, 
  FileSpreadsheet, 
  Clock, 
  Search, 
  Filter, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  Hourglass, 
  Eye, 
  Edit3, 
  Trash2,
  Gift,
  Plus,
  LayoutGrid,
  List,
  Users,
  Phone
} from 'lucide-react';

interface GuestTableSectionProps {
  guests: Guest[];
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
  onViewGuest: (guest: Guest) => void;
  onEditGuest: (guest: Guest) => void;
  onDeleteGuest: (guestId: string) => void;
  onOpenReceptionModal: () => void;
}

export const GuestTableSection: React.FC<GuestTableSectionProps> = ({
  guests,
  activeSubTab,
  setActiveSubTab,
  onViewGuest,
  onEditGuest,
  onDeleteGuest,
  onOpenReceptionModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [partyFilter, setPartyFilter] = useState<'all' | PartyType>('all');
  const [envelopeFilter, setEnvelopeFilter] = useState<'all' | EnvelopeStatus>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 12 : 8;

  // Filtered guests
  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchSearch =
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.phone && g.phone.includes(searchTerm)) ||
        (g.relation && g.relation.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (g.envelopeCode && g.envelopeCode.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchParty = partyFilter === 'all' || g.party === partyFilter;
      const matchEnvelope = envelopeFilter === 'all' || g.envelopeStatus === envelopeFilter;
      const matchSubTab = activeSubTab === 'amplop' ? g.hasEnvelope : true;

      return matchSearch && matchParty && matchEnvelope && matchSubTab;
    });
  }, [guests, searchTerm, partyFilter, envelopeFilter, activeSubTab]);

  const totalPages = Math.max(1, Math.ceil(filteredGuests.length / itemsPerPage));
  const validPage = Math.min(currentPage, totalPages);
  const paginatedGuests = filteredGuests.slice((validPage - 1) * itemsPerPage, validPage * itemsPerPage);

  const totalEnvelopes = guests.filter((g) => g.hasEnvelope).length;

  return (
    <section className="glass-panel rounded-2xl border border-white/80 shadow-md overflow-hidden" id="buku-tamu">
      {/* Tab Header Switcher */}
      <div className="border-b border-purple-100/70 px-4 md:px-6 pt-3 flex flex-wrap items-center justify-between gap-3 bg-white/40">
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => {
              setActiveSubTab('buku-tamu');
              setCurrentPage(1);
            }}
            type="button"
            className={`relative py-3 px-2 text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeSubTab === 'buku-tamu' || activeSubTab === 'semua'
                ? 'text-purple-950 font-bold'
                : 'text-gray-600 hover:text-purple-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-purple-700" />
            <span>Buku Tamu</span>
            <span className="px-2 py-0.5 bg-orange-100 text-orange-950 border border-orange-200/80 rounded-full text-xs font-bold">
              {guests.length}
            </span>
            {(activeSubTab === 'buku-tamu' || activeSubTab === 'semua') && (
              <motion.div
                layoutId="guestSubTabActiveIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-purple-600"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>

          <button
            onClick={() => {
              setActiveSubTab('amplop');
              setCurrentPage(1);
            }}
            type="button"
            className={`relative py-3 px-2 text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeSubTab === 'amplop'
                ? 'text-purple-950 font-bold'
                : 'text-gray-600 hover:text-purple-900'
            }`}
          >
            <Mail className="w-4 h-4 text-orange-600" />
            <span>Daftar Amplop</span>
            <span className="px-2 py-0.5 bg-white/80 text-purple-950 border border-purple-200/80 rounded-full text-xs font-bold">
              {totalEnvelopes}
            </span>
            {activeSubTab === 'amplop' && (
              <motion.div
                layoutId="guestSubTabActiveIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-purple-600"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>

          <button
            onClick={() => {
              setActiveSubTab('rekap');
              const el = document.getElementById('rekap');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            type="button"
            className={`relative py-3 px-2 text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeSubTab === 'rekap'
                ? 'text-purple-950 font-bold'
                : 'text-gray-600 hover:text-purple-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-purple-700" />
            <span>Rekapitulasi</span>
            {activeSubTab === 'rekap' && (
              <motion.div
                layoutId="guestSubTabActiveIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-purple-600"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>

          <button
            onClick={() => {
              setActiveSubTab('log-aktivitas');
              const el = document.getElementById('log-aktivitas');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            type="button"
            className={`relative py-3 px-2 text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeSubTab === 'log-aktivitas'
                ? 'text-purple-950 font-bold'
                : 'text-gray-600 hover:text-purple-900'
            }`}
          >
            <Clock className="w-4 h-4 text-orange-600" />
            <span>Log Aktivitas</span>
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            {activeSubTab === 'log-aktivitas' && (
              <motion.div
                layoutId="guestSubTabActiveIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-purple-600"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        </div>

        <div className="py-2 flex items-center gap-3">
          <span className="text-xs text-gray-600 font-medium">
            Menampilkan {paginatedGuests.length} dari {filteredGuests.length} entri tamu
          </span>
          <button
            onClick={onOpenReceptionModal}
            className="sm:hidden p-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl shadow-xs"
            title="Tambah Tamu Cepat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters and Search Toolbar */}
      <div className="p-4 bg-purple-50/40 border-b border-purple-100/70 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama tamu, kode BT-xxx, atau nomor HP..."
            className="w-full pl-9 pr-4 py-2 bg-white/85 border border-purple-200/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#1e1b4b] placeholder:text-gray-400 shadow-2xs"
          />
        </div>

        {/* Filter Dropdowns, View Switcher & Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* View Mode Switcher (Tabel vs Kartu Grid) */}
          <div className="flex items-center bg-white/80 border border-purple-200/80 p-1 rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setViewMode('table');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-2xs'
                  : 'text-gray-600 hover:bg-purple-50'
              }`}
              title="Tampilan Tabel Lengkap"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabel</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('grid');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-2xs'
                  : 'text-gray-600 hover:bg-purple-50'
              }`}
              title="Tampilan Kartu Tamu"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kartu</span>
            </button>
          </div>

          {/* Filter Pihak */}
          <div className="flex items-center gap-1.5 bg-white/85 border border-purple-200/80 px-3 py-1.5 rounded-xl shadow-2xs">
            <span className="text-xs text-purple-950 font-semibold">Pihak:</span>
            <select
              value={partyFilter}
              onChange={(e) => {
                setPartyFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-transparent border-0 text-xs font-bold text-[#1e1b4b] focus:ring-0 p-0 cursor-pointer"
            >
              <option value="all">Semua Pihak</option>
              <option value="laki">Pihak Laki-laki</option>
              <option value="perempuan">Pihak Perempuan</option>
            </select>
          </div>

          {/* Filter Status Amplop */}
          <div className="flex items-center gap-1.5 bg-white/85 border border-purple-200/80 px-3 py-1.5 rounded-xl shadow-2xs">
            <span className="text-xs text-purple-950 font-semibold">Status Amplop:</span>
            <select
              value={envelopeFilter}
              onChange={(e) => {
                setEnvelopeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-transparent border-0 text-xs font-bold text-[#1e1b4b] focus:ring-0 p-0 cursor-pointer"
            >
              <option value="all">Semua Amplop</option>
              <option value="counted">Sudah Dihitung</option>
              <option value="pending">Belum Dihitung</option>
              <option value="none">Tanpa Amplop</option>
            </select>
          </div>

          {/* Quick Clear Filter */}
          {(searchTerm || partyFilter !== 'all' || envelopeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setPartyFilter('all');
                setEnvelopeFilter('all');
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-white/85 hover:bg-white border border-purple-200/80 rounded-xl text-xs text-purple-950 font-semibold shadow-2xs"
            >
              Reset Filter
            </button>
          )}

          <button
            onClick={() => setCurrentPage(1)}
            className="p-2 bg-white/85 hover:bg-white border border-purple-200/80 rounded-xl text-purple-950 shadow-2xs transition-colors"
            title="Segarkan Data"
            type="button"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area: Table vs Grid Cards */}
      {viewMode === 'grid' ? (
        <div className="p-4 sm:p-5 bg-white/30">
          {paginatedGuests.length === 0 ? (
            <div className="py-12 text-center text-gray-500 bg-white/80 rounded-2xl border border-dashed border-purple-200 p-8 max-w-lg mx-auto shadow-xs">
              <Users className="w-10 h-10 text-purple-400 mx-auto mb-3 opacity-60" />
              <h4 className="font-bold text-base text-[#1e1b4b]">
                {guests.length === 0 ? 'Daftar Tamu Masih Kosong' : 'Tidak Ada Tamu Yang Cocok'}
              </h4>
              <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                {guests.length === 0
                  ? 'Aplikasi buku tamu sudah siap dan bersih. Klik tombol "+ Tambah Tamu" di atas untuk mencatat kehadiran.'
                  : 'Tidak ada tamu yang cocok dengan kata kunci atau filter yang Anda pilih.'}
              </p>
              {guests.length === 0 && (
                <button
                  type="button"
                  onClick={onOpenReceptionModal}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Tamu Pertama</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
              {paginatedGuests.map((guest, idx) => {
                const globalIndex = (validPage - 1) * itemsPerPage + idx + 1;
                return (
                  <div
                    key={guest.id}
                    className="glass-card p-4 rounded-2xl border border-white/85 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Card Top Badges */}
                      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-purple-100/70">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-purple-900 bg-white/90 px-1.5 py-0.5 rounded-md border border-purple-200/80 shadow-2xs">
                            #{globalIndex}
                          </span>
                          <span className="font-mono font-bold text-xs bg-purple-50 px-2 py-0.5 rounded-md text-purple-950 border border-purple-200/70">
                            {guest.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {guest.category === 'VIP' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-950 border border-orange-300">
                              VIP
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              guest.party === 'laki'
                                ? 'bg-orange-50 text-orange-900 border border-orange-200'
                                : 'bg-purple-50 text-purple-900 border border-purple-200'
                            }`}
                          >
                            {guest.party === 'laki' ? 'Laki-laki' : 'Perempuan'}
                          </span>
                        </div>
                      </div>

                      {/* Name & Relation */}
                      <h4 className="font-bold text-sm sm:text-base text-[#1e1b4b] leading-tight group-hover:text-purple-900 transition-colors">
                        {guest.name}
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">{guest.relation || 'Tamu Undangan Resepsi'}</p>

                      {guest.phone && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-purple-900 font-medium">
                          <Phone className="w-3.5 h-3.5 text-purple-600" />
                          <span>{guest.phone}</span>
                        </div>
                      )}

                      {/* Guest Count & Souvenir */}
                      <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-purple-100/60">
                        <div className="flex items-center gap-1.5 text-[#1e1b4b]">
                          <Users className="w-3.5 h-3.5 text-gray-500" />
                          <span className="font-bold">{guest.guestCount}</span> Orang
                        </div>
                        <div>
                          {guest.souvenirGiven ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <Gift className="w-3 h-3 text-emerald-600" /> Souvenir Diserahkan
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">Belum Souvenir</span>
                          )}
                        </div>
                      </div>

                      {/* Envelope info */}
                      <div className="mt-3 p-2.5 rounded-xl bg-purple-50/50 border border-purple-100/80 text-xs">
                        <div className="text-[10px] uppercase font-bold text-purple-900 flex items-center justify-between">
                          <span>Status Amplop</span>
                          {guest.hasEnvelope ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Ada
                            </span>
                          ) : (
                            <span className="text-gray-400">Tanpa Amplop</span>
                          )}
                        </div>
                        <div className="mt-1">
                          {guest.envelopeStatus === 'counted' ? (
                            <div>
                              <div className="font-bold text-orange-950 text-sm">
                                {formatRupiah(guest.envelopeAmount)}
                              </div>
                              <div className="text-[10px] font-mono text-gray-600">
                                {guest.envelopeCode || 'AMP-AUTO'} • Terhitung
                              </div>
                            </div>
                          ) : guest.envelopeStatus === 'pending' ? (
                            <div className="text-orange-900 font-semibold text-[11px] flex items-center gap-1">
                              <Hourglass className="w-3 h-3 text-orange-600" /> Belum Dihitung ({guest.envelopeCode || 'AMP-AUTO'})
                            </div>
                          ) : (
                            <div className="text-gray-500 italic text-[11px]">Kado Fisik / Tanpa Amplop</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Check-in & Actions */}
                    <div className="mt-4 pt-3 border-t border-purple-100/60 flex items-center justify-between text-xs">
                      <div className="text-[10px] text-gray-500">
                        <div className="font-bold text-[#1e1b4b]">{guest.checkInTime}</div>
                        <div>Oleh: {guest.officer}</div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onViewGuest(guest)}
                          className="p-1.5 text-gray-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Lihat Detail & Cetak Thermal"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditGuest(guest)}
                          className="p-1.5 text-gray-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit Tamu"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus data tamu ${guest.name} (${guest.id})?`)) {
                              onDeleteGuest(guest.id);
                            }
                          }}
                          className="p-1.5 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Tamu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Guest Table */
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-purple-100/50 border-b border-purple-200/70 text-purple-950 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-3 sm:px-4 w-12 text-center">No</th>
                <th className="py-3 px-3 sm:px-4">Kode Tamu</th>
                <th className="py-3 px-3 sm:px-4">Nama Tamu & Relasi</th>
                <th className="py-3 px-3 sm:px-4 text-center">Pihak</th>
                <th className="py-3 px-3 sm:px-4 text-center">Jumlah</th>
                <th className="py-3 px-3 sm:px-4 text-center">Amplop</th>
                <th className="py-3 px-3 sm:px-4">Nominal / Status</th>
                <th className="py-3 px-3 sm:px-4">Waktu & Petugas</th>
                <th className="py-3 px-3 sm:px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100/60">
              {paginatedGuests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500">
                    <Users className="w-8 h-8 text-purple-400 mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-sm text-[#1e1b4b]">
                      {guests.length === 0 ? 'Daftar Tamu Masih Kosong' : 'Tidak Ada Tamu Yang Cocok'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {guests.length === 0
                        ? 'Klik tombol "+ Tambah Tamu" di atas untuk mulai mencatat presensi tamu.'
                        : 'Tidak ada tamu yang cocok dengan filter atau kata kunci pencarian.'}
                    </p>
                    {guests.length === 0 && (
                      <button
                        type="button"
                        onClick={onOpenReceptionModal}
                        className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Tamu Pertama</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedGuests.map((guest, idx) => {
                  const globalIndex = (validPage - 1) * itemsPerPage + idx + 1;
                  return (
                    <tr key={guest.id} className="hover:bg-purple-50/40 transition-colors group">
                      <td className="py-3 px-3 sm:px-4 text-center font-semibold text-purple-900">
                        {globalIndex}
                      </td>

                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs bg-white/90 px-2 py-1 rounded-md text-purple-950 border border-purple-200/80 shadow-2xs">
                          {guest.id}
                        </span>
                      </td>

                      <td className="py-3 px-3 sm:px-4">
                        <div className="font-bold text-[#1e1b4b] flex items-center gap-1.5 flex-wrap">
                          <span>{guest.name}</span>
                          {guest.category === 'VIP' && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-orange-100 text-orange-950 border border-orange-300">
                              VIP
                            </span>
                          )}
                          {guest.souvenirGiven && (
                            <span title="Souvenir telah diserahkan">
                              <Gift className="w-3 h-3 text-emerald-600 inline" />
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 flex items-center gap-2 mt-0.5">
                          <span>{guest.relation || 'Tamu Undangan Resepsi'}</span>
                          {guest.phone && (
                            <span className="inline-flex items-center gap-0.5 text-[11px] text-gray-500">
                              <Phone className="w-2.5 h-2.5" />
                              <span>{guest.phone}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            guest.party === 'laki'
                              ? 'bg-orange-50 text-orange-900 border border-orange-200'
                              : 'bg-purple-50 text-purple-900 border border-purple-200'
                          }`}
                        >
                          {guest.party === 'laki' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                      </td>

                      <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-gray-500" />
                          <span className="font-bold text-[#1e1b4b]">{guest.guestCount}</span>
                          <span className="text-xs text-gray-500">org</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                        {guest.hasEnvelope ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 inline" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400 inline" />
                        )}
                      </td>

                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        {guest.envelopeStatus === 'counted' ? (
                          <div>
                            <div className="font-bold text-orange-950">
                              {formatRupiah(guest.envelopeAmount)}
                            </div>
                            <div className="text-[11px] font-mono text-gray-600">
                              {guest.envelopeCode || 'AMP-AUTO'} •{' '}
                              <span className="text-emerald-700 font-semibold">Sudah Dihitung</span>
                            </div>
                          </div>
                        ) : guest.envelopeStatus === 'pending' ? (
                          <div>
                            <div className="inline-flex items-center gap-1 text-xs font-semibold text-orange-800 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                              <Hourglass className="w-3 h-3" /> Belum Dihitung
                            </div>
                            <div className="text-[11px] font-mono text-gray-600">
                              {guest.envelopeCode || 'AMP-AUTO'} • Amplop Fisik Tertutup
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 italic">
                            Tanpa Amplop (Kado Fisik)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <div className="text-xs font-semibold text-[#1e1b4b]">{guest.checkInTime}</div>
                        <div className="text-[11px] text-gray-500">Petugas: {guest.officer}</div>
                      </td>

                      <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onViewGuest(guest)}
                            className="p-1.5 text-gray-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Lihat Kartu Tamu & Bukti Souvenir"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditGuest(guest)}
                            className="p-1.5 text-gray-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Edit Data Tamu & Amplop"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus data tamu ${guest.name} (${guest.id})?`)) {
                                onDeleteGuest(guest.id);
                              }
                            }}
                            className="p-1.5 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Entri Tamu"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Pagination Bar */}
      <div className="p-4 bg-white/70 border-t border-purple-100/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-gray-600">
          Menampilkan{' '}
          <span className="font-bold text-[#1e1b4b]">
            {paginatedGuests.length > 0 ? (validPage - 1) * itemsPerPage + 1 : 0} -{' '}
            {Math.min(validPage * itemsPerPage, filteredGuests.length)}
          </span>{' '}
          dari <span className="font-bold text-[#1e1b4b]">{filteredGuests.length}</span> entri tamu
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validPage === 1}
            className="px-3 py-1.5 border border-purple-200/80 bg-white/80 rounded-xl text-purple-950 hover:bg-white disabled:opacity-40 shadow-2xs font-semibold"
          >
            Sebelumnya
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1.5 rounded-xl font-bold shadow-2xs transition-all ${
                  validPage === pageNum
                    ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white'
                    : 'border border-purple-200/80 bg-white/80 hover:bg-white text-purple-950'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 5 && <span className="px-1 text-gray-400">...</span>}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validPage === totalPages}
            className="px-3 py-1.5 border border-purple-200/80 bg-white/80 rounded-xl text-purple-950 hover:bg-white disabled:opacity-40 shadow-2xs font-semibold"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </section>
  );
};
