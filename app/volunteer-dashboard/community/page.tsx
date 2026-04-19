"use client";
import React, { useEffect, useState } from 'react';
import { Building2, MapPin, Users } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface NGOItem {
  _id: string;
  name: string;
  email: string;
  organizationName?: string;
  publicDescription?: string;
  location?: { address?: string };
}

export default function VolunteerCommunityPage() {
  const { token } = useAuthStore();
  const [ngos, setNgos] = useState<NGOItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);

  useEffect(() => {
    const fetchNGOs = async () => {
      try {
        const res = await fetch('/api/ngos');
        const data = await res.json();
        setNgos(Array.isArray(data) ? data : []);
      } catch {
        setNgos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNGOs();
  }, []);

  const sendRequest = async (ngoId: string) => {
    if (!token) {
      alert('Please sign in again to send requests.');
      return;
    }

    setRequesting(ngoId);
    try {
      const res = await fetch('/api/ngo-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ngoId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to send request');
        return;
      }
      alert('Request sent successfully.');
    } catch {
      alert('Failed to send request');
    } finally {
      setRequesting(null);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Join Community / NGO</h2>
        <p className="text-slate-500 mt-1">Explore registered NGOs and request to join their team permanently.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-52 bg-white rounded-3xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : ngos.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-700 font-semibold">No NGOs available right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ngos.map((ngo) => (
            <div key={ngo._id} className="bg-white rounded-3xl border border-slate-200 p-7 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{ngo.organizationName || ngo.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{ngo.email}</p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-4 min-h-[42px]">
                {ngo.publicDescription || 'Community-led organization supporting crisis response and rehabilitation.'}
              </p>

              <div className="flex items-center text-xs text-slate-500 mb-6">
                <MapPin className="w-4 h-4 mr-1.5 text-primary" />
                {ngo.location?.address || 'Location not specified'}
              </div>

              <button
                onClick={() => sendRequest(ngo._id)}
                disabled={requesting === ngo._id}
                className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60 transition"
              >
                {requesting === ngo._id ? 'Sending...' : 'REQUEST'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
