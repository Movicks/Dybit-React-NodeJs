import React, { useState } from 'react';
import { EmailRounded, FaceRetouchingNaturalRounded, VerifiedUserRounded, VisibilityOff } from '@mui/icons-material';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../Login/LogStyles.css';

// ErrorBoundary component for custom error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // Static method to update state based on error
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // Lifecycle method to catch errors and log them
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  // Render method to display error message if an error occurred
  render() {
    if (this.state.hasError) {
      return (
        <Alert sx={{ backgroundColor: 'white' }} severity="error">
          An error occurred. Please try again or contact support.
        </Alert>
      );
    }

    return this.props.children;
  }
}

// SignUp functional component
export const SignUp = () => {
  // State variables for form data, errors, and submission status
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    referralCode: '',
    verificationCode: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Event handler for input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Update form data using previous state to avoid race conditions
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Event handler to get verification code
  const handleGetCode = async () => {
    try {
      // Call the backend API to send the verification code to the provided email
      const response = await axios.post('/api/send-verification-code', {
        email: formData.email,
      });

      console.log(response.data.message); // Log success message
    } catch (error) {
      console.error('Error sending verification code:', error.message);
    }
  };

  // Event handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // General check for empty fields
    for (const key in formData) {
      if (!formData[key].trim()) {
        newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
      }
    }

    // Example: Validate that the fullName is not empty
    if (!newErrors.fullName) {
      const fullNameRegex = /^[a-zA-Z\s]*$/;
      if (!fullNameRegex.test(formData.fullName)) {
        newErrors.fullName = 'Full name can only contain letters and spaces';
      }
    }

    // Example: Validate that the email is a valid email format
    if (!newErrors.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    // Example: Validate password complexity
    if (!newErrors.password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
      if (!passwordRegex.test(formData.password)) {
        // Check for individual password conditions and throw specific errors
        if (formData.password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters long';
        } else {
          newErrors.password = 'Password must have at least one uppercase, lowercase, one number, and one special symbol';
        }
      }
    }

    // Add more validation rules as needed...

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);

      try {
        // Check if email or name already exists in local storage
        const storedSignupDetails = localStorage.getItem('signupDetails');
        if (storedSignupDetails) {
          const existingSignupDetails = JSON.parse(storedSignupDetails);

          // Check for existing name
          if (existingSignupDetails.fullName === formData.fullName) {
            newErrors.fullName = 'Full name already exists. Please choose a different full name.';
          }

          // Check for existing email
          if (existingSignupDetails.email === formData.email) {
            newErrors.email = 'Email already exists. Please use a different email address.';
          }
        }

        // Check if username or email already exist in the database using Axios
        const response = await axios.post('YOUR_BACKEND_API_CHECK_EXISTENCE_ENDPOINT', {
          userName: formData.fullName,
          email: formData.email,
        });

        // Handle the response from the backend
        const data = response.data;

        // Check for existing username
        if (data.usernameExists) {
          newErrors.fullName = 'Full name already exists. Please choose a different full name.';
        }

        // Check for existing email
        if (data.emailExists) {
          newErrors.email = 'Email already exists. Please use a different email address.';
        }
      } catch (error) {
        // Handle network or other errors during username and email existence check
        console.error('Error during username and email existence check:', error.message);
      }

      setErrors(newErrors);

      if (Object.keys(newErrors).length === 0) {
        try {
          localStorage.setItem('signupDetails', JSON.stringify(formData));
          // Sending registration details to the backend using Axios
          const registrationResponse = await axios.post('YOUR_BACKEND_API_REGISTRATION_ENDPOINT', formData);

          // Handles the response from the backend
          if (registrationResponse.status === 200) {
            console.log('Registration successful:', registrationResponse.data);
          } else {
            console.error('Registration failed:', registrationResponse.statusText);
          }
        } catch (error) {
          // Handle network or other errors during registration
          console.error('Error during registration:', error.message);
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

  // Function to render error alerts
  const renderAlerts = () => {
    return (
      <Stack sx={{ width: '100%', marginTop: '16px', maxWidth: '310px' }} spacing={2}>
        {Object.keys(errors).map((key) => (
          <Alert
            key={key}
            sx={{ backgroundColor: 'white' }}
            severity="error"
          >
            {errors[key]}
          </Alert>
        ))}
      </Stack>
    );
  };

  // Return JSX for the SignUp component
  return (
    <ErrorBoundary>
      <div className='Login'>
        <div className='Login-Box'>
          <form onSubmit={handleSubmit}>
            <div className='header-title'>
              <h2>Register</h2>
              <p>Please enter your details to create an account</p>
            </div>
            {renderAlerts()}
            <div className='input-box'>
              <VerifiedUserRounded className='icon'/>
              <input
                type='text'
                name='fullName'
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
              <label>Full Name</label>
            </div>
            <div className='input-box'>
              <EmailRounded className='icon'/>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <label>Email</label>
            </div>
            <div className='input-box'>
              <FaceRetouchingNaturalRounded className='icon'/>
              <input
                type='text'
                name='referralCode'
                value={formData.referralCode}
                onChange={handleInputChange}
              />
              <label>Referral code (optional)</label>
            </div>
            <div className='input-box'>
              <span className='VerifyCode-btn' onClick={handleGetCode}>Get code</span>
              <input
                type='text'
                name='verificationCode'
                value={formData.verificationCode}
                onChange={handleInputChange}
                required
              />
              <label>Verification Code</label>
            </div>
            <div className='input-box'>
              <VisibilityOff className='icon'/>
              <input
                type='password'
                name='password'
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <label>Password</label>
            </div>
            <button type='submit' className="BTN-REG bg-white text-black font-bold py-2 px-4 rounded-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Register'}
            </button>
            <div className='register-link'>
              <p>Already have an account? <Link to="/">Login</Link></p>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
};
