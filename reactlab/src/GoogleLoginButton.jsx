import React, { useContext } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { AuthContext } from './AuthContext';

export default function GoogleLoginButton() {
  const { socialLogin } = useContext(AuthContext);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <GoogleLogin
  onSuccess={credentialResponse => {
    console.log('GOOGLE SUCCESS:', credentialResponse); 
    socialLogin(credentialResponse.credential);
  }}
  onError={() => console.error('Google login failed')}
/>

    </GoogleOAuthProvider>
  );
}
//ibhjbihgubhhbbhj