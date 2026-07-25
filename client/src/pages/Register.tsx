import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore(s => s.register);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/');
    } catch (e: any) {
      setError(e.response?.data?.error || "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-champagne text-[11px] font-medium tracking-[0.3em] uppercase mb-3">Rejoignez-nous</p>
          <h1 className="text-2xl font-light tracking-[-0.02em] text-charcoal">Créer un compte</h1>
        </div>
        {error && <p className="bg-red-50 text-red-500 text-[12px] p-3 rounded-xl mb-6 font-light">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] tracking-[0.08em] uppercase text-gray-400 font-medium mb-2">Nom</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              className="w-full px-4 py-3 bg-cream border-0 rounded-xl text-[13px] placeholder:text-gray-400 focus:ring-1 focus:ring-champagne/40 focus:bg-white transition-all outline-none font-light" />
          </div>
          <div>
            <label className="block text-[11px] tracking-[0.08em] uppercase text-gray-400 font-medium mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-3 bg-cream border-0 rounded-xl text-[13px] placeholder:text-gray-400 focus:ring-1 focus:ring-champagne/40 focus:bg-white transition-all outline-none font-light" />
          </div>
          <div>
            <label className="block text-[11px] tracking-[0.08em] uppercase text-gray-400 font-medium mb-2">Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              className="w-full px-4 py-3 bg-cream border-0 rounded-xl text-[13px] placeholder:text-gray-400 focus:ring-1 focus:ring-champagne/40 focus:bg-white transition-all outline-none font-light" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-charcoal text-white py-3.5 rounded-full text-[12px] tracking-[0.08em] uppercase font-medium hover:bg-charcoal/90 transition-all duration-300 disabled:opacity-50 mt-2">
            {loading ? 'Création...' : "S'inscrire"}
          </button>
        </form>
        <p className="text-center text-[12px] text-gray-400 mt-8 font-light">
          Déjà un compte ? <Link to="/login" className="text-charcoal font-medium hover:text-champagne transition-colors">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
