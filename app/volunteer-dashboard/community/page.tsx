"use client";
import React, { useEffect, useState } from 'react';
import { Building2, MapPin, Users } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useRouter } from 'next/navigation';

interface NGOItem {
  _id: string;
  name: string;
  email: string;
  organizationName?: string;
  publicDescription?: string;
  location?: { address?: string };
}

export default function VolunteerCommunityPage() {
  const { user } = useAuthStore();
  const addNotification = useNotificationStore(state => state.addNotification);
  const [ngos, setNgos] = useState<NGOItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [existingRequests, setExistingRequests] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ngosRes, reqsRes] = await Promise.all([
          fetch('/api/ngos'),
          fetch('/api/ngo-requests')
        ]);
        
        const ngosData = await ngosRes.json();
        setNgos(Array.isArray(ngosData) ? ngosData : []);
        
        if (reqsRes.ok) {
          const reqsData = await reqsRes.json();
          setExistingRequests(reqsData);
        }
      } catch {
        setNgos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sendRequest = async (ngoId: string) => {
    if (!user) {
      alert('Please sign in again to send requests.');
      return;
    }

    if (!user.phone) {
      alert("Please update your contact number in Settings before requesting to join an NGO.");
      router.push('/volunteer-dashboard/settings');
      return;
    }

    setRequesting(ngoId);
    try {
      const res = await fetch('/api/ngo-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ngoId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to send request');
        return;
      }
      setExistingRequests(prev => [...prev, { ngoId, status: 'Pending' }]);
      
      addNotification({
        title: 'Join Request Dispatched',
        message: `Your request to join "${ngos.find(n => n._id === ngoId)?.organizationName || 'NGO'}" has been sent. Status: Pending.`,
        type: 'join'
      });

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
          {ngos.map((ngo) => {
            const request = existingRequests.find(r => r.ngoId === ngo._id);
            const isPending = request?.status === 'Pending';
            const isApproved = request?.status === 'Approved';
            const isRejected = request?.status === 'Rejected';
            
            let btnLabel = 'JOIN NGO';
            let disabled = false;
            
            if (requesting === ngo._id) {
              btnLabel = 'Sending...';
              disabled = true;
            } else if (isPending) {
              btnLabel = 'REQUESTED';
              disabled = true;
            } else if (isApproved) {
              btnLabel = 'JOINED';
              disabled = true;
            } else if (isRejected) {
              const rejectedAt = new Date(request.updatedAt || request.createdAt || Date.now()).getTime();
              const daysSince = (Date.now() - rejectedAt) / (1000 * 60 * 60 * 24);
              if (daysSince < 14) {
                btnLabel = `COOLDOWN (${Math.ceil(14 - daysSince)} DAYS)`;
                disabled = true;
              } else {
                btnLabel = 'RE-APPLY';
                disabled = false;
              }
            }

            return (
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
                  disabled={disabled}
                  className={`w-full py-4 rounded-2xl font-black transition-all uppercase tracking-widest text-xs shadow-lg shadow-primary/20 ${
                    disabled && btnLabel.includes('COOLDOWN') 
                      ? 'bg-rose-50 text-rose-500 border border-rose-200 opacity-100' 
                      : disabled 
                      ? 'opacity-50 bg-slate-200 text-slate-500' 
                      : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  {btnLabel}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
