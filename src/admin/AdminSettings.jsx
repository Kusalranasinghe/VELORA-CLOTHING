import React, { useState } from 'react';
import {
  Save,
  CheckCircle,
  AlertCircle,
  Database,
  Phone,
  MessageCircle,
  MapPin,
  Mail,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import axios from 'axios';

export default function AdminSettings() {
  const { settings, updateSettings, dataSource, refreshData, showToast } = useShop();
  const [formData, setFormData] = useState({ ...settings });
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(formData);
      showToast('Store settings saved successfully!');
    } catch (error) {
      showToast(error.message || 'Could not save store settings.', 'error');
    }
  };

  const handleTestConnection = async () => {
    if (!formData.appsScriptUrl || !formData.appsScriptUrl.trim()) {
      setConnectionTestResult({
        success: false,
        message: 'Please paste your Google Apps Script Web App URL first.'
      });
      return;
    }

    setTestingConnection(true);
    setConnectionTestResult(null);

    try {
      const res = await axios.get(formData.appsScriptUrl.trim(), {
        params: { action: 'getSettings' },
        timeout: 10000
      });

      if (res.data && res.data.status === 'success') {
        setConnectionTestResult({
          success: true,
          message: 'Connected successfully to Google Spreadsheet!'
        });
        showToast('Google Sheets connected!', 'success');
        refreshData();
      } else {
        setConnectionTestResult({
          success: false,
          message: 'Apps Script responded, but returned an error: ' + (res.data?.message || 'Unknown response')
        });
      }
    } catch (err) {
      setConnectionTestResult({
        success: false,
        message: 'Could not connect. Ensure the Web App is deployed with "Anyone" access and CORS is allowed. Error: ' + err.message
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Top Banner: Connection Status */}
      <div className="bg-white p-6 rounded-3xl border border-velora-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            dataSource === 'google-sheets' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base text-velora-950">Data Storage Engine</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                dataSource === 'google-sheets' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {dataSource === 'google-sheets' ? 'Live Google Sheets' : 'Local Demo Mode'}
              </span>
            </div>
            <p className="text-xs text-velora-500 mt-0.5">
              {dataSource === 'google-sheets'
                ? 'Your website is synchronized with your Google Spreadsheet database in real-time.'
                : 'Using browser local cache. Products and categories can be tested immediately!'}
            </p>
          </div>
        </div>

        <button
          onClick={refreshData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-velora-100 hover:bg-velora-200 text-velora-800 text-xs font-bold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* 1. Google Sheets Configuration */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-velora-200 shadow-sm space-y-6">
          <div className="border-b border-velora-100 pb-4">
            <h3 className="text-base font-serif font-bold text-velora-950 flex items-center gap-2">
              <Database className="w-4 h-4 text-velora-700" />
              Google Sheets API Integration
            </h3>
            <p className="text-xs text-velora-500 mt-1">
              Connect your Google Spreadsheet to manage products without hosting a traditional backend server.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
              Google Apps Script Web App URL
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                name="appsScriptUrl"
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                value={formData.appsScriptUrl || ''}
                onChange={handleChange}
                className="flex-1 px-4 py-2.5 rounded-xl bg-velora-50 border border-velora-200 text-xs focus:outline-none focus:border-velora-950 font-mono"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="px-5 py-2.5 rounded-xl bg-velora-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-velora-800 transition-all flex items-center justify-center gap-2"
              >
                {testingConnection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Test Connection'}
              </button>
            </div>

            {connectionTestResult && (
              <div className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2.5 ${
                connectionTestResult.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {connectionTestResult.success ? <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                <span>{connectionTestResult.message}</span>
              </div>
            )}

            <p className="text-[11px] text-velora-400 mt-2">
              Need help? Check the <code className="bg-velora-100 px-1 py-0.5 rounded text-velora-700 font-mono">google-apps-script/README.md</code> in this project for step-by-step instructions.
            </p>
          </div>
        </div>

        {/* 2. Store & WhatsApp Details */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-velora-200 shadow-sm space-y-6">
          <div className="border-b border-velora-100 pb-4">
            <h3 className="text-base font-serif font-bold text-velora-950 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              Store & WhatsApp Contact Details
            </h3>
            <p className="text-xs text-velora-500 mt-1">
              These details are used across the website and in WhatsApp Click-to-Chat pre-filled messages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                Shop Name *
              </label>
              <input
                type="text"
                name="shopName"
                required
                value={formData.shopName || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-velora-50 border border-velora-200 text-xs focus:outline-none focus:border-velora-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                WhatsApp Order Hotline (with country code) *
              </label>
              <input
                type="text"
                name="whatsappNumber"
                required
                placeholder="94771234567"
                value={formData.whatsappNumber || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-velora-50 border border-velora-200 text-xs focus:outline-none focus:border-velora-900 font-mono font-bold"
              />
              <p className="text-[10px] text-velora-400 mt-1">Enter without + or spaces (e.g. 94771234567)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                Store Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-velora-50 border border-velora-200 text-xs focus:outline-none focus:border-velora-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                Currency Symbol
              </label>
              <input
                type="text"
                name="currency"
                value={formData.currency || 'Rs.'}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-velora-50 border border-velora-200 text-xs focus:outline-none focus:border-velora-900 font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                Physical Store Address / Showroom
              </label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-velora-50 border border-velora-200 text-xs focus:outline-none focus:border-velora-900"
              />
            </div>
          </div>
        </div>

        {/* 3. Promotional Content */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-velora-200 shadow-sm space-y-6">
          <div className="border-b border-velora-100 pb-4">
            <h3 className="text-base font-serif font-bold text-velora-950">
              Hero Banner & Delivery Notes
            </h3>
            <p className="text-xs text-velora-500 mt-1">
              Customize the promotional text shown on the Home Page and top announcement bar.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                Hero Banner Title
              </label>
              <input
                type="text"
                name="heroTitle"
                value={formData.heroTitle || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-velora-50 border border-velora-200 text-xs focus:outline-none focus:border-velora-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                Hero Subtitle
              </label>
              <textarea
                rows={2}
                name="heroSubtitle"
                value={formData.heroSubtitle || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-velora-50 border border-velora-200 text-xs focus:outline-none focus:border-velora-900 resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                Delivery Note
              </label>
              <input
                type="text"
                name="deliveryNote"
                value={formData.deliveryNote || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-velora-50 border border-velora-200 text-xs focus:outline-none focus:border-velora-900"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-velora-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-velora-800 transition-all shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Store Settings
          </button>
        </div>

      </form>

    </div>
  );
}
