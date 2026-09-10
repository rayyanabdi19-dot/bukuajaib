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
    <section className="bg-white rounded-xl border border-[#d5c3b8] shadow-sm overflow-hidden" id="buku-tamu">
      {/* Tab Header Switcher */}
      <div className="border-b border-[#d5c3b8] px-4 md:px-6 pt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => {
              setActiveSubTab('buku-tamu');
              setCurrentPage(1);
            }}
            type="button"
            className={`relative py-3 px-2 text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeSubTab === 'buku-tamu' || activeSubTab === 'semua'
                ? 'text-[#6f4627] font-bold'
                : 'text-[#51443c] hover:text-[#6f4627]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Buku Tamu</span>
            <span className="px-2 py-0.5 bg-[#ffdcc5] text-[#301400] rounded-full text-xs font-bold">
              {guests.length}
            </span>
            {(activeSubTab === 'buku-tamu' || activeSubTab === 'semua') && (
              <motion.div
                layoutId="guestSubTabActiveIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6f4627]"
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
                ? 'text-[#6f4627] font-bold'
                : 'text-[#51443c] hover:text-[#6f4627]'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Daftar Amplop</span>
            <span className="px-2 py-0.5 bg-[#eeeeed] text-[#51443c] rounded-full text-xs font-bold">
              {totalEnvelopes}
            </span>
            {activeSubTab === 'amplop' && (
              <motion.div
                layoutId="guestSubTabActiveIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6f4627]"
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
                ? 'text-[#6f4627] font-bold'
                : 'text-[#51443c] hover:text-[#6f4627]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Rekapitulasi</span>
            {activeSubTab === 'rekap' && (
              <motion.div
                layoutId="guestSubTabActiveIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6f4627]"
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
                ? 'text-[#6f4627] font-bold'
                : 'text-[#51443c] hover:text-[#6f4627]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Log Aktivitas</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {activeSubTab === 'log-aktivitas' && (
              <motion.div
                layoutId="guestSubTabActiveIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6f4627]"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        </div>

        <div className="py-2 flex items-center gap-3">
          <span className="text-xs text-[#51443c]">
            Menampilkan {paginatedGuests.length} dari {filteredGuests.length} entri tamu
          </span>
          <button
            onClick={onOpenReceptionModal}
            className="sm:hidden p-2 bg-[#8b5e3c] text-white rounded-lg"
            title="Tambah Tamu Cepat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters and Search Toolbar */}
      <div className="p-4 bg-[#f3f4f3] border-b border-[#d5c3b8]/60 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#83746b]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama tamu, kode BT-xxx, atau nomor HP..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#d5c3b8] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00] text-[#1a1c1c] placeholder:text-[#83746b]"
          />
        </div>

        {/* Filter Dropdowns, View Switcher & Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* View Mode Switcher (Tabel vs Kartu Grid) */}
          <div className="flex items-center bg-white border border-[#d5c3b8] p-1 rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setViewMode('table');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#6f4627] text-white shadow-2xs'
                  : 'text-[#51443c] hover:bg-[#faf6f2]'
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
                  ? 'bg-[#6f4627] text-white shadow-2xs'
                  : 'text-[#51443c] hover:bg-[#faf6f2]'
              }`}
              title="Tampilan Kartu Tamu"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kartu</span>
            </button>
          </div>

          {/* Filter Pihak */}
          <div className="flex items-center gap-1.5 bg-white border border-[#d5c3b8] px-3 py-1.5 rounded-xl">
            <span className="text-xs text-[#51443c] font-semibold">Pihak:</span>
            <select
              value={partyFilter}
              onChange={(e) => {
                setPartyFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-transparent border-0 text-xs font-semibold text-[#1a1c1c] focus:ring-0 p-0 cursor-pointer"
            >
              <option value="all">Semua Pihak</option>
              <option value="laki">Pihak Laki-laki</option>
              <option value="perempuan">Pihak Perempuan</option>
            </select>
          </div>

          {/* Filter Status Amplop */}
          <div className="flex items-center gap-1.5 bg-white border border-[#d5c3b8] px-3 py-1.5 rounded-xl">
            <span className="text-xs text-[#51443c] font-semibold">Status Amplop:</span>
            <select
              value={envelopeFilter}
              onChange={(e) => {
                setEnvelopeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-transparent border-0 text-xs font-semibold text-[#1a1c1c] focus:ring-0 p-0 cursor-pointer"
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
              className="px-2.5 py-1.5 bg-white hover:bg-[#eeeeed] border border-[#d5c3b8] rounded-xl text-xs text-[#6f4627] font-semibold"
            >
              Reset Filter
            </button>
          )}

          <button
            onClick={() => setCurrentPage(1)}
            className="p-2 bg-white hover:bg-[#eeeeed] border border-[#d5c3b8] rounded-xl text-[#51443c]"
            title="Segarkan Data"
            type="button"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area: Table vs Grid Cards */}
      {viewMode === 'grid' ? (
        <div className="p-4 sm:p-5 bg-[#faf6f2]/40">
          {paginatedGuests.length === 0 ? (
            <div className="py-12 text-center text-[#51443c]">
              Tidak ada tamu yang cocok dengan kriteria pencarian / filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
              {paginatedGuests.map((guest, idx) => {
                const globalIndex = (validPage - 1) * itemsPerPage + idx + 1;
                return (
                  <div
                    key={guest.id}
                    className="bg-white rounded-xl border border-[#d5c3b8] p-4 shadow-2xs hover:shadow-md hover:border-[#8b5e3c]/60 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Card Top Badges */}
                      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#eeeeed]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-[#8c7355] bg-[#faf6f2] px-1.5 py-0.5 rounded border border-[#d5c3b8]/60">
                            #{globalIndex}
                          </span>
                          <span className="font-mono font-bold text-xs bg-[#eeeeed] px-2 py-0.5 rounded text-[#6f4627]">
                            {guest.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {guest.category === 'VIP' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              VIP
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              guest.party === 'laki'
                                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                : 'bg-rose-50 text-rose-900 border border-rose-200'
                            }`}
                          >
                            {guest.party === 'laki' ? 'Laki-laki' : 'Perempuan'}
                          </span>
                        </div>
                      </div>

                      {/* Name & Relation */}
                      <h4 className="font-bold text-sm sm:text-base text-[#1a1c1c] leading-tight group-hover:text-[#6f4627] transition-colors">
                        {guest.name}
                      </h4>
                      <p className="text-xs text-[#51443c] mt-0.5">{guest.relation || 'Tamu Undangan Resepsi'}</p>

                      {guest.phone && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-[#6f4627] font-medium">
                          <Phone className="w-3.5 h-3.5 text-[#8b5e3c]" />
                          <span>{guest.phone}</span>
                        </div>
                      )}

                      {/* Guest Count & Souvenir */}
                      <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-[#f3f4f3]">
                        <div className="flex items-center gap-1.5 text-[#1a1c1c]">
                          <Users className="w-3.5 h-3.5 text-[#83746b]" />
                          <span className="font-bold">{guest.guestCount}</span> Orang
                        </div>
                        <div>
                          {guest.souvenirGiven ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <Gift className="w-3 h-3 text-emerald-600" /> Souvenir Diserahkan
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#83746b] italic">Belum Souvenir</span>
                          )}
                        </div>
                      </div>

                      {/* Envelope info */}
                      <div className="mt-3 p-2.5 rounded-lg bg-[#faf6f2] border border-[#d5c3b8]/50 text-xs">
                        <div className="text-[10px] uppercase font-bold text-[#8c7355] flex items-center justify-between">
                          <span>Status Amplop</span>
                          {guest.hasEnvelope ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Ada
                            </span>
                          ) : (
                            <span className="text-[#83746b]">Tanpa Amplop</span>
                          )}
                        </div>
                        <div className="mt-1">
                          {guest.envelopeStatus === 'counted' ? (
                            <div>
                              <div className="font-bold text-[#6f4627] text-sm">
                                {formatRupiah(guest.envelopeAmount)}
                              </div>
                              <div className="text-[10px] font-mono text-[#51443c]">
                                {guest.envelopeCode || 'AMP-AUTO'} • Terhitung
                              </div>
                            </div>
                          ) : guest.envelopeStatus === 'pending' ? (
                            <div className="text-amber-800 font-semibold text-[11px] flex items-center gap-1">
                              <Hourglass className="w-3 h-3 text-amber-700" /> Belum Dihitung ({guest.envelopeCode || 'AMP-AUTO'})
                            </div>
                          ) : (
                            <div className="text-[#83746b] italic text-[11px]">Kado Fisik / Tanpa Amplop</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Check-in & Actions */}
                    <div className="mt-4 pt-3 border-t border-[#eeeeed] flex items-center justify-between text-xs">
                      <div className="text-[10px] text-[#51443c]">
                        <div className="font-bold text-[#1a1c1c]">{guest.checkInTime}</div>
                        <div>Oleh: {guest.officer}</div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onViewGuest(guest)}
                          className="p-1.5 text-[#51443c] hover:text-[#6f4627] hover:bg-[#faf6f2] rounded-lg transition-colors"
                          title="Lihat Detail & Cetak Thermal"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditGuest(guest)}
                          className="p-1.5 text-[#51443c] hover:text-[#6f4627] hover:bg-[#faf6f2] rounded-lg transition-colors"
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
                          className="p-1.5 text-[#51443c] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
              <tr className="bg-[#e8e8e7]/70 border-b border-[#d5c3b8] text-[#51443c] text-xs font-bold uppercase tracking-wider">
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
            <tbody className="divide-y divide-[#d5c3b8]/60">
              {paginatedGuests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#51443c]">
                    Tidak ada tamu yang cocok dengan kriteria pencarian / filter.
                  </td>
                </tr>
              ) : (
                paginatedGuests.map((guest, idx) => {
                  const globalIndex = (validPage - 1) * itemsPerPage + idx + 1;
                  return (
                    <tr key={guest.id} className="hover:bg-[#f3f4f3] transition-colors group">
                      <td className="py-3 px-3 sm:px-4 text-center font-medium text-[#51443c]">
                        {globalIndex}
                      </td>

                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs bg-[#eeeeed] px-2 py-1 rounded text-[#6f4627] border border-[#d5c3b8]/60">
                          {guest.id}
                        </span>
                      </td>

                      <td className="py-3 px-3 sm:px-4">
                        <div className="font-bold text-[#1a1c1c] flex items-center gap-1.5 flex-wrap">
                          <span>{guest.name}</span>
                          {guest.category === 'VIP' && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              VIP
                            </span>
                          )}
                          {guest.souvenirGiven && (
                            <span title="Souvenir telah diserahkan">
                              <Gift className="w-3 h-3 text-emerald-600 inline" />
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#51443c] flex items-center gap-2 mt-0.5">
                          <span>{guest.relation || 'Tamu Undangan Resepsi'}</span>
                          {guest.phone && (
                            <span className="inline-flex items-center gap-0.5 text-[11px] text-[#83746b]">
                              <Phone className="w-2.5 h-2.5" />
                              <span>{guest.phone}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            guest.party === 'laki'
                              ? 'bg-amber-50 text-amber-900 border border-amber-200'
                              : 'bg-rose-50 text-rose-900 border border-rose-200'
                          }`}
                        >
                          {guest.party === 'laki' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                      </td>

                      <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#83746b]" />
                          <span className="font-bold text-[#1a1c1c]">{guest.guestCount}</span>
                          <span className="text-xs text-[#51443c]">org</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                        {guest.hasEnvelope ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 inline" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#83746b] inline" />
                        )}
                      </td>

                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        {guest.envelopeStatus === 'counted' ? (
                          <div>
                            <div className="font-bold text-[#6f4627]">
                              {formatRupiah(guest.envelopeAmount)}
                            </div>
                            <div className="text-[11px] font-mono text-[#51443c]">
                              {guest.envelopeCode || 'AMP-AUTO'} •{' '}
                              <span className="text-emerald-700 font-semibold">Sudah Dihitung</span>
                            </div>
                          </div>
                        ) : guest.envelopeStatus === 'pending' ? (
                          <div>
                            <div className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Hourglass className="w-3 h-3" /> Belum Dihitung
                            </div>
                            <div className="text-[11px] font-mono text-[#51443c]">
                              {guest.envelopeCode || 'AMP-AUTO'} • Amplop Fisik Tertutup
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-[#51443c] italic">
                            Tanpa Amplop (Kado Fisik)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <div className="text-xs font-semibold text-[#1a1c1c]">{guest.checkInTime}</div>
                        <div className="text-[11px] text-[#51443c]">Petugas: {guest.officer}</div>
                      </td>

                      <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onViewGuest(guest)}
                            className="p-1.5 text-[#51443c] hover:text-[#6f4627] hover:bg-[#eeeeed] rounded-lg transition-colors"
                            title="Lihat Kartu Tamu & Bukti Souvenir"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditGuest(guest)}
                            className="p-1.5 text-[#51443c] hover:text-[#6f4627] hover:bg-[#eeeeed] rounded-lg transition-colors"
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
                            className="p-1.5 text-[#51443c] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
      <div className="p-4 bg-white border-t border-[#d5c3b8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-[#51443c]">
          Menampilkan{' '}
          <span className="font-bold text-[#1a1c1c]">
            {paginatedGuests.length > 0 ? (validPage - 1) * itemsPerPage + 1 : 0} -{' '}
            {Math.min(validPage * itemsPerPage, filteredGuests.length)}
          </span>{' '}
          dari <span className="font-bold text-[#1a1c1c]">{filteredGuests.length}</span> entri tamu
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validPage === 1}
            className="px-2.5 py-1.5 border border-[#d5c3b8] rounded-lg text-[#51443c] hover:bg-[#eeeeed] disabled:opacity-40"
          >
            Sebelumnya
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1.5 rounded-lg font-bold ${
                  validPage === pageNum
                    ? 'bg-[#8b5e3c] text-white'
                    : 'border border-[#d5c3b8] hover:bg-[#eeeeed] text-[#1a1c1c]'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 5 && <span className="px-1 text-[#83746b]">...</span>}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validPage === totalPages}
            className="px-2.5 py-1.5 border border-[#d5c3b8] rounded-lg text-[#1a1c1c] hover:bg-[#eeeeed] disabled:opacity-40"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </section>
  );
};
