import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import '../styles/SignUpCompany.css';

const SignUpCompany = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    companyInfo: {
      name: '',
      industry: '',
      size: '',
      email: '',
      phone: '',
    },
    adminAccount: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    }
  });

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      const { name, email, phone } = formData.companyInfo;
      if (!name.trim()) errors.name = 'Company name is required';
      if (!email.trim()) errors.email = 'Email is required';
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Invalid email format';
      }
      if (!phone.trim()) errors.phone = 'Phone number is required';
    }

    if (step === 2) {
      const { email, password, confirmPassword } = formData.adminAccount;
      if (!email.trim()) errors.email = 'Email is required';
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Invalid email format';
      }
      if (!password) errors.password = 'Password is required';
      if (password && password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
      if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    return errors;
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep(prev => prev + 1);
      setErrors({});
    } else {
      setErrors(stepErrors);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const stepErrors = validateStep(currentStep);
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.bootstrap({
        companyName: formData.companyInfo.name,
        adminEmail: formData.adminAccount.email,
        adminPassword: formData.adminAccount.password
      });
      
      console.log('Company registration successful:', response);
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        submit: error.response?.data?.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-container">
            <h3>Company Information</h3>
            <div className="form-group">
              <label>Company Name*</label>
              <input
                type="text"
                value={formData.companyInfo.name}
                onChange={(e) => handleInputChange('companyInfo', 'name', e.target.value)}
                disabled={isLoading}
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Industry</label>
              <input
                type="text"
                value={formData.companyInfo.industry}
                onChange={(e) => handleInputChange('companyInfo', 'industry', e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Company Size</label>
              <select
                value={formData.companyInfo.size}
                onChange={(e) => handleInputChange('companyInfo', 'size', e.target.value)}
                disabled={isLoading}
              >
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201+">201+ employees</option>
              </select>
            </div>
            <div className="form-group">
              <label>Company Email*</label>
              <input
                type="email"
                value={formData.companyInfo.email}
                onChange={(e) => handleInputChange('companyInfo', 'email', e.target.value)}
                disabled={isLoading}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Phone Number*</label>
              <input
                type="tel"
                value={formData.companyInfo.phone}
                onChange={(e) => handleInputChange('companyInfo', 'phone', e.target.value)}
                disabled={isLoading}
              />
              {errors.phone && <span className="error">{errors.phone}</span>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-container">
            <h3>Admin Account</h3>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.adminAccount.fullName}
                onChange={(e) => handleInputChange('adminAccount', 'fullName', e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Email*</label>
              <input
                type="email"
                value={formData.adminAccount.email}
                onChange={(e) => handleInputChange('adminAccount', 'email', e.target.value)}
                disabled={isLoading}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Password*</label>
              <input
                type="password"
                value={formData.adminAccount.password}
                onChange={(e) => handleInputChange('adminAccount', 'password', e.target.value)}
                disabled={isLoading}
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label>Confirm Password*</label>
              <input
                type="password"
                value={formData.adminAccount.confirmPassword}
                onChange={(e) => handleInputChange('adminAccount', 'confirmPassword', e.target.value)}
                disabled={isLoading}
              />
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="signup-company-container">
      <div className="progress-bar">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
        <div className="line"></div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
      </div>

      <form onSubmit={currentStep === 2 ? handleSubmit : handleNext}>
        {renderStep()}
        
        {errors.submit && (
          <div className="error-message">{errors.submit}</div>
        )}

        <div className="button-group">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              className="back-button"
            >
              Back
            </button>
          )}
          <button
            type={currentStep === 2 ? 'submit' : 'button'}
            disabled={isLoading}
            className="next-button"
          >
            {isLoading 
              ? 'Processing...' 
              : currentStep === 2 
                ? 'Complete Registration' 
                : 'Next'
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUpCompany;