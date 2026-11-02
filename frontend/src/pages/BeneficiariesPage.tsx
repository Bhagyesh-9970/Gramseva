import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Plus, Search, Filter, Download, ArrowRight,
  ShieldCheck, X, CheckCircle2, AlertCircle
} from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { AppSidebar } from '../components/layout/AppSidebar';
import { useVillage } from '../context/VillageContext';

export const BeneficiariesPage: React.FC = () => {
  const { selectedVillageId, selectedVillage } = useVillage();
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New beneficiary form
  const [name, setName] = useState('');
  const [nameMr, setNameMr] = useState('');
  const [headOfFamily, setHeadOfFamily] = useState('');
  const [familyMembers, setFamilyMembers] = useState(4);
  const [phone, setPhone] = useState('');
  const [rationCardNumber, setRationCardNumber] = useState('');
  const [category, setCategory] = useState('PHH');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState('');

  const fetchBeneficiaries = async () => {
    try {
      const vParam = selectedVillageId && selectedVillageId !== 'ALL' ? `?village_id=${selectedVillageId}` : '';
      const cParam = categoryFilter !== 'ALL' ? `${vParam ? '&' : '?'}category=${categoryFilter}` : vParam;
      const res = await fetch(`/api/pds/beneficiaries${cParam}`);
      if (res.ok) setBeneficiaries(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, [selectedVillageId, categoryFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await fetch('/api/pds/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          name_mr: nameMr || name,
          head_of_family: headOfFamily || name,
          family_members_count: familyMembers,
          contact_phone: phone,
          address,
          village_id: selectedVillageId || 'v-shiva',
          ration_card_number: rationCardNumber,
          ration_card_category: category,
          ration_card_color: category === 'APL' ? 'ORANGE' : 'YELLOW'
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setName('');
        setRationCardNumber('');
        setPhone('');
        fetchBeneficiaries();
      } else {
        const err = await res.json();
        setFormError(err.detail || 'Failed to register beneficiary.');
      }
    } catch (e) {
      setFormError('Network error registering beneficiary.');
    }
  };

  const exportCSV = () => {
    const headers = ['Beneficiary Code,Ration Card Number,Name,Category,Family Members,Phone,Status'];
    const rows = beneficiaries.map(b =>
      `"${b.beneficiary_code}","${b.ration_card_number}","${b.name}","${b.ration_card_category}",${b.family_members_count},"${b.contact_phone || ''}","${b.status}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beneficiaries_${selectedVillageId || 'all'}.csv`;
    a.click();
  };

  const filtered = beneficiaries.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.ration_card_number.toLowerCase().includes(search.toLowerCase()) ||
    b.beneficiary_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D18] flex flex-col">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Beneficiary Registry
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Aadhaar-seeded ration cardholders, Antyodaya (AAY) and BPL priority households.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportCSV}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Beneficiary</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, ration card, or code..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto text-xs">
              <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">Category:</span>
              {['ALL', 'AAY', 'PHH', 'APL'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    categoryFilter === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'AAY' ? 'AAY (Antyodaya)' : cat === 'PHH' ? 'PHH (BPL Priority)' : cat === 'APL' ? 'APL (White/Orange)' : 'All Categories'}
                </button>
              ))}
            </div>
          </div>

          {/* Beneficiary Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Beneficiary Code</th>
                    <th className="py-3 px-4">Ration Card No.</th>
                    <th className="py-3 px-4">Beneficiary Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Family Size</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Village</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map(ben => {
                    let catPill = 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-800';
                    if (ben.ration_card_category === 'AAY') catPill = 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
                    if (ben.ration_card_category === 'APL') catPill = 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800';

                    return (
                      <tr key={ben.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">
                          {ben.beneficiary_code}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {ben.ration_card_number}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          <div>{ben.name}</div>
                          {ben.name_mr && ben.name_mr !== ben.name && (
                            <div className="text-[10px] text-slate-400 font-normal">{ben.name_mr}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${catPill}`}>
                            {ben.ration_card_category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                          {ben.family_members_count} Members
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {ben.contact_phone || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {ben.village_name}
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            to={`/app/beneficiaries/${ben.id}`}
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-xs"
                          >
                            <span>Profile</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Register Beneficiary Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Register New Beneficiary
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {formError && (
                  <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name (English)
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Tukaram Shinde"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name (मराठी)
                      </label>
                      <input
                        type="text"
                        value={nameMr}
                        onChange={e => setNameMr(e.target.value)}
                        placeholder="उदा. तुकाराम शिंदे"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Ration Card Number
                      </label>
                      <input
                        type="text"
                        required
                        value={rationCardNumber}
                        onChange={e => setRationCardNumber(e.target.value)}
                        placeholder="e.g. MH-27-094821"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                      >
                        <option value="PHH">PHH (Priority / BPL)</option>
                        <option value="AAY">AAY (Antyodaya Anna)</option>
                        <option value="APL">APL (Above Poverty Line)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Family Members Count
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="15"
                        value={familyMembers}
                        onChange={e => setFamilyMembers(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Contact Mobile
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 98220 00000"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                    >
                      Register Beneficiary
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
