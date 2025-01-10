import React, { useState } from 'react';
// import './SignUp.css'; // Import your CSS file

const SignUp = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [companyInfo, setCompanyInfo] = useState({
        companyName: '',
        industry: '',
        size: '',
        email: '',
        phone: '',
    });
    const [adminAccount, setAdminAccount] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationType, setVerificationType] = useState(''); // 'email' or 'phone'
    const [errors, setErrors] = useState({});

    const handleInputChange = (step, field, value) => {
        switch (step) {
            case 1:
                setCompanyInfo({ ...companyInfo, [field]: value });
                break;
            case 2:
                setAdminAccount({ ...adminAccount, [field]: value });
                break;
            case 3:
                setVerificationCode(value);
                break;
            default:
                break;
        }
    };

    const handleSubmit = async (step) => {
        setErrors({}); // Clear previous errors
        console.log(step);

        try {
            // Validate data based on the current step
            //const validationErrors = validateData(step);
            // console.log(validationErrors);
            // if (Object.keys(validationErrors).length > 0) {
            //     setErrors(validationErrors);
            //     return;
            // }

            // Handle API calls or form submissions here
            if (step === 1) {
                // Send company information to the server
                console.log('Step 1: Company Information submitted:', companyInfo.companyName);
                setCurrentStep(2);
            } else if (step === 2) {
                // Send admin account information to the server
                console.log('Step 2: Admin Account information submitted:', adminAccount);
                // Trigger email verification
                setVerificationType('email');
                setCurrentStep(3);
            } else if (step === 3) {
                // Verify the entered code
                console.log('Step 3: Verification code submitted:', verificationCode);
                // Handle successful verification
                setCurrentStep(4);
            }
        } catch (error) {
            // Handle errors (e.g., network issues, server errors)
            console.error('Error during sign-up:', error);
            // Display an error message to the user
            setErrors({ general: 'An error occurred during sign-up.' });
        }
    };

    const validateData = (step) => {
        const errors = {};
        switch (step) {
            case 1:
                if (!companyInfo.name) {
                    errors.name = 'Company name is required.';
                }
                if (!companyInfo.industry) {
                    errors.industry = 'Industry is required.';
                }
                if (!companyInfo.size) {
                    errors.size = 'Company size is required.';
                }
                if (!companyInfo.email) {
                    errors.email = 'Business email is required.';
                } else if (!isValidEmail(companyInfo.email)) {
                    errors.email = 'Invalid email format.';
                }
                break;
            case 2:
                if (!adminAccount.fullName) {
                    errors.fullName = 'Full name is required.';
                }
                if (!adminAccount.email) {
                    errors.email = 'Email is required.';
                } else if (!isValidEmail(adminAccount.email)) {
                    errors.email = 'Invalid email format.';
                }
                if (!adminAccount.password) {
                    errors.password = 'Password is required.';
                } else if (adminAccount.password.length < 8) {
                    errors.password = 'Password must be at least 8 characters long.';
                }
                if (adminAccount.password !== adminAccount.confirmPassword) {
                    errors.confirmPassword = 'Passwords do not match.';
                }
                break;
            case 3:
                if (!verificationCode) {
                    errors.verificationCode = 'Verification code is required.';
                }
                break;
            default:
                break;
        }
        return errors;
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <CompanyInfo
                        companyInfo={companyInfo}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                        errors={errors}
                    />
                );
            case 2:
                return (
                    <AdminAccount
                        adminAccount={adminAccount}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                        errors={errors}
                    />
                );
            case 3:
                return (
                    <Verification
                        verificationType={verificationType}
                        verificationCode={verificationCode}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                        errors={errors}
                    />
                );
            case 4:
                return <WelcomeScreen />;
            default:
                return null;
        }
    };

    return (
        <div className="signup-container">
            {renderStep()}
        </div>
    );
};

// Step 1: Company Information component
const CompanyInfo = ({ companyInfo, handleInputChange, handleSubmit, errors }) => {
    return (
        <div>
            <h2>Company Information</h2>

            {/* Company Name */}
            <div className="form-group">
                <label htmlFor="companyName">Company Name:</label>
                <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={companyInfo.companyName}
                    onChange={(e) => handleInputChange(1, 'companyName', e.target.value)}
                    required
                />
                {errors.companyName && <span className="error">{errors.companyName}</span>}
            </div>

            {/* Industry */}
            <div className="form-group">
                <label htmlFor="industry">Industry:</label>
                <input
                    type="text"
                    id="industry"
                    name="industry"
                    value={companyInfo.industry}
                    onChange={(e) => handleInputChange(1, 'industry', e.target.value)}
                    required
                />
                {errors.industry && <span className="error">{errors.industry}</span>}
            </div>

            {/* Company Size */}
            <div className="form-group">
                <label htmlFor="size">Company Size:</label>
                <input
                    type="text"
                    id="size"
                    name="size"
                    value={companyInfo.size}
                    onChange={(e) => handleInputChange(1, 'size', e.target.value)}
                    required
                />
                {errors.size && <span className="error">{errors.size}</span>}
            </div>

            {/* Business Email */}
            <div className="form-group">
                <label htmlFor="email">Business Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={companyInfo.email}
                    onChange={(e) => handleInputChange(1, 'email', e.target.value)}
                    required
                />
                {errors.email && <span className="error">{errors.email}</span>}
            </div>

            {/* Phone Number */}
            <div className="form-group">
                <label htmlFor="phone">Phone Number:</label>
                <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={companyInfo.phone}
                    onChange={(e) => handleInputChange(1, 'phone', e.target.value)}
                    required
                />
                {errors.phone && <span className="error">{errors.phone}</span>}
            </div>

            <button type="button" onClick={() => handleSubmit(1)}>
                Next
            </button>
        </div>
    );
};

// Step 2: Admin Account component
const AdminAccount = ({ adminAccount, handleInputChange, handleSubmit, errors }) => {
    return (
        <div>
            <h2>Admin Account</h2>

            {/* Full Name */}
            <div className="form-group">
                <label htmlFor="fullName">Full Name:</label>
                <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={adminAccount.fullName}
                    onChange={(e) => handleInputChange(2, 'fullName', e.target.value)}
                    required
                />
                {errors.fullName && <span className="error">{errors.fullName}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={adminAccount.email}
                    onChange={(e) => handleInputChange(2, 'email', e.target.value)}
                    required
                />
                {errors.email && <span className="error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={adminAccount.password}
                    onChange={(e) => handleInputChange(2, 'password', e.target.value)}
                    required
                />
                {errors.password && <span className="error">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={adminAccount.confirmPassword}
                    onChange={(e) => handleInputChange(2, 'confirmPassword', e.target.value)}
                    required
                />
                {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            </div>

            <button type="button" onClick={() => handleSubmit(2)}>
                Next
            </button>
        </div>
    );
};

// Step 3: Verification component
const Verification = ({ verificationType, verificationCode, handleInputChange, handleSubmit, errors }) => {
    return (
        <div>
            <h2>Verification</h2>

            <p>Please enter the verification code sent to your {verificationType}:</p>

            {/* Verification Code */}
            <div className="form-group">
                <label htmlFor="verificationCode">Verification Code:</label>
                <input
                    type="text"
                    id="verificationCode"
                    name="verificationCode"
                    value={verificationCode}
                    onChange={(e) => handleInputChange(3, 'verificationCode', e.target.value)}
                    required
                />
                {errors.verificationCode && <span className="error">{errors.verificationCode}</span>}
            </div>

            <button type="button" onClick={() => handleSubmit(3)}>
                Verify
            </button>
        </div>
    );
};

// Step 4: Welcome Screen component
const WelcomeScreen = () => {
    return (
        <div>
            <h2>Welcome!</h2>
            <p>Thank you for signing up! Your account has been successfully created.</p>

            <ul>
                <li>Get started with our quick start guide.</li>
                <li>Explore the setup checklist to configure your account.</li>
                <li>Reach out to support if you need any assistance.</li>
            </ul>

            <button type="button" onClick={() => alert('Start Exploring!')}>
                Start Exploring
            </button>
        </div>
    );
};


export default SignUp;