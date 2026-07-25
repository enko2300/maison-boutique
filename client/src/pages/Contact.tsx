import { useState } from 'react';
import { useToastStore } from '../components/ui/Toast';

export default function Contact() {
  const showToast = useToastStore(s => s.show);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Erreur');
      showToast('Message envoyé avec succès', 'check');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      showToast('Erreur lors de l\'envoi', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        {/* Left — Info */}
        <div>
          <p className="text-champagne text-[11px] font-medium tracking-[0.3em] uppercase mb-3">Contact</p>
          <h1 className="text-3xl md:text-4xl font-light tracking-[-0.02em] text-charcoal mb-6">
            Parlons de votre<br/><span className="font-medium">projet</span>
          </h1>
          <p className="text-[14px] text-gray-400 font-light leading-relaxed max-w-md">
            Une question sur une commande, un produit ou un partenariat ? Notre équipe vous répond sous 24h.
          </p>

          <div className="mt-12 space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <p className="text-[13px] font-medium text-charcoal mb-1">Email</p>
                <p className="text-[13px] text-gray-400 font-light">contact@maison.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <div>
                <p className="text-[13px] font-medium text-charcoal mb-1">Téléphone</p>
                <p className="text-[13px] text-gray-400 font-light">+33 1 23 45 67 89</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <p className="text-[13px] font-medium text-charcoal mb-1">Adresse</p>
                <p className="text-[13px] text-gray-400 font-light">12 Rue de la Paix<br/>75002 Paris, France</p>
              </div>
            </div>
          </div>

          {/* Horaires */}
          <div className="mt-10 p-5 bg-cream rounded-2xl">
            <p className="text-[11px] tracking-[0.1em] uppercase text-gray-400 font-medium mb-3">Horaires</p>
            <div className="space-y-1.5 text-[13px] font-light">
              <div className="flex justify-between"><span className="text-gray-500">Lundi — Vendredi</span><span className="text-charcoal">9h — 19h</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Samedi</span><span className="text-charcoal">10h — 18h</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Dimanche</span><span className="text-gray-400">Fermé</span></div>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="lg:pt-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] tracking-[0.08em] uppercase text-gray-400 font-medium mb-2">Nom</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-cream border-0 rounded-xl text-[13px] placeholder:text-gray-400 focus:ring-1 focus:ring-champagne/40 focus:bg-white transition-all outline-none font-light"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label className="block text-[11px] tracking-[0.08em] uppercase text-gray-400 font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-cream border-0 rounded-xl text-[13px] placeholder:text-gray-400 focus:ring-1 focus:ring-champagne/40 focus:bg-white transition-all outline-none font-light"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] tracking-[0.08em] uppercase text-gray-400 font-medium mb-2">Sujet</label>
              <select
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-cream border-0 rounded-xl text-[13px] text-gray-500 focus:ring-1 focus:ring-champagne/40 focus:bg-white transition-all outline-none font-light appearance-none cursor-pointer"
              >
                <option value="" disabled>Choisir un sujet</option>
                <option value="commande">Question sur une commande</option>
                <option value="produit">Information produit</option>
                <option value="retour">Retour & échange</option>
                <option value="partenariat">Partenariat</option>
                <option value="presse">Presse & médias</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] tracking-[0.08em] uppercase text-gray-400 font-medium mb-2">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 bg-cream border-0 rounded-xl text-[13px] placeholder:text-gray-400 focus:ring-1 focus:ring-champagne/40 focus:bg-white transition-all outline-none font-light resize-none"
                placeholder="Décrivez votre demande..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-charcoal text-white py-3.5 rounded-full text-[12px] tracking-[0.08em] uppercase font-medium hover:bg-charcoal/90 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le message'}
            </button>

            <p className="text-center text-[11px] text-gray-400 font-light">
              Nous répondons sous 24h ouvrées.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
