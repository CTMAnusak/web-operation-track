import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../layouts/MobileLayout';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import AppCheckbox from '../components/AppCheckbox';
import { authService } from '../services/authService';
import { routePaths } from '../routes/routePaths';
import logoImg from '../assets/images/logo-vtrack.png';
import '../assets/css/pages/LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const isFormFilled = username.trim() !== '' && password.trim() !== '';

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setErrors((prev) => {
      if (!prev.username && !prev.general) return prev;
      return { ...prev, username: undefined, general: undefined };
    });
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setErrors((prev) => {
      if (!prev.password && !prev.general) return prev;
      return { ...prev, password: undefined, general: undefined };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    const validationErrors = {};
    if (!username.trim()) {
      validationErrors.username = 'Username ไม่ถูกต้อง';
    }
    if (!password.trim()) {
      validationErrors.password = 'Password ไม่ถูกต้อง';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.login(username, password);

      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('rememberedUser', username);
        }
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        navigate(routePaths.dashboard);
      } else {
        setErrors(
          result.errors && Object.keys(result.errors).length > 0
            ? result.errors
            : { general: 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง' }
        );
      }
    } catch {
      setErrors({
        general:
          'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณารีเฟรชหน้าแล้วลองอีกครั้ง',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileLayout>
      <div className="login-page">
        <div className="login-page__logo">
          <img src={logoImg} alt="V Track" className="login-page__logo-img" />
          <span className="login-page__logo-text">V Track</span>
        </div>

        <div className="login-page__card">
          <h1 className="login-page__title">Sign In to Tracking</h1>

          {errors.general ? (
            <p className="login-page__error" role="alert">
              {errors.general}
            </p>
          ) : null}
          
          <form onSubmit={handleSubmit} className="login-page__form">
            <AppInput
              type="text"
              placeholder="Username"
              value={username}
              onChange={handleUsernameChange}
              error={errors.username}
            />
            
            <AppInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              showPasswordToggle={true}
              error={errors.password}
            />
            
            <div className="login-page__remember">
              <AppCheckbox
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
            </div>
            
            <AppButton 
              type="submit" 
              disabled={isLoading}
              isActive={isFormFilled}
            >
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </AppButton>
          </form>
        </div>
      </div>
    </MobileLayout>
  );
}

export default LoginPage;
