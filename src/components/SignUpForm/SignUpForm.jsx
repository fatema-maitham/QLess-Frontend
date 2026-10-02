import { useContext, useState } from 'react';
import { useNavigate } from 'react-router';

import { signUp } from '../../services/authService';
import { UserContext } from '../../contexts/UserContext';
import AuthLayout from '../Auth/AuthLayout';
import { UserIcon, MailIcon, PhoneIcon, LockIcon, EyeIcon, BuildingIcon, AlertIcon } from '../Auth/AuthIcons';

const STRENGTH_COLORS = ['#E2572A', '#F26B3A', '#F7C98B', '#1E1A18'];
const STRENGTH_LABELS = ['Weak', 'Okay', 'Good', 'Strong'];

const getStrength = (p) => {
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p) || /[A-Z]/.test(p)) s++;
  return s;
};


const SignUpForm = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [role, setRole] = useState('customer');
  const [showPw, setShowPw] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', passwordConf: '',
  });
  const { name, email, phone, password, passwordConf } = formData;
  const strength = getStrength(password);
  const tooShort = password.length > 0 && password.length < 6;
  const mismatch = passwordConf.length > 0 && password !== passwordConf;
  const isValid = name && email.includes('@') && password.length >= 6 && password === passwordConf;

  const handleChange = (evt) => {
    setMessage('');
    setFormData({ ...formData, [evt.target.name]: evt.target.value });
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!isValid) return;
    setLoading(true);
    try {
      const user = await signUp({ name, email, password, role, phone: phone || null });
      setUser(user);
      navigate('/');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormInvalid = () => {
    return !(username && email && password && password === passwordConf);
  };

  return (
    <main>
      <h1>Sign Up</h1>
      <p>{message}</p>
      <form onSubmit={handleSubmit}>
        {/* Username Field */}
        <div>
          <label htmlFor='username'>Username:</label>
          <input
            type='text'
            id='username'
            value={username}
            name='username'
            onChange={handleChange}
            required
          />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor='email'>Email:</label>
          <input
            type='email'
            id='email'
            value={email}
            name='email'
            onChange={handleChange}
            required
          />
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor='password'>Password:</label>
          <input
            type='password'
            id='password'
            value={password}
            name='password'
            onChange={handleChange}
            required
          />
        </div>

        {/* Coinfirm Password */}
        <div>
          <label htmlFor='confirm'>Confirm Password:</label>
          <input
            type='password'
            id='confirm'
            value={passwordConf}
            name='passwordConf'
            onChange={handleChange}
            required
          />
        </div>

        {/* Form Actions */}
        <div>
          <button disabled={isFormInvalid()}>Sign Up</button>
          <button onClick={() => navigate('/')}>Cancel</button>
        </div>
      </form>
    </main>
  );
};

export default SignUpForm;