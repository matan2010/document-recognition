import React, { useState } from 'react';
// import './SignUp.css'; // Import your CSS file

const SignUp = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [companyInfo, setCompanyInfo] = useState({
        name: '',
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

        try {
            // Validate data based on the current step
            const validationErrors = validateData(step);
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }

            // Handle API calls or form submissions here
            if (step === 1) {
                // Send company information to the server
                console.log('Step 1: Company Information submitted:', companyInfo);
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
            <div className="form-group">
                <label htmlFor="companyName">Company Name:</label>
                <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={companyInfo.name}
                    onChange={(e) => handleInputChange(1, 'name', e.target.value)}
                    required
                />
                {errors.name && <span className="error">{errors.name}</span>}
            </div>
            {/* ... other fields for industry, size, email, phone */}
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
            {/* ... (fields for fullName, email, password, confirmPassword) */}
            <button type="button" onClick={() => handleSubmit(2)}>
                Next
            </button>
        </div>
    );
};

// Step 3: Verification component
const Verification = ({
                          verificationType,
                          verificationCode,
                          handleInputChange,
                          handleSubmit,
                          errors,
                      }) => {
    return (
        <div>
            <h2>Verification</h2>
            {/* ... (verification code input field) */}
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
            {/* ... (welcome message, quick start guide, setup checklist) */}
        </div>
    );
};

export default SignUp;